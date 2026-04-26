import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Wah, env-nya nggak kebaca bro. Pastiin jalaninnya pake flag --env-file=.env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('--- CEK KONEKSI SUPABASE ---')
  
  // 1. Cek Profiles
  const { data: profiles, error: pError } = await supabase.from('profiles').select('id, email').limit(5)
  if (pError) {
    console.error('Error Profile:', pError.message)
  } else {
    console.log('User di Profiles:', profiles.length)
    profiles.forEach(p => console.log(`- User ID: ${p.id} (${p.email})`))
  }

  // 2. Cek Kursus
  const { data: courses, error: cError } = await supabase.from('courses').select('id, title, status')
  if (cError) {
    console.error('Error Courses:', cError.message)
  } else {
    console.log('Kursus di DB:', courses.length)
    courses.forEach(c => console.log(`- [${c.status}] ${c.title}`))
  }
}

testConnection()
