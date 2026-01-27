'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { supabase } from './lib/supabase' // adjust if your path differs (e.g. "@/app/lib/supabase")

/**
 * ✅ This page.tsx is built to ensure:
 * - ALL calls go to Railway via ONE baseURL
 * - ALL endpoints use relative paths (/ai-xxx) so no double URL bugs
 * - Timeouts are long enough for audio/AI work
 * - Easy debug logs + clear errors
 *
 * Required env on Vercel + locally:
 * NEXT_PUBLIC_API_BASE=https://magicprod-backend-production.up.railway.app
 */

type Plan = any
type BeatResponse = any
type MelodyResponse = any
type LoopsResponse = { loops?: any[] }
type EditResponse = { output_url?: string }
type MasterResponse = { output_url?: string }
type VocalResponse = { output_url?: string }
type ExportStemsResponse = { output_url?: string }

function getNiceAxiosError(err: unknown) {
  const e = err as AxiosError<any>
  if (axios.isAxiosError(e)) {
    const status = e.response?.status
    const data = e.response?.data
    const msg = e.message
    return { status, data, msg }
  }
  return { status: undefined, data: undefined, msg: String(err) }
}

export default function Home() {
  // -----------------------------
  // 1) API client (ONE baseURL)
  // -----------------------------
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      timeout: 180000, // ✅ 2 minutes (audio AI can take time)
      withCredentials: false,
    })
  }, [API_BASE])

  useEffect(() => {
    console.log('API_BASE =', API_BASE)
    if (!API_BASE) {
      console.warn(
        'NEXT_PUBLIC_API_BASE is missing. Set it in .env.local and Vercel env vars.'
      )
    }
  }, [API_BASE])

  // -----------------------------
  // 2) Core state
  // -----------------------------
  const [file, setFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [abMode, setAbMode] = useState<'original' | 'result'>('original')

  // selection region (waveform selection)
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null)

  // generic strength
  const [strength, setStrength] = useState<number>(60)

  // AI Edit
  const [command, setCommand] = useState<string>('')

  // Plan
  const [plan, setPlan] = useState<Plan | null>(null)

  // Loops
  const [finding, setFinding] = useState(false)
  const [loops, setLoops] = useState<any[]>([])

  // Beats
  const [beatsLoading, setBeatsLoading] = useState(false)
  const [beats, setBeats] = useState<BeatResponse | null>(null)

  // Melody generator
  const [melBusy, setMelBusy] = useState(false)
  const [melPrompt, setMelPrompt] = useState('')
  const [melBpm, setMelBpm] = useState<number>(140)
  const [melBars, setMelBars] = useState<number>(8)
  const [melSeed, setMelSeed] = useState<number>(1)
  const [melOutput, setMelOutput] = useState<'midi' | 'audio'>('midi')
  const [melRes, setMelRes] = useState<MelodyResponse | null>(null)

  // Vocals
  const [vocalStyle, setVocalStyle] = useState<string>('clean')
  const [vocalWholeTrack, setVocalWholeTrack] = useState<boolean>(true)
  const [vocalsBusy, setVocalsBusy] = useState<boolean>(false)

  // Mastering
  const [masterPreset, setMasterPreset] = useState<string>('Streaming')
  const [masterWholeTrack, setMasterWholeTrack] = useState<boolean>(true)
  const [mastering, setMastering] = useState<boolean>(false)

  // Export stems
  const [exporting, setExporting] = useState(false)

  // Busy state for AI edit
  const [busy, setBusy] = useState(false)

  // For <audio> player
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const activeAudioSrc = useMemo(() => {
    if (abMode === 'original') return originalUrl ?? undefined
    return resultUrl ?? originalUrl ?? undefined
  }, [abMode, originalUrl, resultUrl])

  // -----------------------------
  // 3) File handling
  // -----------------------------
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPlan(null)
    setLoops([])
    setBeats(null)
    setMelRes(null)
    setResultUrl(null)

    if (f) {
      const url = URL.createObjectURL(f)
      setOriginalUrl(url)
      setAbMode('original')
    } else {
      setOriginalUrl(null)
    }
  }

  // -----------------------------
  // 4) Backend calls (IMPORTANT)
  //    ✅ all routes are RELATIVE: '/ai-xxx'
  // -----------------------------

  async function fetchBeats(f: File) {
    setBeatsLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', f)

      if (selection) {
        fd.append('start', String(selection.start ?? 0))
        fd.append('end', String(selection.end ?? 0))
      } else {
        fd.append('start', '0')
        fd.append('end', '0')
      }

      const res = await api.post('/ai-beats', fd, { responseType: 'json' })
      setBeats(res.data)
    } catch (err) {
      console.error('ai-beats failed:', getNiceAxiosError(err))
      alert('Beat analysis failed. Check backend terminal + browser console.')
    } finally {
      setBeatsLoading(false)
    }
  }

  const findLoops = async () => {
    if (!file) return
    setFinding(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('start', String(selection?.start ?? 0))
      fd.append('end', String(selection?.end ?? 0))

      const res = await api.post<LoopsResponse>('/ai-loops', fd, {
        responseType: 'json',
      })
      setLoops(res.data?.loops ?? [])
    } catch (err) {
      console.error('ai-loops failed:', getNiceAxiosError(err))
      setLoops([])
      alert('Loop detection failed. Check backend terminal + browser console.')
    } finally {
      setFinding(false)
    }
  }

  const applyAI = async () => {
    if (!file || !selection || !command.trim()) {
      alert('Upload a file, select a region, and type a command.')
      return
    }

    setBusy(true)
    try {
      // 1) plan
      const planFd = new FormData()
      planFd.append('command', command.trim())

      const planRes = await api.post('/ai-plan', planFd, { responseType: 'json' })
      setPlan(planRes.data)

      // 2) edit
      const fd = new FormData()
      fd.append('file', file)
      fd.append('start', String(selection.start))
      fd.append('end', String(selection.end))
      fd.append('command', command.trim())
      fd.append('strength', String(strength))

      const res = await api.post<EditResponse>('/ai-edit', fd, { responseType: 'json' })
      const out = res.data?.output_url
      if (out) {
        setResultUrl(out)
        setAbMode('result')
      } else {
        alert('AI edit returned no output_url. Check backend logs.')
      }
    } catch (err) {
      console.error('ai-edit failed:', getNiceAxiosError(err))
      alert('AI edit failed. Check backend terminal + browser console.')
    } finally {
      setBusy(false)
    }
  }

  const applyMastering = async () => {
    if (!file) {
      alert('Upload a file (or generate a beat) first.')
      return
    }

    setMastering(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('preset', masterPreset)
      fd.append('strength', String(strength))

      if (!masterWholeTrack && selection) {
        fd.append('start', String(selection.start))
        fd.append('end', String(selection.end))
      } else {
        fd.append('start', '0')
        fd.append('end', '0')
      }

      const res = await api.post<MasterResponse>('/ai-master', fd, { responseType: 'json' })
      const out = res.data?.output_url
      if (out) {
        setResultUrl(out)
        setAbMode('result')
      } else {
        alert('Mastering returned no output_url. Check backend logs.')
      }
    } catch (err) {
      console.error('ai-master failed:', getNiceAxiosError(err))
      alert('Mastering failed. Check backend terminal + browser console.')
    } finally {
      setMastering(false)
    }
  }

  const applyVocals = async () => {
    if (!file) {
      alert('Upload a vocal audio file first.')
      return
    }

    setVocalsBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('style', vocalStyle)
      fd.append('strength', String(strength))

      if (!vocalWholeTrack && selection) {
        fd.append('start', String(selection.start))
        fd.append('end', String(selection.end))
      } else {
        fd.append('start', '0')
        fd.append('end', '0')
      }

      const res = await api.post<VocalResponse>('/ai-vocal', fd, { responseType: 'json' })
      const out = res.data?.output_url
      if (out) {
        setResultUrl(out)
        setAbMode('result')
      } else {
        alert('Vocal returned no output_url. Check backend logs.')
      }
    } catch (err) {
      console.error('ai-vocal failed:', getNiceAxiosError(err))
      alert('Vocal processing failed. Check backend terminal + browser console.')
    } finally {
      setVocalsBusy(false)
    }
  }

  const exportStems = async () => {
    if (!file) {
      alert('Upload a file first.')
      return
    }

    setExporting(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('start', String(selection?.start ?? 0))
      fd.append('end', String(selection?.end ?? 0))
      fd.append('command', command.trim())
      fd.append('edit_strength', String(strength))
      fd.append('master_preset', masterPreset)
      fd.append('master_strength', String(strength))
      fd.append('vocal_style', vocalStyle)
      fd.append('vocal_strength', String(strength))

      const res = await api.post<ExportStemsResponse>('/ai-export-stems', fd, {
        responseType: 'json',
      })

      const out = res.data?.output_url
      if (out) {
        window.open(out as string, '_blank')
      } else {
        alert('Export returned no output_url. Check backend logs.')
      }
    } catch (err) {
      console.error('ai-export-stems failed:', getNiceAxiosError(err))
      alert('Export failed. Check backend terminal + browser console.')
    } finally {
      setExporting(false)
    }
  }

  const generateMelody = async () => {
    setMelBusy(true)
    setMelRes(null)

    try {
      const fd = new FormData()
      fd.append('prompt', melPrompt)
      fd.append('bpm', String(melBpm))
      fd.append('bars', String(melBars))
      fd.append('seed', String(melSeed))
      fd.append('output', melOutput)

      const res = await api.post('/ai-melody', fd, { responseType: 'json' })
      setMelRes(res.data)
    } catch (err) {
      console.error('ai-melody failed:', getNiceAxiosError(err))
      alert('Melody generation failed. Check backend terminal + browser console.')
    } finally {
      setMelBusy(false)
    }
  }

  // Stripe buy plan (if you have it)
  const buyplan = async (planName: 'starter' | 'pro') => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert('You must be logged in to purchase a plan.')
        return
      }

      // NOTE: this endpoint looks like a Next.js route in your app (not Railway):
      // If your Stripe checkout endpoint is in Next.js (app/api/billing/checkout), keep it here:
      const res = await fetch(`/api/billing/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planName }),
      })

      const data = await res.json()
      if (data?.url) window.location.href = data.url
      else alert('Checkout failed (missing url). Check server logs.')
    } catch (err) {
      console.error('buyplan failed:', err)
      alert('Checkout failed. Check console.')
    }
  }

  // -----------------------------
  // 5) Minimal UI (safe)
  //    Replace this with your full UI if you want,
  //    BUT KEEP the handlers + API rules above.
  // -----------------------------
  return (
    <main style={{ padding: 16, maxWidth: 1000, margin: '0 auto' }}>
      <h1>MagicProd</h1>

      <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <label>Upload audio</label>
          <input type="file" accept="audio/*" onChange={onFileChange} />
        </div>

        <div>
          <label>Strength</label>
          <input
            type="number"
            value={strength}
            onChange={(e) => setStrength(Number(e.target.value))}
            style={{ width: 80, marginLeft: 8 }}
          />
        </div>

        <div>
          <button
            onClick={() => file && fetchBeats(file)}
            disabled={!file || beatsLoading}
          >
            {beatsLoading ? 'Analyzing…' : 'Analyze Beats'}
          </button>
        </div>

        <div>
          <button onClick={findLoops} disabled={!file || finding}>
            {finding ? 'Finding…' : 'Find Loops'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Selection (seconds) — put your waveform selector into setSelection</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
          <input
            type="number"
            placeholder="start"
            value={selection?.start ?? 0}
            onChange={(e) =>
              setSelection((s) => ({ start: Number(e.target.value), end: s?.end ?? 0 }))
            }
          />
          <input
            type="number"
            placeholder="end"
            value={selection?.end ?? 0}
            onChange={(e) =>
              setSelection((s) => ({ start: s?.start ?? 0, end: Number(e.target.value) }))
            }
          />
          <button onClick={() => setSelection(null)}>Clear</button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>A/B Mode</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button onClick={() => setAbMode('original')} disabled={!originalUrl}>
            A: Original
          </button>
          <button onClick={() => setAbMode('result')} disabled={!resultUrl}>
            B: Result
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <audio ref={audioRef} controls src={activeAudioSrc} />
        </div>
      </div>

      <hr style={{ margin: '20px 0' }} />

      <section>
        <h2>AI Edit</h2>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. normalize, add bass, punchier drums..."
          style={{ width: '100%', padding: 8 }}
        />
        <div style={{ marginTop: 10 }}>
          <button onClick={applyAI} disabled={!file || !selection || busy}>
            {busy ? 'Working…' : 'Apply AI Edit'}
          </button>
        </div>

        {plan && (
          <pre style={{ marginTop: 10, background: '#111', color: '#eee', padding: 10 }}>
            {JSON.stringify(plan, null, 2)}
          </pre>
        )}
      </section>

      <hr style={{ margin: '20px 0' }} />

      <section>
        <h2>Mastering</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={masterPreset} onChange={(e) => setMasterPreset(e.target.value)}>
            <option value="Streaming">Streaming</option>
            <option value="Club">Club</option>
            <option value="Warm">Warm</option>
          </select>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={masterWholeTrack}
              onChange={(e) => setMasterWholeTrack(e.target.checked)}
            />
            Whole track
          </label>
          <button onClick={applyMastering} disabled={!file || mastering}>
            {mastering ? 'Working…' : 'Apply Mastering'}
          </button>
        </div>
      </section>

      <hr style={{ margin: '20px 0' }} />

      <section>
        <h2>AI Vocals</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={vocalStyle} onChange={(e) => setVocalStyle(e.target.value)}>
            <option value="clean">Clean</option>
            <option value="modern">Modern</option>
            <option value="vintage">Vintage</option>
          </select>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={vocalWholeTrack}
              onChange={(e) => setVocalWholeTrack(e.target.checked)}
            />
            Whole track
          </label>
          <button onClick={applyVocals} disabled={!file || vocalsBusy}>
            {vocalsBusy ? 'Working…' : 'Apply Vocal Chain'}
          </button>
        </div>
      </section>

      <hr style={{ margin: '20px 0' }} />

      <section>
        <h2>Export Stems</h2>
        <button onClick={exportStems} disabled={!file || exporting}>
          {exporting ? 'Exporting…' : 'Export Stems (ZIP)'}
        </button>
      </section>

      <hr style={{ margin: '20px 0' }} />

      <section>
        <h2>AI Melody Generator</h2>
        <input
          value={melPrompt}
          onChange={(e) => setMelPrompt(e.target.value)}
          placeholder="Melody prompt…"
          style={{ width: '100%', padding: 8 }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <label>
            BPM{' '}
            <input
              type="number"
              value={melBpm}
              onChange={(e) => setMelBpm(Number(e.target.value))}
              style={{ width: 90 }}
            />
          </label>
          <label>
            Bars{' '}
            <input
              type="number"
              value={melBars}
              onChange={(e) => setMelBars(Number(e.target.value))}
              style={{ width: 70 }}
            />
          </label>
          <label>
            Seed{' '}
            <input
              type="number"
              value={melSeed}
              onChange={(e) => setMelSeed(Number(e.target.value))}
              style={{ width: 70 }}
            />
          </label>
          <label>
            Output{' '}
            <select value={melOutput} onChange={(e) => setMelOutput(e.target.value as any)}>
              <option value="midi">midi</option>
              <option value="audio">audio</option>
            </select>
          </label>

          <button onClick={generateMelody} disabled={melBusy}>
            {melBusy ? 'Working…' : 'Generate Melody'}
          </button>
        </div>

        {melRes && (
          <pre style={{ marginTop: 10, background: '#111', color: '#eee', padding: 10 }}>
            {JSON.stringify(melRes, null, 2)}
          </pre>
        )}
      </section>

      <hr style={{ margin: '20px 0' }} />

      <section>
        <h2>Stripe Plans</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => buyplan('starter')}>Buy Starter</button>
          <button onClick={() => buyplan('pro')}>Buy Pro</button>
        </div>
      </section>

      <hr style={{ margin: '20px 0' }} />

      <section>
        <h2>Debug info</h2>
        <div style={{ fontSize: 14 }}>
          <div>
            <b>API_BASE</b>: {API_BASE || '(missing)'}
          </div>
          <div>
            <b>File</b>: {file ? file.name : '(none)'}
          </div>
          <div>
            <b>Selection</b>:{' '}
            {selection ? `${selection.start}s → ${selection.end}s` : '(none)'}
          </div>
          <div>
            <b>Original URL</b>: {originalUrl ? 'set' : 'none'}
          </div>
          <div>
            <b>Result URL</b>: {resultUrl ? 'set' : 'none'}
          </div>
          <div>
            <b>Loops</b>: {loops.length}
          </div>
          <div>
            <b>Beats</b>: {beats ? 'loaded' : 'none'}
          </div>
        </div>
      </section>
    </main>
  )
}
