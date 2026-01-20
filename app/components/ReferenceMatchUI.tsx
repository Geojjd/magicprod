'use client'

import { useMemo, useState, useEffect } from 'react'
import axios from 'axios'

type RefAnalyze = {
  mix: {
    rms_dbfs: number
    peak_dbfs: number
    low_dbfs: number
    mid_dbfs: number
    sub_dbfs: number
    duration_s: number
  }
  reference: {
    rms_dbfs: number
    peak_dbfs: number
    low_dbfs: number
    mid_dbfs: number
    sub_dbfs: number
    duration_s: number
  }
  suggestions: {
    gain_db: number
    low_shelf_db: number
    low_shelf_freq_hz: number
    highpass_hz: number
    notes: string[]
  }
}

export default function ReferenceMatchUI() {
  const [mixFile, setMixFile] = useState<File | null>(null)
  const [refFile, setRefFile] = useState<File | null>(null)

  const [strength, setStrength] = useState<number>(60)

  const [analyzing, setAnalyzing] = useState(false)
  const [applying, setApplying] = useState(false)

  const [analysis, setAnalysis] = useState<RefAnalyze | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)

  // Local preview URLs
  const mixPreview = useMemo(() => (mixFile ? URL.createObjectURL(mixFile) : null), [mixFile])
  const refPreview = useMemo(() => (refFile ? URL.createObjectURL(refFile) : null), [refFile])

  useEffect(() => {
    return () => {
      if (mixPreview) URL.revokeObjectURL(mixPreview)
      if (refPreview) URL.revokeObjectURL(refPreview)
    }
  }, [mixPreview, refPreview])

  const analyze = async () => {
    if (!mixFile || !refFile) {
      alert('Upload BOTH: your mix and a reference track.')
      return
    }

    setAnalyzing(true)
    setAnalysis(null)
    setOutputUrl(null)

    try {
      const fd = new FormData()
      fd.append('mix_file', mixFile)
      fd.append('ref_file', refFile)

      const res = await axios.post('http://127.0.0.1:8000/ai-reference-analyze', fd, {
        responseType: 'json',
      })

      setAnalysis(res.data)
    } catch (err) {
      console.error(err)
      alert('Reference analysis failed. Check backend terminal.')
    } finally {
      setAnalyzing(false)
    }
  }

  const apply = async () => {
    if (!mixFile || !refFile) {
      alert('Upload BOTH: your mix and a reference track.')
      return
    }

    setApplying(true)
    setOutputUrl(null)

    try {
      const fd = new FormData()
      fd.append('mix_file', mixFile)
      fd.append('ref_file', refFile)
      fd.append('strength', String(strength))

      const res = await axios.post('http://127.0.0.1:8000/ai-reference-apply', fd, {
        responseType: 'json',
      })

      setOutputUrl(res.data.output_url)
    } catch (err) {
      console.error(err)
      alert('Reference apply failed. Check backend terminal.')
    } finally {
      setApplying(false)
    }
  }

  const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : '—')

  return (
    <section style={{ marginTop: 16, padding: 12, border: '1px solid #333', borderRadius: 10 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Reference Matching</h2>

      <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
        {/* Uploads */}
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Your Mix</div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                setMixFile(e.target.files?.[0] ?? null)
                setAnalysis(null)
                setOutputUrl(null)
              }}
            />
            {mixPreview && (
              <audio controls src={mixPreview} style={{ marginTop: 8, width: '100%' }} />
            )}
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Reference Track</div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                setRefFile(e.target.files?.[0] ?? null)
                setAnalysis(null)
                setOutputUrl(null)
              }}
            />
            {refPreview && (
              <audio controls src={refPreview} style={{ marginTop: 8, width: '100%' }} />
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={analyze}
            disabled={!mixFile || !refFile || analyzing}
            style={{ padding: '10px 14px' }}
          >
            {analyzing ? 'Analyzing…' : 'Analyze'}
          </button>

          <button
            onClick={apply}
            disabled={!mixFile || !refFile || applying}
            style={{ padding: '10px 14px' }}
          >
            {applying ? 'Applying…' : 'Apply Match'}
          </button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Strength:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              style={{ width: 220 }}
            />
            <span style={{ fontSize: 12, opacity: 0.8 }}>{strength}%</span>
          </div>
        </div>

        {/* Analysis results */}
        {analysis && (
          <div style={{ padding: 12, border: '1px solid #222', borderRadius: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Analysis</h3>

            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Mix vs Reference (dBFS)</div>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.75 }} />
                <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 700 }}>Mix</div>
                <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 700 }}>Reference</div>

                <div style={{ fontSize: 12, opacity: 0.75 }}>RMS</div>
                <div style={{ fontSize: 12 }}>{fmt(analysis.mix.rms_dbfs)}</div>
                <div style={{ fontSize: 12 }}>{fmt(analysis.reference.rms_dbfs)}</div>

                <div style={{ fontSize: 12, opacity: 0.75 }}>Peak</div>
                <div style={{ fontSize: 12 }}>{fmt(analysis.mix.peak_dbfs)}</div>
                <div style={{ fontSize: 12 }}>{fmt(analysis.reference.peak_dbfs)}</div>

                <div style={{ fontSize: 12, opacity: 0.75 }}>Sub (20–60)</div>
                <div style={{ fontSize: 12 }}>{fmt(analysis.mix.sub_dbfs)}</div>
                <div style={{ fontSize: 12 }}>{fmt(analysis.reference.sub_dbfs)}</div>

                <div style={{ fontSize: 12, opacity: 0.75 }}>Low (20–180)</div>
                <div style={{ fontSize: 12 }}>{fmt(analysis.mix.low_dbfs)}</div>
                <div style={{ fontSize: 12 }}>{fmt(analysis.reference.low_dbfs)}</div>

                <div style={{ fontSize: 12, opacity: 0.75 }}>Mid (180–2000)</div>
                <div style={{ fontSize: 12 }}>{fmt(analysis.mix.mid_dbfs)}</div>
                <div style={{ fontSize: 12 }}>{fmt(analysis.reference.mid_dbfs)}</div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>Suggested moves</div>
                <div style={{ marginTop: 6, fontSize: 12 }}>
                  Gain match: <b>{fmt(analysis.suggestions.gain_db)} dB</b>
                </div>
                <div style={{ marginTop: 2, fontSize: 12 }}>
                  Low shelf: <b>{fmt(analysis.suggestions.low_shelf_db)} dB</b> @{' '}
                  <b>{analysis.suggestions.low_shelf_freq_hz} Hz</b>
                </div>
                <div style={{ marginTop: 2, fontSize: 12 }}>
                  Highpass: <b>{analysis.suggestions.highpass_hz || 0} Hz</b>
                </div>

                {analysis.suggestions.notes?.length > 0 && (
                  <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18, fontSize: 12, opacity: 0.8 }}>
                    {analysis.suggestions.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Output */}
        {outputUrl && (
          <div style={{ padding: 12, border: '1px solid #222', borderRadius: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Matched Output</h3>
            <audio controls src={outputUrl} style={{ marginTop: 10, width: '100%' }} />
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>{outputUrl}</div>
          </div>
        )}
      </div>
    </section>
  )
}
