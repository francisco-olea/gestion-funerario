'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { FuneralService, PhotoEntry } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, ImageIcon, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PanelProps {
  services: FuneralService[]
  entries: PhotoEntry[]
}

type PanelFilter = 'total' | 'active' | 'finished' | 'photos'

function formatDate(str: string) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

function isInMonth(dateStr: string, month: number, year: number) {
  if (!dateStr) return false
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return false
  return date.getMonth() === month && date.getFullYear() === year
}

export default function Panel({ services, entries }: PanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<PanelFilter>('total')

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthLabel = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(now)

  const servicesThisMonth = services.filter((s) => isInMonth(s.creadoEn, currentMonth, currentYear))
  const activeThisMonth = servicesThisMonth.filter((s) => s.status === 'activo')
  const finishedThisMonth = servicesThisMonth.filter((s) => s.status === 'finalizado')
  const photosThisMonth = entries
    .filter((e) => isInMonth(e.creadoEn, currentMonth, currentYear))
    .reduce((acc, e) => acc + e.fotos.length, 0)

  const active = services.filter((s) => s.status === 'activo')
  const recent = services.filter((s) => s.status === 'finalizado').slice(-3).reverse()

  const servicesWithPhotosThisMonth = useMemo(() => {
    const serviceIds = new Set(
      entries
        .filter((e) => isInMonth(e.creadoEn, currentMonth, currentYear) && e.fotos.length > 0)
        .map((e) => e.serviceId)
    )
    return services.filter((s) => serviceIds.has(s.id))
  }, [entries, services, currentMonth, currentYear])

  const filteredServices = useMemo(() => {
    if (selectedFilter === 'total') return servicesThisMonth
    if (selectedFilter === 'active') return activeThisMonth
    if (selectedFilter === 'finished') return finishedThisMonth
    return servicesWithPhotosThisMonth
  }, [
    selectedFilter,
    servicesThisMonth,
    activeThisMonth,
    finishedThisMonth,
    servicesWithPhotosThisMonth,
  ])

  const filterTitles: Record<PanelFilter, string> = {
    total: `Servicios totales de ${monthLabel}`,
    active: `Servicios activos de ${monthLabel}`,
    finished: `Servicios terminados de ${monthLabel}`,
    photos: `Servicios con fotografías en ${monthLabel}`,
  }

  const filterEmptyMessages: Record<PanelFilter, string> = {
    total: `No hay servicios registrados en ${monthLabel}.`,
    active: `No hay servicios activos en ${monthLabel}.`,
    finished: `No hay servicios terminados en ${monthLabel}.`,
    photos: `No hay servicios con fotografías recibidas en ${monthLabel}.`,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen mensual de servicios funerarios ({monthLabel})
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => setSelectedFilter('total')}
          className="text-left"
          aria-pressed={selectedFilter === 'total'}
        >
          <Card className={cn('transition-colors hover:border-primary/60', selectedFilter === 'total' && 'border-primary')}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{servicesThisMonth.length}</p>
                <p className="text-xs text-muted-foreground">Servicios totales de {monthLabel}</p>
              </div>
            </CardContent>
          </Card>
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('active')}
          className="text-left"
          aria-pressed={selectedFilter === 'active'}
        >
          <Card className={cn('transition-colors hover:border-primary/60', selectedFilter === 'active' && 'border-primary')}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500/10 text-green-600 shrink-0">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeThisMonth.length}</p>
                <p className="text-xs text-muted-foreground">Servicios activos de {monthLabel}</p>
              </div>
            </CardContent>
          </Card>
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('finished')}
          className="text-left"
          aria-pressed={selectedFilter === 'finished'}
        >
          <Card className={cn('transition-colors hover:border-primary/60', selectedFilter === 'finished' && 'border-primary')}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{finishedThisMonth.length}</p>
                <p className="text-xs text-muted-foreground">Servicios terminados de {monthLabel}</p>
              </div>
            </CardContent>
          </Card>
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter('photos')}
          className="text-left"
          aria-pressed={selectedFilter === 'photos'}
        >
          <Card className={cn('transition-colors hover:border-primary/60', selectedFilter === 'photos' && 'border-primary')}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-accent-foreground shrink-0">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{photosThisMonth}</p>
                <p className="text-xs text-muted-foreground">Fotografías recibidas en {monthLabel}</p>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Filtered services */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">{filterTitles[selectedFilter]}</h2>
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {filterEmptyMessages[selectedFilter]}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredServices.map((s) => (
              <ServiceCard key={s.id} service={s} entries={entries} />
            ))}
          </div>
        )}
      </section>

      {/* Active services */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Servicios en curso</h2>
        {active.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              No hay servicios activos en este momento.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {active.map((s) => (
              <ServiceCard key={s.id} service={s} entries={entries} />
            ))}
          </div>
        )}
      </section>

      {/* Recent finished */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">Servicios recientes finalizados</h2>
          <div className="flex flex-col gap-3">
            {recent.map((s) => (
              <ServiceCard key={s.id} service={s} entries={entries} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ServiceCard({ service, entries }: { service: FuneralService; entries: PhotoEntry[] }) {
  const serviceEntries = entries.filter((e) => e.serviceId === service.id)
  const photoCount = serviceEntries.reduce((acc, e) => acc + e.fotos.length, 0)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          {/* Photo */}
          <div className="relative w-20 shrink-0 bg-muted">
            {service.imagenDifunto ? (
              <Image
                src={service.imagenDifunto}
                alt={`Fotografía de ${service.nombreDifunto}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Users className="h-8 w-8 opacity-30" />
              </div>
            )}
          </div>
          {/* Info */}
          <div className="flex flex-1 flex-col justify-between gap-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground leading-tight">{service.nombreDifunto}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(service.fechaNacimiento)} — {formatDate(service.fechaDefuncion)}
                </p>
              </div>
              <Badge
                variant={service.status === 'activo' ? 'default' : 'secondary'}
                className="shrink-0 capitalize"
              >
                {service.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Velorio: {formatDate(service.fechaVelorio)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.horaVelorio}
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {photoCount} foto{photoCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
