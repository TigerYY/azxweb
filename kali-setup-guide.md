# Kali Linux 连接和扫描设置指南

## 🔌 SSH 连接问题排查

### ⚡ 快速修复（推荐）

如果遇到 "Connection refused" 错误，可以使用一键修复脚本：

**方法 1：使用修复脚本（最简单）**

1. 将 `fix-kali-ssh.sh` 传输到 Kali Linux（使用 Parallels 共享文件夹、HTTP 服务器或其他方法）
2. 在 Kali Linux 终端中执行：
```bash
sudo bash fix-kali-ssh.sh
```

脚本会自动：
- ✅ 检查并安装 OpenSSH 服务器
- ✅ 启动 SSH 服务并设置开机自启
- ✅ 配置防火墙允许 22 端口
- ✅ 验证 SSH 服务状态

**方法 2：手动修复**

### 1. 检查网络连通性

```bash
# 在 macOS 中测试网络连接
ping -c 3 10.211.55.6
```

### 2. 检查 SSH 服务状态（在 Kali Linux 中）

如果无法通过 SSH 连接，请在 Kali Linux 的图形界面或控制台中执行：

```bash
# 检查 SSH 服务状态
sudo systemctl status ssh
# 或
sudo systemctl status sshd

# 如果未运行，启动 SSH 服务
sudo systemctl start ssh
sudo systemctl enable ssh

# 检查 SSH 端口是否监听
sudo netstat -tlnp | grep :22
# 或
sudo ss -tlnp | grep :22
```

### 3. 配置 SSH 服务（如果需要）

```bash
# 安装 SSH 服务器（如果未安装）
sudo apt update
sudo apt install -y openssh-server

# 配置 SSH（可选）
sudo nano /etc/ssh/sshd_config

# 确保以下配置：
# PermitRootLogin no
# PasswordAuthentication yes
# PubkeyAuthentication yes

# 重启 SSH 服务
sudo systemctl restart ssh
```

## 📁 方法 1：使用共享文件夹（推荐，如果 Parallels 已配置）

如果 Parallels 已配置共享文件夹：

```bash
# 在 macOS 中，将文件复制到共享文件夹
cp scan-aztcon.sh ~/Parallels/Kali\ Linux/共享/
cp kali-security-scan-guide.md ~/Parallels/Kali\ Linux/共享/

# 在 Kali Linux 中访问共享文件夹
cd ~/Parallels/共享/
# 或
cd /media/psf/Home/...（根据实际挂载点）
```

## 📁 方法 2：使用 USB 或网络共享

### 选项 A：使用 HTTP 服务器（简单）

在 macOS 中启动临时 HTTP 服务器：

```bash
# 在项目目录中
cd /Users/yangyang/Documents/YYCode/aztcon.com
python3 -m http.server 8000
```

然后在 Kali Linux 中下载：

```bash
# 在 Kali Linux 中
cd ~
wget http://10.211.55.2:8000/scan-aztcon.sh
wget http://10.211.55.2:8000/kali-security-scan-guide.md
chmod +x scan-aztcon.sh
```

### 选项 B：使用 SCP（需要 SSH 工作）

```bash
# 在 macOS 中
scp scan-aztcon.sh tiger@10.211.55.6:~/
scp kali-security-scan-guide.md tiger@10.211.55.6:~/
```

## 📁 方法 3：直接在 Kali Linux 中创建脚本

如果无法传输文件，可以直接在 Kali Linux 中创建脚本：

### 步骤 1：在 Kali Linux 中创建脚本

```bash
# 在 Kali Linux 终端中执行
cd ~
nano scan-aztcon.sh
```

然后复制 `scan-aztcon.sh` 的内容（可以从 macOS 中查看文件内容）。

### 步骤 2：或者使用 curl 从 GitHub Gist 下载（如果上传了）

## 🚀 执行扫描

一旦脚本在 Kali Linux 中可用：

```bash
# 1. 确保脚本有执行权限
chmod +x scan-aztcon.sh

# 2. 安装必要的工具（如果未安装）
sudo apt update
sudo apt install -y nmap nikto sslscan gobuster whatweb curl

# 3. 执行扫描
./scan-aztcon.sh
```

## 🔧 手动执行扫描（如果脚本不可用）

如果无法使用脚本，可以手动执行以下命令：

```bash
# 创建结果目录
mkdir -p ~/scan-results-$(date +%Y%m%d)
cd ~/scan-results-$(date +%Y%m%d)

# 1. 端口扫描
nmap -sV -p 80,443 aztcon.com -oN nmap-scan.txt

# 2. SSL 扫描
sslscan aztcon.com > sslscan-report.txt

# 3. HTTP 头检查
curl -I https://aztcon.com > http-headers.txt

# 4. Web 扫描
nikto -h https://aztcon.com -o nikto-report.txt -Format txt

# 5. 目录枚举（可选，需要时间）
gobuster dir -u https://aztcon.com -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o gobuster-results.txt

# 6. 技术识别
whatweb https://aztcon.com > whatweb-results.txt

# 查看结果
ls -lh
cat http-headers.txt
```

## 📊 获取结果

### 方法 1：使用 SCP（如果 SSH 可用）

```bash
# 在 macOS 中
scp -r tiger@10.211.55.6:~/scan-results-* ./
```

### 方法 2：使用共享文件夹

将结果从 Kali Linux 的共享文件夹复制到 macOS。

### 方法 3：使用 HTTP 服务器

在 Kali Linux 中：

```bash
cd ~/scan-results-*
python3 -m http.server 8000
```

在 macOS 中访问：`http://10.211.55.6:8000`

## 🐛 常见问题

### 问题 1：SSH 连接被拒绝

**解决方案：**
- 在 Kali Linux 中启动 SSH 服务
- 检查防火墙设置
- 确认 IP 地址正确

### 问题 2：工具未安装

**解决方案：**
```bash
sudo apt update
sudo apt install -y nmap nikto sslscan gobuster whatweb curl testssl.sh
```

### 问题 3：权限不足

**解决方案：**
```bash
chmod +x scan-aztcon.sh
```

## 📝 快速检查命令

如果只需要快速检查，可以在 Kali Linux 中执行：

```bash
# 快速安全检查（5分钟）
echo "=== 端口扫描 ===" && \
nmap -sV -p 80,443 aztcon.com && \
echo -e "\n=== SSL 检查 ===" && \
sslscan aztcon.com | head -30 && \
echo -e "\n=== HTTP 安全头 ===" && \
curl -I https://aztcon.com | grep -iE "(strict|frame|xss|csp|content-type)" && \
echo -e "\n=== 快速 Web 扫描 ===" && \
nikto -h https://aztcon.com -maxtime 5m
```

---

**提示：** 如果 SSH 无法连接，建议使用 Parallels 共享文件夹或直接在 Kali Linux 图形界面中操作。
