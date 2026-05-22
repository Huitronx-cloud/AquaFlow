-- ============================================================
-- AQUA FLOW — Migración inicial
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ─── ORGANIZACIONES ──────────────────────────────────────────
create type plan_type as enum ('basico', 'pro', 'empresarial');
create type org_status as enum ('trial', 'active', 'suspended', 'cancelled');

create table organizations (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null,
  slug                  text not null unique,
  plan                  plan_type not null default 'basico',
  status                org_status not null default 'trial',
  trial_ends_at         timestamptz default (now() + interval '30 days'),
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  rfc                   text,
  razon_social          text,
  whatsapp_limit        int not null default 100,
  created_at            timestamptz not null default now()
);

-- ─── LOCALES ─────────────────────────────────────────────────
create table locations (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  address     text not null,
  colonia     text not null,
  city        text not null,
  state       text not null default 'CDMX',
  phone       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── USUARIOS ────────────────────────────────────────────────
create type user_role as enum ('owner', 'admin', 'supervisor', 'repartidor');

create table app_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  org_id      uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id),
  name        text not null,
  email       text not null,
  phone       text,
  role        user_role not null default 'supervisor',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── TURNOS (bitácora) ───────────────────────────────────────
create type shift_status as enum ('borrador', 'completado');

create table shifts (
  id                        uuid primary key default uuid_generate_v4(),
  location_id               uuid not null references locations(id) on delete cascade,
  user_id                   uuid not null references app_users(id),
  turno                     smallint not null check (turno in (1, 2)),
  fecha                     date not null,
  hora_llegada              time,
  caja_chica                numeric(10,2),
  lectura_inicial           numeric(12,2),
  lectura_final             numeric(12,2),
  lectura_filtro_1_real     numeric(12,2),
  lectura_filtro_1_proximo  numeric(12,2),
  lectura_filtro_2_real     numeric(12,2),
  lectura_filtro_2_proximo  numeric(12,2),
  jabon_nivel               text,
  jabon_proximo_cambio      date,
  no_remision               text,
  se_cloraron_tanques       boolean,
  ozono_hora                time,
  ozono_minutos             int,
  garrafones_llenados       int default 0,
  total_ventas              numeric(10,2) default 0,
  observaciones             text,
  firmado_por               text,
  firmado_at                timestamptz,
  status                    shift_status not null default 'borrador',
  created_at                timestamptz not null default now(),
  unique(location_id, turno, fecha)
);

-- ─── ENVASES POR TURNO ───────────────────────────────────────
create type container_type as enum ('garrafon_20l', 'botella_1l', 'botella_250ml');

create table shift_containers (
  id        uuid primary key default uuid_generate_v4(),
  shift_id  uuid not null references shifts(id) on delete cascade,
  tipo      container_type not null,
  llenos    int not null default 0,
  vacios    int not null default 0,
  unique(shift_id, tipo)
);

-- ─── CHECKLIST DE LIMPIEZA ───────────────────────────────────
create table shift_cleaning_tasks (
  id            uuid primary key default uuid_generate_v4(),
  shift_id      uuid not null references shifts(id) on delete cascade,
  task_key      text not null,
  completado    boolean not null default false,
  completado_at timestamptz,
  unique(shift_id, task_key)
);

-- ─── EQUIPOS REVISADOS ───────────────────────────────────────
create type equipment_status as enum ('ok', 'alerta', 'falla');

create table shift_equipment_checks (
  id          uuid primary key default uuid_generate_v4(),
  shift_id    uuid not null references shifts(id) on delete cascade,
  equipo_key  text not null,
  status      equipment_status not null default 'ok',
  nota        text,
  unique(shift_id, equipo_key)
);

-- ─── CLIENTES ────────────────────────────────────────────────
create type customer_status as enum ('activo', 'suspendido', 'moroso');

create table customers (
  id                    uuid primary key default uuid_generate_v4(),
  org_id                uuid not null references organizations(id) on delete cascade,
  location_id           uuid not null references locations(id),
  name                  text not null,
  phone                 text not null,
  address               text not null,
  colonia               text not null,
  city                  text not null,
  frecuencia_dias       int,
  garrafones_prestados  int not null default 0,
  saldo_pendiente       numeric(10,2) not null default 0,
  status                customer_status not null default 'activo',
  notas                 text,
  created_at            timestamptz not null default now()
);

-- ─── PEDIDOS ─────────────────────────────────────────────────
create type order_status as enum ('pendiente', 'confirmado', 'en_camino', 'entregado', 'cancelado');
create type payment_method as enum ('efectivo', 'transferencia', 'tarjeta');

create table orders (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references organizations(id) on delete cascade,
  location_id     uuid not null references locations(id),
  customer_id     uuid not null references customers(id),
  repartidor_id   uuid references app_users(id),
  fecha           date not null default current_date,
  status          order_status not null default 'pendiente',
  garrafones      int not null default 1,
  total_mxn       numeric(10,2) not null default 0,
  metodo_pago     payment_method,
  portal_token    text not null unique default encode(gen_random_bytes(16), 'hex'),
  entregado_at    timestamptz,
  notas           text,
  created_at      timestamptz not null default now()
);

-- ─── COBROS ──────────────────────────────────────────────────
create table payments (
  id               uuid primary key default uuid_generate_v4(),
  org_id           uuid not null references organizations(id) on delete cascade,
  order_id         uuid references orders(id),
  customer_id      uuid not null references customers(id),
  monto            numeric(10,2) not null,
  metodo           payment_method not null,
  fecha            date not null default current_date,
  registrado_por   uuid not null references app_users(id),
  notas            text,
  created_at       timestamptz not null default now()
);

-- ─── NOTIFICACIONES ──────────────────────────────────────────
create type notification_channel as enum ('whatsapp', 'sms', 'email');
create type notification_type as enum (
  'pedido_confirmado', 'pedido_en_camino', 'pedido_entregado',
  'cobro_vencido', 'recordatorio_pedido', 'solicitud_resena'
);
create type notification_status as enum ('enviado', 'fallido');

create table notifications (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references customers(id),
  order_id    uuid references orders(id),
  tipo        notification_type not null,
  canal       notification_channel not null default 'whatsapp',
  mensaje     text not null,
  enviado_at  timestamptz not null default now(),
  status      notification_status not null default 'enviado'
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index idx_shifts_location_fecha on shifts(location_id, fecha desc);
create index idx_orders_org_status on orders(org_id, status);
create index idx_orders_customer on orders(customer_id);
create index idx_customers_org on customers(org_id);
create index idx_payments_org on payments(org_id);
create index idx_notifications_org on notifications(org_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Los usuarios solo ven datos de su organización
-- ============================================================
alter table organizations enable row level security;
alter table locations enable row level security;
alter table app_users enable row level security;
alter table shifts enable row level security;
alter table shift_containers enable row level security;
alter table shift_cleaning_tasks enable row level security;
alter table shift_equipment_checks enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;

-- Función helper: obtener org_id del usuario actual
create or replace function get_user_org_id()
returns uuid language sql security definer
as $$ select org_id from app_users where id = auth.uid() $$;

-- Políticas RLS
create policy "users_own_org" on organizations
  for all using (id = get_user_org_id());

create policy "users_own_locations" on locations
  for all using (org_id = get_user_org_id());

create policy "users_own_users" on app_users
  for all using (org_id = get_user_org_id());

create policy "users_own_shifts" on shifts
  for all using (location_id in (
    select id from locations where org_id = get_user_org_id()
  ));

create policy "users_own_customers" on customers
  for all using (org_id = get_user_org_id());

create policy "users_own_orders" on orders
  for all using (org_id = get_user_org_id());

create policy "users_own_payments" on payments
  for all using (org_id = get_user_org_id());

create policy "users_own_notifications" on notifications
  for all using (org_id = get_user_org_id());
