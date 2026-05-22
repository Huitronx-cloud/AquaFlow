# Aqua Flow — Roadmap de desarrollo

## Fase 1 — MVP (semanas 1-6)
Suficiente para el primer cliente de pago.

- [x] Estructura del proyecto
- [x] Base de datos (migración inicial)
- [x] Tipos TypeScript
- [ ] Auth: registro de organización + login
- [ ] Dashboard principal (resumen del día)
- [ ] Módulo Bitácora digital (reemplaza el Excel de AQUANORIA)
- [ ] Módulo Clientes (CRUD básico)
- [ ] Módulo Pedidos (crear, asignar, entregar)
- [ ] Portal del cliente (link único por pedido)
- [ ] Deploy en Vercel + dominio aquaflow.mx

## Fase 2 — Crecimiento (semanas 7-12)

- [ ] Módulo Cobros y cartera
- [ ] Notificaciones WhatsApp (Twilio)
- [ ] Módulo Reportes con gráficas
- [ ] Exportar a Excel por módulo
- [ ] Integración Stripe (suscripciones)
- [ ] App PWA para repartidores (offline-first)
- [ ] Multi-local (plan Pro)

## Fase 3 — Escala (mes 4+)

- [ ] Facturación electrónica CFDI (México)
- [ ] Optimización de rutas por mapa
- [ ] App nativa iOS/Android (React Native)
- [ ] API pública para integraciones
- [ ] Panel de super-admin (ver todos los clientes)
- [ ] Módulo de inventario y producción

---

## Stack
- Next.js 14 (App Router)
- Supabase (PostgreSQL + Auth + Realtime)
- Tailwind CSS
- Stripe (suscripciones)
- Twilio (WhatsApp)
- Resend (email)
- Vercel (deploy)

## Precios
| Plan | Precio | Locales | Usuarios |
|------|--------|---------|---------|
| Básico | $299 MXN/mes | 1 | 3 |
| Pro | $599 MXN/mes | 3 | 10 |
| Empresarial | $1,199 MXN/mes | ilimitados | ilimitados |

30 días gratis, sin tarjeta de crédito.
