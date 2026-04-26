import { queryOptions } from '@tanstack/react-query'
import { supabase } from './supabase'

export const profileQueries = {
  detail: (userId: string | undefined) =>
    queryOptions({
      queryKey: ['profile', userId],
      queryFn: async () => {
        if (!userId) return null
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role, avatar_url, bio')
          .eq('id', userId)
          .single()
        if (error) throw error
        return data
      },
      enabled: !!userId,
      staleTime: 1000 * 60 * 30, // 30 mins
    }),

  allMentors: () =>
    queryOptions({
      queryKey: ['mentors'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'guru')
          .order('name', { ascending: true })
        if (error) throw error
        return data || []
      },
      staleTime: 1000 * 60 * 30,
    }),

  mentorCourses: (mentorId: string) =>
    queryOptions({
      queryKey: ['mentor-courses', mentorId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('instructor_id', mentorId)
          .eq('status', 'published')
        if (error) throw error
        return data || []
      },
      staleTime: 1000 * 60 * 10,
    })
}

export const dashboardQueries = {
  guruStats: (userId: string | undefined) =>
    queryOptions({
      queryKey: ['guru-stats', userId],
      queryFn: async () => {
        if (!userId) return null
        
        // Fetch courses first to get IDs for enrollments
        const { data: courses } = await supabase
          .from('courses')
          .select('id, rating, total_students')
          .eq('instructor_id', userId)
        
        const activeCourses = courses?.length || 0
        const totalStudents = courses?.reduce((acc, c) => acc + (c.total_students || 0), 0) || 0
        const avgRating = courses?.length 
          ? (courses.reduce((acc, c) => acc + Number(c.rating || 0), 0) / courses.length).toFixed(1) 
          : '0.0'
        
        let recentSales: any[] = []
        if (courses && courses.length > 0) {
          const { data } = await supabase
            .from('enrollments')
            .select(`
              id,
              enrolled_at,
              student:profiles(name),
              course:courses(title)
            `)
            .in('course_id', courses.map(c => c.id))
            .order('enrolled_at', { ascending: false })
            .limit(5)
          recentSales = (data as any[]) || []
        }

        return {
          stats: {
            totalStudents: totalStudents.toLocaleString(),
            revenue: 'Rp ' + (totalStudents * 150000 / 1000000).toFixed(1) + 'jt',
            courseRating: avgRating,
            activeCourses
          },
          recentSales: recentSales.map((s: any) => ({
            name: s.student?.name || 'Siswa Baru',
            course: s.course?.title || 'Kursus',
            date: new Date(s.enrolled_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }))
        }
      },
      enabled: !!userId,
      staleTime: 1000 * 60 * 5, // 5 mins
    }),

  studentStats: (userId: string | undefined) =>
    queryOptions({
      queryKey: ['student-stats', userId],
      queryFn: async () => {
        if (!userId) return null
        
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('id, progress, enrolled_at, course:courses(id, title, category, image_url)')
          .eq('student_id', userId)
          .order('enrolled_at', { ascending: false })
        
        const completed = enrollments?.filter(e => e.progress === 100).length || 0
        const avgProgress = enrollments?.length 
          ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length) 
          : 0

        return {
          stats: {
            hours: (enrollments?.length || 0) * 2 + 'j',
            completed,
            progress: avgProgress
          },
          recentCourses: enrollments?.slice(0, 3) || []
        }
      },
      enabled: !!userId,
      staleTime: 1000 * 60 * 5,
    }),

  guruStudents: (userId: string | undefined) =>
    queryOptions({
      queryKey: ['guru-students', userId],
      queryFn: async () => {
        if (!userId) return []
        
        const { data: myCourses } = await supabase.from('courses').select('id').eq('instructor_id', userId)
        const courseIds = myCourses?.map(c => c.id) || []
        if (courseIds.length === 0) return []

        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            id,
            enrolled_at,
            progress,
            student:profiles(id, name, email, avatar_url),
            course:courses(title)
          `)
          .in('course_id', courseIds)
          .order('enrolled_at', { ascending: false })
        
        if (error) throw error
        return data || []
      },
      enabled: !!userId,
      staleTime: 1000 * 60 * 5,
    }),

  instructorDiscussions: (userId: string | undefined) =>
    queryOptions({
      queryKey: ['instructor-discussions', userId],
      queryFn: async () => {
        if (!userId) return []
        
        const { data: myCourses } = await supabase.from('courses').select('id').eq('instructor_id', userId)
        const courseIds = myCourses?.map(c => c.id) || []
        
        if (courseIds.length === 0) return []

        const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', 
          (await supabase.from('modules').select('id').in('course_id', courseIds)).data?.map(m => m.id) || []
        )
        const lessonIds = lessons?.map(l => l.id) || []

        if (lessonIds.length === 0) return []

        const { data, error } = await supabase
          .from('discussions')
          .select(`
            *,
            user:profiles(id, name, avatar_url),
            lesson:lessons(id, title, module:modules(id, title, course:courses(id, title)))
          `)
          .in('lesson_id', lessonIds)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data || []
      },
      enabled: !!userId,
      staleTime: 1000 * 30, // 30 seconds for messages
    }),

  studentDiscussions: (userId: string | undefined) =>
    queryOptions({
      queryKey: ['student-discussions', userId],
      queryFn: async () => {
        if (!userId) return []
        const { data, error } = await supabase
          .from('discussions')
          .select(`
            *,
            user:profiles(id, name, avatar_url),
            lesson:lessons(id, title, module:modules(id, title, course:courses(id, title)))
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
      },
      enabled: !!userId,
      staleTime: 1000 * 30,
    })
}

export const courseQueries = {
  myCourses: (userId: string | undefined, isTeacher: boolean) =>
    queryOptions({
      queryKey: ['dashboard-courses', userId, isTeacher],
      queryFn: async () => {
        if (!userId) return []
        
        if (isTeacher) {
          const { data, error } = await supabase
            .from('courses')
            .select('id, title, category, image_url, status, rating, total_students, price_monthly')
            .eq('instructor_id', userId)
          if (error) throw error
          return data || []
        } else {
          const { data, error } = await supabase
            .from('enrollments')
            .select(`id, progress, course:courses(id, title, category, image_url, status, rating, price_monthly)`)
            .eq('student_id', userId)
          if (error) throw error
          return data.map((e: any) => ({ 
            ...e.course, 
            progress: e.progress, 
            enrollment_id: e.id 
          })) || []
        }
      },
      enabled: !!userId,
      staleTime: 1000 * 60 * 5,
    }),

  publicCourses: () =>
    queryOptions({
      queryKey: ['public-courses'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('courses')
          .select(`*, instructor:profiles(name, avatar_url)`)
          .eq('status', 'published')
        if (error) throw error
        return data || []
      },
      staleTime: 1000 * 60 * 10, // 10 mins
    }),

  courseDetail: (courseId: string) =>
    queryOptions({
      queryKey: ['course', courseId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('courses')
          .select(`*, instructor:profiles(name, avatar_url)`)
          .eq('id', courseId)
          .single()
        if (error) throw error
        return data
      },
      staleTime: 1000 * 60 * 5,
    }),

  courseModules: (courseId: string) =>
    queryOptions({
      queryKey: ['course-modules', courseId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('modules')
          .select(`*, lessons(*)`)
          .eq('course_id', courseId)
          .order('order_index', { ascending: true })
        if (error) throw error
        return data || []
      },
      staleTime: 1000 * 60 * 5,
    }),

  enrollment: (courseId: string, userId: string | undefined) =>
    queryOptions({
      queryKey: ['enrollment', courseId, userId],
      queryFn: async () => {
        if (!userId) return null
        const { data, error } = await supabase
          .from('enrollments')
          .select('*')
          .eq('course_id', courseId)
          .eq('student_id', userId)
          .maybeSingle()
        if (error) return null
        return data
      },
      enabled: !!userId,
      staleTime: 1000 * 60 * 2,
    }),

  classroom: (courseId: string) =>
    queryOptions({
      queryKey: ['classroom-course', courseId],
      queryFn: async () => {
        const [courseRes, modulesRes, lessonsRes, quizzesRes] = await Promise.all([
          supabase.from('courses').select('*, instructor:profiles(name)').eq('id', courseId).single(),
          supabase.from('modules').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
          supabase.from('lessons').select('*').in('module_id', (await supabase.from('modules').select('id').eq('course_id', courseId)).data?.map(m => m.id) || []),
          supabase.from('quizzes').select('*').in('module_id', (await supabase.from('modules').select('id').eq('course_id', courseId)).data?.map(m => m.id) || [])
        ])
        
        if (courseRes.error) throw courseRes.error
        if (modulesRes.error) throw modulesRes.error

        const lessons = lessonsRes.data || []
        const quizzes = quizzesRes.data || []

        const sortedModules = modulesRes.data.map((m: any) => ({
          ...m,
          lessons: lessons
            .filter((l: any) => l.module_id === m.id)
            .sort((a: any, b: any) => a.order_index - b.order_index),
          quizzes: quizzes
            .filter((q: any) => q.module_id === m.id)
            .sort((a: any, b: any) => a.order_index - b.order_index)
        }))
        
        return { ...courseRes.data, modules: sortedModules }
      },
      staleTime: 1000 * 60 * 10,
    }),

  progress: (courseId: string, userId: string | undefined) =>
    queryOptions({
      queryKey: ['user-progress', courseId, userId],
      queryFn: async () => {
        if (!userId) return []
        const { data, error } = await supabase
          .from('completed_lessons')
          .select('lesson_id')
          .eq('course_id', courseId)
          .eq('student_id', userId)
        if (error) throw error
        return data.map(d => d.lesson_id)
      },
      enabled: !!userId,
      staleTime: 1000 * 60 * 5,
    }),

  discussions: (lessonId: number | undefined) =>
    queryOptions({
      queryKey: ['discussions', lessonId],
      queryFn: async () => {
        if (!lessonId) return []
        const { data, error } = await supabase
          .from('discussions')
          .select('*, user:profiles(name, avatar_url)')
          .eq('lesson_id', lessonId)
          .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
      },
      enabled: !!lessonId,
      staleTime: 1000 * 60, // 1 min
    })
}

export const scheduleQueries = {
  mySchedules: (userId: string | undefined, date: string) =>
    queryOptions({
      queryKey: ['schedules', userId, date],
      queryFn: async () => {
        if (!userId) return []
        
        // Fetch schedules for a specific date
        // We'll use start_time for filtering
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .eq('user_id', userId)
          .gte('start_time', `${date}T00:00:00`)
          .lte('start_time', `${date}T23:59:59`)
          .order('start_time', { ascending: true })
        
        if (error) {
          // If table doesn't exist yet, return empty but log it
          console.warn('Schedules table might not exist:', error)
          return []
        }
        return data || []
      },
      enabled: !!userId,
      staleTime: 1000 * 60 * 5,
    })
}

