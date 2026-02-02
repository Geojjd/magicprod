import axios from 'axios'
import { getSupabaseBrowserClient } from './supabase'

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE! 

export const api = axios.create({
    baseURL: API_BASE,
    timeout: 12000, // 12 seconds (AI tasks can take a while)
});


api.interceptors.request.use(async (config) => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) return config

    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});