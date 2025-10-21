import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>请先登录</div>
  }

  // 获取用户资料
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('获取用户资料失败:', error)
    return <div>获取用户资料失败</div>
  }

  // 如果用户没有profile记录，创建默认记录
  if (!profile) {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          full_name: '',
          年级: '',
          class: '',
          role: 'student'
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('创建用户资料失败:', insertError)
      return <div>创建用户资料失败</div>
    }

    return <ProfileClient profile={newProfile} />
  }

  return <ProfileClient profile={profile} />
}