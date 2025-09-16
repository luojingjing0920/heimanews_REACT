// Content.jsx 修改后
import React from 'react';
import Layout from '../Layout';
import FileForm from './FileterForm';
import ArticleTable from './ArticleTable';

export default function Content() {
  return (
    <Layout>
      {/* 筛选 */}
      <FileForm />
      {/* 内容列表 */}
      <ArticleTable />
    </Layout>
  );
}