#!/bin/bash

# 网站安全检查脚本 (Shell 版本)
# 用于快速检查 aztcon.com 的安全配置

SITE="aztcon.com"
SITE_URL="https://${SITE}"

echo "🔒 网站安全检查 - ${SITE_URL}"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 检查函数
check_item() {
    local name=$1
    local passed=$2
    local message=$3
    
    if [ "$passed" = true ]; then
        echo -e "${GREEN}✓${NC} $name"
    else
        echo -e "${RED}✗${NC} $name"
    fi
    
    if [ -n "$message" ]; then
        echo -e "  ${YELLOW}→${NC} $message"
    fi
}

# 1. 检查 HTTPS
echo -e "${CYAN}1. HTTPS 和 SSL/TLS 检查${NC}"
echo "----------------------------------------"

if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${SITE_URL}" | grep -q "200\|301\|302"; then
    check_item "HTTPS 可用" true "网站可以通过 HTTPS 访问"
    
    # 检查 SSL 证书
    if echo | openssl s_client -connect "${SITE}:443" -servername "${SITE}" 2>/dev/null | grep -q "Verify return code: 0"; then
        check_item "SSL 证书有效" true
    else
        check_item "SSL 证书有效" false "请检查证书配置"
    fi
else
    check_item "HTTPS 可用" false "无法通过 HTTPS 访问"
fi

echo ""

# 2. 检查 HTTP 安全响应头
echo -e "${CYAN}2. HTTP 安全响应头检查${NC}"
echo "----------------------------------------"

HEADERS=$(curl -sI "${SITE_URL}" --max-time 5)

check_header() {
    local header=$1
    local name=$2
    
    if echo "$HEADERS" | grep -qi "^${header}:"; then
        local value=$(echo "$HEADERS" | grep -i "^${header}:" | cut -d: -f2- | xargs)
        check_item "$name" true "$value"
    else
        check_item "$name" false "未设置"
    fi
}

check_header "strict-transport-security" "HSTS (强制 HTTPS)"
check_header "x-frame-options" "X-Frame-Options (防止点击劫持)"
check_header "x-content-type-options" "X-Content-Type-Options (防止 MIME 嗅探)"
check_header "content-security-policy" "Content-Security-Policy (CSP)"
check_header "referrer-policy" "Referrer-Policy"
check_header "x-xss-protection" "X-XSS-Protection"

echo ""

# 3. 检查 robots.txt
echo -e "${CYAN}3. robots.txt 检查${NC}"
echo "----------------------------------------"

if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${SITE_URL}/robots.txt" | grep -q "200"; then
    check_item "robots.txt 存在" true
    ROBOTS_CONTENT=$(curl -s --max-time 5 "${SITE_URL}/robots.txt")
    
    # 检查敏感目录
    if echo "$ROBOTS_CONTENT" | grep -qiE "(admin|\.git|\.env|config|private)"; then
        check_item "敏感目录检查" false "robots.txt 可能暴露敏感目录"
    else
        check_item "敏感目录检查" true
    fi
else
    check_item "robots.txt 存在" false "无法访问 robots.txt"
fi

echo ""

# 4. 检查网站可访问性
echo -e "${CYAN}4. 基本可访问性检查${NC}"
echo "----------------------------------------"

STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${SITE_URL}")

if [ "$STATUS_CODE" = "200" ]; then
    check_item "网站可访问" true "HTTP 状态码: $STATUS_CODE"
elif [ "$STATUS_CODE" = "301" ] || [ "$STATUS_CODE" = "302" ]; then
    check_item "网站可访问" true "HTTP 状态码: $STATUS_CODE (重定向)"
else
    check_item "网站可访问" false "HTTP 状态码: $STATUS_CODE"
fi

echo ""

# 5. 推荐工具
echo -e "${CYAN}5. 推荐的在线安全检查工具${NC}"
echo "----------------------------------------"
echo -e "${BLUE}SSL Labs SSL Test:${NC}"
echo "  https://www.ssllabs.com/ssltest/analyze.html?d=${SITE}"
echo ""
echo -e "${BLUE}Security Headers:${NC}"
echo "  https://securityheaders.com/?q=${SITE_URL}"
echo ""
echo -e "${BLUE}Mozilla Observatory:${NC}"
echo "  https://observatory.mozilla.org/analyze/${SITE}"
echo ""
echo -e "${BLUE}Sucuri SiteCheck:${NC}"
echo "  https://sitecheck.sucuri.net/?scan=${SITE}"
echo ""
echo -e "${BLUE}Google Safe Browsing:${NC}"
echo "  https://transparencyreport.google.com/safe-browsing/search?url=${SITE_URL}"
echo ""

echo -e "${GREEN}检查完成！${NC}"
echo ""
echo "提示：查看 security-check.md 获取详细的安全配置指南"
