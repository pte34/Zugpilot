import type { ApiSection, ApiStop } from '../types'

export type LiveStatus =
  | { kind: 'not-started' }
  | { kind: 'in-transit'; step: ApiSection; percent: number; remainingMinutes: number }
  | { kind: 'waiting'; stationName: string; nextStep: ApiSection; waitMinutes: number }
  | { kind: 'arrived' }

/**
 * Die API liefert keine echte GPS-Position des Zuges. Als ehrliche
 * Annaeherung schaetzen wir die Position anhand der (Echtzeit-)Fahrzeiten:
 * auf welcher Etappe befindet sich die Verbindung gerade, und wie weit ist
 * diese Etappe zeitlich schon fortgeschritten.
 */
function effectiveTime(stop: ApiStop, field: 'departure' | 'arrival'): Date | null {
  const prognosisIso = field === 'departure' ? stop.prognosis?.departure : stop.prognosis?.arrival
  const scheduledIso = field === 'departure' ? stop.departure : stop.arrival
  const iso = prognosisIso ?? scheduledIso
  return iso ? new Date(iso) : null
}

export function getLiveStatus(steps: ApiSection[], now: Date): LiveStatus {
  if (steps.length === 0) return { kind: 'not-started' }

  const firstDeparture = effectiveTime(steps[0].departure, 'departure')
  const lastArrival = effectiveTime(steps[steps.length - 1].arrival, 'arrival')
  if (firstDeparture && now < firstDeparture) return { kind: 'not-started' }
  if (lastArrival && now > lastArrival) return { kind: 'arrived' }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const dep = effectiveTime(step.departure, 'departure')
    const arr = effectiveTime(step.arrival, 'arrival')
    if (!dep || !arr) continue

    if (now >= dep && now <= arr) {
      const totalMs = arr.getTime() - dep.getTime()
      const percent = totalMs > 0 ? Math.min(100, Math.max(0, ((now.getTime() - dep.getTime()) / totalMs) * 100)) : 100
      const remainingMinutes = Math.max(0, (arr.getTime() - now.getTime()) / 60_000)
      return { kind: 'in-transit', step, percent, remainingMinutes }
    }

    const nextStep = steps[i + 1]
    if (nextStep && now > arr) {
      const nextDep = effectiveTime(nextStep.departure, 'departure')
      if (nextDep && now < nextDep) {
        const waitMinutes = Math.max(0, (nextDep.getTime() - now.getTime()) / 60_000)
        return { kind: 'waiting', stationName: step.arrival.station.name ?? '', nextStep, waitMinutes }
      }
    }
  }

  return { kind: 'not-started' }
}
