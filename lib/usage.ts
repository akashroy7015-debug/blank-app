// Free tier usage tracking via localStorage
const KEY = 'flirtiq_usage'

interface UsageData {
  date: string  // YYYY-MM-DD
  count: number
}

export function getTodayUsage(): number {
  if (typeof window === 'undefined') return 0
  const today = new Date().toISOString().split('T')[0]
  const raw = localStorage.getItem(KEY)
  if (!raw) return 0
  try {
    const data: UsageData = JSON.parse(raw)
    if (data.date !== today) return 0
    return data.count
  } catch {
    return 0
  }
}

export function incrementUsage(): void {
  const today = new Date().toISOString().split('T')[0]
  const current = getTodayUsage()
  localStorage.setItem(KEY, JSON.stringify({ date: today, count: current + 1 }))
}

export const FREE_LIMIT = 3

export function canUseFreeTier(): boolean {
  return getTodayUsage() < FREE_LIMIT
}
