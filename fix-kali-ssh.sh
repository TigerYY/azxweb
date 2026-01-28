#!/bin/bash
# Kali Linux SSH 服务修复脚本
# 用于在 Kali Linux 中启用 SSH 服务并打开 22 端口

echo "=========================================="
echo "Kali Linux SSH 服务修复脚本"
echo "=========================================="
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  请使用 sudo 运行此脚本"
    echo "使用方法: sudo bash fix-kali-ssh.sh"
    exit 1
fi

echo "[1/5] 检查 SSH 服务是否已安装..."
if ! command -v sshd &> /dev/null; then
    echo "📦 正在安装 OpenSSH 服务器..."
    apt update
    apt install -y openssh-server
else
    echo "✅ OpenSSH 服务器已安装"
fi

echo ""
echo "[2/5] 检查 SSH 服务状态..."
if systemctl is-active --quiet ssh; then
    echo "✅ SSH 服务正在运行"
else
    echo "⚠️  SSH 服务未运行，正在启动..."
    systemctl start ssh
    systemctl enable ssh
    echo "✅ SSH 服务已启动并设置为开机自启"
fi

echo ""
echo "[3/5] 检查 SSH 端口监听状态..."
if netstat -tlnp 2>/dev/null | grep -q ":22 " || ss -tlnp 2>/dev/null | grep -q ":22 "; then
    echo "✅ SSH 正在监听 22 端口"
    netstat -tlnp 2>/dev/null | grep ":22 " || ss -tlnp 2>/dev/null | grep ":22 "
else
    echo "⚠️  SSH 未监听 22 端口，正在重启服务..."
    systemctl restart ssh
    sleep 2
    if netstat -tlnp 2>/dev/null | grep -q ":22 " || ss -tlnp 2>/dev/null | grep -q ":22 "; then
        echo "✅ SSH 现在正在监听 22 端口"
    else
        echo "❌ 警告：SSH 仍然未监听 22 端口"
    fi
fi

echo ""
echo "[4/5] 检查防火墙状态..."
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        echo "🔥 防火墙已启用，检查 SSH 规则..."
        if ufw status | grep -q "22/tcp"; then
            echo "✅ 防火墙已允许 SSH (22端口)"
        else
            echo "⚠️  正在添加 SSH 防火墙规则..."
            ufw allow ssh
            ufw allow 22/tcp
            echo "✅ SSH 防火墙规则已添加"
        fi
    else
        echo "ℹ️  防火墙未启用（这是正常的，如果不需要防火墙）"
    fi
elif command -v iptables &> /dev/null; then
    echo "ℹ️  检测到 iptables，检查 SSH 规则..."
    if iptables -L INPUT -n | grep -q "22"; then
        echo "✅ iptables 已允许 SSH"
    else
        echo "⚠️  正在添加 iptables SSH 规则..."
        iptables -A INPUT -p tcp --dport 22 -j ACCEPT
        echo "✅ iptables SSH 规则已添加"
    fi
else
    echo "ℹ️  未检测到防火墙工具"
fi

echo ""
echo "[5/5] 检查 SSH 配置..."
SSH_CONFIG="/etc/ssh/sshd_config"
if [ -f "$SSH_CONFIG" ]; then
    echo "📝 检查关键 SSH 配置项..."
    
    # 检查 PasswordAuthentication
    if grep -q "^PasswordAuthentication" "$SSH_CONFIG"; then
        if grep -q "^PasswordAuthentication yes" "$SSH_CONFIG"; then
            echo "✅ 密码认证已启用"
        else
            echo "⚠️  密码认证被禁用，如果需要密码登录，请启用它"
        fi
    else
        echo "ℹ️  使用默认密码认证设置（通常为启用）"
    fi
    
    # 检查 PermitRootLogin
    if grep -q "^PermitRootLogin" "$SSH_CONFIG"; then
        ROOT_LOGIN=$(grep "^PermitRootLogin" "$SSH_CONFIG" | awk '{print $2}')
        echo "ℹ️  Root 登录设置: $ROOT_LOGIN"
    fi
    
    # 检查 Port
    if grep -q "^Port" "$SSH_CONFIG"; then
        SSH_PORT=$(grep "^Port" "$SSH_CONFIG" | awk '{print $2}')
        echo "ℹ️  SSH 端口: $SSH_PORT"
    else
        echo "ℹ️  使用默认 SSH 端口: 22"
    fi
else
    echo "⚠️  未找到 SSH 配置文件"
fi

echo ""
echo "=========================================="
echo "✅ 修复完成！"
echo "=========================================="
echo ""
echo "📋 验证步骤："
echo "1. 检查 SSH 服务状态:"
echo "   sudo systemctl status ssh"
echo ""
echo "2. 检查端口监听:"
echo "   sudo netstat -tlnp | grep :22"
echo "   或"
echo "   sudo ss -tlnp | grep :22"
echo ""
echo "3. 检查防火墙规则:"
echo "   sudo ufw status"
echo ""
echo "4. 从 macOS 测试连接:"
echo "   ssh tiger@10.211.55.6"
echo ""
echo "💡 如果仍然无法连接，请检查："
echo "   - Kali Linux 的 IP 地址是否正确 (10.211.55.6)"
echo "   - 网络连接是否正常 (ping 10.211.55.6)"
echo "   - Parallels 网络配置是否正确"
echo ""
