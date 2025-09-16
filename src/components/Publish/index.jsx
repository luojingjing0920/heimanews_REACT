import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import './index.css';

export default function Publish() {
    const navigate = useNavigate();
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

    // 加载频道列表
    useEffect(() => {
        axios.get('https://geek.itheima.net/v1_0/channels')
            .then(res => {
                if (res.data?.data?.channels) {
                    setChannels(res.data.data.channels);
                }
            })
            .catch(() => setError('获取频道失败'));
    }, []);

    // 处理封面图片选择
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCover(file);
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

    // 发布文章
    const handlePublish = async () => {
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

        const payload = {
            title,
            content,
            channel_id: channelId,
            cover: {
                type: cover ? 1 : 0,
                images: cover ? [URL.createObjectURL(cover)] : []
            }
        };

        try {
            await axios.post('https://geek.itheima.net/v1_0/mp/articles', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccess(true);
            setTimeout(() => navigate('/content'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || '发布失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="publish-wrap">
                <div className="content">
                    <div className="card">
                        <div className="title"><span>发布文章</span></div>
                        <div className="body">
                            {error && <div className="alert alert-danger show">{error}</div>}
                            {success && <div className="alert alert-success show">发布成功！2 秒后自动跳转...</div>}

                            <form className="art-form" onSubmit={e => e.preventDefault()}>
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
                                        <option value="" disabled>请选择文章频道</option>
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
                                        className="publish-content form-control"
                                        rows={12}
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        placeholder="请输入文章内容"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary send"
                                        onClick={handlePublish}
                                        disabled={loading}
                                    >
                                        {loading ? '发布中...' : '发布文章'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/content')}
                                    >
                                        取消
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}