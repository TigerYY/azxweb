#!/usr/bin/env node

/**
 * 网站安全检查脚本
 * 用于检查 aztcon.com 的安全配置
 * 
 * 使用方法：
 *   node security-check.js
 *   或
 *   chmod +x security-check.js && ./security-check.js
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

const SITE_URL = 'aztcon.com';
const SITE_URL_FULL = `https://${SITE_URL}`;

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60));
}

function logCheck(name, passed, message = '') {
    const status = passed ? '✓' : '✗';
    const color = passed ? 'green' : 'red';
    log(`  ${status} ${name}`, color);
    if (message) {
        log(`    ${message}`, 'yellow');
    }
}

// 检查 HTTPS 可用性
function checkHTTPS() {
    return new Promise((resolve) => {
        logSection('1. HTTPS 和 SSL/TLS 检查');
        
        const options = {
            hostname: SITE_URL,
            port: 443,
            path: '/',
            method: 'HEAD',
            rejectUnauthorized: true,
        };

        const req = https.request(options, (res) => {
            logCheck('HTTPS 可用', true, `状态码: ${res.statusCode}`);
            
            // 检查重定向
            if (res.statusCode === 301 || res.statusCode === 302) {
                logCheck('HTTP 到 HTTPS 重定向', true, `重定向到: ${res.headers.location}`);
            }
            
            resolve({
                https: true,
                statusCode: res.statusCode,
                headers: res.headers,
            });
        });

        req.on('error', (error) => {
            logCheck('HTTPS 可用', false, error.message);
            resolve({ https: false, error: error.message });
        });

        req.setTimeout(5000, () => {
            req.destroy();
            logCheck('HTTPS 连接', false, '连接超时');
            resolve({ https: false, error: 'Timeout' });
        });

        req.end();
    });
}

// 检查 HTTP 安全响应头
function checkSecurityHeaders(headers) {
    logSection('2. HTTP 安全响应头检查');
    
    const requiredHeaders = {
        'strict-transport-security': 'HSTS (强制 HTTPS)',
        'x-frame-options': '防止点击劫持',
        'x-content-type-options': '防止 MIME 类型嗅探',
        'content-security-policy': '内容安全策略 (CSP)',
        'referrer-policy': 'Referrer 策略',
        'x-xss-protection': 'XSS 保护',
    };

    const recommendedHeaders = {
        'permissions-policy': '权限策略',
    };

    Object.entries(requiredHeaders).forEach(([header, description]) => {
        const value = headers[header] || headers[header.toLowerCase()];
        logCheck(description, !!value, value || '未设置');
    });

    Object.entries(recommendedHeaders).forEach(([header, description]) => {
        const value = headers[header] || headers[header.toLowerCase()];
        if (value) {
            logCheck(description, true, value);
        } else {
            log(`  ⚠ ${description}`, 'yellow');
            log(`    建议添加此响应头`, 'yellow');
        }
    });
}

// 检查外部资源
function checkExternalResources() {
    logSection('3. 外部资源检查');
    
    // 这里可以添加检查外部 CDN 的逻辑
    log('  检查外部 CDN 资源...', 'blue');
    log('  建议：', 'yellow');
    log('    - 为所有外部脚本添加 SRI (Subresource Integrity)', 'yellow');
    log('    - 使用可信的 CDN 服务', 'yellow');
    log('    - 考虑使用本地资源替代外部 CDN', 'yellow');
}

// 检查 robots.txt
function checkRobotsTxt() {
    return new Promise((resolve) => {
        logSection('4. robots.txt 检查');
        
        const options = {
            hostname: SITE_URL,
            port: 443,
            path: '/robots.txt',
            method: 'GET',
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    logCheck('robots.txt 存在', true);
                    log('  内容预览:', 'blue');
                    console.log(data.split('\n').slice(0, 10).join('\n'));
                    
                    // 检查是否暴露敏感目录
                    const sensitivePatterns = ['/admin', '/.git', '/.env', '/config'];
                    const hasSensitive = sensitivePatterns.some(pattern => 
                        data.toLowerCase().includes(pattern)
                    );
                    
                    if (hasSensitive) {
                        logCheck('敏感目录检查', false, 'robots.txt 可能暴露敏感目录');
                    } else {
                        logCheck('敏感目录检查', true);
                    }
                } else {
                    logCheck('robots.txt 存在', false, `状态码: ${res.statusCode}`);
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            logCheck('robots.txt 可访问', false, error.message);
            resolve();
        });

        req.setTimeout(5000, () => {
            req.destroy();
            logCheck('robots.txt 检查', false, '连接超时');
            resolve();
        });

        req.end();
    });
}

// 检查网站可访问性
function checkAccessibility() {
    logSection('5. 基本可访问性检查');
    
    return new Promise((resolve) => {
        const options = {
            hostname: SITE_URL,
            port: 443,
            path: '/',
            method: 'GET',
        };

        const req = https.request(options, (res) => {
            logCheck('网站可访问', res.statusCode === 200, `状态码: ${res.statusCode}`);
            
            // 检查内容类型
            const contentType = res.headers['content-type'] || '';
            if (contentType.includes('text/html')) {
                logCheck('内容类型正确', true, contentType);
            } else {
                logCheck('内容类型', false, contentType);
            }
            
            resolve();
        });

        req.on('error', (error) => {
            logCheck('网站可访问', false, error.message);
            resolve();
        });

        req.setTimeout(5000, () => {
            req.destroy();
            logCheck('网站访问', false, '连接超时');
            resolve();
        });

        req.end();
    });
}

// 生成报告
function generateReport(results) {
    logSection('检查完成');
    
    log('\n建议的下一步操作：', 'cyan');
    log('1. 访问 SSL Labs 进行详细 SSL/TLS 检查：', 'yellow');
    log(`   https://www.ssllabs.com/ssltest/analyze.html?d=${SITE_URL}`, 'blue');
    
    log('\n2. 检查 HTTP 安全头：', 'yellow');
    log(`   https://securityheaders.com/?q=https://${SITE_URL}`, 'blue');
    
    log('\n3. Mozilla Observatory 综合检查：', 'yellow');
    log(`   https://observatory.mozilla.org/analyze/${SITE_URL}`, 'blue');
    
    log('\n4. 检查网站是否在黑名单中：', 'yellow');
    log(`   https://sitecheck.sucuri.net/?scan=${SITE_URL}`, 'blue');
    
    log('\n5. 查看详细的安全配置指南：', 'yellow');
    log('   查看 security-check.md 文件', 'blue');
}

// 主函数
async function main() {
    log('\n🔒 网站安全检查工具', 'cyan');
    log(`目标网站: ${SITE_URL_FULL}\n`, 'blue');
    
    try {
        // 执行各项检查
        const httpsResult = await checkHTTPS();
        
        if (httpsResult.headers) {
            checkSecurityHeaders(httpsResult.headers);
        }
        
        checkExternalResources();
        await checkRobotsTxt();
        await checkAccessibility();
        
        // 生成报告
        generateReport();
        
    } catch (error) {
        log(`\n❌ 检查过程中出现错误: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 运行检查
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };
