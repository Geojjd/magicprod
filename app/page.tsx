'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Waveform, { WaveApi } from './components/Waveform'
import ReferenceMatchUI from './components/ReferenceMatchUI'
import styles from './page.module.css'
import { supabase } from '@/app/lib/supabase'

type Selection = { start: number; end: number }

type LoopCandidate = {
  start: number
  end: number
  score: number
  bars?: number
  bpm?: number
}

type HistoryItem = {
  text: string
  strength: number
  time: number
}

const PRESETS = [
  { label: 'Punchier drums', text: 'Make the drums punchier, add transient shaping, keep it clean.' },
  { label: 'Louder / normalize', text: 'Normalize to a competitive loudness without clipping.' },
  { label: 'More bass', text: 'Boost the sub bass and tighten the low end.' },
  { label: 'Lo-fi', text: 'Add subtle vinyl noise, gentle saturation, and a lowpass around 12k.' },
  { label: 'Wider', text: 'Make the mix wider but keep the low end mono.' },
  { label: 'Darker', text: 'Make it darker and warmer, reduce harsh highs.' },
  { label: 'Brighter', text: 'Add clarity and brightness without making it harsh.' },
  { label: 'Glue', text: 'Add light bus compression for glue, keep transients.' },
] as const

type MasterPreset = 'streaming' | 'loud' | 'club'
type VocalStyle = 'clean' | 'rap' | 'melodic' | 'aggressive'

type MelodyOutput = 'midi' | 'audio' | 'both'
type MelodyResult = {
  meta: { bpm: number; bars: number; seed: number; key: string; scale: string; instrument: number }
  midi_url?: string
  audio_url?: string
}

const API = process.env.NEXT_PUBLIC_API_BASE!

const logout = async () => {
  await supabase.auth.signOut()
  document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  window.location.href = '/login'
}

export default function Home() {
  // AI command + strength
  const [strength, setStrength] = useState<number>(60)
  const [command, setCommand] = useState('')

  // Mastering
  const [masterPreset, setMasterPreset] = useState<MasterPreset>('streaming')
  const [masterWholeTrack, setMasterWholeTrack] = useState(true)
  const [mastering, setMastering] = useState(false)

  // Vocals
  const [vocalStyle, setVocalStyle] = useState<VocalStyle>('clean')
  const [vocalWholeTrack, setVocalWholeTrack] = useState(true)
  const [vocalsBusy, setVocalsBusy] = useState(false)

  // Beat generator
  const [genPrompt, setGenPrompt] = useState('dark drill, punchy drums')
  const [genBpm, setGenBpm] = useState(140)
  const [genBars, setGenBars] = useState(8)
  const [genSeed, setGenSeed] = useState(0)
  const [generating, setGenerating] = useState(false)

  // Melody generator
  const [melPrompt, setMelPrompt] = useState('dark drill melody, plucky, simple')
  const [melBpm, setMelBpm] = useState(140)
  const [melBars, setMelBars] = useState(8)
  const [melSeed, setMelSeed] = useState(0)
  const [melOutput, setMelOutput] = useState<MelodyOutput>('midi')
  const [melBusy, setMelBusy] = useState(false)
  const [melRes, setMelRes] = useState<MelodyResult | null>(null)

  // Audio + selection
  const [file, setFile] = useState<File | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)

  // Backend results
  const [plan, setPlan] = useState<any>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Beat grid
  const [beatTimes, setBeatTimes] = useState<number[]>([])
  const [bpm, setBpm] = useState<number>(0)
  const [lockBars, setLockBars] = useState<number>(4)

  // Waveform controls
  const [waveApi, setWaveApi] = useState<WaveApi | null>(null)

  // Loops
  const [loops, setLoops] = useState<LoopCandidate[]>([])
  const [finding, setFinding] = useState(false)

  // A/B
  const [abMode, setAbMode] = useState<'original' | 'result'>('original')

  // History
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Local preview URL for ORIGINAL uploaded/generated file
  const originalUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl)
    }
  }, [originalUrl])

  const fetchBeats = async (f: File) => {
    try {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('start', '0')
      fd.append('end', '0')

      const res = await axios.post(`${API}/ai-beats`, fd, { responseType: 'json' })
      setBeatTimes(res.data.beat_times || [])
      setBpm(res.data.bpm || 0)
    } catch (err) {
      console.error('ai-beats failed:', err)
      setBeatTimes([])
      setBpm(0)
    }
  }

  const generateBeat = async () => {
    setGenerating(true)
    try {
      const fd = new FormData()
      fd.append('prompt', genPrompt)
      fd.append('bpm', String(genBpm))
      fd.append('bars', String(genBars))
      fd.append('seed', String(genSeed))

      const res = await axios.post(`${API}/ai-generate`, fd, { responseType: 'json' })
      const wavUrl = res.data.output_url as string

      const blob = await fetch(wavUrl).then((r) => r.blob())
      const newFile = new File([blob], 'generated_beat.wav', { type: 'audio/wav' })

      setFile(newFile)
      setSelection(null)
      setPlan(null)
      setResultUrl(null)
      setWaveApi(null)
      setLoops([])
      setAbMode('original')

      await fetchBeats(newFile)
    } catch (err) {
      console.error(err)
      alert('Beat generation failed. Check backend terminal.')
    } finally {
      setGenerating(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null

    setFile(f)
    setSelection(null)
    setPlan(null)
    setResultUrl(null)
    setWaveApi(null)
    setLoops([])
    setAbMode('original')

    if (f) fetchBeats(f)
  }

  const findLoops = async () => {
    if (!file) return
    setFinding(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('start', String(selection?.start ?? 0))
      fd.append('end', String(selection?.end ?? 0))

      const res = await axios.post(`${API}/ai-loops`, fd, { responseType: 'json' })
      setLoops(res.data.loops || [])
    } catch (err) {
      console.error(err)
      alert('Loop detection failed. Check backend terminal.')
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
    const finalCommand = `${command.trim()} (strength: ${strength}%)`
    setHistory((h) => [{ text: command.trim(), strength, time: Date.now() }, ...h].slice(0, 10))

    try {
      // 1) plan
      const planFd = new FormData()
      planFd.append('command', finalCommand)

      const planRes = await axios.post(`${API}/ai-plan`, planFd, { responseType: 'json' })
      setPlan(planRes.data)

      // 2) edit
      const fd = new FormData()
      fd.append('file', file)
      fd.append('start', String(selection.start))
      fd.append('end', String(selection.end))
      fd.append('command', finalCommand)
      fd.append('strength', String(strength))

      const res = await axios.post(`${API}/ai-edit`, fd, { responseType: 'json' })
      setResultUrl(res.data.output_url)
      setAbMode('result')
    } catch (err) {
      console.error(err)
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

      const res = await axios.post(`${API}/ai-master`, fd, { responseType: 'json' })
      setPlan(res.data.plan ?? res.data)
      setResultUrl(res.data.output_url)
      setAbMode('result')
    } catch (err) {
      console.error(err)
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

      const res = await axios.post(`${API}/ai-vocal`, fd, { responseType: 'json' })
      setPlan(res.data.plan ?? res.data)
      setResultUrl(res.data.output_url)
      setAbMode('result')
    } catch (err) {
      console.error(err)
      alert('Vocal processing failed. Check backend terminal + browser console.')
    } finally {
      setVocalsBusy(false)
    }
  }

  const exportStems = async () => {
    if (!file) return alert('Upload a file first.')

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

      const res = await axios.post(`${API}/ai-export-stems`, fd, { responseType: 'json' })
      window.open(res.data.output_url as string, '_blank')
    } catch (err) {
      console.error(err)
      alert('Export failed. Check backend terminal.')
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

      const res = await axios.post(`${API}/ai-melody`, fd, { responseType: 'json' })
      setMelRes(res.data)
    } catch (err) {
      console.error(err)
      alert('Melody generation failed. Check backend terminal.')
    } finally {
      setMelBusy(false)
    }
  }

  const activeAudioSrc =
    abMode === 'original' ? (originalUrl ?? undefined) : (resultUrl ?? originalUrl ?? undefined)


    const buyPlan = async (plan: "starter" | "pro") => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/stripe/checkout`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan }),
  })

  const data = await res.json()
  window.location.href = data.url
}


  return (
    <main className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.title}>MagicProd</div>
          <div className={styles.subtitle}>Beats • Melody • Vocals • Mastering • Reference Match • Export</div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className={styles.badge}>Local API: {API}</span>
          <button className={`${styles.btn} ${styles.btnSmall}`} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* LEFT: Workspace */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Workspace</div>
            <span className={styles.badge}>Editor</span>
          </div>

          <div className={styles.cardBody}>
            {/* Upload */}
            <div className={styles.row}>
              <input className={styles.fileInput} type="file" accept="audio/*" onChange={onFileChange} />
            </div>

            {file && (
              <>
                <div className={styles.divider} />

                <div className={styles.row}>
                  <span className={styles.label}>Lock:</span>
                  {[1, 2, 4, 8].map((n) => (
                    <button
                      key={n}
                      className={`${styles.btn} ${styles.btnSmall} ${lockBars === n ? styles.btnActive : ''}`}
                      onClick={() => setLockBars(n)}
                    >
                      {n} bar{n > 1 ? 's' : ''}
                    </button>
                  ))}
                  <span className={styles.badge}>BPM: {bpm ? Math.round(bpm) : '—'}</span>
                </div>

                <div style={{ marginTop: 10 }}>
                  <Waveform
                    file={file}
                    beatTimes={beatTimes}
                    bpm={bpm}
                    lockBars={lockBars}
                    onRegionChange={(start, end) => setSelection({ start, end })}
                    onReady={setWaveApi}
                  />
                </div>

                {/* Transport */}
                <div className={styles.transport} style={{ marginTop: 10 }}>
                  <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => waveApi?.playPause()} disabled={!waveApi}>
                    Play / Pause
                  </button>
                  <button className={`${styles.btn} ${styles.btnSmall}`} onClick={() => waveApi?.stop()} disabled={!waveApi}>
                    Stop
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnSmall}`}
                    onClick={() => waveApi?.playSelection()}
                    disabled={!waveApi || !selection}
                  >
                    Play Selection
                  </button>
                  <button className={`${styles.btn} ${styles.btnSmall}`} onClick={findLoops} disabled={!file || finding}>
                    {finding ? 'Finding Loops…' : 'Find Loops'}
                  </button>

                  <div style={{ marginLeft: 'auto' }} />
                  <button
                    className={`${styles.btn} ${styles.btnSmall} ${abMode === 'original' ? styles.btnActive : ''}`}
                    onClick={() => setAbMode('original')}
                    disabled={!originalUrl}
                  >
                    A: Original
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnSmall} ${abMode === 'result' ? styles.btnActive : ''}`}
                    onClick={() => setAbMode('result')}
                    disabled={!resultUrl}
                  >
                    B: Result
                  </button>
                </div>

                {selection && (
                  <div style={{ marginTop: 8 }} className={styles.hint}>
                    Selected: {selection.start.toFixed(2)}s – {selection.end.toFixed(2)}s
                  </div>
                )}

                {/* A/B audio */}
                <div className={styles.divider} />
                <div className={styles.row}>
                  <div className={styles.cardTitle}>A/B Player</div>
                  <span className={styles.hint}>{abMode === 'original' ? 'Listening: original' : 'Listening: result'}</span>
                </div>

                {activeAudioSrc ? (
                  <audio key={abMode + String(resultUrl)} controls src={activeAudioSrc} style={{ marginTop: 10 }} />
                ) : (
                  <div className={styles.hint} style={{ marginTop: 10 }}>
                    No audio loaded yet.
                  </div>
                )}

                {/* AI Command */}
                <div className={styles.divider} />
                <div className={styles.row}>
                  {PRESETS.map((p) => (
                    <button key={p.label} className={`${styles.btn} ${styles.btnSmall}`} onClick={() => setCommand(p.text)}>
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className={styles.row} style={{ marginTop: 10 }}>
                  <input
                    style={{ flex: 1 }}
                    placeholder="e.g. normalize, make punchier, add bass..."
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                  />
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={applyAI} disabled={busy}>
                    {busy ? 'Working…' : 'Apply AI'}
                  </button>
                </div>

                {/* Strength */}
                <div className={styles.row} style={{ marginTop: 10 }}>
                  <span className={styles.label}>Strength:</span>
                  <input type="range" min={0} max={100} value={strength} onChange={(e) => setStrength(Number(e.target.value))} />
                  <span className={styles.badge}>{strength}%</span>
                </div>

                {/* Export */}
                <div className={styles.row} style={{ marginTop: 10 }}>
                  <button className={`${styles.btn} ${styles.btnGreen}`} onClick={exportStems}>
                    Export Stems (ZIP)
                  </button>
                </div>
              </>
            )}

            {/* Plan */}
            {plan && (
              <div className={styles.planBox}>
                <div className={styles.divider} />
                <div className={styles.row}>
                  <div className={styles.cardTitle}>AI Plan</div>
                  <span className={styles.hint}>Shows what the backend decided to do</span>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(plan, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Tools Rack */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Tools Rack</div>
            <span className={styles.badge}>Generators + Processing</span>
          </div>

          <div className={styles.cardBody}>
            {/* Beat Generator */}
            <div className={styles.row}>
              <div className={styles.cardTitle}>AI Beat Generator</div>
              <span className={styles.hint}>Generate a beat WAV</span>
            </div>

            <div className={styles.inputRow} style={{ marginTop: 10 }}>
              <input value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} placeholder="e.g. dark drill, punchy drums" />
              <input type="number" value={genBpm} onChange={(e) => setGenBpm(Number(e.target.value))} placeholder="BPM" />
              <input type="number" value={genBars} onChange={(e) => setGenBars(Number(e.target.value))} placeholder="Bars" />
              <input type="number" value={genSeed} onChange={(e) => setGenSeed(Number(e.target.value))} placeholder="Seed" title="0 = random" />
            </div>

            <div className={styles.row} style={{ marginTop: 10 }}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={generateBeat} disabled={generating}>
                {generating ? 'Generating…' : 'Generate Beat'}
              </button>
              <span className={styles.hint}>Tip: set Seed to the same number to regenerate the same beat.</span>
            </div>

            <div className={styles.divider} />

            {/* Melody Generator */}
            <div className={styles.row}>
              <div className={styles.cardTitle}>AI Melody Generator</div>
              <span className={styles.hint}>Choose MIDI / Audio / Both</span>
            </div>

            <div className={styles.inputRowMelody} style={{ marginTop: 10 }}>
              <input value={melPrompt} onChange={(e) => setMelPrompt(e.target.value)} placeholder="e.g. dark drill melody, plucky, simple" />
              <input type="number" value={melBpm} onChange={(e) => setMelBpm(Number(e.target.value))} placeholder="BPM" />
              <input type="number" value={melBars} onChange={(e) => setMelBars(Number(e.target.value))} placeholder="Bars" />
              <input type="number" value={melSeed} onChange={(e) => setMelSeed(Number(e.target.value))} placeholder="Seed" title="0 = random" />
              <select className={styles.select} value={melOutput} onChange={(e) => setMelOutput(e.target.value as MelodyOutput)}>
                <option value="midi">MIDI</option>
                <option value="audio">Audio Preview</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className={styles.row} style={{ marginTop: 10 }}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={generateMelody} disabled={melBusy}>
                {melBusy ? 'Generating…' : 'Generate Melody'}
              </button>
              <button
                className={`${styles.btn}`}
                onClick={() => {
                  setMelBpm(genBpm)
                  setMelBars(genBars)
                  setMelSeed(genSeed)
                }}
                title="Copies BPM/Bars/Seed from your Beat Generator settings"
              >
                Use beat settings
              </button>
            </div>

            {melRes && (
              <>
                <div className={styles.row} style={{ marginTop: 10 }}>
                  <span className={styles.badge}>
                    {melRes.meta.key} {melRes.meta.scale} • {melRes.meta.bars} bars • {melRes.meta.bpm} BPM
                  </span>
                  <span className={styles.hint}>Instrument (GM): {melRes.meta.instrument}</span>
                </div>

                {melRes.midi_url && (
                  <div className={styles.row} style={{ marginTop: 10 }}>
                    <a className={styles.link} href={melRes.midi_url} target="_blank" rel="noreferrer">
                      Open MIDI
                    </a>
                    <a className={styles.link} href={melRes.midi_url} download>
                      Download MIDI
                    </a>
                  </div>
                )}

                {melRes.audio_url && (
                  <div style={{ marginTop: 10 }}>
                    <audio controls src={melRes.audio_url} />
                  </div>
                )}
              </>
            )}

            <div className={styles.divider} />

            {/* Vocals */}
            <div className={styles.row}>
              <div className={styles.cardTitle}>AI Vocals</div>
              <span className={styles.hint}>Chain styles</span>
            </div>

            <div className={styles.row} style={{ marginTop: 10 }}>
              <label className={styles.label}>Style</label>
              <select value={vocalStyle} onChange={(e) => setVocalStyle(e.target.value as VocalStyle)} className={styles.select}>
                <option value="clean">Clean</option>
                <option value="rap">Rap</option>
                <option value="melodic">Melodic</option>
                <option value="aggressive">Aggressive</option>
              </select>

              <label className={styles.label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={vocalWholeTrack} onChange={(e) => setVocalWholeTrack(e.target.checked)} />
                Whole track
              </label>

              <button className={`${styles.btn} ${styles.btnGreen}`} onClick={applyVocals} disabled={vocalsBusy || !file || (!vocalWholeTrack && !selection)}>
                {vocalsBusy ? 'Processing…' : 'Apply Vocal Chain'}
              </button>
            </div>

            <div className={styles.divider} />

            {/* Mastering */}
            <div className={styles.row}>
              <div className={styles.cardTitle}>AI Mastering</div>
              <span className={styles.hint}>Preset-based mastering</span>
            </div>

            <div className={styles.row} style={{ marginTop: 10 }}>
              <label className={styles.label}>Preset</label>
              <select value={masterPreset} onChange={(e) => setMasterPreset(e.target.value as MasterPreset)} className={styles.select}>
                <option value="streaming">Streaming</option>
                <option value="loud">Loud</option>
                <option value="club">Club</option>
              </select>

              <label className={styles.label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={masterWholeTrack} onChange={(e) => setMasterWholeTrack(e.target.checked)} />
                Whole track
              </label>

              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={applyMastering} disabled={mastering || !file || (!masterWholeTrack && !selection)}>
                {mastering ? 'Mastering…' : 'Apply Mastering'}
              </button>
            </div>

            <div className={styles.divider} />

            {/* Reference Matching */}
            <div className={styles.row}>
              <div className={styles.cardTitle}>Reference Matching</div>
              <span className={styles.hint}>A/B match loudness + tone (safe MVP)</span>
            </div>

            <div style={{ marginTop: 10 }}>
              <ReferenceMatchUI />
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className={styles.card} style={{ marginTop: 14 }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>History</div>
            <span className={styles.hint}>Tap to reuse</span>
          </div>
          <div className={styles.cardBody}>
            <div style={{ display: 'grid', gap: 8 }}>
              {history.map((h) => (
                <button
                  key={h.time}
                  className={styles.btn}
                  onClick={() => {
                    setCommand(h.text)
                    setStrength(h.strength)
                  }}
                  style={{ justifyContent: 'space-between' }}
                >
                  <span>{h.text}</span>
                  <span className={styles.badge}>Strength: {h.strength}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
