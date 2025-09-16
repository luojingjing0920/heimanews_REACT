import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import './index.css';

export default function EditArticle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [channels, setChannels] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [channelId, setChannelId] = useState('');
    const [cover, setCover] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    // 加载文章详情和频道列表
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('请先登录');
            return;
        }

        // 获取文章详情
        axios.get(`https://geek.itheima.net/v1_0/mp/articles/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.data?.data) {
                    const articleData = res.data.data;
                    setArticle(articleData);
                    setTitle(articleData.title);
                    setContent(articleData.content);
                    setChannelId(articleData.channel_id);
                    if (articleData.cover?.images?.[0]) {
                        setCoverPreview(articleData.cover.images[0]);
                    }
                }
            })
            .catch(() => setError('获取文章详情失败'));

        // 获取频道列表
        axios.get('https://geek.itheima.net/v1_0/channels')
            .then(res => {
                if (res.data?.data?.channels) {
                    setChannels(res.data.data.channels);
                }
            })
            .catch(() => setError('获取频道失败'));
    }, [id]);

    // 处理封面图片选择
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 验证文件类型和大小
            if (!file.type.startsWith('image/')) {
                setError('请选择图片文件');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB限制
                setError('图片大小不能超过5MB');
                return;
            }

            setCover(file);
            setError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 移除已选封面
    const removeCover = () => {
        setCover(null);
        setCoverPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // 更新文章
    const handleUpdate = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('请先登录');
            return;
        }
        if (!title.trim()) {
            setError('请输入文章标题');
            return;
        }
        if (!channelId) {
            setError('请选择文章频道');
            return;
        }
        if (!content.trim()) {
            setError('请输入文章内容');
            return;
        }

        setError('');
        setLoading(true);

        // 准备表单数据
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('channel_id', channelId);

        // 处理封面图片
        if (cover) {
            formData.append('cover', cover);
        } else if (!coverPreview) {
            // 如果没有封面图片，设置封面类型为无图
            formData.append('cover', JSON.stringify({ type: 0, images: [] }));
        }

        try {
            await axios.put(`https://geek.itheima.net/v1_0/mp/articles/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            setSuccess(true);
            setTimeout(() => navigate('/content'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || '更新失败');
        } finally {
            setLoading(false);
        }
    };

    if (!article) {
        return (
            <Layout>
                <div className="edit-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>加载中...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="edit-container">
                <div className="edit-header">
                    <h2>编辑文章</h2>
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        ← 返回
                    </button>
                </div>

                <div className="edit-form">
                    {error && <div className="alert alert-danger show">{error}</div>}
                    {success && <div className="alert alert-success show">更新成功！2秒后自动跳转...</div>}

                    <div className="form-group">
                        <label className="form-label">标题：</label>
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="请输入文章标题"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">频道：</label>
                        <select
                            className="form-select"
                            value={channelId}
                            onChange={e => setChannelId(e.target.value)}
                        >
                            <option value="">请选择文章频道</option>
                            {channels.map(ch => (
                                <option key={ch.id} value={ch.id}>{ch.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">封面：</label>
                        <div className="cover-upload">
                            {coverPreview ? (
                                <div className="cover-preview">
                                    <img src={coverPreview} alt="封面预览" />
                                    <button type="button" className="remove-cover" onClick={removeCover}>
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="cover-placeholder"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <span>+</span>
                                    <p>点击上传封面图片</p>
                                    <p className="cover-hint">支持JPG、PNG格式，大小不超过5MB</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="cover-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">内容：</label>
                        <textarea
                            className="edit-content form-control"
                            rows={12}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="请输入文章内容"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleUpdate}
                            disabled={loading}
                        >
                            {loading ? '更新中...' : '更新文章'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/content')}
                        >
                            取消
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}