'use client'

import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'

export type WaveApi = {
  playPause: () => void
  stop: () => void
  playSelection: () => void
  setRegion: (start: number, end: number) => void
}

type Props = {
  file: File | null
  beatTimes?: number[]
  lockBars?: number
  bpm?: number
  onRegionChange?: (start: number, end: number) => void
  onReady?: (api: WaveApi) => void
}

const snapToBeat = (t: number, beats: number[]) => {
  if (!beats || beats.length === 0) return t
  let best = beats[0]
  let bestDist = Math.abs(beats[0] - t)
  for (const b of beats) {
    const d = Math.abs(b - t)
    if (d < bestDist) {
      bestDist = d
      best = b
    }
  }
  return best
}

const barsToSeconds = (bars: number, bpm?: number) => {
  if (!bpm || bpm <= 0) return null
  const beatsPerBar = 4
  const secondsPerBeat = 60 / bpm
  return bars * beatsPerBar * secondsPerBeat
}

export default function Waveform({
  file,
  beatTimes = [],
  lockBars,
  bpm,
  onRegionChange,
  onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const regionRef = useRef<any>(null)

  // ✅ keep callbacks stable (prevents effect re-run flicker)
  const onRegionChangeRef = useRef(onRegionChange)
  const onReadyRef = useRef(onReady)

  useEffect(() => {
    onRegionChangeRef.current = onRegionChange
  }, [onRegionChange])

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    if (!file || !containerRef.current) return

    wsRef.current?.destroy()
    wsRef.current = null
    regionRef.current = null

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height: 120,
      waveColor: '#cbd5e1',
      progressColor: '#0f172a',
    })

    const regions = ws.registerPlugin(RegionsPlugin.create())

    wsRef.current = ws
    ws.loadBlob(file)

    ws.once('ready', () => {
      const dur = ws.getDuration() || 0
      const start = 0
      const end = Math.min(3, dur || 3)

      const r = regions.addRegion({
        start,
        end,
        drag: true,
        resize: true,
      })

      regionRef.current = r
      onRegionChangeRef.current?.(r.start, r.end)

      onReadyRef.current?.({
        playPause: () => ws.playPause(),
        stop: () => ws.stop(),
        playSelection: () => {
          const reg = regionRef.current
          if (!reg) return
          ws.play(reg.start, reg.end)
        },
        setRegion: (s: number, e: number) => {
          const reg = regionRef.current
          if (!reg) return
          reg.setOptions({ start: s, end: e })
          onRegionChangeRef.current?.(s, e)
        },
      })
    })

    regions.on('region-updated', (region: any) => {
      regionRef.current = region

      let s = region.start
      let e = region.end

      if (beatTimes.length > 0) {
        s = snapToBeat(s, beatTimes)
        e = snapToBeat(e, beatTimes)
        if (e <= s) e = s + 0.05
      }

      const lockSeconds = lockBars ? barsToSeconds(lockBars, bpm) : null
      if (lockSeconds) e = s + lockSeconds

      const changed =
        Math.abs(s - region.start) > 0.001 || Math.abs(e - region.end) > 0.001
      if (changed) region.setOptions({ start: s, end: e })

      onRegionChangeRef.current?.(s, e)
    })

    return () => {
      ws.destroy()
      wsRef.current = null
      regionRef.current = null
    }
  }, [file, beatTimes, lockBars, bpm]) // ✅ no onReady/onRegionChange here

  return <div ref={containerRef} />
}
