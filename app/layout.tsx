import type { Metadata } from 'next'
import { Lora, Inter } from 'next/font/google'
import './globals.css'

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Serenidad — Sistema de Gestión Funeraria',
  description: 'Portal de gestión de servicios funerarios y entradas fotográficas.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
