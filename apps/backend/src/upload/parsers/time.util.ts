export function parseTimeToMs(time: string): number {
    // supports 00:00:12.345 or 00:00:12,345 or 00:00:12
    const m = time.trim().match(/^(\d{2}):(\d{2}):(\d{2})([\.,](\d{1,3}))?$/)
    if (!m) return 0
    const hh = parseInt(m[1], 10)
    const mm = parseInt(m[2], 10)
    const ss = parseInt(m[3], 10)
    const ms = m[5] ? parseInt(m[5].padEnd(3, '0'), 10) : 0
    return ((hh * 60 + mm) * 60 + ss) * 1000 + ms
}
