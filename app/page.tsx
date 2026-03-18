'use client'

import { useState, useEffect, useCallback } from 'react'
import LoginPage from '@/components/login-page'
import LoadingScreen from '@/components/loading-screen'
import Sidebar, { NavSection } from '@/components/sidebar'
import Panel from '@/components/panel'
import Servicios from '@/components/servicios'
import Entradas from '@/components/entradas'
import Condolencias from '@/components/condolencias'
import Presentaciones from '@/components/presentaciones'
import { CondolenceEntry, FuneralService, PhotoEntry } from '@/lib/types'
import {
  getCondolences,
  getEntries,
  getServices,
  saveCondolences,
  saveEntries,
  saveServices,
} from '@/lib/storage'

type AppState = 'login' | 'loading' | 'app'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('login')
  const [activeSection, setActiveSection] = useState<NavSection>('panel')
  const [services, setServices] = useState<FuneralService[]>([])
  const [entries, setEntries] = useState<PhotoEntry[]>([])
  const [condolences, setCondolences] = useState<CondolenceEntry[]>([])

  // Load from storage on mount
  useEffect(() => {
    setServices(getServices())
    setEntries(getEntries())
    setCondolences(getCondolences())
  }, [])

  function handleLogin() {
    setAppState('loading')
  }

  const handleLoadingDone = useCallback(() => {
    setAppState('app')
  }, [])

  function handleLogout() {
    setAppState('login')
    setActiveSection('panel')
  }

  function addService(s: FuneralService) {
    const updated = [s, ...services]
    setServices(updated)
    saveServices(updated)
  }

  function deleteService(id: string) {
    const updated = services.filter((s) => s.id !== id)
    setServices(updated)
    saveServices(updated)
    // Also remove entries for this service
    const updatedEntries = entries.filter((e) => e.serviceId !== id)
    setEntries(updatedEntries)
    saveEntries(updatedEntries)
    const updatedCondolences = condolences.filter((c) => c.serviceId !== id)
    setCondolences(updatedCondolences)
    saveCondolences(updatedCondolences)
  }

  function toggleServiceStatus(id: string) {
    const updated = services.map((s) =>
      s.id === id
        ? { ...s, status: s.status === 'activo' ? 'finalizado' : ('activo' as const) }
        : s
    )
    setServices(updated)
    saveServices(updated)
  }

  function updateService(updatedService: FuneralService) {
    const updated = services.map((s) => (s.id === updatedService.id ? updatedService : s))
    setServices(updated)
    saveServices(updated)
  }

  function addEntry(entry: PhotoEntry) {
    const updated = [entry, ...entries]
    setEntries(updated)
    saveEntries(updated)
  }

  function deleteEntry(entryId: string) {
    const updated = entries.filter((e) => e.id !== entryId)
    setEntries(updated)
    saveEntries(updated)
  }

  function updateEntry(updatedEntry: PhotoEntry) {
    const updated = entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    setEntries(updated)
    saveEntries(updated)
  }

  function addCondolence(entry: CondolenceEntry) {
    const updated = [entry, ...condolences]
    setCondolences(updated)
    saveCondolences(updated)
  }

  function deleteCondolence(entryId: string) {
    const updated = condolences.filter((e) => e.id !== entryId)
    setCondolences(updated)
    saveCondolences(updated)
  }

  function updateCondolence(updatedEntry: CondolenceEntry) {
    const updated = condolences.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    setCondolences(updated)
    saveCondolences(updated)
  }

  if (appState === 'login') {
    return <LoginPage onLogin={handleLogin} />
  }

  if (appState === 'loading') {
    return <LoadingScreen onDone={handleLoadingDone} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        active={activeSection}
        onNavigate={setActiveSection}
        onLogout={handleLogout}
      />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="w-full p-4 sm:p-6 lg:p-8">
          {activeSection === 'panel' && (
            <Panel services={services} entries={entries} />
          )}
          {activeSection === 'servicios' && (
            <Servicios
              services={services}
              onAdd={addService}
              onDelete={deleteService}
              onToggleStatus={toggleServiceStatus}
              onUpdate={updateService}
            />
          )}
          {activeSection === 'entradas' && (
            <Entradas
              services={services}
              entries={entries}
              onAdd={addEntry}
              onDeleteEntry={deleteEntry}
              onUpdateEntry={updateEntry}
            />
          )}
          {activeSection === 'condolencias' && (
            <Condolencias
              services={services}
              condolences={condolences}
              onAdd={addCondolence}
              onDelete={deleteCondolence}
              onUpdate={updateCondolence}
            />
          )}
          {activeSection === 'presentaciones' && (
            <Presentaciones services={services} entries={entries} />
          )}
        </div>
      </main>
    </div>
  )
}
