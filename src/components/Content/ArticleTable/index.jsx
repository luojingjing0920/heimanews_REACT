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
    const navigate = useNavigate();

    // 从API获取文章数据
    const fetchArticles = async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            // 获取token
            const token = localStorage.getItem('auth_token');

            // 设置请求头
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    page: page,
                    per_page: 10 // 每页显示10条数据
                }
            };

            // 发送GET请求到API
            const response = await axios.get('https://geek.itheima.net/v1_0/mp/articles', config)
            console.log('API响应:', response.data); // 调试用

            // 处理响应数据
            const data = response.data.data;

            // 更新状态
            setArticles(data.results || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.total_pages || 1);
            setTotalCount(data.total_count || 0);

        } catch (err) {
            console.error('获取文章列表失败:', err);
            setError('获取文章列表失败，请稍后重试');

            // 如果是认证错误，可能需要重新登录
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('auth_token');
                // window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    // 组件挂载时和页码变化时获取数据
    useEffect(() => {
        fetchArticles(currentPage);
    }, [currentPage]);

    // 处理封面图片URL
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
        console.log("编辑文章:", id)
        navigate(`/edit/${id}`)
    };

    const handleDelete = async (id) => {
        if (!window.confirm("确定要删除这篇文章吗？")) return;

        try {
            // 获取token
            const token = localStorage.getItem('auth_token');

            // 设置请求头
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            // 发送DELETE请求到API
            await axios.delete(`https://geek.itheima.net/v1_0/mp/articles/${id}`, config);

            // 删除成功后，重新获取数据
            fetchArticles(currentPage);
        } catch (err) {
            console.error('删除文章失败:', err);
            alert('删除文章失败，请稍后重试');

            // 如果是认证错误，可能需要重新登录
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }
        }
    };

    const getStatusBadge = (status) => {
        if (status === 2) {
            return <span className="badge text-bg-success">审核通过</span>;
        } else if (status === 1) {
            return <span className="badge text-bg-primary">待审核</span>;
        } else if (status === 0) {
            return <span className="badge text-bg-secondary">已驳回</span>;
        }
        return null;
    };

    // 处理页码变化
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // 格式化日期
    const formatDate = (dateString) => {
        if (!dateString) return '未发布';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    };

    // 渲染加载状态
    if (loading) {
        return (
            <div className="card article-table">
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">加载中...</span>
                    </div>
                    <p className="mt-3">正在加载文章列表...</p>
                </div>
            </div>
        );
    }

    // 渲染错误状态
    if (error) {
        return (
            <div className="card article-table">
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
    <div>
          <div className="card article-table">
              <table className="table table-striped table-hover">
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
                  <tbody className="align-middle art-list">
                      {articles.length > 0 ? (
                          articles.map(article => (
                      <tr key={article.id}>
                          <td>
                              <img
                                          src={getCoverImage(article)}
                                          alt={article.title}
                                          className="article-cover"
                                          style={{ width: '60px', height: '40px', objectFit: 'cover' }} />
                          </td>
                                  <td>{article.title}</td>
                                  <td>{getStatusBadge(article.status)}</td>
                                  <td>{formatDate(article.pubdate)}</td>
                                  <td>{article.read_count || 0}</td>
                                  <td>{article.comment_count || 0}</td>
                                  <td>{article.like_count || 0}</td>
                                  <td>
                                      <button
                                          className="btn btn-sm btn-outline-primary me-2"
                                          onClick={() => handleEdit(article.id)}
                                      >
                                          编辑
                                      </button>
                                      <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleDelete(article.id)}
                                      >
                                          删除
                                      </button>
                                  </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                              <td colSpan="8" className="text-center py-4">
                                      {error ? error : '暂无文章数据'}
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
              {/* 分页 */}
              {articles.length > 0 && (
                  <nav>
                      <ul className="pagination justify-content-center">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                  className="page-link"
                                  onClick={() => handlePageChange(currentPage - 1)}
                                  disabled={currentPage === 1}
                              >
                                  &laquo;
                              </button>
                          </li>
                          {/* 显示页码按钮 */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <li
                                  key={page}
                                  className={`page-item ${currentPage === page ? 'active' : ''}`}
                              >
                                  <button
                                      className="page-link"
                                      onClick={() => handlePageChange(page)}
                                  >
                                      {page}
                                  </button>
                              </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button
                                  className="page-link"
                                  onClick={() => handlePageChange(currentPage + 1)}
                                  disabled={currentPage === totalPages}
                              >
                                  &raquo;
                              </button>
                          </li>

                          <li className="page-item">
                              <span className="page-link">共{totalCount}条</span>
                          </li>
                      </ul>
                  </nav>
              )}
              </div>
              </div>
  )}
          
