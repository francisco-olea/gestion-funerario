import { CondolenceEntry, FuneralService, PhotoEntry } from './types'

const SERVICES_KEY = 'funeraria_services'
const ENTRIES_KEY = 'funeraria_entries'
const CONDOLENCES_KEY = 'funeraria_condolences'

export function getServices(): FuneralService[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(SERVICES_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveServices(services: FuneralService[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services))
}

export function getEntries(): PhotoEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveEntries(entries: PhotoEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function getCondolences(): CondolenceEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CONDOLENCES_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveCondolences(entries: CondolenceEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CONDOLENCES_KEY, JSON.stringify(entries))
}
