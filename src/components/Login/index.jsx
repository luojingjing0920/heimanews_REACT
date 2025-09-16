import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import './index.css'

export default function Login() {
  const [mobile, setMobile] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  // 自动隐藏提示消息
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleLogin = async () => {
    // 表单验证
    if (!mobile) {
      setMessage('请输入手机号');
      setMessageType('danger');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(mobile)) {
      setMessage('手机号格式不正确');
      setMessageType('danger');
      return;
    }
    if (!code) {
      setMessage('请输入验证码');
      setMessageType('danger');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      //调用API
      const response = await axios.post('https://geek.itheima.net/v1_0/authorizations', { mobile, code })
      console.log('点击登录', response)
      //保存token到localStorage
      localStorage.setItem('auth_token', response.data.data.token)
      localStorage.setItem('user_info', JSON.stringify(response.data.data.user))
      setMessage('登录成功！正在跳转...');
      setMessageType('success');

      // 跳转到/content页面
      setTimeout(() => {
        navigate('/content');
      }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || '登录失败，请重试';
      setMessage(errorMessage);
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* 警告框 - 移动到顶部固定位置 */}
      {message && (
        <div className="alert-container">
          <div className={`alert alert-${messageType}`}>
            {message}
            <button
              type="button"
              className="close-btn"
              onClick={() => setMessage('')}
              aria-label="关闭提示"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* 登录表单 */}
      <div className="login-wrap">
        <div className="title">黑马头条</div>
        <div>
          <form className="login-form">
            <div className="item">
              <input
                type="text"
                className="form-control"
                name="mobile"
                placeholder="请输入手机号"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="item">
              <input
                type="text"
                className="form-control"
                name="code"
                placeholder="默认验证码246810"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="item">
              <button
                type="button"
                className="my-btn"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    登录中...
                  </>
                ) : '登 录'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}