import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';   

export default function ArticleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('缺少登录凭证');
            setLoading(false);
            return;
        }

        axios.get(`https://geek.itheima.net/v1_0/mp/articles/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.data?.data) {
                    setArticle(res.data.data);
                } else {
                    setError('文章数据格式错误');
                }
            })
            .catch(() => setError('获取文章详情失败'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="detail-loading">加载中...</div>;
    if (error) return <div className="detail-error">{error}</div>;
    if (!article) return null;

    return (
        <div className="article-detail">
            <div className="detail-header">
                <button className="btn-back" onClick={() => navigate(-1)}>← 返回</button>
                <h1 className="detail-title">{article.title}</h1>
                <div className="detail-meta">
                    <span>状态：{article.status === 1 ? '待审核' : '审核通过'}</span>
                    <span>发布时间：{article.pubdate}</span>
                    <span>阅读 {article.read_count} · 评论 {article.comment_count} · 点赞 {article.like_count}</span>
                </div>
            </div>

            {/* 封面图 */}
            {article.cover.images[0] && (
                <img className="detail-cover" src={article.cover.images[0]} alt="封面" />
            )}

            {/* 正文 */}
            <div
                className="detail-content"
                dangerouslySetInnerHTML={{ __html: article.content || '<p>暂无正文</p>' }}
            />
        </div>
    );
}