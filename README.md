# GelatoFlow - POS & Gestión de Heladería 🍦

Sistema web Premium para la administración de ventas, control de inventario y gestión de cajeros, diseñado específicamente para heladerías.

## Tecnologías Utilizadas
- **Frontend**: React 18, TypeScript, Vite
- **Estilos**: Tailwind CSS v4, CSS Tokens, Diseño Glassmorphism
- **Estado**: Zustand
- **Rutas**: React Router v7
- **Iconos**: Lucide React
- **Impresión**: react-to-print

## Estructura del Sistema

El sistema se divide en dos módulos principales según el rol del usuario:

### 1. Módulo de Cajero (`/cashier`)
- **Apertura de Caja**: Arqueo inicial, conteo de denominaciones.
- **POS (Punto de Venta)**: Gestión simultánea de mesas, toma de pedidos con carrito y persistencia en memoria local.
- **Checkout**: Interfaz optimizada para pagos (Efectivo, Tarjeta, Transferencia), cálculo de cambio automático e impresión de ticket.
- **Gastos**: Registro de salidas de dinero durante el turno con impresión de comprobante.
- **Cierre de Caja**: Conciliación final, resumen de ganancias del turno, conteo físico vs esperado.

### 2. Módulo de Administrador (`/admin`)
- **Gestión de Productos**: *(Implementado)*
  - CRUD completo de productos del menú.
  - Asignación de categorías (Helados, Toppings, Bebidas, Postres).
  - Control de precio, stock actual, unidad de medida.
  - Filtros en tiempo real, búsqueda y activación/desactivación dinámica.
- **Gestión de Recursos/Insumos**: *(Pendiente)*
- **Inventario**: *(Pendiente)*
- **Historial de Movimientos**: *(Pendiente)*
- **Gestión de Usuarios**: *(Pendiente)*

## Diseño y UX
Se ha construido un diseño exclusivo **Pastel Glassmorphism**, caracterizado por:
- Desenfoques de fondo (`backdrop-filter: blur()`).
- Gradientes en tonos pastel.
- Micro-animaciones en interacciones (hover, presionar).
- Diálogos personalizados y notificaciones interactivas (`sonner`).

## Ejecución Local

1. Instalar dependencias:
```bash
npm install
```

2. Levantar servidor de desarrollo:
```bash
npm run dev
```

El proyecto se servirá por defecto en `http://localhost:5173`.

## Ramas de Desarrollo
- `main`: Entorno principal / Producción.
- `develop`: Entorno de desarrollo / Staging.
- `modulos-admin`: Implementación actual de los módulos de administración.
