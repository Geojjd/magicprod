import axios from 'axios'

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000'

export const api = axios.create({
    baseURL: API_BASE,
    timeout: 12000, // 12 seconds (AI tasks can take a while)
})