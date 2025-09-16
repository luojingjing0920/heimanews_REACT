// components/TopNav/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

export default function TopNav({ onToggleSidebar, sidebarCollapsed }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userInfo, setUserInfo] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);

  // 安全地解析用户信息
  useEffect(() => {
    const getUserInfo = () => {
      try {
        const userInfoStr = localStorage.getItem('user_info');
        if (!userInfoStr || userInfoStr === 'undefined' || userInfoStr === 'null') {
          return {};
        }
        return JSON.parse(userInfoStr);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        return {};
      }
    };

    setUserInfo(getUserInfo());
  }, []);

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    navigate('/login');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="top-nav">
      <div className="top-nav-content">
        <div className="nav-left">
          {/* 高亮显示的侧边栏切换按钮 */}
          <button
            className={`sidebar-toggle ${sidebarCollapsed ? 'collapsed' : ''}`}
            onClick={onToggleSidebar}
            aria-label="切换侧边栏"
            title={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
          >
            <span className="toggle-icon">
              {sidebarCollapsed ? '→' : '←'}
            </span>
            <span className="toggle-text">
              {sidebarCollapsed ? '展开菜单' : '折叠菜单'}
            </span>
          </button>
        </div>

        <div className="nav-right">
          <div className="time-display">
            <div className="current-time">{formatTime(currentTime)}</div>
            <div className="current-date">{formatDate(currentTime)}</div>
          </div>

          <div
            className="user-menu"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <div className="user-info">
              <div className="user-avatar">
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-details">
                <div className="user-name">{userInfo.name || '用户'}</div>
                <div className="user-role">管理员</div>
              </div>
              <div className="dropdown-arrow">▼</div>
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <span className="icon">👤</span>
                  <span>个人资料</span>
                </div>
                <div className="dropdown-item">
                  <span className="icon">⚙️</span>
                  <span>账户设置</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <span className="icon">🚪</span>
                  <span>退出登录</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}