'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // 初始化表单数据
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    class: '',
    role: '学生', // 默认值设为中文
    grade: [] // grade 字段，text[] 类型
  })

  // 获取用户资料
  const fetchProfile = async () => {
    try {
      const supabase = createClient()
      
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMessage('请先登录')
        setLoading(false)
        return
      }

      // 获取用户资料
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('获取用户资料失败:', error)
        setMessage('获取用户资料失败')
        setLoading(false)
        return
      }

      // 如果用户没有profile记录，创建默认记录
      if (!profileData) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
              full_name: '',
              class: '',
              role: '学生', // 使用中文默认值
              grade: []
            }
          ])
          .select()
          .single()

        if (insertError) {
          console.error('创建用户资料失败:', insertError)
          setMessage('创建用户资料失败')
          setLoading(false)
          return
        }

        setProfile(newProfile)
        setFormData({
          username: newProfile.username || '',
          full_name: newProfile.full_name || '',
          class: newProfile.class || '',
          role: newProfile.role || '学生', // 使用中文默认值
          grade: newProfile.grade || []
        })
      } else {
        setProfile(profileData)
        setFormData({
          username: profileData.username || '',
          full_name: profileData.full_name || '',
          class: profileData.class || '',
          role: profileData.role || '学生', // 使用中文默认值
          grade: profileData.grade || []
        })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('获取资料失败:', error)
      setMessage('获取资料失败: ' + error.message)
      setLoading(false)
    }
  }

  // 组件挂载时获取资料
  useEffect(() => {
    fetchProfile()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 处理 grade 数组的添加
  const handleAddGrade = () => {
    setFormData(prev => ({
      ...prev,
      grade: [...prev.grade, ''] // 添加一个空字符串
    }))
  }

  // 处理 grade 数组的删除
  const handleRemoveGrade = (index) => {
    setFormData(prev => ({
      ...prev,
      grade: prev.grade.filter((_, i) => i !== index)
    }))
  }

  // 处理 grade 数组单项的修改
  const handleGradeChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      grade: prev.grade.map((item, i) => i === index ? value : item)
    }))
  }

  const handleSave = async () => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          class: formData.class,
          role: formData.role, // 使用中文值
          grade: formData.grade
        })
        .eq('id', profile.id)

      if (error) {
        throw error
      }

      setMessage('资料更新成功！')
      setIsEditing(false)
      
      // 重新获取最新资料
      await fetchProfile()
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('保存失败:', error)
      setMessage('保存失败: ' + error.message)
    }
  }

  const handleCancel = () => {
    // 重置表单数据为原始profile数据
    setFormData({
      username: profile.username || '',
      full_name: profile.full_name || '',
      class: profile.class || '',
      role: profile.role || '学生', // 使用中文默认值
      grade: profile.grade || []
    })
    setIsEditing(false)
    setMessage('')
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto p-6">加载中...</div>
  }

  if (!profile) {
    return <div className="max-w-2xl mx-auto p-6">{message || '请先登录'}</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">个人资料</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            编辑资料
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('失败') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : 'bg-green-100 text-green-700 border border-green-300'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* 用户名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            用户名
          </label>
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.username || '未设置'}</p>
          )}
        </div>

        {/* 真实姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            真实姓名
          </label>
          {isEditing ? (
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{profile.full_name || '未设置'}</p>
          )}
        </div>

        {/* 班级 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            班级
          </label>
          {isEditing ? (
            <input
              type="text"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：1班、2班"
            />
          ) : (
            <p className="text-gray-900">{profile.class || '未设置'}</p>
          )}
        </div>

        {/* Grade 字段 (text[] 数组) - 现在作为年级信息 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年级信息
          </label>
          {isEditing ? (
            <div className="space-y-2">
              {formData.grade.map((gradeItem, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={gradeItem}
                    onChange={(e) => handleGradeChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入年级信息，例如：一年级、二年级"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGrade(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    删除
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddGrade}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                添加年级信息
              </button>
              <p className="text-sm text-gray-500">可以添加多个年级信息</p>
            </div>
          ) : (
            <div>
              {profile.grade && profile.grade.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.grade.map((gradeItem, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {gradeItem}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">未设置年级信息</p>
              )}
            </div>
          )}
        </div>

        {/* 角色 - 使用中文选项 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            身份
          </label>
          {isEditing ? (
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="学生">学生</option>
              <option value="家长">家长</option>
              <option value="教师">教师</option>
            </select>
          ) : (
            <p className="text-gray-900">{profile.role || '未设置'}</p>
          )}
        </div>


        {/* 编辑按钮 */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  )
}