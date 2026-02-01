import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonkey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) throw new Error("supabaseUrl is required");
if (!supabaseAnonkey) throw new Error("supabaseAnonKey is required");


export const supabase = createClient(supabaseUrl, supabaseAnonkey);