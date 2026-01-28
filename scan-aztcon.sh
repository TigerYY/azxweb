#!/bin/bash

###############################################################################
# 网站安全扫描脚本 - 用于 Kali Linux
# 目标: aztcon.com
# 
# 使用方法:
#   chmod +x scan-aztcon.sh
#   ./scan-aztcon.sh
#
# 注意: 仅用于扫描您自己拥有或已授权的网站
###############################################################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置
TARGET="aztcon.com"
TARGET_URL="https://${TARGET}"
DATE=$(date +%Y%m%d-%H%M%S)
OUTPUT_DIR="scan-results-${DATE}"

# 创建输出目录
mkdir -p "${OUTPUT_DIR}"
cd "${OUTPUT_DIR}" || exit

# 打印横幅
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║        网站安全扫描工具 - Kali Linux 版本              ║"
echo "║        目标: ${TARGET}                                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${YELLOW}⚠️  警告: 仅用于扫描您自己拥有或已授权的网站！${NC}"
echo ""
echo -e "${BLUE}扫描结果将保存到: ${OUTPUT_DIR}${NC}"
echo ""

# 检查网络连接
echo -e "${CYAN}[检查]${NC} 测试网络连接..."
if ping -c 2 "${TARGET}" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 网络连接正常"
else
    echo -e "${RED}✗${NC} 无法连接到 ${TARGET}"
    echo "请检查网络连接或目标域名是否正确"
    exit 1
fi
echo ""

# 函数：打印步骤
print_step() {
    local step_num=$1
    local total_steps=$2
    local description=$3
    echo -e "${CYAN}[${step_num}/${total_steps}]${NC} ${description}..."
}

# 函数：检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${YELLOW}⚠${NC}  警告: $1 未安装，跳过此步骤"
        return 1
    fi
    return 0
}

TOTAL_STEPS=8
STEP=1

# 1. Nmap 端口扫描
print_step $STEP $TOTAL_STEPS "Nmap 端口和服务扫描"
if check_command nmap; then
    echo "  扫描常见 Web 端口 (80, 443, 8080, 8443)..."
    nmap -sV -sC -p 80,443,8080,8443 "${TARGET}" -oN nmap-scan.txt 2>&1 | tail -20
    echo -e "${GREEN}✓${NC} 结果已保存到 nmap-scan.txt"
else
    echo -e "${YELLOW}⚠${NC}  Nmap 未安装，跳过"
fi
echo ""
STEP=$((STEP + 1))

# 2. SSL/TLS 安全扫描
print_step $STEP $TOTAL_STEPS "SSL/TLS 安全扫描"
if check_command testssl.sh; then
    echo "  执行完整 SSL/TLS 测试（这可能需要几分钟）..."
    testssl.sh --color 0 "${TARGET}" > ssl-report.txt 2>&1
    echo -e "${GREEN}✓${NC} 结果已保存到 ssl-report.txt"
elif check_command sslscan; then
    echo "  使用 sslscan 进行 SSL 扫描..."
    sslscan "${TARGET}" > sslscan-report.txt 2>&1
    echo -e "${GREEN}✓${NC} 结果已保存到 sslscan-report.txt"
else
    echo "  使用 openssl 检查证书..."
    echo | openssl s_client -connect "${TARGET}:443" -servername "${TARGET}" 2>/dev/null | \
        openssl x509 -noout -dates -subject -issuer > ssl-basic-check.txt 2>&1
    echo -e "${GREEN}✓${NC} 基本证书信息已保存到 ssl-basic-check.txt"
fi
echo ""
STEP=$((STEP + 1))

# 3. HTTP 安全响应头检查
print_step $STEP $TOTAL_STEPS "HTTP 安全响应头检查"
echo "  获取 HTTP 响应头..."
curl -I "${TARGET_URL}" -s -o http-headers.txt
echo -e "${GREEN}✓${NC} 响应头已保存到 http-headers.txt"
echo ""
echo "  检查关键安全头:"
SECURITY_HEADERS=(
    "strict-transport-security:HSTS"
    "x-frame-options:X-Frame-Options"
    "x-content-type-options:X-Content-Type-Options"
    "content-security-policy:CSP"
    "referrer-policy:Referrer-Policy"
    "x-xss-protection:X-XSS-Protection"
)

for header_info in "${SECURITY_HEADERS[@]}"; do
    IFS=':' read -r header name <<< "$header_info"
    if grep -qi "^${header}:" http-headers.txt; then
        value=$(grep -i "^${header}:" http-headers.txt | cut -d: -f2- | xargs)
        echo -e "    ${GREEN}✓${NC} ${name}: ${value}"
    else
        echo -e "    ${RED}✗${NC} ${name}: 未设置"
    fi
done
echo ""
STEP=$((STEP + 1))

# 4. Nikto Web 漏洞扫描
print_step $STEP $TOTAL_STEPS "Nikto Web 服务器扫描"
if check_command nikto; then
    echo "  执行 Nikto 扫描（这可能需要几分钟）..."
    timeout 300 nikto -h "${TARGET_URL}" -o nikto-report.txt -Format txt 2>&1 | tail -30
    echo -e "${GREEN}✓${NC} 结果已保存到 nikto-report.txt"
else
    echo -e "${YELLOW}⚠${NC}  Nikto 未安装，跳过"
fi
echo ""
STEP=$((STEP + 1))

# 5. 目录和文件枚举
print_step $STEP $TOTAL_STEPS "目录和文件枚举"
if check_command gobuster; then
    echo "  使用 Gobuster 进行目录扫描（使用中等字典，可能需要较长时间）..."
    echo "  提示: 按 Ctrl+C 可提前停止"
    WORDLIST="/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt"
    if [ ! -f "$WORDLIST" ]; then
        WORDLIST="/usr/share/wordlists/dirb/common.txt"
    fi
    if [ -f "$WORDLIST" ]; then
        timeout 600 gobuster dir -u "${TARGET_URL}" -w "$WORDLIST" -t 30 -q -o gobuster-results.txt 2>&1
        echo -e "${GREEN}✓${NC} 结果已保存到 gobuster-results.txt"
    else
        echo -e "${YELLOW}⚠${NC}  未找到字典文件，跳过"
    fi
elif check_command dirb; then
    echo "  使用 Dirb 进行目录扫描..."
    timeout 600 dirb "${TARGET_URL}" -o dirb-results.txt 2>&1 | tail -20
    echo -e "${GREEN}✓${NC} 结果已保存到 dirb-results.txt"
else
    echo -e "${YELLOW}⚠${NC}  目录扫描工具未安装，跳过"
fi
echo ""
STEP=$((STEP + 1))

# 6. Web 技术识别
print_step $STEP $TOTAL_STEPS "Web 技术识别"
if check_command whatweb; then
    echo "  识别网站使用的技术..."
    whatweb "${TARGET_URL}" -a 3 > whatweb-results.txt 2>&1
    cat whatweb-results.txt
    echo -e "${GREEN}✓${NC} 结果已保存到 whatweb-results.txt"
else
    echo "  使用 curl 检查服务器信息..."
    curl -sI "${TARGET_URL}" | grep -iE "(server|x-powered-by)" > server-info.txt
    if [ -s server-info.txt ]; then
        cat server-info.txt
        echo -e "${GREEN}✓${NC} 服务器信息已保存到 server-info.txt"
    else
        echo -e "${YELLOW}⚠${NC}  未检测到服务器信息（可能是好事，说明隐藏了版本信息）"
    fi
fi
echo ""
STEP=$((STEP + 1))

# 7. robots.txt 检查
print_step $STEP $TOTAL_STEPS "robots.txt 检查"
echo "  检查 robots.txt..."
if curl -s -o robots.txt "${TARGET_URL}/robots.txt" && [ -s robots.txt ]; then
    echo -e "${GREEN}✓${NC} robots.txt 存在"
    echo "  内容:"
    cat robots.txt | sed 's/^/    /'
    echo -e "${GREEN}✓${NC} 内容已保存到 robots.txt"
    
    # 检查敏感目录
    if grep -qiE "(admin|\.git|\.env|config|private|backup)" robots.txt; then
        echo -e "${YELLOW}⚠${NC}  警告: robots.txt 中可能包含敏感目录"
    fi
else
    echo -e "${YELLOW}⚠${NC}  robots.txt 不存在或无法访问"
fi
echo ""
STEP=$((STEP + 1))

# 8. 生成扫描摘要
print_step $STEP $TOTAL_STEPS "生成扫描摘要"
{
    echo "=========================================="
    echo "网站安全扫描报告"
    echo "=========================================="
    echo "目标网站: ${TARGET}"
    echo "扫描时间: $(date)"
    echo "扫描工具: Kali Linux 安全扫描脚本"
    echo ""
    echo "=========================================="
    echo "扫描结果文件:"
    echo "=========================================="
    ls -lh | grep -v "^d" | awk '{print $9, "(" $5 ")"}'
    echo ""
    echo "=========================================="
    echo "快速检查结果:"
    echo "=========================================="
    
    # HTTP 安全头统计
    echo ""
    echo "HTTP 安全响应头:"
    MISSING_HEADERS=0
    for header_info in "${SECURITY_HEADERS[@]}"; do
        IFS=':' read -r header name <<< "$header_info"
        if ! grep -qi "^${header}:" http-headers.txt 2>/dev/null; then
            echo "  ✗ ${name}: 未设置"
            MISSING_HEADERS=$((MISSING_HEADERS + 1))
        fi
    done
    
    if [ $MISSING_HEADERS -eq 0 ]; then
        echo "  ✓ 所有关键安全头都已设置"
    else
        echo "  ⚠ 缺少 ${MISSING_HEADERS} 个安全响应头"
    fi
    
    echo ""
    echo "=========================================="
    echo "建议的下一步操作:"
    echo "=========================================="
    echo "1. 查看详细报告文件"
    echo "2. 对比之前的安全检查结果"
    echo "3. 根据发现的问题进行修复"
    echo "4. 修复后重新扫描验证"
    echo ""
    echo "相关文档:"
    echo "  - SECURITY-IMPROVEMENTS.md"
    echo "  - security-check.md"
    echo ""
} > summary.txt

cat summary.txt
echo -e "${GREEN}✓${NC} 摘要已保存到 summary.txt"
echo ""

# 完成
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   扫描完成！                            ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}结果目录:${NC} $(pwd)"
echo -e "${CYAN}查看摘要:${NC} cat summary.txt"
echo ""
echo -e "${YELLOW}提示:${NC} 将扫描结果与 macOS 上的检查脚本结果进行对比"
echo ""
