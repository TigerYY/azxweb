#!/bin/bash
# 快速安全扫描脚本 - 可直接在 Kali Linux 中创建和执行

TARGET="aztcon.com"
DATE=$(date +%Y%m%d-%H%M%S)
OUTPUT_DIR="$HOME/scan-results-${DATE}"

mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR" || exit

echo "=========================================="
echo "网站安全扫描 - $TARGET"
echo "=========================================="
echo "结果将保存到: $OUTPUT_DIR"
echo ""

# 检查工具
check_tool() {
    if ! command -v "$1" &> /dev/null; then
        echo "⚠  $1 未安装，正在安装..."
        sudo apt update -qq && sudo apt install -y "$1" 2>/dev/null || echo "  无法安装 $1，跳过"
    fi
}

echo "[准备] 检查必要工具..."
check_tool nmap
check_tool curl
check_tool sslscan
check_tool nikto
check_tool whatweb

echo ""
echo "开始扫描..."
echo ""

# 1. 端口扫描
echo "[1/6] 端口和服务扫描..."
nmap -sV -p 80,443 "$TARGET" -oN nmap-scan.txt 2>&1 | tail -15
echo "✓ 完成"

# 2. SSL/TLS 扫描
echo ""
echo "[2/6] SSL/TLS 安全扫描..."
if command -v sslscan &> /dev/null; then
    sslscan "$TARGET" > sslscan-report.txt 2>&1
    echo "✓ 完成（查看 sslscan-report.txt）"
else
    echo "⚠  sslscan 未安装，跳过"
fi

# 3. HTTP 安全头检查
echo ""
echo "[3/6] HTTP 安全响应头检查..."
curl -I "https://$TARGET" -s -o http-headers.txt
echo "响应头："
echo "----------------------------------------"
cat http-headers.txt
echo "----------------------------------------"
echo ""
echo "关键安全头检查："
SECURITY_HEADERS=("strict-transport-security" "x-frame-options" "x-content-type-options" "content-security-policy" "referrer-policy" "x-xss-protection")
MISSING=0
for header in "${SECURITY_HEADERS[@]}"; do
    if grep -qi "^${header}:" http-headers.txt; then
        value=$(grep -i "^${header}:" http-headers.txt | cut -d: -f2- | xargs)
        echo "  ✓ $header: $value"
    else
        echo "  ✗ $header: 未设置"
        MISSING=$((MISSING + 1))
    fi
done
if [ $MISSING -gt 0 ]; then
    echo ""
    echo "⚠  警告: 缺少 $MISSING 个安全响应头"
fi
echo "✓ 完成"

# 4. Web 漏洞扫描
echo ""
echo "[4/6] Web 服务器漏洞扫描（可能需要几分钟）..."
if command -v nikto &> /dev/null; then
    timeout 600 nikto -h "https://$TARGET" -o nikto-report.txt -Format txt -maxtime 10m 2>&1 | tail -20
    echo "✓ 完成（查看 nikto-report.txt）"
else
    echo "⚠  nikto 未安装，跳过"
fi

# 5. Web 技术识别
echo ""
echo "[5/6] Web 技术识别..."
if command -v whatweb &> /dev/null; then
    whatweb "https://$TARGET" -a 3 > whatweb-results.txt 2>&1
    cat whatweb-results.txt
    echo "✓ 完成"
else
    echo "⚠  whatweb 未安装，跳过"
fi

# 6. robots.txt 检查
echo ""
echo "[6/6] robots.txt 检查..."
if curl -s "https://$TARGET/robots.txt" -o robots.txt && [ -s robots.txt ]; then
    echo "robots.txt 内容："
    cat robots.txt
    echo "✓ 完成"
else
    echo "⚠  robots.txt 不存在或无法访问"
fi

# 生成摘要
echo ""
echo "=========================================="
echo "扫描完成！"
echo "=========================================="
echo "结果目录: $OUTPUT_DIR"
echo ""
echo "文件列表："
ls -lh
echo ""
echo "快速查看结果："
echo "  - 端口扫描: cat nmap-scan.txt"
echo "  - HTTP 头: cat http-headers.txt"
echo "  - SSL 报告: cat sslscan-report.txt"
echo "  - Web 扫描: cat nikto-report.txt"
echo ""
echo "建议的下一步："
echo "  1. 查看详细报告文件"
echo "  2. 对比 macOS 上的检查结果"
echo "  3. 根据发现的问题进行修复"
echo ""
