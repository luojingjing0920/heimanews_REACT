// components/Sider/index.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './index.css';

export default function Sider() {
    // 安全地从localStorage获取用户信息
    const getUserInfo = () => {
        try {
            const userData = localStorage.getItem('user_info');
            if (userData && userData !== 'undefined') {
                return JSON.parse(userData);
            }
        } catch (error) {
            console.error('解析用户信息失败:', error);
        }
        return { name: '用户' }; // 默认值
    };

    const userInfo = getUserInfo();
    const username = userInfo.name || '用户';

    return (
        <div className="sider">
            <div className="sider-header">
                <h2>黑马头条</h2>
                <div className="sider-subtitle">内容管理平台</div>
            </div>
            <ul className="sider-nav">
                <li>
                    <NavLink
                        to="/content"
                        className={({ isActive }) =>
                            `sider-nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="icon">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8 5h2v2H8V5zm0 4h2v2H8V9zm0 4h2v2H8v-2zm4-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm4-8h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2z" />
                            </svg>
                        </span>
                        <span className="link-text">内容管理</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/publish"
                        className={({ isActive }) =>
                            `sider-nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="icon">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                        </span>
                        <span className="link-text">发布文章</span>
                    </NavLink>
                </li>
            </ul>
            <div className="sider-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        <svg viewBox="0 0 24 24" width="32" height="32">
                            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <div className="user-details">
                        <div className="user-name">{username}</div>
                        <div className="user-role">已登录</div>
                    </div>
                </div>
            </div>
        </div>
    );
}