import { createClient } from "@supabase/supabase-js";

// Menggunakan dummy URL agar saat proses build di Vercel tidak error jika env belum di-set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

