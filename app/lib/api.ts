import axios from 'axios'
import { supabase } from './supabase'

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000'

export const api = axios.create({
    baseURL: API_BASE,
    timeout: 12000, // 12 seconds (AI tasks can take a while)
})


//Attach supabase auth token to each request if available
api.interceptors.request.use(async (config) => {
    const { data } = await supabase.auth.getSession()

    const accessToken = data.session?.access_token
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
})

console.log("API_BASE =", API_BASE)
