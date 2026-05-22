import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// Clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fechas en español
export function formatDate(date: string | Date) {
  return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })
}

export function formatDateShort(date: string | Date) {
  return format(new Date(date), 'dd/MM/yyyy', { locale: es })
}

export function formatTime(time: string) {
  return time.substring(0, 5) // "08:30:00" → "08:30"
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { locale: es, addSuffix: true })
}

// Moneda MXN
export function formatMXN(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Día de la semana
export function getDayName(date: Date = new Date()) {
  return format(date, 'EEEE', { locale: es }) // "lunes", "martes"...
}

// Iniciales de nombre
export function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// Token único para portal del cliente
export function generatePortalToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Pluralizar en español
export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`
}
