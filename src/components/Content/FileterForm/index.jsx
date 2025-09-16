import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';

export default function FileterForm() {
    const [status, setStatus] = useState('');
    const [channelId, setChannelId] = useState('');
    const [channels, setChannels] = useState([]);
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // 获取频道列表
    useEffect(() => {
        axios.get('https://geek.itheima.net/v1_0/channels')
            .then(res => {
                if (res.data?.data?.channels) {
                    setChannels(res.data.data.channels);
                }
            })
            .catch(() => setError('获取频道失败'));
    }, []);

    // 获取文章列表
    const fetchArticles = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('缺少登录凭证，请先登录');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await axios.get('https://geek.itheima.net/v1_0/mp/articles', {
                params: {
                    status,
                    channel_id: channelId,
                    page: 1,
                    per_page: 10
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data?.data?.results) {
                setArticles(res.data.data.results);
            } else {
                setError('文章数据格式错误');
            }
        } catch (err) {
            console.error(err);
            setError('获取文章列表失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="wrap">
                <div className="main">
                    <div className="card">
                        <div className="title">
                            <span>内容管理</span>
                        </div>
                        <div className="body">
                            <form className="sel-form">
                                <div>
                                    <label className="form-label">状态:</label>
                                    {['', '1', '2'].map((val, idx) => (
                                        <div className="form-check" key={val}>
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="status"
                                                value={val}
                                                checked={status === val}
                                                onChange={() => setStatus(val)}
                                                id={['all', 'audit', 'approved'][idx]}
                                            />
                                            <label className="form-check-label" htmlFor={['all', 'audit', 'approved'][idx]}>
                                                {['全部', '待审核', '审核通过'][idx]}
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="form-label">频道:</label>
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

                                <div>
                                    <button
                                        type="button"
                                        className="btn btn-primary sel-btn"
                                        onClick={fetchArticles}
                                        disabled={loading}
                                    >
                                        {loading ? '加载中...' : '筛选'}
                                    </button>
                                </div>
                            </form>

                            {error && <p style={{ color: 'red' }}>{error}</p>}

                            {/* 文章列表表格 */}
                            <table className="article-table" style={{ marginTop: 20, width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>封面</th>
                                        <th>标题</th>
                                        <th>状态</th>
                                        <th>发布时间</th>
                                        <th>阅读数</th>
                                        <th>评论数</th>
                                        <th>点赞数</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {articles.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center' }}>暂无文章数据</td>
                                        </tr>
                                    ) : (
                                        articles.map(article => (
                                            <tr key={article.id}>
                                                <td>
                                                    <img
                                                        src={article.cover.images[0] || 'https://via.placeholder.com/50'}
                                                        alt="封面"
                                                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                                                    />
                                                </td>
                                                <td
                                                    style={{ cursor: 'pointer', color: '#1890ff' }}
                                                    onClick={() => navigate(`/article/${article.id}`)}
                                                >
                                                    {article.title}
                                                </td>
                                                <td>{article.status === 1 ? '待审核' : '审核通过'}</td>
                                                <td>{article.pubdate}</td>
                                                <td>{article.read_count}</td>
                                                <td>{article.comment_count}</td>
                                                <td>{article.like_count}</td>
                                                <td>
                                                    <button onClick={() => navigate(`/article/${article.id}`)}>查看</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}