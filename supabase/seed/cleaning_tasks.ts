// Tareas de limpieza por turno y día de la semana
// day: 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb

export const CLEANING_TASKS = {
  turno_1: [
    {
      key: 'ozono_tqe',
      label: 'Revisar que TQE de purificación huela a gas ozono',
      days: [1, 3, 5], // Lun, Mié, Vie
    },
    {
      key: 'barrer_banqueta',
      label: 'Barrer banqueta y calle',
      days: [0, 1, 2, 3, 4, 5, 6], // Todos los días
    },
    {
      key: 'canceleria_local1',
      label: 'Limpieza interior y exterior de cancelería y vidrios (Local 1)',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      key: 'limpiar_wc',
      label: 'Limpiar WC — trapear y tirar basura',
      days: [1, 3, 5], // Lun, Mié, Vie
    },
    {
      key: 'barrer_interior',
      label: 'Barrer y trapear área interior',
      days: [2, 4, 6], // Mar, Jue, Sáb
    },
    {
      key: 'limpiar_tinas',
      label: 'Limpieza debajo de las tinas',
      days: [2, 4, 6], // Mar, Jue, Sáb
    },
    {
      key: 'desinfeccion_boquillas',
      label: 'Desinfección de boquillas de llenado (8:00 y 12:00 hrs)',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      key: 'tapas_liners',
      label: 'Limpiar tapas, colocar liners y reciclar tapas buenas',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
  ],
  turno_2: [
    {
      key: 'ozono_tqe',
      label: 'Revisar que TQE de purificación huela a gas ozono',
      days: [2, 4, 6], // Mar, Jue, Sáb
    },
    {
      key: 'barrer_banqueta',
      label: 'Barrer banqueta y calle',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      key: 'canceleria_local2',
      label: 'Limpieza interior y exterior de cancelería y vidrios (Local 2)',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      key: 'limpiar_wc',
      label: 'Limpiar WC — trapear y tirar basura',
      days: [2, 4, 6], // Mar, Jue, Sáb
    },
    {
      key: 'barrer_interior',
      label: 'Barrer y trapear área interior',
      days: [1, 3, 5], // Lun, Mié, Vie
    },
    {
      key: 'limpiar_tinas',
      label: 'Limpieza debajo de las tinas',
      days: [1, 3, 5], // Lun, Mié, Vie
    },
    {
      key: 'desinfeccion_boquillas',
      label: 'Desinfección de boquillas de llenado (16:00 y 19:00 hrs)',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
    {
      key: 'tapas_liners',
      label: 'Limpiar tapas, colocar liners y reciclar tapas buenas',
      days: [0, 1, 2, 3, 4, 5, 6],
    },
  ],
}

export const EQUIPMENT_CHECKS = {
  turno_1: [
    { key: 'osmosis_filtros', label: 'Osmosis inversa y cab. filtros', days: [2, 4, 6] },
    { key: 'bomba_hidroneum', label: 'Bomba de hidroneumático', days: [2, 4, 6] },
    { key: 'bomba_agua_purif', label: 'Bomba de agua purificada', days: [2, 4, 6] },
    { key: 'bomba_sanitizado', label: 'Bomba de sanitizado', days: [2, 4, 6] },
  ],
  turno_2: [
    { key: 'osmosis_filtros', label: 'Osmosis inversa y cab. filtros', days: [6, 0, 1] },
    { key: 'bomba_hidroneum', label: 'Bomba de hidroneumático', days: [6, 0, 1] },
    { key: 'bomba_agua_purif', label: 'Bomba de agua purificada', days: [6, 0, 1] },
    { key: 'bomba_sanitizado', label: 'Bomba de sanitizado', days: [6, 0, 1] },
  ],
}
