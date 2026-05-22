// ─── Organización (cada purificadora cliente) ────────────────────────────────
export type Plan = 'basico' | 'pro' | 'empresarial'
export type OrgStatus = 'trial' | 'active' | 'suspended' | 'cancelled'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: Plan
  status: OrgStatus
  trial_ends_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  rfc: string | null
  razon_social: string | null
  created_at: string
}

// ─── Locales / Sucursales ────────────────────────────────────────────────────
export interface Location {
  id: string
  org_id: string
  name: string
  address: string
  colonia: string
  city: string
  state: string
  phone: string | null
  is_active: boolean
  created_at: string
}

// ─── Usuarios ────────────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'admin' | 'supervisor' | 'repartidor'

export interface AppUser {
  id: string
  org_id: string
  location_id: string | null
  name: string
  email: string
  phone: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

// ─── Turnos (bitácora) ───────────────────────────────────────────────────────
export type TurnoNumber = 1 | 2
export type ShiftStatus = 'borrador' | 'completado'

export interface Shift {
  id: string
  location_id: string
  user_id: string
  turno: TurnoNumber
  fecha: string
  hora_llegada: string | null
  caja_chica: number | null
  lectura_inicial: number | null
  lectura_final: number | null
  lectura_filtro_1_real: number | null
  lectura_filtro_1_proximo: number | null
  lectura_filtro_2_real: number | null
  lectura_filtro_2_proximo: number | null
  jabon_nivel: string | null
  jabon_proximo_cambio: string | null
  no_remision: string | null
  se_cloraron_tanques: boolean | null
  ozono_hora: string | null
  ozono_minutos: number | null
  observaciones: string | null
  firmado_por: string | null
  firmado_at: string | null
  status: ShiftStatus
  created_at: string
}

// ─── Envases por turno ───────────────────────────────────────────────────────
export type ContainerType = 'garrафон_20l' | 'botella_1l' | 'botella_250ml'

export interface ShiftContainer {
  id: string
  shift_id: string
  tipo: ContainerType
  llenos: number
  vacios: number
}

// ─── Checklist limpieza ──────────────────────────────────────────────────────
export interface ShiftCleaningTask {
  id: string
  shift_id: string
  task_key: string
  completado: boolean
  completado_at: string | null
}

// ─── Equipos revisados ───────────────────────────────────────────────────────
export type EquipmentStatus = 'ok' | 'alerta' | 'falla'

export interface ShiftEquipmentCheck {
  id: string
  shift_id: string
  equipo_key: string
  status: EquipmentStatus
  nota: string | null
}

// ─── Clientes ────────────────────────────────────────────────────────────────
export type CustomerStatus = 'activo' | 'suspendido' | 'moroso'

export interface Customer {
  id: string
  org_id: string
  location_id: string
  name: string
  phone: string
  address: string
  colonia: string
  city: string
  frecuencia_dias: number | null
  garrafones_prestados: number
  saldo_pendiente: number
  status: CustomerStatus
  notas: string | null
  created_at: string
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────
export type OrderStatus = 'pendiente' | 'confirmado' | 'en_camino' | 'entregado' | 'cancelado'
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta'

export interface Order {
  id: string
  org_id: string
  location_id: string
  customer_id: string
  repartidor_id: string | null
  fecha: string
  status: OrderStatus
  garrafones: number
  total_mxn: number
  metodo_pago: PaymentMethod | null
  portal_token: string
  entregado_at: string | null
  notas: string | null
  created_at: string
}

// ─── Cobros ──────────────────────────────────────────────────────────────────
export interface Payment {
  id: string
  org_id: string
  order_id: string | null
  customer_id: string
  monto: number
  metodo: PaymentMethod
  fecha: string
  registrado_por: string
  notas: string | null
  created_at: string
}

// ─── Notificaciones ──────────────────────────────────────────────────────────
export type NotificationChannel = 'whatsapp' | 'sms' | 'email'
export type NotificationType =
  | 'pedido_confirmado'
  | 'pedido_en_camino'
  | 'pedido_entregado'
  | 'cobro_vencido'
  | 'recordatorio_pedido'
  | 'solicitud_resena'

export interface Notification {
  id: string
  org_id: string
  customer_id: string
  tipo: NotificationType
  canal: NotificationChannel
  mensaje: string
  enviado_at: string
  status: 'enviado' | 'fallido'
}
