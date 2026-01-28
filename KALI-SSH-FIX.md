# Kali Linux SSH 连接修复指南

## 🚨 问题：SSH 连接被拒绝

错误信息：
```
ssh: connect to host 10.211.55.6 port 22: Connection refused
```

## ⚡ 快速解决方案

### 方法 1：使用一键修复脚本（推荐）

#### 步骤 1：将脚本传输到 Kali Linux

**选项 A：使用 Parallels 共享文件夹**
```bash
# 在 macOS 中
cp fix-kali-ssh.sh ~/Parallels/Kali\ Linux/共享/
```

然后在 Kali Linux 中：
```bash
cd ~/Parallels/共享/
sudo bash fix-kali-ssh.sh
```

**选项 B：使用 HTTP 服务器**

在 macOS 中启动 HTTP 服务器：
```bash
cd /Users/yangyang/Documents/YYCode/aztcon.com
python3 -m http.server 8000
```

在 Kali Linux 中下载并执行：
```bash
wget http://10.211.55.2:8000/fix-kali-ssh.sh
sudo bash fix-kali-ssh.sh
```

**选项 C：直接在 Kali Linux 中创建脚本**

在 Kali Linux 终端中：
```bash
nano fix-kali-ssh.sh
# 然后复制 fix-kali-ssh.sh 的内容并保存
sudo bash fix-kali-ssh.sh
```

#### 步骤 2：验证修复

修复完成后，在 macOS 中测试：
```bash
ssh tiger@10.211.55.6
```

---

### 方法 2：手动修复（如果脚本不可用）

在 Kali Linux 终端中依次执行：

```bash
# 1. 安装 OpenSSH 服务器（如果未安装）
sudo apt update
sudo apt install -y openssh-server

# 2. 启动 SSH 服务
sudo systemctl start ssh
sudo systemctl enable ssh

# 3. 检查服务状态
sudo systemctl status ssh

# 4. 检查端口监听
sudo netstat -tlnp | grep :22
# 或
sudo ss -tlnp | grep :22

# 5. 配置防火墙（如果启用了防火墙）
sudo ufw allow ssh
sudo ufw allow 22/tcp
sudo ufw status
```

---

## 🔍 故障排查

### 问题 1：服务启动失败

```bash
# 查看详细错误信息
sudo systemctl status ssh
sudo journalctl -u ssh -n 50
```

### 问题 2：端口被占用

```bash
# 查看占用 22 端口的进程
sudo lsof -i :22
# 或
sudo netstat -tlnp | grep :22
```

### 问题 3：防火墙阻止

```bash
# 检查防火墙状态
sudo ufw status verbose

# 如果防火墙已启用，确保允许 SSH
sudo ufw allow 22/tcp
sudo ufw reload
```

### 问题 4：SSH 配置问题

```bash
# 检查 SSH 配置
sudo nano /etc/ssh/sshd_config

# 确保以下配置：
# Port 22
# PermitRootLogin no (推荐)
# PasswordAuthentication yes
# PubkeyAuthentication yes

# 修改后重启服务
sudo systemctl restart ssh
```

### 问题 5：网络连接问题

在 macOS 中测试：
```bash
# 测试网络连通性
ping -c 3 10.211.55.6

# 测试端口是否开放
nc -zv 10.211.55.6 22
# 或
telnet 10.211.55.6 22
```

---

## ✅ 验证清单

修复后，请确认：

- [ ] SSH 服务正在运行：`sudo systemctl status ssh`
- [ ] 22 端口正在监听：`sudo netstat -tlnp | grep :22`
- [ ] 防火墙允许 SSH：`sudo ufw status | grep 22`
- [ ] 可以从 macOS 连接：`ssh tiger@10.211.55.6`

---

## 📝 常见命令参考

```bash
# 启动 SSH 服务
sudo systemctl start ssh

# 停止 SSH 服务
sudo systemctl stop ssh

# 重启 SSH 服务
sudo systemctl restart ssh

# 查看 SSH 服务状态
sudo systemctl status ssh

# 设置开机自启
sudo systemctl enable ssh

# 禁用开机自启
sudo systemctl disable ssh

# 查看 SSH 日志
sudo journalctl -u ssh -f

# 测试 SSH 配置（不重启服务）
sudo sshd -t
```

---

## 💡 提示

1. **首次连接**：首次 SSH 连接时会提示确认主机密钥，输入 `yes` 即可
2. **密码认证**：确保 `/etc/ssh/sshd_config` 中 `PasswordAuthentication yes`
3. **用户权限**：确保用户 `tiger` 存在且有登录权限
4. **网络配置**：如果使用 Parallels，确保网络模式设置为"共享网络"或"桥接网络"

---

## 🔗 相关文档

- 详细设置指南：`kali-setup-guide.md`
- 快速扫描参考：`KALI-QUICK-REFERENCE.md`
- 执行指南：`KALI-EXECUTE-GUIDE.md`
