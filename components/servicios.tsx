'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { FuneralService } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CalendarDays,
  Clock,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Users,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

interface ServiciosProps {
  services: FuneralService[]
  onAdd: (s: FuneralService) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  onUpdate: (s: FuneralService) => void
}

function formatDate(str: string) {
  if (!str) return '—'
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Servicios({
  services,
  onAdd,
  onDelete,
  onToggleStatus,
  onUpdate,
}: ServiciosProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    nombreDifunto: '',
    fechaNacimiento: '',
    fechaDefuncion: '',
    fechaVelorio: '',
    horaVelorio: '',
  })
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function resetForm() {
    setForm({
      nombreDifunto: '',
      fechaNacimiento: '',
      fechaDefuncion: '',
      fechaVelorio: '',
      horaVelorio: '',
    })
    setImagenPreview(null)
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await toBase64(file)
    setImagenPreview(b64)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const newService: FuneralService = {
      id: crypto.randomUUID(),
      ...form,
      imagenDifunto: imagenPreview,
      status: 'activo',
      creadoEn: new Date().toISOString(),
    }
    onAdd(newService)
    resetForm()
    setSaving(false)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Servicios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Alta y gestión de servicios funerarios
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">Dar de alta servicio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombreDifunto">Nombre completo del difunto</Label>
                <Input
                  id="nombreDifunto"
                  required
                  value={form.nombreDifunto}
                  onChange={(e) => setForm((f) => ({ ...f, nombreDifunto: e.target.value }))}
                  placeholder="Ej. Juan Carlos Pérez López"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    required
                    value={form.fechaNacimiento}
                    onChange={(e) => setForm((f) => ({ ...f, fechaNacimiento: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fechaDefuncion">Fecha de defunción</Label>
                  <Input
                    id="fechaDefuncion"
                    type="date"
                    required
                    value={form.fechaDefuncion}
                    onChange={(e) => setForm((f) => ({ ...f, fechaDefuncion: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="fechaVelorio">Fecha de velorio</Label>
                  <Input
                    id="fechaVelorio"
                    type="date"
                    required
                    value={form.fechaVelorio}
                    onChange={(e) => setForm((f) => ({ ...f, fechaVelorio: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="horaVelorio">Hora de velorio</Label>
                  <Input
                    id="horaVelorio"
                    type="time"
                    required
                    value={form.horaVelorio}
                    onChange={(e) => setForm((f) => ({ ...f, horaVelorio: e.target.value }))}
                  />
                </div>
              </div>
              {/* Image upload */}
              <div className="flex flex-col gap-1.5">
                <Label>Fotografía del difunto</Label>
                <div
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                  aria-label="Subir fotografía del difunto"
                >
                  {imagenPreview ? (
                    <div className="relative h-32 w-32 overflow-hidden rounded-lg">
                      <Image src={imagenPreview} alt="Vista previa" fill className="object-cover" />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-7 w-7 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">
                        Haz clic para seleccionar una imagen
                      </p>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <DialogFooter className="mt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar servicio'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No hay servicios registrados. Agrega el primero.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Difunto</TableHead>
                  <TableHead>Nacimiento</TableHead>
                  <TableHead>Defunción</TableHead>
                  <TableHead>Velorio</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((s) => (
                  <ServiceTableRow
                    key={s.id}
                    service={s}
                    onDelete={() => onDelete(s.id)}
                    onToggle={() => onToggleStatus(s.id)}
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

function ServiceTableRow({
  service,
  onDelete,
  onToggle,
  onUpdate,
}: {
  service: FuneralService
  onDelete: () => void
  onToggle: () => void
  onUpdate: (s: FuneralService) => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    nombreDifunto: service.nombreDifunto,
    fechaNacimiento: service.fechaNacimiento,
    fechaDefuncion: service.fechaDefuncion,
    fechaVelorio: service.fechaVelorio,
    horaVelorio: service.horaVelorio,
  })
  const [editImagePreview, setEditImagePreview] = useState<string | null>(service.imagenDifunto)
  const editFileRef = useRef<HTMLInputElement>(null)

  function resetEditForm() {
    setEditForm({
      nombreDifunto: service.nombreDifunto,
      fechaNacimiento: service.fechaNacimiento,
      fechaDefuncion: service.fechaDefuncion,
      fechaVelorio: service.fechaVelorio,
      horaVelorio: service.horaVelorio,
    })
    setEditImagePreview(service.imagenDifunto)
  }

  async function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await toBase64(file)
    setEditImagePreview(b64)
  }

  function handleSaveEdit() {
    setSavingEdit(true)
    onUpdate({
      ...service,
      ...editForm,
      imagenDifunto: editImagePreview,
    })
    setSavingEdit(false)
    setEditOpen(false)
  }

  return (
    <TableRow>
      <TableCell>
        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
          {service.imagenDifunto ? (
            <Image
              src={service.imagenDifunto}
              alt={`Fotografía de ${service.nombreDifunto}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Users className="h-5 w-5 opacity-40" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium">{service.nombreDifunto}</TableCell>
      <TableCell>{formatDate(service.fechaNacimiento)}</TableCell>
      <TableCell>{formatDate(service.fechaDefuncion)}</TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          {formatDate(service.fechaVelorio)}
        </span>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          {service.horaVelorio}
        </span>
      </TableCell>
      <TableCell>
        <Badge
          variant={service.status === 'activo' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {service.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="h-8" onClick={onToggle}>
            {service.status === 'activo' ? (
              <ToggleRight className="h-3.5 w-3.5" />
            ) : (
              <ToggleLeft className="h-3.5 w-3.5" />
            )}
          </Button>

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
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif">Editar servicio</DialogTitle>
              </DialogHeader>
              <div className="mt-2 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`editar-nombre-${service.id}`}>Nombre completo del difunto</Label>
                  <Input
                    id={`editar-nombre-${service.id}`}
                    required
                    value={editForm.nombreDifunto}
                    onChange={(e) => setEditForm((f) => ({ ...f, nombreDifunto: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`editar-fecha-nac-${service.id}`}>Fecha de nacimiento</Label>
                    <Input
                      id={`editar-fecha-nac-${service.id}`}
                      type="date"
                      value={editForm.fechaNacimiento}
                      onChange={(e) => setEditForm((f) => ({ ...f, fechaNacimiento: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`editar-fecha-def-${service.id}`}>Fecha de defunción</Label>
                    <Input
                      id={`editar-fecha-def-${service.id}`}
                      type="date"
                      value={editForm.fechaDefuncion}
                      onChange={(e) => setEditForm((f) => ({ ...f, fechaDefuncion: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`editar-fecha-vel-${service.id}`}>Fecha de velorio</Label>
                    <Input
                      id={`editar-fecha-vel-${service.id}`}
                      type="date"
                      value={editForm.fechaVelorio}
                      onChange={(e) => setEditForm((f) => ({ ...f, fechaVelorio: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`editar-hora-vel-${service.id}`}>Hora de velorio</Label>
                    <Input
                      id={`editar-hora-vel-${service.id}`}
                      type="time"
                      value={editForm.horaVelorio}
                      onChange={(e) => setEditForm((f) => ({ ...f, horaVelorio: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Fotografía del difunto</Label>
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50"
                    onClick={() => editFileRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && editFileRef.current?.click()}
                  >
                    {editImagePreview ? (
                      <div className="relative h-28 w-28 overflow-hidden rounded-lg">
                        <Image src={editImagePreview} alt="Vista previa" fill className="object-cover" />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-7 w-7 text-muted-foreground" />
                        <p className="text-center text-sm text-muted-foreground">
                          Haz clic para seleccionar una imagen
                        </p>
                      </>
                    )}
                    <input
                      ref={editFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditImageChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={handleSaveEdit} disabled={savingEdit}>
                    {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Confirmar eliminación</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                ¿Estás seguro de eliminar el servicio de{' '}
                <strong>{service.nombreDifunto}</strong>? Esta acción no se puede deshacer.
              </p>
              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={() => { onDelete(); setConfirmOpen(false) }}>
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
