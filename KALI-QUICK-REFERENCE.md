# Kali Linux 快速扫描参考

## 🚀 一键完整扫描

```bash
# 将脚本复制到 Kali Linux
# 在 macOS 中：
scp scan-aztcon.sh user@kali-vm-ip:/home/user/

# 在 Kali Linux 中：
chmod +x scan-aztcon.sh
./scan-aztcon.sh
```

## ⚡ 快速命令（5-10分钟扫描）

```bash
# 1. 端口扫描
nmap -sV -p 80,443 aztcon.com

# 2. SSL 检查
sslscan aztcon.com

# 3. HTTP 头检查
curl -I https://aztcon.com | grep -iE "(strict|frame|xss|csp)"

# 4. 快速 Web 扫描
nikto -h https://aztcon.com -maxtime 5m
```

## 🔧 常用工具命令

### Nmap
```bash
nmap -sV -sC aztcon.com                    # 基本扫描
nmap -p- -sV aztcon.com                    # 全端口扫描
nmap --script vuln aztcon.com              # 漏洞扫描
```

### SSL/TLS
```bash
testssl.sh aztcon.com                      # 完整 SSL 测试
sslscan aztcon.com                         # SSL 扫描
openssl s_client -connect aztcon.com:443   # 证书检查
```

### Web 扫描
```bash
nikto -h https://aztcon.com                # Web 漏洞扫描
whatweb https://aztcon.com                 # 技术识别
```

### 目录枚举
```bash
gobuster dir -u https://aztcon.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
dirb https://aztcon.com                    # 目录扫描
```

## 📋 检查清单

- [ ] 端口扫描 (nmap)
- [ ] SSL/TLS 测试 (testssl.sh/sslscan)
- [ ] HTTP 安全头 (curl)
- [ ] Web 漏洞扫描 (nikto)
- [ ] 目录枚举 (gobuster/dirb)
- [ ] 技术识别 (whatweb)
- [ ] robots.txt 检查

## 📊 结果对比

将 Kali Linux 扫描结果与 macOS 检查脚本结果对比：
- macOS: `./check-security.sh`
- Kali: `./scan-aztcon.sh`

## 📁 文件传输

### 从 macOS 复制到 Kali Linux
```bash
# 使用 scp
scp scan-aztcon.sh user@kali-ip:/home/user/
scp kali-security-scan-guide.md user@kali-ip:/home/user/
```

### 从 Kali Linux 复制结果到 macOS
```bash
# 在 macOS 中执行
scp -r user@kali-ip:/home/user/scan-results-* ./
```

## 🎯 重点关注

1. **开放端口** - 只应开放 80, 443
2. **SSL 配置** - TLS 1.2+, 强加密套件
3. **安全响应头** - HSTS, CSP, X-Frame-Options 等
4. **暴露文件** - .git, .env, backup 等
5. **服务器信息** - 版本信息泄露

---

详细指南: `kali-security-scan-guide.md`
