import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PBLIC_SUPABASE!;
const supabaseAnonkey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonkey);