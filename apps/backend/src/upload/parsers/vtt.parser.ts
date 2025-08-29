import { parseTimeToMs } from './time.util'
import { SubtitleChunkInput } from './srt.parser'

export function parseVtt(input: string): SubtitleChunkInput[] {
    const lines = input.replace(/\r/g, '').split('\n')
    const chunks: SubtitleChunkInput[] = []
    let i = 0
    // skip WEBVTT header if present
    if (lines[i] && lines[i].toUpperCase().startsWith('WEBVTT')) {
        while (i < lines.length && lines[i].trim() !== '') i++
        while (i < lines.length && lines[i].trim() === '') i++
    }
    while (i < lines.length) {
        // optional cue id
        if (lines[i] && !lines[i].includes('-->')) i++
        const timeLine = lines[i++] || ''
        const tm = timeLine.match(/(\d{2}:\d{2}:\d{2}[\.,]\d{1,3})\s+-->\s+(\d{2}:\d{2}:\d{2}[\.,]\d{1,3})/)
        if (!tm) continue
        const startMs = parseTimeToMs(tm[1])
        const endMs = parseTimeToMs(tm[2])
        const texts: string[] = []
        while (i < lines.length && lines[i].trim() !== '') {
            texts.push(lines[i++])
        }
        while (i < lines.length && lines[i].trim() === '') i++
        const text = texts.join(' ').trim()
        if (text) chunks.push({ text, startMs, endMs })
    }
    return chunks
}
