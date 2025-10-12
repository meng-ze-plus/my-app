import { createClient } from '@/lib/supabase/server';

export default async function 学生成绩数据库() {
  const supabase = await createClient();
  const { data: 学生成绩数据库 } = await supabase.from("学生成绩数据库").select();

  return <pre>{JSON.stringify(学生成绩数据库, null, 2)}</pre>
}