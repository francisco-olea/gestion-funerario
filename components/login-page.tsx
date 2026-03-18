'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Eye, EyeOff, Lock, User } from 'lucide-react'

const DEMO_USER = 'admin'
const DEMO_PASS = 'serenidad2024'

interface LoginProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      if (username === DEMO_USER && password === DEMO_PASS) {
        onLogin()
      } else {
        setError('Usuario o contraseña incorrectos.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-primary/30 mb-4 shadow-md">
            <Image src="/logo.jpg" alt="Serenidad" fill className="object-cover" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Serenidad</h1>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
            Servicios Funerarios
          </p>
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader className="pb-2 pt-6 px-6">
            <h2 className="text-lg font-semibold text-foreground">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">Acceso al sistema de gestión</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    className="pl-9"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    className="pl-9 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full mt-1" disabled={loading}>
                {loading ? 'Verificando...' : 'Entrar'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Demo: <span className="font-mono">admin</span> / <span className="font-mono">serenidad2024</span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
