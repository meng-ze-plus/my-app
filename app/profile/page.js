'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Checkbox } from "@/components/ui/checkbox" // 导入自定义复选框组件

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // 年级选项
  const gradeOptions = [
    '高2022级',
    '高2023级', 
    '高2024级',
    '高2025级'
  ]

  // 初始化表单数据
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    class: '',
    role: '学生',
    grade: [] // grade 字段，text[] 类型，存储选中的年级
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
              role: '学生',
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
          role: newProfile.role || '学生',
          grade: newProfile.grade || []
        })
      } else {
        setProfile(profileData)
        setFormData({
          username: profileData.username || '',
          full_name: profileData.full_name || '',
          class: profileData.class || '',
          role: profileData.role || '学生',
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

  // 处理年级选项的选择/取消选择 - 适配自定义 Checkbox 组件
  const handleGradeCheckedChange = (gradeValue, checked) => {
    setFormData(prev => {
      if (checked) {
        // 添加年级到数组
        return {
          ...prev,
          grade: [...prev.grade, gradeValue]
        }
      } else {
        // 从数组中移除年级
        return {
          ...prev,
          grade: prev.grade.filter(item => item !== gradeValue)
        }
      }
    })
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
          role: formData.role,
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
      role: profile.role || '学生',
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

        {/* Grade 字段 (text[] 数组) - 使用美化的 Checkbox 组件 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年级信息
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">请选择您所在的年级（可多选）</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gradeOptions.map((gradeOption) => (
                  <div key={gradeOption} className="flex items-center space-x-2">
                    <Checkbox
                      id={`grade-${gradeOption}`}
                      checked={formData.grade.includes(gradeOption)}
                      onCheckedChange={(checked) => handleGradeCheckedChange(gradeOption, checked)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`grade-${gradeOption}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {gradeOption}
                    </label>
                  </div>
                ))}
              </div>
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

        {/* 角色 */}
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