# 🚀 在 Kali Linux 中执行安全扫描 - 快速开始

## 📍 当前状态
- ✅ macOS HTTP 服务器已启动（端口 8000）
- ✅ 网络连接正常（可以 ping 通 Kali Linux）
- ⚠️  SSH 服务未启动（使用替代方法）

## 🎯 推荐方法：直接在 Kali Linux 中创建并执行脚本

### 步骤 1：在 Kali Linux 中打开终端

### 步骤 2：复制并执行以下命令

**选项 A：从 HTTP 服务器下载（如果网络配置允许）**

```bash
# 尝试从 macOS 下载脚本（IP 可能是 10.211.55.2 或 192.168.3.146）
cd ~
wget http://10.211.55.2:8000/quick-scan-kali.sh || wget http://192.168.3.146:8000/quick-scan-kali.sh
chmod +x quick-scan-kali.sh
./quick-scan-kali.sh
```

**选项 B：直接创建脚本（推荐，最简单）**

在 Kali Linux 终端中执行：

```bash
# 创建脚本文件
cat > ~/quick-scan.sh << 'SCRIPT_END'
#!/bin/bash
TARGET="aztcon.com"
DATE=$(date +%Y%m%d-%H%M%S)
OUTPUT_DIR="$HOME/scan-results-${DATE}"
mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR" || exit

echo "=========================================="
echo "网站安全扫描 - $TARGET"
echo "=========================================="
echo ""

# 安装工具（如果需要）
sudo apt update -qq 2>/dev/null
sudo apt install -y nmap nikto sslscan whatweb curl 2>/dev/null

# 1. 端口扫描
echo "[1/6] 端口扫描..."
nmap -sV -p 80,443 "$TARGET" -oN nmap-scan.txt
echo "✓ 完成"

# 2. SSL 扫描
echo ""
echo "[2/6] SSL 扫描..."
sslscan "$TARGET" > sslscan-report.txt 2>&1
echo "✓ 完成"

# 3. HTTP 头检查
echo ""
echo "[3/6] HTTP 安全头检查..."
curl -I "https://$TARGET" -s -o http-headers.txt
echo "关键安全头："
grep -iE "(strict|frame|xss|csp|content-type)" http-headers.txt || echo "⚠ 未发现关键安全头"
echo "✓ 完成"

# 4. Web 扫描
echo ""
echo "[4/6] Web 漏洞扫描（5分钟）..."
nikto -h "https://$TARGET" -o nikto-report.txt -Format txt -maxtime 5m 2>&1 | tail -15
echo "✓ 完成"

# 5. 技术识别
echo ""
echo "[5/6] Web 技术识别..."
whatweb "https://$TARGET" > whatweb-results.txt 2>&1
cat whatweb-results.txt
echo "✓ 完成"

# 6. robots.txt
echo ""
echo "[6/6] robots.txt 检查..."
curl -s "https://$TARGET/robots.txt" > robots.txt
if [ -s robots.txt ]; then
    cat robots.txt
else
    echo "⚠ robots.txt 不存在"
fi

echo ""
echo "=========================================="
echo "扫描完成！结果在: $OUTPUT_DIR"
echo "=========================================="
ls -lh
SCRIPT_END

# 添加执行权限并运行
chmod +x ~/quick-scan.sh
~/quick-scan.sh
```

## ⚡ 超快速版本（5分钟检查）

如果只需要快速检查，执行：

```bash
TARGET="aztcon.com"
echo "=== 快速安全检查 ==="
echo ""
echo "1. 端口扫描:"
nmap -sV -p 80,443 $TARGET
echo ""
echo "2. SSL 检查:"
sslscan $TARGET | head -30
echo ""
echo "3. HTTP 安全头:"
curl -I https://$TARGET 2>/dev/null | grep -iE "(strict|frame|xss|csp|content-type|server)"
echo ""
echo "4. Web 技术:"
whatweb https://$TARGET
echo ""
echo "5. 快速 Web 扫描:"
nikto -h https://$TARGET -maxtime 3m | tail -20
```

## 📥 获取扫描结果

### 方法 1：使用 HTTP 服务器（在 Kali Linux 中）

```bash
cd ~/scan-results-*
python3 -m http.server 8001
```

然后在 macOS 浏览器访问：`http://10.211.55.6:8001`

### 方法 2：使用共享文件夹

如果 Parallels 已配置共享文件夹，直接复制结果文件。

### 方法 3：启动 SSH 后使用 SCP

在 Kali Linux 中启动 SSH：
```bash
sudo systemctl start ssh
sudo systemctl enable ssh
```

然后在 macOS 中：
```bash
scp -r tiger@10.211.55.6:~/scan-results-* ./
```

## 🔧 如果工具未安装

```bash
# 更新系统
sudo apt update

# 安装必要工具
sudo apt install -y nmap nikto sslscan gobuster whatweb curl

# 可选：安装 testssl.sh（更详细的 SSL 测试）
cd /tmp
wget https://testssl.sh/testssl.sh
chmod +x testssl.sh
sudo mv testssl.sh /usr/local/bin/
```

## 📊 结果分析

扫描完成后，重点关注：

1. **端口扫描结果** - 只应开放 80, 443
2. **SSL 配置** - TLS 版本、加密套件
3. **HTTP 安全头** - 是否缺少关键安全头
4. **Web 漏洞** - Nikto 发现的潜在问题
5. **暴露文件** - robots.txt 中的敏感目录

## 🔗 相关文档

- `kali-security-scan-guide.md` - 详细工具使用指南
- `SECURITY-IMPROVEMENTS.md` - 改进建议
- `security-check.md` - 安全配置指南

## ❓ 遇到问题？

1. **网络不通**：检查 Parallels 网络配置
2. **工具未安装**：运行 `sudo apt install -y [工具名]`
3. **权限问题**：使用 `chmod +x script.sh`
4. **扫描超时**：减少扫描时间或使用快速版本

---

**现在就开始：** 在 Kali Linux 终端中执行上面的命令！
