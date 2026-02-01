import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRolekey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL!");
if (!serviceRolekey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY!");

export const supabaseAdmin = createClient(supabaseUrl, serviceRolekey, {
    auth: { persistSession: false },

});

