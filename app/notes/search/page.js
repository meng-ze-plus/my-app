'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client' // 根据你的项目结构调整导入路径

export default function SearchNoteById() {
  const [searchId, setSearchId] = useState('')
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 根据ID查询笔记的函数
  const searchNote = async () => {
    if (!searchId.trim()) {
      setError('请输入一个有效的ID')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setNote(null) // 清除之前的搜索结果

      const supabase = createClient()
      
      // 使用 Supabase JS SDK 查询匹配ID的笔记
      const { data, error } = await supabase
        .from('notes')
        .select('id, title')
        .eq('id', searchId) // 使用 .eq 进行精确匹配:cite[1]
        .single() // 如果期望只返回一条记录

      if (error) {
        throw error
      }

      if (data) {
        setNote(data)
      } else {
        setError('未找到对应ID的笔记')
      }

    } catch (err) {
      console.error('查询失败:', err)
      setError(`查询失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 处理输入框变化
  const handleInputChange = (e) => {
    setSearchId(e.target.value)
  }

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault()
    searchNote()
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>通过ID查询笔记</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchId}
            onChange={handleInputChange}
            placeholder="输入笔记ID (例如: 1, 2, 3...)"
            style={{ 
              flexGrow: 1, 
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '查询中...' : '查询'}
          </button>
        </div>
      </form>

      {/* 显示错误信息 */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* 显示查询结果 */}
      {note && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}>
          <h3>查询结果</h3>
          <p><strong>ID:</strong> {note.id}</p>
          <p><strong>标题:</strong> {note.title}</p>
        </div>
      )}
    </div>
  )
}