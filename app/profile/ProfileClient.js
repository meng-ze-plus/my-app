'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfileClient({ profile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: profile.username || '',
    full_name: profile.full_name || '',
    年级: profile.年级 || '',
    class: profile.class || '',
    role: profile.role || ''
  })
  const [message, setMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      const supabase = createClient()
      
      // 直接更新profiles表
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          年级: formData.年级,
          class: formData.class,
          role: formData.role
        })
        .eq('id', profile.id)

      if (error) {
        throw error
      }

      setMessage('资料更新成功！')
      setIsEditing(false)
      
      // 3秒后清除消息
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('保存失败:', error)
      setMessage('保存失败: ' + error.message)
    }
  }

  const handleCancel = () => {
    setFormData({
      username: profile.username || '',
      full_name: profile.full_name || '',
      年级: profile.年级 || '',
      class: profile.class || '',
      role: profile.role || 'student'
    })
    setIsEditing(false)
    setMessage('')
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

        {/* 年级 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年级
          </label>
          {isEditing ? (
            <select
              name="年级"
              value={formData.年级}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择年级</option>
              <option value="一年级">一年级</option>
              <option value="二年级">二年级</option>
              <option value="三年级">三年级</option>
              <option value="四年级">四年级</option>
              <option value="五年级">五年级</option>
              <option value="六年级">六年级</option>
              <option value="初一">初一</option>
              <option value="初二">初二</option>
              <option value="初三">初三</option>
              <option value="高一">高一</option>
              <option value="高二">高二</option>
              <option value="高三">高三</option>
            </select>
          ) : (
            <p className="text-gray-900">{profile.年级 || '未设置'}</p>
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
              <option value="student">学生</option>
              <option value="teacher">教师</option>
            </select>
          ) : (
            <p className="text-gray-900">
              {profile.role === 'teacher' ? '教师' : '学生'}
            </p>
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