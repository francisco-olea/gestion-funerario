'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { FuneralService, PhotoEntry } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { CalendarDays, ImageIcon, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'

interface EntradasProps {
  services: FuneralService[]
  entries: PhotoEntry[]
  onAdd: (entry: PhotoEntry) => void
  onDeleteEntry: (entryId: string) => void
  onUpdateEntry: (entry: PhotoEntry) => void
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

export default function Entradas({
  services,
  entries,
  onAdd,
  onDeleteEntry,
  onUpdateEntry,
}: EntradasProps) {
  const [open, setOpen] = useState(false)
  const [filterDate, setFilterDate] = useState<string>('')
  const [newEntryDate, setNewEntryDate] = useState<string>('')
  const [form, setForm] = useState({
    serviceId: '',
    nombreFamiliar: '',
    telefono: 'ADMIN',
  })
  const [fotos, setFotos] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function resetForm() {
    setForm({ serviceId: '', nombreFamiliar: '', telefono: 'ADMIN' })
    setFotos([])
    setNewEntryDate('')
  }

  const availableServicesForNewEntry = newEntryDate
    ? services.filter((s) => getDateFilterKey(s.creadoEn) === newEntryDate)
    : []

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - fotos.length
    const toProcess = files.slice(0, remaining)
    const b64s = await Promise.all(toProcess.map(toBase64))
    setFotos((prev) => [...prev, ...b64s])
    e.target.value = ''
  }

  function removePhoto(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    setSaving(true)
    const newEntry: PhotoEntry = {
      id: crypto.randomUUID(),
      serviceId: form.serviceId,
      nombreFamiliar: form.nombreFamiliar,
      telefono: form.telefono,
      fotos,
      creadoEn: new Date().toISOString(),
    }
    onAdd(newEntry)
    resetForm()
    setSaving(false)
    setOpen(false)
  }

  const filteredEntries = filterDate
    ? entries.filter((e) => getDateFilterKey(e.creadoEn) === filterDate)
    : entries

  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Entradas Fotográficas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fotografías enviadas por familiares y seres queridos
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v) }}>
          <DialogTrigger asChild>
            <Button disabled={services.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">Nueva entrada fotográfica</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nueva-entrada-fecha-servicio">Filtrar servicios por día</Label>
                <Input
                  id="nueva-entrada-fecha-servicio"
                  type="date"
                  value={newEntryDate}
                  onChange={(e) => {
                    const nextDate = e.target.value
                    setNewEntryDate(nextDate)
                    setForm((f) => ({ ...f, serviceId: '' }))
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Servicio funerario</Label>
                <Select
                  value={form.serviceId}
                  onValueChange={(v) => setForm((f) => ({ ...f, serviceId: v }))}
                  disabled={!newEntryDate || availableServicesForNewEntry.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !newEntryDate
                          ? 'Primero elige un día'
                          : availableServicesForNewEntry.length === 0
                            ? 'No hay servicios en esa fecha'
                            : 'Seleccionar servicio...'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServicesForNewEntry.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nombreDifunto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombreFamiliar">Nombre completo del familiar</Label>
                <Input
                  id="nombreFamiliar"
                  required
                  value={form.nombreFamiliar}
                  onChange={(e) => setForm((f) => ({ ...f, nombreFamiliar: e.target.value }))}
                  placeholder="Ej. María González"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="telefono">Número de teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value="No requerido (administrador)"
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>
              {/* Photos */}
              <div className="flex flex-col gap-1.5">
                <Label>Fotografías (máx. 5)</Label>
                <div
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fotos.length < 5 && fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fotos.length < 5 && fileRef.current?.click()}
                  aria-label="Subir fotografías"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {fotos.length < 5
                      ? `Subir fotografías (${fotos.length}/5)`
                      : 'Límite alcanzado'}
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImages}
                  />
                </div>
                {fotos.length > 0 && (
                  <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {fotos.map((f, i) => (
                      <div key={i} className="relative aspect-square rounded-md overflow-hidden group">
                        <Image src={f} alt={`Foto ${i + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Quitar foto ${i + 1}`}
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter className="mt-2">
                <Button type="button" variant="outline" onClick={() => { resetForm(); setOpen(false) }}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={!form.serviceId || !form.nombreFamiliar || fotos.length === 0 || saving}
                  onClick={handleSubmit}
                >
                  {saving ? 'Guardando...' : 'Guardar entrada'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      {services.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Label htmlFor="filtro-fecha" className="text-sm shrink-0">Filtrar por fecha:</Label>
          <Input
            id="filtro-fecha"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full sm:w-64"
          />
          {filterDate && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setFilterDate('')}>
              Limpiar filtro
            </Button>
          )}
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {services.length === 0
                ? 'Primero agrega un servicio para poder recibir entradas.'
                : filterDate
                  ? 'No hay entradas fotográficas en la fecha seleccionada.'
                  : 'No hay entradas fotográficas aún.'}
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
                  <TableHead>Familiar</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Fotos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <EntryTableRow
                    key={entry.id}
                    entry={entry}
                    services={services}
                    serviceName={serviceMap[entry.serviceId]?.nombreDifunto ?? 'Servicio eliminado'}
                    onDeleteEntry={() => onDeleteEntry(entry.id)}
                    onUpdateEntry={onUpdateEntry}
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

function EntryTableRow({
  entry,
  services,
  serviceName,
  onDeleteEntry,
  onUpdateEntry,
}: {
  entry: PhotoEntry
  services: FuneralService[]
  serviceName: string
  onDeleteEntry: () => void
  onUpdateEntry: (entry: PhotoEntry) => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editFotos, setEditFotos] = useState<string[]>(entry.fotos)
  const [editForm, setEditForm] = useState({
    serviceId: entry.serviceId,
    nombreFamiliar: entry.nombreFamiliar,
    telefono: entry.telefono,
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const editFileRef = useRef<HTMLInputElement>(null)
  const [photoToDeleteIndex, setPhotoToDeleteIndex] = useState<number | null>(null)

  function resetEdit() {
    setEditForm({
      serviceId: entry.serviceId,
      nombreFamiliar: entry.nombreFamiliar,
      telefono: entry.telefono,
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
    onUpdateEntry({
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
      <TableCell>{entry.telefono}</TableCell>
      <TableCell>
        <Badge variant="secondary">{serviceName}</Badge>
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
              if (v) resetEdit()
              setEditOpen(v)
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif">Editar entrada fotográfica</DialogTitle>
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
                  <Label htmlFor={`editar-familiar-${entry.id}`}>Nombre del familiar</Label>
                  <Input
                    id={`editar-familiar-${entry.id}`}
                    value={editForm.nombreFamiliar}
                    onChange={(e) => setEditForm((f) => ({ ...f, nombreFamiliar: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`editar-telefono-${entry.id}`}>Teléfono</Label>
                  <Input
                    id={`editar-telefono-${entry.id}`}
                    value={editForm.telefono}
                    onChange={(e) => setEditForm((f) => ({ ...f, telefono: e.target.value }))}
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
                    disabled={!editForm.serviceId || !editForm.nombreFamiliar || !editForm.telefono || savingEdit}
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
            onOpenChange={(open) => {
              if (!open) setPhotoToDeleteIndex(null)
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
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmRemoveEditPhoto}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Eliminar entrada</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Eliminar entrada</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                ¿Eliminar la entrada de <strong>{entry.nombreFamiliar}</strong> con todas sus fotografías?
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={() => { onDeleteEntry(); setConfirmOpen(false) }}>Eliminar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TableCell>
    </TableRow>
  )
}
