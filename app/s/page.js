'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SearchStudent() {
  const [searchValue, setSearchValue] = useState('')
  const [searchType, setSearchType] = useState('id') // 'id' 或 'name'
  const [student, setStudent] = useState(null)
  const [students, setStudents] = useState([]) // 用于存储模糊查询的多个结果
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 查询学生成绩的函数
  const searchStudent = async () => {
    if (!searchValue.trim()) {
      setError(`请输入一个有效的学生${searchType === 'id' ? 'ID' : '姓名'}`)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setStudent(null)
      setStudents([])

      const supabase = createClient()
      
      let query = supabase
        .from('学生成绩数据库')
        .select("*")

      // 根据查询类型添加不同的筛选条件
      if (searchType === 'id') {
        // ID查询 - 精确匹配
        const { data, error } = await query
          .eq('id', searchValue)
          .single()

        if (error) throw error
        if (data) {
          setStudent(data)
        } else {
          setError('未找到对应ID的学生记录')
        }
      } else {
        // 姓名查询 - 模糊匹配
        const { data, error } = await query
          .ilike('姓名', `%${searchValue}%`) // 使用 ilike 进行不区分大小写的模糊匹配

        if (error) throw error
        if (data && data.length > 0) {
          if (data.length === 1) {
            // 如果只找到一个，直接显示
            setStudent(data[0])
          } else {
            // 如果找到多个，显示列表
            setStudents(data)
          }
        } else {
          setError('未找到对应姓名的学生记录')
        }
      }

    } catch (err) {
      console.error('查询失败:', err)
      setError(`查询失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 从列表中选择一个学生
  const selectStudent = (selectedStudent) => {
    setStudent(selectedStudent)
    setStudents([])
  }

  // 处理输入框变化
  const handleInputChange = (e) => {
    setSearchValue(e.target.value)
  }

  // 处理查询类型变化
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value)
    setSearchValue('')
    setStudent(null)
    setStudents([])
    setError(null)
  }

  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault()
    searchStudent()
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>学生成绩查询系统</h1>
      
      {/* 查询条件选择 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '15px' }}>
          <input
            type="radio"
            value="id"
            checked={searchType === 'id'}
            onChange={handleSearchTypeChange}
            style={{ marginRight: '5px' }}
          />
          按学号查询
        </label>
        <label>
          <input
            type="radio"
            value="name"
            checked={searchType === 'name'}
            onChange={handleSearchTypeChange}
            style={{ marginRight: '5px' }}
          />
          按姓名查询
        </label>
      </div>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            placeholder={searchType === 'id' ? "输入学生ID" : "输入学生姓名"}
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

      {/* 显示学生列表（模糊查询结果） */}
      {students.length > 0 && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3>找到多条数据，请选择：</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {students.map((stu) => (
              <div 
                key={stu.id}
                style={{ 
                  padding: '10px', 
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => selectStudent(stu)}
              >
                <p><strong>ID:</strong> {stu.id} | <strong>姓名:</strong> {stu.姓名} | <strong>考次:</strong> {stu.考次}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 显示查询结果 */}
      {student && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}>
          <h3>学生成绩查询结果</h3>
          
          {/* 学生基本信息 */}
          <div style={{ marginBottom: '20px' }}>
            <h4>基本信息</h4>
            <p><strong>ID:</strong> {student.id}</p>
            <p><strong>姓名:</strong> {student.姓名}</p>
            <p><strong>年级:</strong> {student.年级}</p>
            <p><strong>班级:</strong> {student.班级}</p>
            <p><strong>考次:</strong> {student.考次}</p>
          </div>
          
          {/* 总分信息 */}
          <div style={{ marginBottom: '20px' }}>
            <h4>总分信息</h4>
            <p><strong>原始分:</strong> {student.总分_原始分}</p>
            <p><strong>得分:</strong> {student.总分_得分}</p>
            <p><strong>校次:</strong> {student.总分_校次}</p>
            <p><strong>班次:</strong> {student.总分_班次}</p>
            <p><strong>联考名次:</strong> {student.总分_联考名次}</p>
          </div>
          
          {/* 各科成绩 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {/* 语文 */}
            <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
              <h5>语文</h5>
              <p>原始分: {student.语文_原始分}</p>
              <p>得分: {student.语文_得分}</p>
              <p>校次: {student.语文_校次}</p>
              <p>班次: {student.语文_班次}</p>
              <p>联考名次: {student.语文_联考名次}</p>
            </div>
            
            {/* 数学 */}
            <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
              <h5>数学</h5>
              <p>原始分: {student.数学_原始分}</p>
              <p>得分: {student.数学_得分}</p>
              <p>校次: {student.数学_校次}</p>
              <p>班次: {student.数学_班次}</p>
              <p>联考名次: {student.数学_联考名次}</p>
            </div>
            
            {/* 英语 */}
            <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
              <h5>英语</h5>
              <p>原始分: {student.英语_原始分}</p>
              <p>得分: {student.英语_得分}</p>
              <p>校次: {student.英语_校次}</p>
              <p>班次: {student.英语_班次}</p>
              <p>联考名次: {student.英语_联考名次}</p>
            </div>
            
            {/* 物理 */}
            {student.物理_原始分 && (
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                <h5>物理</h5>
                <p>原始分: {student.物理_原始分}</p>
                <p>得分: {student.物理_得分}</p>
                <p>校次: {student.物理_校次}</p>
                <p>班次: {student.物理_班次}</p>
                <p>联考名次: {student.物理_联考名次}</p>
              </div>
            )}
            
            {/* 化学 */}
            {student.化学_原始分 && (
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                <h5>化学</h5>
                <p>原始分: {student.化学_原始分}</p>
                <p>得分: {student.化学_得分}</p>
                <p>校次: {student.化学_校次}</p>
                <p>班次: {student.化学_班次}</p>
                <p>联考名次: {student.化学_联考名次}</p>
              </div>
            )}
            
            {/* 其他科目可以根据需要添加 */}
          </div>
        </div>
      )}
    </div>
  )
}