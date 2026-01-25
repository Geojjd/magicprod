import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRolekey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin= createClient(supabaseUrl, serviceRolekey)

