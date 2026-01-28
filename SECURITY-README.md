# 网站安全检查工具使用指南

## 📦 包含的文件

1. **`security-check.md`** - 详细的安全检查清单和配置指南
2. **`security-check.js`** - Node.js 安全检查脚本
3. **`check-security.sh`** - Shell 安全检查脚本（推荐）
4. **`.htaccess.example`** - Apache 服务器安全配置示例
5. **`SECURITY-IMPROVEMENTS.md`** - 当前发现的问题和改进建议

## 🚀 快速开始

### 方法 1：使用 Shell 脚本（推荐）

```bash
# 运行安全检查
./check-security.sh
```

### 方法 2：使用 Node.js 脚本

```bash
# 运行安全检查
node security-check.js
```

## 📊 检查结果解读

### ✓ 绿色标记
- 表示该项检查通过
- 配置正确或状态正常

### ✗ 红色标记
- 表示该项需要关注
- 可能需要配置或修复

### ⚠ 黄色标记
- 表示建议改进
- 不是严重问题，但建议优化

## 🔧 主要检查项目

1. **HTTPS 和 SSL/TLS**
   - 检查 HTTPS 是否可用
   - 验证 SSL 证书有效性

2. **HTTP 安全响应头**
   - HSTS (强制 HTTPS)
   - X-Frame-Options (防止点击劫持)
   - X-Content-Type-Options (防止 MIME 嗅探)
   - Content-Security-Policy (CSP)
   - Referrer-Policy
   - X-XSS-Protection

3. **robots.txt**
   - 检查文件是否存在
   - 检查是否暴露敏感目录

4. **基本可访问性**
   - 网站是否可正常访问
   - HTTP 状态码检查

## 🛠️ 如何修复发现的问题

### 1. 配置安全响应头

**如果使用 Apache：**
```bash
# 复制示例文件
cp .htaccess.example .htaccess

# 根据实际情况编辑
nano .htaccess
```

**如果使用 Nginx：**
参考 `security-check.md` 中的 Nginx 配置示例

**如果使用其他服务器：**
参考 `security-check.md` 中的配置指南

### 2. 优化 robots.txt

编辑 `robots.txt` 文件，移除不存在的目录引用。

### 3. 添加 SRI（可选）

为外部资源添加完整性验证：
```bash
# 使用在线工具生成 SRI 哈希
# https://www.srihash.org/
```

## 🌐 在线安全检查工具

运行脚本后，会显示以下推荐工具的链接：

1. **SSL Labs** - SSL/TLS 详细检查
2. **Security Headers** - HTTP 安全头检查
3. **Mozilla Observatory** - 综合安全评分
4. **Sucuri SiteCheck** - 恶意软件检查
5. **Google Safe Browsing** - 黑名单检查

## 📝 当前状态总结

根据最新检查（2026-01-26）：

✅ **正常：**
- HTTPS 可用
- SSL 证书有效
- 网站可访问

⚠️ **需要改进：**
- 缺少 HTTP 安全响应头（高优先级）
- robots.txt 可能暴露敏感目录（中优先级）
- 外部资源未使用 SRI（中优先级）

详细改进建议请查看：**`SECURITY-IMPROVEMENTS.md`**

## 🔄 定期检查

建议定期运行安全检查：

```bash
# 每周运行一次
./check-security.sh > security-report-$(date +%Y%m%d).txt
```

## 📚 更多信息

- 详细配置指南：`security-check.md`
- 改进建议：`SECURITY-IMPROVEMENTS.md`
- Apache 配置示例：`.htaccess.example`

## ❓ 常见问题

**Q: 我应该使用哪个检查脚本？**  
A: 推荐使用 `check-security.sh`，它更简单且不需要 Node.js。

**Q: 如何验证安全响应头是否生效？**  
A: 运行检查脚本后，访问 https://securityheaders.com/?q=https://aztcon.com

**Q: 配置安全响应头会影响网站功能吗？**  
A: 正确配置不会影响正常功能。如果遇到问题，可以逐步添加响应头并测试。

**Q: 静态网站也需要这些安全措施吗？**  
A: 是的，即使是静态网站，安全响应头也能防止多种攻击（如点击劫持、XSS 等）。

---

**需要帮助？** 查看详细文档或联系技术支持。
