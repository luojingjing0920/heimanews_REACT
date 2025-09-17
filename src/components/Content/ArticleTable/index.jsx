import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './index.css'

export default function ArticleTable() {
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [channelFilter, setChannelFilter] = useState('');
    const [sortField, setSortField] = useState('pubdate');
    const [sortOrder, setSortOrder] = useState('desc');
    const navigate = useNavigate();

    // 从API获取文章数据
    const fetchArticles = async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    page: page,
                    per_page: 10,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    channel_id: channelFilter || undefined,
                    sort: sortOrder === 'asc' ? sortField : `-${sortField}`
                }
            };

            const response = await axios.get('https://geek.itheima.net/v1_0/mp/articles', config)
            const data = response.data.data;

            setArticles(data.results || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.total_pages || 1);
            setTotalCount(data.total_count || 0);

        } catch (err) {
            console.error('获取文章列表失败:', err);
            setError('获取文章列表失败，请稍后重试');

            if (err.response && err.response.status === 401) {
                localStorage.removeItem('auth_token');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles(currentPage);
    }, [currentPage, statusFilter, channelFilter, sortField, sortOrder]);

    const getCoverImage = (article) => {
        if (article.cover && article.cover.images && article.cover.images[0]) {
            return article.cover.images[0];
        }
        if (article.cover && typeof article.cover === 'string') {
            return article.cover;
        }
        return 'https://via.placeholder.com/60x40?text=无封面';
    };

    const handleEdit = (id) => {
        navigate(`/edit/${id}`)
    };

    const handleDelete = async (id) => {
        if (!window.confirm("确定要删除这篇文章吗？")) return;

        try {
            const token = localStorage.getItem('auth_token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            await axios.delete(`https://geek.itheima.net/v1_0/mp/articles/${id}`, config);
            fetchArticles(currentPage);
        } catch (err) {
            console.error('删除文章失败:', err);
            alert('删除文章失败，请稍后重试');

            if (err.response && err.response.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            2: { text: '审核通过', class: 'status-approved' },
            1: { text: '待审核', class: 'status-pending' },
            0: { text: '已驳回', class: 'status-rejected' }
        };

        const statusInfo = statusMap[status] || { text: '未知', class: 'status-unknown' };
        return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '未发布';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className="sort-icon">↕</span>;
        return <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
    };

    if (loading) {
        return (
            <div className="content-card">
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">加载中...</span>
                    </div>
                    <p className="mt-3">正在加载文章列表...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content-card">
                <div className="alert alert-danger m-3" role="alert">
                    {error}
                    <button
                        className="btn btn-sm btn-outline-danger ms-3"
                        onClick={() => fetchArticles(currentPage)}
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="content-management">
            <div className="content-header">
                <h2>内容管理</h2>
            </div>

            <div className="filter-controls">
                <div className="filter-group">
                    <label>状态：</label>
                    <div className="filter-options">
                        <button
                            className={statusFilter === 'all' ? 'active' : ''}
                            onClick={() => setStatusFilter('all')}
                        >
                            全部
                        </button>
                        <button
                            className={statusFilter === 2 ? 'active' : ''}
                            onClick={() => setStatusFilter(2)}
                        >
                            审核通过
                        </button>
                    </div>
                </div>

                <div className="filter-group">
                    <label>频道：</label>
                    <select
                        value={channelFilter}
                        onChange={(e) => setChannelFilter(e.target.value)}
                    >
                        <option value="">请选择文章频道</option>
                        {/* 这里应该从API获取频道列表 */}
                        <option value="1">新闻</option>
                        <option value="2">技术</option>
                        <option value="3">娱乐</option>
                    </select>
                </div>
            </div>

            <div className="content-card">
                <div className="table-responsive">
                    <table className="article-table">
                        <thead>
                            <tr>
                                <th className="cover-col">封面</th>
                                <th className="title-col">标题</th>
                                <th
                                    className="status-col sortable"
                                    onClick={() => handleSort('status')}
                                >
                                    状态 <SortIcon field="status" />
                                </th>
                                <th
                                    className="date-col sortable"
                                    onClick={() => handleSort('pubdate')}
                                >
                                    发布时间 <SortIcon field="pubdate" />
                                </th>
                                <th
                                    className="number-col sortable"
                                    onClick={() => handleSort('read_count')}
                                >
                                    阅读数 <SortIcon field="read_count" />
                                </th>
                                <th
                                    className="number-col sortable"
                                    onClick={() => handleSort('comment_count')}
                                >
                                    评论数 <SortIcon field="comment_count" />
                                </th>
                                <th
                                    className="number-col sortable"
                                    onClick={() => handleSort('like_count')}
                                >
                                    点赞数 <SortIcon field="like_count" />
                                </th>
                                <th className="action-col">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.length > 0 ? (
                                articles.map(article => (
                                    <tr key={article.id}>
                                        <td>
                                            <img
                                                src={getCoverImage(article)}
                                                alt={article.title}
                                                className="article-cover"
                                            />
                                        </td>
                                        <td className="article-title">{article.title}</td>
                                        <td>{getStatusBadge(article.status)}</td>
                                        <td>{formatDate(article.pubdate)}</td>
                                        <td className="number-cell">{article.read_count || 0}</td>
                                        <td className="number-cell">{article.comment_count || 0}</td>
                                        <td className="number-cell">{article.like_count || 0}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(article.id)}
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(article.id)}
                                                >
                                                    删除
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="no-data">
                                        暂无文章数据
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {articles.length > 0 && (
                    <div className="table-footer">
                        <div className="pagination-info">
                            共 {totalCount} 条记录，第 {currentPage}/{totalPages} 页
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                            >
                                首页
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                上一页
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                if (pageNum > 0 && pageNum <= totalPages) {
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                return null;
                            })}

                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                下一页
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                末页
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}