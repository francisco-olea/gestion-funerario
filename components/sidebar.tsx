'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  ImageIcon,
  MessageSquareHeart,
  PlaySquare,
  LogOut,
} from 'lucide-react'

export type NavSection = 'panel' | 'servicios' | 'entradas' | 'condolencias' | 'presentaciones'

const navItems: { key: NavSection; label: string; icon: React.ElementType }[] = [
  { key: 'panel', label: 'Panel', icon: LayoutDashboard },
  { key: 'servicios', label: 'Servicios', icon: Briefcase },
  { key: 'entradas', label: 'Entradas Fotográficas', icon: ImageIcon },
  { key: 'condolencias', label: 'Condolencias', icon: MessageSquareHeart },
  { key: 'presentaciones', label: 'Presentaciones', icon: PlaySquare },
]

interface SidebarProps {
  active: NavSection
  onNavigate: (section: NavSection) => void
  onLogout: () => void
}

export default function Sidebar({ active, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-sidebar-primary/30 shrink-0">
          <Image src="/logo.jpg" alt="Serenidad" fill className="object-cover" />
        </div>
        <div>
          <p className="font-serif text-sm font-semibold text-sidebar-foreground leading-tight">
            Serenidad
          </p>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
            Gestión Funeraria
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1" aria-label="Navegación principal">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={cn(
              'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left',
              active === key
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
