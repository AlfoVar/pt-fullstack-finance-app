# PT Fullstack Finance App

Aplicación Next.js para registrar movimientos (ingresos/egresos), gestionar usuarios y generar reportes. Incluye UI moderna, API REST y documentación OpenAPI (Swagger).

## Páginas principales
- `/` — Inicio / dashboard.
- `/movements` — Lista de movimientos.
- `/movements/new` — Crear movimiento (admin).
- `/movements/[id]` — Ver / editar movimiento.
- `/users` — Gestión de usuarios (admin).
- `/users/new` — Crear usuario (admin).
- `/reports` — Reportes y gráfico.
- `/docs` — Documentación interactiva (Swagger UI).

## API y OpenAPI
- API routes en `src/pages/api/*`.
- OpenAPI spec: `src/lib/openapiSpec.ts`.
- Swagger UI page: `/docs` (usa `swagger-ui-react` y carga `openapiSpec`).
- Raw spec (si está configurado): `/api/openapi.json` o `/api/docs` según tu ruta API.

## Requisitos
- Node.js 18+ recomendado
- Base de datos (DATABASE_URL) configurada en .env
- NEXTAUTH_URL configurada para NextAuth

## Instalación y uso
1. Instalar dependencias:
```bash
npm install
```

2. Generar cliente Prisma (si usas Prisma):
```bash
npx prisma generate
```

3. Ejecutar migraciones de Prisma (si aplica):
```bash
npx prisma migrate dev
```

4. Ejecutar en desarrollo:
```bash
npm run dev
# abrir http://localhost:3000
# docs: http://localhost:3000/docs
```

5. Build / producción:
```bash
npm run build
npm start
```

## Tests
- Los tests están en `src/__tests__` o `src/tests`.
- Ejecutar:
```bash
npm test
```

## Configuración de imágenes (next/image)
Si usas avatars remotos (GitHub u otros) añade dominios en `next.config.js`:
```js
// next.config.js
module.exports = {
  images: {
    domains: ["avatars.githubusercontent.com"],
    // o usar remotePatterns
  },
};
```
Reinicia el servidor tras cambios.

## Notas útiles
- El spec OpenAPI se encuentra en `src/lib/openapiSpec.ts`.
- La página `/docs` carga `swagger-ui-react` de forma dinámica (ssr: false).
- Asegúrate de reiniciar el dev server tras cambios en `next.config.js` o variables de entorno.
- Para evitar llamadas reales en tests, mockea `src/lib/prisma`.

## Despliegue
Se recomienda Vercel para desplegar Next.js. Asegura configurar variables de entorno (DATABASE_URL, NEXTAUTH_URL, etc.) en la plataforma de despliegue.
