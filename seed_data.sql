    -- ==========================================
    -- SCRIPT DATA AWAL (SEED DATA) WESTUD
    -- ==========================================

    DO $$ 
    DECLARE 
        v_instructor_id UUID;
        v_course_id_1 BIGINT;
        v_course_id_2 BIGINT;
        v_module_id_1 BIGINT;
        v_module_id_2 BIGINT;
    BEGIN
        -- 1. Ambil ID User pertama yang ada di tabel profiles untuk jadi instruktur
        SELECT id INTO v_instructor_id FROM public.profiles LIMIT 1;

        -- Jika tidak ada user, kita stop (lo harus login/signup dulu sekali via web)
        IF v_instructor_id IS NULL THEN
            RAISE NOTICE 'KAGAK ADA USER BRO! Signup dulu di web sekali biar ada ID-nya.';
            RETURN;
        END IF;

        -- 2. Masukkan Data Kursus
        -- Kursus 1: React 19
        INSERT INTO public.courses (title, description, instructor_id, category, price_monthly, price_yearly, image_url, status, rating, total_students)
        VALUES (
            'Mastering React 19: The Complete Guide',
            'Pelajari fitur terbaru React 19 mulai dari Actions, Use API, hingga Server Components dengan studi kasus nyata.',
            v_instructor_id,
            'Web Development',
            'Rp 149.000',
            'Rp 1.200.000',
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
            'published',
            4.9,
            1250
        ) RETURNING id INTO v_course_id_1;

        -- Kursus 2: UI/UX Masterclass
        INSERT INTO public.courses (title, description, instructor_id, category, price_monthly, price_yearly, image_url, status, rating, total_students)
        VALUES (
            'UI/UX Design Masterclass 2026',
            'Kuasai Figma, Teori Warna, dan Tipografi untuk membangun antarmuka aplikasi yang modern dan intuitif.',
            v_instructor_id,
            'UI/UX Design',
            'Gratis',
            'Gratis',
            'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800&q=80',
            'published',
            4.8,
            850
        ) RETURNING id INTO v_course_id_2;

        -- 3. Masukkan Data Module & Lessons untuk Kursus 1
        -- Module 1
        INSERT INTO public.modules (course_id, title, order_index)
        VALUES (v_course_id_1, 'Pengenalan React 19', 1) RETURNING id INTO v_module_id_1;

        INSERT INTO public.lessons (module_id, title, duration, is_free, order_index)
        VALUES 
        (v_module_id_1, 'Apa yang baru di React 19?', '10:25', TRUE, 1),
        (v_module_id_1, 'Persiapan Environment', '05:15', TRUE, 2);

        -- Module 2
        INSERT INTO public.modules (course_id, title, order_index)
        VALUES (v_course_id_1, 'Deep Dive Actions', 2) RETURNING id INTO v_module_id_2;

        INSERT INTO public.lessons (module_id, title, duration, is_free, order_index)
        VALUES 
        (v_module_id_2, 'Memahami useActionState', '15:40', FALSE, 1),
        (v_module_id_2, 'Optimistic Updates', '20:10', FALSE, 2);

        -- 4. Masukkan Data Module & Lessons untuk Kursus 2
        INSERT INTO public.modules (course_id, title, order_index)
        VALUES (v_course_id_2, 'Fundamental Design', 1) RETURNING id INTO v_module_id_1;

        INSERT INTO public.lessons (module_id, title, duration, is_free, order_index)
        VALUES 
        (v_module_id_1, 'Prinsip Gestalt dalam UI', '12:30', TRUE, 1),
        (v_module_id_1, 'Workflow Figma 2026', '18:45', TRUE, 2);

        RAISE NOTICE 'DATA BERHASIL DI-PUSH BRO! Cek halaman /courses sekarang.';
    END $$;
