export type ServiceStatus = 'activo' | 'finalizado'

export interface FuneralService {
  id: string
  nombreDifunto: string
  fechaNacimiento: string
  fechaDefuncion: string
  fechaVelorio: string
  horaVelorio: string
  imagenDifunto: string | null
  status: ServiceStatus
  creadoEn: string
}

export interface PhotoEntry {
  id: string
  serviceId: string
  nombreFamiliar: string
  telefono: string
  fotos: string[]
  creadoEn: string
}

export interface CondolenceEntry {
  id: string
  serviceId: string
  nombreFamiliar: string
  condolencia: string
  fotos: string[]
  creadoEn: string
}
