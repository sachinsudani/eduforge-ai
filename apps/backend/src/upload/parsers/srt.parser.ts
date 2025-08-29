import { parseTimeToMs } from './time.util'

export type SubtitleChunkInput = { text: string; startMs: number; endMs: number }

export function parseSrt(input: string): SubtitleChunkInput[] {
    const lines = input.replace(/\r/g, '').split('\n')
    const chunks: SubtitleChunkInput[] = []
    let i = 0
    while (i < lines.length) {
        // skip index line (number)
        if (/^\d+$/.test(lines[i].trim())) i++
        // time line
        const timeLine = lines[i++] || ''
        const tm = timeLine.match(/(\d{2}:\d{2}:\d{2}[\.,]\d{1,3})\s+-->\s+(\d{2}:\d{2}:\d{2}[\.,]\d{1,3})/)
        if (!tm) continue
        const startMs = parseTimeToMs(tm[1])
        const endMs = parseTimeToMs(tm[2])
        const texts: string[] = []
        while (i < lines.length && lines[i].trim() !== '') {
            texts.push(lines[i++])
        }
        // skip blank separator
        while (i < lines.length && lines[i].trim() === '') i++
        const text = texts.join(' ').trim()
        if (text) chunks.push({ text, startMs, endMs })
    }
    return chunks
}
