// components/Layout/index.jsx
import React, { useState } from 'react';
import Sider from '../Sider';
import TopNav from '../TopNav';
import './index.css';

export default function Layout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className={`layout-wrap ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* 侧边栏 */}
            <div className="layout-sider">
                <Sider collapsed={sidebarCollapsed} />
            </div>

            {/* 右侧区域 */}
            <div className="layout-main">
                {/* 顶部导航 */}
                <TopNav onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />

                {/* 内容区域 */}
                <div className="layout-content">
                    {children}
                </div>
            </div>

            {/* 移动端遮罩层 */}
            {sidebarCollapsed && (
                <div
                    className="layout-mask"
                    onClick={() => setSidebarCollapsed(false)}
                />
            )}
        </div>
    );
}