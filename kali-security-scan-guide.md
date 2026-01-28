# 使用 Kali Linux 扫描 aztcon.com 安全指南

## ⚠️ 重要声明

**仅用于扫描您自己拥有或已获得明确授权的网站！**
- 本指南仅用于对 `aztcon.com` 进行安全评估（您自己的网站）
- 未经授权扫描他人网站是违法行为
- 请遵守当地法律法规和道德准则

## 🛠️ Kali Linux 工具准备

### 1. 更新 Kali Linux 系统

```bash
# 更新软件包列表
sudo apt update

# 升级系统
sudo apt upgrade -y

# 安装额外工具（如果需要）
sudo apt install -y testssl.sh nikto dirb gobuster sqlmap
```

### 2. 验证网络连接

```bash
# 确保可以访问目标网站
ping -c 3 aztcon.com

# 检查 DNS 解析
nslookup aztcon.com
```

## 🔍 安全扫描工具和方法

### 1. Nmap - 端口和服务扫描

**用途：** 发现开放的端口、服务版本、操作系统信息

```bash
# 基本端口扫描
nmap -sV -sC aztcon.com

# 完整扫描（包括所有端口）
nmap -p- -sV -sC aztcon.com

# 扫描常见 Web 端口
nmap -p 80,443,8080,8443 -sV -sC aztcon.com

# 保存结果到文件
nmap -sV -sC aztcon.com -oN nmap-scan.txt

# 详细扫描（包括脚本扫描）
nmap -sV -sC --script vuln aztcon.com
```

**输出解读：**
- `-sV`: 版本检测
- `-sC`: 使用默认脚本
- `-p-`: 扫描所有 65535 个端口
- `--script vuln`: 运行漏洞检测脚本

### 2. SSL/TLS 安全扫描

#### 使用 testssl.sh（推荐）

```bash
# 下载 testssl.sh（如果未安装）
cd /tmp
wget https://testssl.sh/testssl.sh
chmod +x testssl.sh

# 完整 SSL/TLS 测试
./testssl.sh --color 0 aztcon.com > ssl-report.txt

# 快速测试
./testssl.sh --quick aztcon.com

# 测试特定功能
./testssl.sh --protocols aztcon.com
./testssl.sh --ciphers aztcon.com
./testssl.sh --vulnerabilities aztcon.com
```

#### 使用 sslscan

```bash
# SSL 扫描
sslscan aztcon.com > sslscan-report.txt

# 详细扫描
sslscan --show-certificate aztcon.com
```

#### 使用 openssl（内置工具）

```bash
# 检查 SSL 证书
echo | openssl s_client -connect aztcon.com:443 -servername aztcon.com 2>/dev/null | openssl x509 -noout -text

# 检查支持的协议
openssl s_client -connect aztcon.com:443 -tls1_2
openssl s_client -connect aztcon.com:443 -tls1_3
```

### 3. Nikto - Web 服务器漏洞扫描

**用途：** 扫描 Web 服务器配置问题、潜在漏洞、危险文件

```bash
# 基本扫描
nikto -h https://aztcon.com

# 详细扫描（保存结果）
nikto -h https://aztcon.com -o nikto-report.html -Format htm

# 文本格式报告
nikto -h https://aztcon.com -o nikto-report.txt -Format txt

# 扫描多个端口
nikto -h aztcon.com -p 80,443,8080

# 使用 SSL
nikto -h aztcon.com -ssl

# 完整扫描（包括所有检查）
nikto -h https://aztcon.com -C all -Tuning 1-9
```

**参数说明：**
- `-h`: 目标主机
- `-o`: 输出文件
- `-Format`: 输出格式（htm/txt/xml）
- `-C all`: 显示所有检查
- `-Tuning`: 扫描类型（1-9）

### 4. 目录和文件枚举

#### 使用 dirb

```bash
# 基本目录扫描
dirb https://aztcon.com

# 使用自定义字典
dirb https://aztcon.com /usr/share/wordlists/dirb/common.txt

# 递归扫描
dirb https://aztcon.com -r

# 保存结果
dirb https://aztcon.com -o dirb-results.txt
```

#### 使用 gobuster（更快，推荐）

```bash
# 目录扫描
gobuster dir -u https://aztcon.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt

# 文件扩展名扫描
gobuster dir -u https://aztcon.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,js,txt

# 使用多个线程（更快）
gobuster dir -u https://aztcon.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 50

# 保存结果
gobuster dir -u https://aztcon.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o gobuster-results.txt
```

#### 使用 dirsearch

```bash
# 安装 dirsearch（如果未安装）
cd /opt
sudo git clone https://github.com/maurosoria/dirsearch.git
cd dirsearch

# 基本扫描
python3 dirsearch.py -u https://aztcon.com

# 使用扩展名
python3 dirsearch.py -u https://aztcon.com -e php,html,js,txt

# 多线程扫描
python3 dirsearch.py -u https://aztcon.com -t 50

# 保存结果
python3 dirsearch.py -u https://aztcon.com -o dirsearch-results.txt
```

### 5. HTTP 安全头检查

#### 使用 curl

```bash
# 检查所有响应头
curl -I https://aztcon.com

# 详细检查
curl -v https://aztcon.com 2>&1 | grep -i "header"

# 检查特定安全头
curl -I https://aztcon.com | grep -iE "(strict-transport|frame-options|content-type-options|csp|xss)"

# 保存完整响应
curl -I https://aztcon.com -o headers.txt
```

#### 使用 whatweb（Web 技术识别）

```bash
# 识别 Web 技术
whatweb https://aztcon.com

# 详细输出
whatweb -v https://aztcon.com

# 保存结果
whatweb https://aztcon.com -a 3 > whatweb-results.txt
```

### 6. SQL 注入检测（如果网站有表单）

**注意：** 仅用于您自己的网站！

```bash
# 基本 SQL 注入测试（针对联系表单）
sqlmap -u "https://aztcon.com/contact.html" --forms --batch

# 如果有 POST 表单
sqlmap -u "https://aztcon.com/contact.html" --data "name=test&email=test@test.com" --batch

# 详细测试
sqlmap -u "https://aztcon.com/contact.html" --forms --batch --level=3 --risk=2
```

### 7. OWASP ZAP - 自动化 Web 应用安全扫描

```bash
# 启动 ZAP（GUI）
zap.sh

# 或使用命令行版本
zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' https://aztcon.com

# 完整扫描
zap-cli full-scan --self-contained --start-options '-config api.disablekey=true' https://aztcon.com
```

### 8. Burp Suite - 专业 Web 安全测试

```bash
# 启动 Burp Suite
burpsuite

# 或社区版
burpsuite-community
```

**使用步骤：**
1. 启动 Burp Suite
2. 配置浏览器代理（127.0.0.1:8080）
3. 浏览网站
4. 使用 Scanner 功能进行自动扫描
5. 查看报告

## 📋 完整扫描脚本

创建一个自动化扫描脚本：

```bash
#!/bin/bash
# 保存为: scan-aztcon.sh

TARGET="aztcon.com"
DATE=$(date +%Y%m%d-%H%M%S)
OUTPUT_DIR="scan-results-$DATE"

mkdir -p $OUTPUT_DIR
cd $OUTPUT_DIR

echo "开始扫描 $TARGET..."
echo "结果将保存到: $OUTPUT_DIR"
echo ""

# 1. Nmap 扫描
echo "[1/7] 执行 Nmap 端口扫描..."
nmap -sV -sC -p 80,443,8080,8443 $TARGET -oN nmap-scan.txt
echo "完成"

# 2. SSL/TLS 扫描
echo "[2/7] 执行 SSL/TLS 扫描..."
if command -v testssl.sh &> /dev/null; then
    testssl.sh --color 0 $TARGET > ssl-report.txt 2>&1
else
    sslscan $TARGET > sslscan-report.txt
fi
echo "完成"

# 3. HTTP 头检查
echo "[3/7] 检查 HTTP 安全头..."
curl -I https://$TARGET > http-headers.txt 2>&1
echo "完成"

# 4. Nikto 扫描
echo "[4/7] 执行 Nikto Web 扫描..."
nikto -h https://$TARGET -o nikto-report.txt -Format txt
echo "完成"

# 5. 目录枚举
echo "[5/7] 执行目录枚举..."
gobuster dir -u https://$TARGET -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 30 -o gobuster-results.txt 2>&1
echo "完成"

# 6. Web 技术识别
echo "[6/7] 识别 Web 技术..."
whatweb https://$TARGET -a 3 > whatweb-results.txt 2>&1
echo "完成"

# 7. 生成摘要
echo "[7/7] 生成扫描摘要..."
echo "扫描完成时间: $(date)" > summary.txt
echo "目标: $TARGET" >> summary.txt
echo "" >> summary.txt
echo "扫描结果文件:" >> summary.txt
ls -lh >> summary.txt

echo ""
echo "✅ 扫描完成！结果保存在: $OUTPUT_DIR"
```

**使用方法：**
```bash
chmod +x scan-aztcon.sh
./scan-aztcon.sh
```

## 🔍 扫描结果分析

### 重点关注的项目

1. **开放端口**
   - 只应开放必要的端口（80, 443）
   - 其他端口（如 22, 3306）不应对外暴露

2. **SSL/TLS 配置**
   - 使用 TLS 1.2 或更高版本
   - 禁用弱加密套件
   - 证书有效期和链完整性

3. **HTTP 安全头**
   - 检查是否缺少安全响应头
   - CSP 策略是否合理

4. **暴露的文件和目录**
   - 检查是否暴露敏感文件（.git, .env, backup 等）
   - 检查管理后台是否可访问

5. **Web 服务器信息泄露**
   - 服务器版本信息
   - 错误页面信息泄露

## 📊 结果对比

将 Kali Linux 扫描结果与之前的检查脚本结果对比：

```bash
# 在 Kali Linux 中运行
./scan-aztcon.sh

# 在 macOS 中运行（之前创建的脚本）
cd /path/to/aztcon.com
./check-security.sh
```

## 🛡️ 修复建议

根据扫描结果，参考以下文档进行修复：
- `SECURITY-IMPROVEMENTS.md` - 改进建议
- `security-check.md` - 配置指南
- `.htaccess.example` - Apache 配置示例

## ⚡ 快速扫描命令（一键执行）

```bash
# 快速安全检查（5-10分钟）
echo "=== 快速安全检查 ===" && \
nmap -sV -p 80,443 aztcon.com && \
echo "---" && \
curl -I https://aztcon.com | grep -iE "(strict|frame|xss|csp)" && \
echo "---" && \
nikto -h https://aztcon.com -maxtime 5m
```

## 📝 注意事项

1. **扫描频率：** 不要过于频繁扫描，避免被服务器封禁
2. **合法使用：** 仅扫描您拥有或已授权的网站
3. **结果保存：** 保存扫描结果以便后续分析和对比
4. **修复验证：** 修复问题后重新扫描验证

## 🔗 相关资源

- [Kali Linux 文档](https://www.kali.org/docs/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Nmap 参考指南](https://nmap.org/book/man.html)
- [Nikto 文档](https://cirt.net/Nikto2)

---

**最后更新：** 2026-01-26  
**目标网站：** aztcon.com  
**扫描环境：** Kali Linux (Parallels VM on macOS)
