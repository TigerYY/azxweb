# 在 Kali Linux 中执行安全扫描 - 操作指南

## 🌐 方法 1：通过 HTTP 服务器下载脚本（推荐）

### 步骤 1：在 macOS 中已启动 HTTP 服务器
服务器地址：`http://10.211.55.2:8000`（或您的 macOS IP）

### 步骤 2：在 Kali Linux 中执行以下命令

打开 Kali Linux 终端，执行：

```bash
# 1. 进入用户目录
cd ~

# 2. 下载扫描脚本
wget http://10.211.55.2:8000/scan-aztcon.sh

# 如果上面的 IP 不行，尝试：
# wget http://10.211.55.1:8000/scan-aztcon.sh
# 或者查看 macOS IP：在 macOS 终端执行 ifconfig | grep "inet "

# 3. 给脚本添加执行权限
chmod +x scan-aztcon.sh

# 4. 安装必要的工具（如果未安装）
sudo apt update
sudo apt install -y nmap nikto sslscan gobuster whatweb curl

# 5. 执行扫描
./scan-aztcon.sh
```

## 🚀 方法 2：直接执行命令（如果无法下载脚本）

如果无法下载脚本，可以直接在 Kali Linux 终端中执行以下命令：

```bash
# 创建结果目录
TARGET="aztcon.com"
DATE=$(date +%Y%m%d-%H%M%S)
OUTPUT_DIR="~/scan-results-${DATE}"
mkdir -p $OUTPUT_DIR
cd $OUTPUT_DIR

echo "开始扫描 $TARGET..."

# 1. 端口扫描
echo "[1/6] 端口扫描..."
nmap -sV -p 80,443 $TARGET -oN nmap-scan.txt

# 2. SSL 扫描
echo "[2/6] SSL 扫描..."
sslscan $TARGET > sslscan-report.txt 2>&1

# 3. HTTP 头检查
echo "[3/6] HTTP 安全头检查..."
curl -I https://$TARGET > http-headers.txt 2>&1
echo "安全头检查结果："
curl -I https://$TARGET 2>/dev/null | grep -iE "(strict|frame|xss|csp|content-type)" || echo "未发现关键安全头"

# 4. Web 扫描
echo "[4/6] Web 漏洞扫描..."
nikto -h https://$TARGET -o nikto-report.txt -Format txt -maxtime 10m

# 5. 技术识别
echo "[5/6] Web 技术识别..."
whatweb https://$TARGET > whatweb-results.txt 2>&1

# 6. robots.txt 检查
echo "[6/6] robots.txt 检查..."
curl -s https://$TARGET/robots.txt > robots.txt 2>&1
if [ -s robots.txt ]; then
    echo "robots.txt 内容："
    cat robots.txt
else
    echo "robots.txt 不存在或无法访问"
fi

# 生成摘要
echo ""
echo "=========================================="
echo "扫描完成！"
echo "=========================================="
echo "结果保存在: $OUTPUT_DIR"
echo ""
echo "文件列表："
ls -lh
echo ""
echo "查看 HTTP 安全头："
cat http-headers.txt | grep -iE "(strict|frame|xss|csp|content-type|server)" || echo "未发现关键安全头"
```

## 📊 方法 3：快速检查（5分钟版本）

如果只需要快速检查，执行：

```bash
TARGET="aztcon.com"

echo "=== 1. 端口扫描 ==="
nmap -sV -p 80,443 $TARGET

echo -e "\n=== 2. SSL 检查 ==="
sslscan $TARGET | head -40

echo -e "\n=== 3. HTTP 安全头 ==="
curl -I https://$TARGET 2>/dev/null | grep -iE "(strict|frame|xss|csp|content-type|server)"

echo -e "\n=== 4. 快速 Web 扫描 ==="
nikto -h https://$TARGET -maxtime 5m | tail -30

echo -e "\n=== 5. Web 技术 ==="
whatweb https://$TARGET
```

## 🔍 获取 macOS IP 地址

如果不知道 macOS 的 IP 地址，在 macOS 终端中执行：

```bash
# 方法 1：查看所有 IP
ifconfig | grep "inet " | grep -v "127.0.0.1"

# 方法 2：查看 Parallels 网络 IP（通常是 10.211.55.x）
ifconfig | grep -A 5 "vnic" | grep "inet "

# 方法 3：查看默认网关（Kali 的网关通常是 macOS 的 IP）
# 在 Kali Linux 中执行：
ip route | grep default
```

## 📥 下载扫描结果到 macOS

扫描完成后，在 Kali Linux 中：

```bash
# 方法 1：使用 HTTP 服务器（在 Kali Linux 中）
cd ~/scan-results-*
python3 -m http.server 8001
```

然后在 macOS 浏览器中访问：`http://10.211.55.6:8001` 下载文件

或者：

```bash
# 方法 2：如果 SSH 可用后，在 macOS 中执行
scp -r tiger@10.211.55.6:~/scan-results-* ./
```

## ⚙️ 如果 SSH 无法连接，启动 SSH 服务

在 Kali Linux 图形界面终端中执行：

```bash
# 检查 SSH 状态
sudo systemctl status ssh

# 如果未运行，启动 SSH
sudo systemctl start ssh
sudo systemctl enable ssh

# 检查防火墙
sudo ufw status
# 如果需要，允许 SSH
sudo ufw allow ssh
```

## 📋 检查清单

执行扫描前确保：
- [ ] 网络连接正常（可以 ping 通 aztcon.com）
- [ ] 已安装必要工具（nmap, nikto, sslscan 等）
- [ ] 有足够的磁盘空间保存结果
- [ ] 了解这是对您自己网站的合法扫描

## 🎯 预期结果

扫描完成后，您应该看到：
- `nmap-scan.txt` - 端口和服务信息
- `sslscan-report.txt` - SSL/TLS 配置
- `http-headers.txt` - HTTP 响应头
- `nikto-report.txt` - Web 漏洞扫描结果
- `whatweb-results.txt` - Web 技术识别
- `robots.txt` - robots.txt 内容

## 💡 提示

1. **扫描时间**：完整扫描可能需要 10-30 分钟
2. **网络要求**：确保 Kali Linux 可以访问互联网
3. **结果分析**：将结果与 macOS 上的 `check-security.sh` 结果对比
4. **修复建议**：查看 `SECURITY-IMPROVEMENTS.md` 了解如何修复发现的问题

---

**现在就开始：** 在 Kali Linux 终端中执行上面的命令！
