// 主题切换功能
(function() {
    'use strict';

    const THEME_STORAGE_KEY = 'aztcon-theme';
    const THEME_ATTRIBUTE = 'data-theme';
    
    // 获取主题切换按钮
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('.theme-icon');
    
    // 获取当前主题
    function getCurrentTheme() {
        return document.documentElement.getAttribute(THEME_ATTRIBUTE) || 'dark';
    }
    
    // 设置主题
    function setTheme(theme) {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
        
        // 更新 meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'light' ? '#f5f7fa' : '#1a1f3a');
        }
        
        // 更新按钮图标
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
        
        // 保存到 localStorage
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (e) {
            console.warn('无法保存主题偏好到 localStorage:', e);
        }
    }
    
    // 切换主题
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }
    
    // 初始化主题
    function initTheme() {
        let theme = 'dark'; // 默认深色模式
        
        // 尝试从 localStorage 读取用户保存的偏好
        try {
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                theme = savedTheme;
            }
        } catch (e) {
            console.warn('无法读取 localStorage:', e);
        }
        
        // 如果没有保存的主题，始终使用深色模式（不跟随系统偏好）
        // 应用主题
        setTheme(theme);
    }
    
    // 不再监听系统主题变化，始终使用用户保存的偏好或默认深色模式
    
    // 绑定按钮事件
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // 页面加载时初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();
