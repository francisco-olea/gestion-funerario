'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { CondolenceEntry, FuneralService } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Download, HeartHandshake, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'

interface CondolenciasProps {
  services: FuneralService[]
  condolences: CondolenceEntry[]
  onAdd: (entry: CondolenceEntry) => void
  onDelete: (entryId: string) => void
  onUpdate: (entry: CondolenceEntry) => void
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getDateFilterKey(dateStr: string) {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeName(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/(^|[\s\-'])([a-záéíóúñü])/g, (_, prefix: string, char: string) => {
      return `${prefix}${char.toUpperCase()}`
    })
}

function normalizeCondolenceText(text: string) {
  const clean = text.trim().toLowerCase().replace(/\s+/g, ' ')
  return clean.replace(/(^|[.!?]\s+)([a-záéíóúñü])/g, (_, prefix: string, char: string) => {
    return `${prefix}${char.toUpperCase()}`
  })
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function Condolencias({
  services,
  condolences,
  onAdd,
  onDelete,
  onUpdate,
}: CondolenciasProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newCondolenceDate, setNewCondolenceDate] = useState('')
  const [selectedServiceForPdf, setSelectedServiceForPdf] = useState('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfMessage, setPdfMessage] = useState('')
  const [form, setForm] = useState({
    serviceId: '',
    nombreFamiliar: '',
    condolencia: '',
  })

  function resetForm() {
    setForm({
      serviceId: '',
      nombreFamiliar: '',
      condolencia: '',
    })
    setNewCondolenceDate('')
  }

  const availableServicesForNewCondolence = newCondolenceDate
    ? services.filter((s) => getDateFilterKey(s.creadoEn) === newCondolenceDate)
    : []

  function handleSubmit() {
    setSaving(true)
    const newEntry: CondolenceEntry = {
      id: crypto.randomUUID(),
      serviceId: form.serviceId,
      nombreFamiliar: form.nombreFamiliar,
      condolencia: form.condolencia,
      fotos: [],
      creadoEn: new Date().toISOString(),
    }
    onAdd(newEntry)
    resetForm()
    setSaving(false)
    setOpen(false)
  }

  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]))
  const servicesWithCondolences = services.filter((s) =>
    condolences.some((entry) => entry.serviceId === s.id)
  )

  async function handleDownloadPdfByService() {
    if (!selectedServiceForPdf || isGeneratingPdf) return

    const service = services.find((s) => s.id === selectedServiceForPdf)
    if (!service) {
      setPdfMessage('Servicio no encontrado para generar el PDF.')
      return
    }

    const byService = condolences
      .filter((entry) => entry.serviceId === selectedServiceForPdf)
      .sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime())

    if (byService.length === 0) {
      setPdfMessage('No hay condolencias para el servicio seleccionado.')
      return
    }

    setIsGeneratingPdf(true)
    setPdfMessage('')

    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      byService.forEach((entry, index) => {
        if (index > 0) doc.addPage()

        const normalizedMessage = normalizeCondolenceText(entry.condolencia)
        const normalizedName = normalizeName(entry.nombreFamiliar)

        // Decorative double frame
        doc.setDrawColor(96, 82, 74)
        doc.setLineWidth(1.6)
        doc.roundedRect(42, 42, pageWidth - 84, pageHeight - 84, 18, 18)
        doc.setDrawColor(186, 170, 158)
        doc.setLineWidth(0.9)
        doc.roundedRect(54, 54, pageWidth - 108, pageHeight - 108, 14, 14)

        doc.setFont('times', 'normal')
        doc.setFontSize(14)
        doc.setTextColor(90, 74, 62)
        doc.text(`Condolencias para ${service.nombreDifunto}`, pageWidth / 2, 86, { align: 'center' })

        doc.setFont('times', 'italic')
        doc.setFontSize(18)
        doc.setTextColor(52, 45, 40)
        const maxTextWidth = pageWidth - 180
        const lines = doc.splitTextToSize(normalizedMessage, maxTextWidth)
        const lineHeight = 28
        const textBlockHeight = lines.length * lineHeight
        const startY = Math.max(170, pageHeight / 2 - textBlockHeight / 2)
        doc.text(lines, pageWidth / 2, startY, { align: 'center', lineHeightFactor: 1.45 })

        const nameY = Math.min(pageHeight - 110, startY + textBlockHeight + 48)
        doc.setFont('times', 'italic')
        doc.setFontSize(16)
        doc.setTextColor(74, 62, 54)
        doc.text(`- ${normalizedName}`, pageWidth / 2, nameY, { align: 'center' })
      })

      const fileService = slugify(service.nombreDifunto) || 'difunto'
      doc.save(`condolencias-${fileService}.pdf`)
      setPdfMessage('PDF generado correctamente.')
    } catch {
      setPdfMessage('No se pudo generar el PDF en este momento.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Condolencias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mensajes y fotografías de condolencia para cada servicio
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[22rem]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={selectedServiceForPdf} onValueChange={setSelectedServiceForPdf}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Seleccionar difunto para PDF" />
              </SelectTrigger>
              <SelectContent>
                {servicesWithCondolences.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nombreDifunto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={handleDownloadPdfByService}
              disabled={!selectedServiceForPdf || isGeneratingPdf}
            >
              <Download className="h-4 w-4" />
              {isGeneratingPdf ? 'Generando PDF...' : 'Descargar PDF'}
            </Button>
          </div>
          {pdfMessage && (
            <p className="text-xs text-muted-foreground">{pdfMessage}</p>
          )}
          <Dialog
            open={open}
            onOpenChange={(v) => {
              if (!v) resetForm()
              setOpen(v)
            }}
          >
            <DialogTrigger asChild>
              <Button disabled={services.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva condolencia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif">Nueva condolencia</DialogTitle>
              </DialogHeader>
              <div className="mt-2 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nueva-condolencia-fecha-servicio">Filtrar servicios por día</Label>
                  <Input
                    id="nueva-condolencia-fecha-servicio"
                    type="date"
                    value={newCondolenceDate}
                    onChange={(e) => {
                      const nextDate = e.target.value
                      setNewCondolenceDate(nextDate)
                      setForm((f) => ({ ...f, serviceId: '' }))
                    }}
                  />
                </div>
              <div className="flex flex-col gap-1.5">
                  <Label>Servicio funerario</Label>
                  <Select
                    value={form.serviceId}
                    onValueChange={(v) => setForm((f) => ({ ...f, serviceId: v }))}
                    disabled={!newCondolenceDate || availableServicesForNewCondolence.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !newCondolenceDate
                            ? 'Primero elige un día'
                            : availableServicesForNewCondolence.length === 0
                              ? 'No hay servicios en esa fecha'
                              : 'Seleccionar servicio...'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServicesForNewCondolence.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nombreDifunto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="condolencia-familiar">Nombre completo</Label>
                  <Input
                    id="condolencia-familiar"
                    value={form.nombreFamiliar}
                    onChange={(e) => setForm((f) => ({ ...f, nombreFamiliar: e.target.value }))}
                    placeholder="Ej. María González"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="condolencia-texto">Mensaje de condolencia</Label>
                  <Textarea
                    id="condolencia-texto"
                    value={form.condolencia}
                    onChange={(e) => setForm((f) => ({ ...f, condolencia: e.target.value }))}
                    placeholder="Escribe aquí tu mensaje de condolencia..."
                    className="min-h-28"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled={!form.serviceId || !form.nombreFamiliar || !form.condolencia || saving}
                    onClick={handleSubmit}
                  >
                    {saving ? 'Guardando...' : 'Guardar condolencia'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {condolences.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <HeartHandshake className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {services.length === 0
                ? 'Primero agrega un servicio para poder registrar condolencias.'
                : 'No hay condolencias registradas aún.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Condolencia</TableHead>
                  <TableHead>Fotos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {condolences.map((entry) => (
                  <CondolenceRow
                    key={entry.id}
                    entry={entry}
                    services={services}
                    serviceName={serviceMap[entry.serviceId]?.nombreDifunto ?? 'Servicio eliminado'}
                    onDelete={() => onDelete(entry.id)}
                    onUpdate={onUpdate}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CondolenceRow({
  entry,
  services,
  serviceName,
  onDelete,
  onUpdate,
}: {
  entry: CondolenceEntry
  services: FuneralService[]
  serviceName: string
  onDelete: () => void
  onUpdate: (entry: CondolenceEntry) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [photoToDeleteIndex, setPhotoToDeleteIndex] = useState<number | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    serviceId: entry.serviceId,
    nombreFamiliar: entry.nombreFamiliar,
    condolencia: entry.condolencia,
  })
  const [editFotos, setEditFotos] = useState<string[]>(entry.fotos)
  const editFileRef = useRef<HTMLInputElement>(null)

  function resetEditForm() {
    setEditForm({
      serviceId: entry.serviceId,
      nombreFamiliar: entry.nombreFamiliar,
      condolencia: entry.condolencia,
    })
    setEditFotos(entry.fotos)
  }

  async function handleEditImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - editFotos.length
    const toProcess = files.slice(0, remaining)
    const b64s = await Promise.all(toProcess.map(toBase64))
    setEditFotos((prev) => [...prev, ...b64s])
    e.target.value = ''
  }

  function removeEditPhoto(index: number) {
    setEditFotos((prev) => prev.filter((_, i) => i !== index))
  }

  function confirmRemoveEditPhoto() {
    if (photoToDeleteIndex === null) return
    removeEditPhoto(photoToDeleteIndex)
    setPhotoToDeleteIndex(null)
  }

  function handleSaveEdit() {
    setSavingEdit(true)
    onUpdate({
      ...entry,
      ...editForm,
      fotos: editFotos,
    })
    setSavingEdit(false)
    setEditOpen(false)
  }

  const date = new Date(entry.creadoEn)
  const formatted = date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <TableRow>
      <TableCell>
        <span className="inline-flex items-center gap-1 text-xs">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          {formatted}
        </span>
      </TableCell>
      <TableCell className="font-medium">{entry.nombreFamiliar}</TableCell>
      <TableCell>
        <Badge variant="secondary">{serviceName}</Badge>
      </TableCell>
      <TableCell className="max-w-sm">
        <p className="line-clamp-3 text-xs text-muted-foreground">{entry.condolencia}</p>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{entry.fotos.length} foto{entry.fotos.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-1">
            {entry.fotos.slice(0, 3).map((foto, i) => (
              <div key={i} className="relative h-8 w-8 overflow-hidden rounded-md border">
                <Image src={foto} alt={`Miniatura ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Dialog
            open={editOpen}
            onOpenChange={(v) => {
              if (v) resetEditForm()
              setEditOpen(v)
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif">Editar condolencia</DialogTitle>
              </DialogHeader>
              <div className="mt-2 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Servicio funerario</Label>
                  <Select
                    value={editForm.serviceId}
                    onValueChange={(v) => setEditForm((f) => ({ ...f, serviceId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar servicio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nombreDifunto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`editar-condolencia-nombre-${entry.id}`}>Nombre</Label>
                  <Input
                    id={`editar-condolencia-nombre-${entry.id}`}
                    value={editForm.nombreFamiliar}
                    onChange={(e) => setEditForm((f) => ({ ...f, nombreFamiliar: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`editar-condolencia-texto-${entry.id}`}>Mensaje</Label>
                  <Textarea
                    id={`editar-condolencia-texto-${entry.id}`}
                    value={editForm.condolencia}
                    onChange={(e) => setEditForm((f) => ({ ...f, condolencia: e.target.value }))}
                    className="min-h-28"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Fotografías (máx. 5)</Label>
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50"
                    onClick={() => editFotos.length < 5 && editFileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && editFotos.length < 5 && editFileRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {editFotos.length < 5
                        ? `Agregar fotografías (${editFotos.length}/5)`
                        : 'Límite alcanzado'}
                    </p>
                    <input
                      ref={editFileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleEditImages}
                    />
                  </div>
                  {editFotos.length > 0 && (
                    <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {editFotos.map((foto, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-md">
                          <Image src={foto} alt={`Foto ${i + 1}`} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotoToDeleteIndex(i)}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label={`Quitar foto ${i + 1}`}
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled={!editForm.serviceId || !editForm.nombreFamiliar || !editForm.condolencia || savingEdit}
                    onClick={handleSaveEdit}
                  >
                    {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={photoToDeleteIndex !== null}
            onOpenChange={(v) => {
              if (!v) setPhotoToDeleteIndex(null)
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar fotografía</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Seguro que deseas eliminar esta imagen del registro? Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={confirmRemoveEditPhoto}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Eliminar condolencia</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                ¿Eliminar la condolencia de <strong>{entry.nombreFamiliar}</strong>?
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete()
                    setConfirmDeleteOpen(false)
                  }}
                >
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  )
}
