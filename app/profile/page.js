'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle>个人资料</CardTitle>
            <CardDescription>
              查看和编辑您的个人信息
            </CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              编辑资料
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {message && (
            <div className={`p-3 rounded-md border ${
              message.includes('失败') 
                ? 'bg-destructive/10 text-destructive-foreground border-destructive/20' 
                : 'bg-success/10 text-success-foreground border-success/20'
            }`}>
              {message}
            </div>
          )}

          {/* 用户名 */}
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            {isEditing ? (
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="请输入用户名"
              />
            ) : (
              <div className="text-sm text-foreground p-2 rounded-md bg-muted/50">
                {profile.username || '未设置'}
              </div>
            )}
          </div>

          {/* 真实姓名 */}
          <div className="space-y-2">
            <Label htmlFor="full_name">真实姓名</Label>
            {isEditing ? (
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="请输入真实姓名"
              />
            ) : (
              <div className="text-sm text-foreground p-2 rounded-md bg-muted/50">
                {profile.full_name || '未设置'}
              </div>
            )}
          </div>

          {/* 班级 */}
          <div className="space-y-2">
            <Label htmlFor="class">班级</Label>
            {isEditing ? (
              <Input
                id="class"
                name="class"
                value={formData.class}
                onChange={handleInputChange}
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
            <Label>年级信息</Label>
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
                      <Label
                        htmlFor={`grade-${gradeOption}`}
                        className="cursor-pointer"
                      >
                        {gradeOption}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {profile.grade && profile.grade.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.grade.map((gradeItem, index) => (
                      <Badge key={index} variant="secondary">
                        {gradeItem}
                      </Badge>
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
            <Label htmlFor="role">身份</Label>
            {isEditing ? (
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择身份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="学生">学生</SelectItem>
                  <SelectItem value="家长">家长</SelectItem>
                  <SelectItem value="教师">教师</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-foreground p-2 rounded-md bg-muted/50">
                {profile.role || '未设置'}
              </div>
            )}
          </div>
        </CardContent>

        {isEditing && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存更改
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}