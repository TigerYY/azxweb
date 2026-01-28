# 网站安全检查指南 - aztcon.com

## 📋 快速检查清单

### 1. HTTPS 和 SSL/TLS 配置
- [ ] 确认网站使用 HTTPS（https://aztcon.com）
- [ ] 检查 SSL 证书是否有效且未过期
- [ ] 验证是否强制 HTTPS 重定向（HTTP → HTTPS）
- [ ] 检查 TLS 版本（建议 TLS 1.2+）
- [ ] 验证证书链完整性

**在线工具：**
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/analyze.html?d=aztcon.com)
- [Security Headers](https://securityheaders.com/?q=https://aztcon.com)

### 2. HTTP 安全响应头
检查以下安全头是否配置：
- [ ] `Content-Security-Policy` (CSP) - 防止 XSS 攻击
- [ ] `X-Frame-Options` - 防止点击劫持
- [ ] `X-Content-Type-Options: nosniff` - 防止 MIME 类型嗅探
- [ ] `Strict-Transport-Security` (HSTS) - 强制 HTTPS
- [ ] `Referrer-Policy` - 控制 referrer 信息
- [ ] `Permissions-Policy` - 控制浏览器功能

**当前状态检查：**
```bash
curl -I https://aztcon.com
```

### 3. 内容安全策略 (CSP)
- [ ] 检查是否有 CSP 头
- [ ] 验证外部资源（CDN）是否在白名单中
- [ ] 确认内联脚本和样式是否安全

### 4. 外部资源安全检查
检查所有外部 CDN 和资源：
- [ ] `cdnjs.cloudflare.com` - 是否使用 SRI (Subresource Integrity)
- [ ] `cdn.jsdelivr.net` - 是否使用 SRI
- [ ] `cdn.plot.ly` - 是否使用 SRI
- [ ] 验证所有外部脚本来源可信

### 5. 表单安全
- [ ] 联系表单是否有 CSRF 保护（静态网站通常不需要）
- [ ] 表单提交是否有输入验证
- [ ] 是否有防止垃圾邮件的措施（如 reCAPTCHA）

### 6. 敏感信息泄露
- [ ] 检查 robots.txt 是否暴露敏感目录
- [ ] 确认没有暴露 `.git`、`.env` 等敏感文件
- [ ] 检查页面源码中是否有硬编码的 API 密钥或密码
- [ ] 验证错误页面不泄露系统信息

### 7. 依赖和第三方库
- [ ] 检查使用的 JavaScript 库是否有已知漏洞
- [ ] 定期更新第三方依赖
- [ ] 使用 SRI 哈希验证外部资源完整性

### 8. 文件上传（如适用）
- [ ] 文件类型验证
- [ ] 文件大小限制
- [ ] 文件存储位置安全

### 9. 访问控制
- [ ] 确认管理后台（如存在）有适当保护
- [ ] 检查目录遍历漏洞
- [ ] 验证敏感文件访问权限

### 10. 性能和可用性
- [ ] 网站加载速度
- [ ] 移动端响应式设计
- [ ] 可访问性（a11y）检查

## 🔧 自动化检查工具

### 在线安全扫描工具
1. **SSL Labs** - SSL/TLS 配置检查
   - https://www.ssllabs.com/ssltest/analyze.html?d=aztcon.com

2. **Security Headers** - HTTP 安全头检查
   - https://securityheaders.com/?q=https://aztcon.com

3. **Mozilla Observatory** - 综合安全评分
   - https://observatory.mozilla.org/analyze/aztcon.com

4. **Sucuri SiteCheck** - 恶意软件和黑名单检查
   - https://sitecheck.sucuri.net/?scan=aztcon.com

5. **Google Safe Browsing** - 检查网站是否被标记为不安全
   - https://transparencyreport.google.com/safe-browsing/search?url=aztcon.com

6. **WebPageTest** - 性能和安全性检查
   - https://www.webpagetest.org/

### 命令行工具
- **curl** - 检查 HTTP 响应头
- **nmap** - 端口扫描和服务检测
- **testssl.sh** - SSL/TLS 测试
- **nikto** - Web 服务器漏洞扫描

## 📝 推荐的安全配置

### Nginx 配置示例（如果使用）
```nginx
# 强制 HTTPS
server {
    listen 80;
    server_name aztcon.com www.aztcon.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aztcon.com www.aztcon.com;

    # SSL 配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CSP（根据实际需求调整）
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';" always;

    # 其他配置...
}
```

### Apache 配置示例（如果使用）
```apache
# 强制 HTTPS
<VirtualHost *:80>
    ServerName aztcon.com
    Redirect permanent / https://aztcon.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName aztcon.com
    
    # SSL 配置
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    # 安全头
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</VirtualHost>
```

## 🚨 常见安全问题及解决方案

### 1. 缺少安全响应头
**问题：** 网站没有设置必要的安全头
**解决：** 在服务器配置中添加安全响应头（见上方配置示例）

### 2. 外部资源未使用 SRI
**问题：** CDN 资源可能被篡改
**解决：** 为所有外部脚本和样式添加 `integrity` 属性

### 3. 混合内容（Mixed Content）
**问题：** HTTPS 页面加载 HTTP 资源
**解决：** 确保所有资源都使用 HTTPS

### 4. 过时的 SSL/TLS 配置
**问题：** 使用旧版或不安全的 TLS 版本
**解决：** 更新到 TLS 1.2 或更高版本

## 📅 定期检查计划

- **每日：** 自动化监控（如使用监控服务）
- **每周：** 手动检查安全头配置
- **每月：** 完整安全扫描
- **每季度：** 安全审计和渗透测试
- **每年：** 全面安全评估

## 📞 需要帮助？

如果发现安全问题，建议：
1. 记录问题详情
2. 评估风险等级
3. 制定修复计划
4. 及时修复并验证

---

**最后更新：** 2026-01-26
**网站：** https://aztcon.com
