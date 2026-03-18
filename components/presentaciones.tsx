'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { FuneralService, PhotoEntry } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  CalendarDays,
  Clock,
  Download,
  PlaySquare,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'

interface PresentacionesProps {
  services: FuneralService[]
  entries: PhotoEntry[]
}

function formatDate(str: string) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

function getDateFilterKey(dateStr: string) {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function Presentaciones({ services, entries }: PresentacionesProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')
  const filteredServices = selectedDate
    ? services.filter((s) => getDateFilterKey(s.creadoEn) === selectedDate)
    : []
  const service = filteredServices.find((s) => s.id === selectedId) ?? null

  function handleDateChange(value: string) {
    setSelectedDate(value)
    setSelectedId('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Presentaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Información del servicio y compilación de fotografías
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-64">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            aria-label="Filtrar servicios por fecha de registro"
          />
        </div>
        <Select value={selectedId} onValueChange={setSelectedId} disabled={!selectedDate || filteredServices.length === 0}>
          <SelectTrigger className="w-full sm:w-80 md:w-96">
            <SelectValue placeholder={selectedDate ? 'Seleccionar servicio...' : 'Primero elige una fecha'} />
          </SelectTrigger>
          <SelectContent>
            {filteredServices.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nombreDifunto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!service ? (
        <Card>
          <CardContent className="py-16 text-center">
            <PlaySquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {services.length === 0
                ? 'No hay servicios disponibles aún.'
                : !selectedDate
                  ? 'Selecciona una fecha para listar los servicios registrados.'
                  : filteredServices.length === 0
                    ? 'No hay servicios registrados en esa fecha.'
                    : 'Selecciona un servicio para ver su presentación.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ServicePresentation service={service} entries={entries} />
      )}
    </div>
  )
}

function ServicePresentation({
  service,
  entries,
}: {
  service: FuneralService
  entries: PhotoEntry[]
}) {
  const serviceEntries = entries.filter((e) => e.serviceId === service.id)
  const allPhotos = serviceEntries.flatMap((e) => e.fotos)

  return (
    <div className="flex flex-col gap-6">
      {/* Service info card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="font-serif text-xl">
              {service.nombreDifunto}
            </CardTitle>
            <Badge
              variant={service.status === 'activo' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {service.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            {service.imagenDifunto && (
              <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={service.imagenDifunto}
                  alt={`Fotografía de ${service.nombreDifunto}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Nacimiento</p>
                <p className="font-medium text-foreground">{formatDate(service.fechaNacimiento)}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Defunción</p>
                <p className="font-medium text-foreground">{formatDate(service.fechaDefuncion)}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Velorio</p>
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(service.fechaVelorio)}
                  <Clock className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                  {service.horaVelorio}
                </p>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {serviceEntries.length} entrada{serviceEntries.length !== 1 ? 's' : ''} —{' '}
                {allPhotos.length} fotografía{allPhotos.length !== 1 ? 's' : ''} recibidas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slideshow */}
      {allPhotos.length > 0 ? (
        <Slideshow photos={allPhotos} name={service.nombreDifunto} />
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Este servicio aún no tiene fotografías de familiares.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Slideshow({ photos, name }: { photos: string[]; name: string }) {
  const [current, setCurrent] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isRenderingVideo, setIsRenderingVideo] = useState(false)
  const [downloadMessage, setDownloadMessage] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const SLIDE_MS = 3000
  const TRANSITION_MS = 650

  function startTransition(nextIndex: number) {
    if (nextIndex === current) return
    setPrevious(current)
    setCurrent(nextIndex)
    setIsTransitioning(true)
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false)
      setPrevious(null)
    }, TRANSITION_MS)
  }

  function next() {
    startTransition((current + 1) % photos.length)
  }

  function prev() {
    startTransition((current - 1 + photos.length) % photos.length)
  }

  function reset() {
    setCurrent(0)
    setPrevious(null)
    setIsTransitioning(false)
    setPlaying(false)
  }

  async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  function drawContainedImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    width: number,
    height: number,
    alpha: number
  ) {
    const imageRatio = img.width / img.height
    const frameRatio = width / height
    let drawWidth = width
    let drawHeight = height
    let x = 0
    let y = 0

    if (imageRatio > frameRatio) {
      drawWidth = width
      drawHeight = width / imageRatio
      y = (height - drawHeight) / 2
    } else {
      drawHeight = height
      drawWidth = height * imageRatio
      x = (width - drawWidth) / 2
    }

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.drawImage(img, x, y, drawWidth, drawHeight)
    ctx.restore()
  }

  function findMp4MimeType() {
    const candidates = ['video/mp4;codecs=h264', 'video/mp4;codecs=avc1', 'video/mp4']
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) return type
    }
    return ''
  }

  async function handleDownloadVideo() {
    if (isRenderingVideo || photos.length === 0) return
    setDownloadMessage('')

    const mp4MimeType = findMp4MimeType()
    if (!mp4MimeType) {
      setDownloadMessage('Tu navegador no soporta exportación directa a MP4.')
      return
    }

    setIsRenderingVideo(true)

    try {
      const images = await Promise.all(photos.map(loadImage))
      const canvas = document.createElement('canvas')
      const width = 1280
      const height = 720
      const fps = 30
      const frameMs = 1000 / fps
      const stillMs = 2400
      const transitionMs = 700

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setDownloadMessage('No se pudo crear el render de video.')
        return
      }

      const stream = canvas.captureStream(fps)
      const recorder = new MediaRecorder(stream, { mimeType: mp4MimeType })
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }

      const stopped = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve()
      })

      recorder.start()

      const segmentMs = stillMs + transitionMs
      const totalMs = photos.length === 1
        ? stillMs
        : segmentMs * (photos.length - 1) + stillMs

      for (let t = 0; t <= totalMs; t += frameMs) {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, width, height)

        if (photos.length === 1) {
          drawContainedImage(ctx, images[0], width, height, 1)
        } else {
          let segmentIndex = Math.floor(t / segmentMs)
          if (segmentIndex >= photos.length - 1) segmentIndex = photos.length - 1

          if (segmentIndex === photos.length - 1) {
            drawContainedImage(ctx, images[segmentIndex], width, height, 1)
          } else {
            const localTime = t - segmentIndex * segmentMs
            if (localTime <= stillMs) {
              drawContainedImage(ctx, images[segmentIndex], width, height, 1)
            } else {
              const progress = Math.min((localTime - stillMs) / transitionMs, 1)
              drawContainedImage(ctx, images[segmentIndex], width, height, 1 - progress)
              drawContainedImage(ctx, images[segmentIndex + 1], width, height, progress)
            }
          }
        }

        await new Promise((resolve) => setTimeout(resolve, frameMs))
      }

      recorder.stop()
      await stopped

      const blob = new Blob(chunks, { type: mp4MimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const safeName = name.trim().replace(/\s+/g, '-').toLowerCase() || 'presentacion'
      a.href = url
      a.download = `presentacion-${safeName}.mp4`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setDownloadMessage('Video MP4 generado correctamente.')
    } catch {
      setDownloadMessage('No se pudo generar el video MP4. Inténtalo de nuevo.')
    } finally {
      setIsRenderingVideo(false)
    }
  }

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(next, SLIDE_MS)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, photos.length, current])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
    }
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-base flex items-center gap-2">
          <PlaySquare className="h-4 w-4 text-primary" />
          Video compilación — {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Main photo display */}
        <div className="relative w-full aspect-[4/3] bg-muted rounded-xl overflow-hidden shadow-md">
          {previous !== null && (
            <Image
              src={photos[previous]}
              alt={`Fotografía ${previous + 1} de ${photos.length}`}
              fill
              className={`object-contain ${isTransitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700`}
            />
          )}
          <Image
            src={photos[current]}
            alt={`Fotografía ${current + 1} de ${photos.length}`}
            fill
            className={`${isTransitioning ? 'opacity-100' : 'opacity-100'} object-contain transition-opacity duration-700`}
          />
          {/* Overlay info */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
            {current + 1} / {photos.length}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="flex w-full gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setPlaying(false) }}
              className={`relative h-14 w-14 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                i === current ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`Ver fotografía ${i + 1}`}
            >
              <Image src={p} alt={`Miniatura ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="icon" onClick={prev} aria-label="Foto anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={playing ? 'outline' : 'default'}
            size="sm"
            className="gap-2 px-5"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? (
              <>
                <Pause className="h-4 w-4" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Reproducir
              </>
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={next} aria-label="Foto siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={reset} aria-label="Reiniciar">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={handleDownloadVideo}
            disabled={isRenderingVideo}
          >
            <Download className="h-4 w-4" />
            {isRenderingVideo ? 'Generando Video...' : 'Descargar Video'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Las fotos cambian automáticamente cada 3 segundos al reproducir.
        </p>
        {downloadMessage && (
          <p className="text-xs text-muted-foreground">{downloadMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}
