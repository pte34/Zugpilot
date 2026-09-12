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

/** "20 Min." / "1 Std." / "1 Std. 20 Min." aus einer Gesamtminutenzahl. */
export function formatMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes))
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} Min.`
  if (mins === 0) return `${hours} Std.`
  return `${hours} Std. ${mins} Min.`
}

/** Parst die Dauer der API ("00d00:20:00" = Tage/Std./Min./Sek.) in ein lesbares "20 Min." / "1 Std. 20 Min." */
export function formatDuration(apiDuration: string): string {
  const match = /^(\d+)d(\d{2}):(\d{2}):(\d{2})$/.exec(apiDuration)
  if (!match) return apiDuration
  const days = Number(match[1])
  const hours = Number(match[2]) + days * 24
  const minutes = Number(match[3])
  return formatMinutes(hours * 60 + minutes)
}
