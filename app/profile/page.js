'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Checkbox } from "@/components/ui/checkbox"

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
    grade: []
  })

  // 获取用户资料
  const fetchProfile = async () => {
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMessage('请先登录')
        setLoading(false)
        return
      }

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

  const handleGradeCheckedChange = (gradeValue, checked) => {
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          grade: [...prev.grade, gradeValue]
        }
      } else {
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
      
      await fetchProfile()
      
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
      class: profile.class || '',
      role: profile.role || '学生',
      grade: profile.grade || []
    })
    setIsEditing(false)
    setMessage('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">{message || '请先登录'}</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">个人资料</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                编辑资料
              </button>
            )}
          </div>
        </div>

        <div className="p-6 pt-0">
          {message && (
            <div className={`mb-6 p-3 rounded-md border ${
              message.includes('失败') 
                ? 'bg-destructive/10 text-destructive-foreground border-destructive/20' 
                : 'bg-success/10 text-success-foreground border-success/20'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* 用户名 */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                用户名
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                <div className="text-sm text-foreground p-2 rounded-md bg-muted/50">
                  {profile.username || '未设置'}
                </div>
              )}
            </div>

            {/* 真实姓名 */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                真实姓名
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                <div className="text-sm text-foreground p-2 rounded-md bg-muted/50">
                  {profile.full_name || '未设置'}
                </div>
              )}
            </div>

            {/* 班级 */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                班级
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="例如：1班、2班"
                />
              ) : (
                <div className="text-sm text-foreground p-2 rounded-md bg-muted/50">
                  {profile.class || '未设置'}
                </div>
              )}
            </div>

            {/* 年级信息 */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                年级信息
              </label>
              {isEditing ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">请选择您所在的年级（可多选）</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {gradeOptions.map((gradeOption) => (
                      <div key={gradeOption} className="flex items-center space-x-2">
                        <Checkbox
                          id={`grade-${gradeOption}`}
                          checked={formData.grade.includes(gradeOption)}
                          onCheckedChange={(checked) => handleGradeCheckedChange(gradeOption, checked)}
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
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground"
                        >
                          {gradeItem}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-2 rounded-md bg-muted/50">
                      未设置年级信息
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 身份 */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                身份
              </label>
              {isEditing ? (
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="学生">学生</option>
                  <option value="家长">家长</option>
                  <option value="教师">教师</option>
                </select>
              ) : (
                <div className="text-sm text-foreground p-2 rounded-md bg-muted/50">
                  {profile.role || '未设置'}
                </div>
              )}
            </div>

            {/* 编辑按钮 */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}