import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Content from './components/Content'
import Publish from './components/Publish'
import Login from './components/Login'
import ArticleDetail from './components/Content/AritleDetail'
import EditArticle from './components/EditAticle'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/content" element={<Content />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/edit/:id" element={<EditArticle />} />
        <Route path="/*" element={<Login />} /> 
      </Routes>
    </BrowserRouter>
  );
}