export const WEEKDAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

export function minuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function formatTime(iso: string | null): string {
  if (!iso) return '--:--'
  const date = new Date(iso)
  return date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
}

export function formatWeekdayTime(date: Date): string {
  return `${WEEKDAY_NAMES[date.getDay()]}, ${date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })} Uhr`
}

/** Parst die ISO-Dauer der API ("00d00:48m") in ein lesbares "48 Min." / "1 Std. 20 Min." */
export function formatDuration(apiDuration: string): string {
  const match = /(\d+)d(\d+):(\d+)m/.exec(apiDuration)
  if (!match) return apiDuration
  const days = Number(match[1])
  const hours = Number(match[2]) + days * 24
  const minutes = Number(match[3])
  if (hours === 0) return `${minutes} Min.`
  if (minutes === 0) return `${hours} Std.`
  return `${hours} Std. ${minutes} Min.`
}
