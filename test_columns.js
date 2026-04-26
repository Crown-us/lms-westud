
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://fqjlssibovszwvybfrtk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxamxzc2lib3Zzend2eWJmcnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MzQxNzYsImV4cCI6MjA5MjMxMDE3Nn0.rDT4Q-H-q2Am50v4wIBqf0vFld5TzxEWzVBeUrSi6sM'
)

async function checkColumns() {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching lessons:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Columns available:', Object.keys(data[0]))
  } else {
    // If no data, try to get error by inserting dummy (will fail if schema is wrong, but tells us columns)
    const { error: insertError } = await supabase.from('lessons').insert({ title: 'test_schema_check' }).select()
    console.log('Insert attempt error (check columns in message):', insertError?.message)
  }
}

checkColumns()
