# TIF — Sistema de Gestión de Incidencias Técnicas (Frontend)

Frontend independiente del backend Laravel para el Trabajo Integrador Final de Desarrollo de Software 2026. Se conservó la interfaz generada a partir del diseño original y se corrigió su integración con la API REST. Las peticiones AJAX se realizan con `jQuery.ajax`; la interfaz está construida con React, Bootstrap y CSS.

## Requisitos

- Node.js compatible con Vite 8 (Node 20.19+ o 22.12+ recomendado).
- npm.
- Backend Laravel del TIF en ejecución en `http://127.0.0.1:8000`.

## Instalación y ejecución (Windows CMD)

1. Descomprimí el frontend en una carpeta independiente del backend.
2. Abrí CMD en la carpeta del frontend.
3. Instalá las dependencias:

   ```bat
   npm install
   ```

4. Opcionalmente, creá el archivo local `.env` desde el ejemplo:

   ```bat
   copy .env.example .env
   ```

   El valor predeterminado ya apunta a `http://127.0.0.1:8000/api`. Si el backend está en otra dirección, cambiá `VITE_API_URL` en `.env`.
5. Iniciá Vite:

   ```bat
   npm run dev
   ```

6. Abrí la dirección indicada por Vite, normalmente `http://127.0.0.1:5173`.

El backend debe haberse configurado y sembrado previamente (`php artisan migrate --seed`). Mantené la terminal del backend abierta mientras probás el frontend.

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Usuario | `usuario@test.com` | `password123` |
| Técnico | `tecnico@test.com` | `password123` |

Estas cuentas se crean desde el seeder del backend. No son credenciales de producción.

## Funcionalidades conectadas

- Login contra `POST /api/login`, token Bearer y verificación de sesión con `GET /api/user`.
- Cierre de sesión y revocación del token mediante `POST /api/logout`.
- Listado según el rol, filtros reales de estado y categoría, y detalle de cada incidencia.
- Carga de categorías desde `GET /api/categorias`; no quedan duplicadas en el código del frontend.
- Creación con título, descripción y `category_id`; el backend asigna el estado inicial y el usuario creador.
- Toma por técnico con `PUT /api/incidencias/{id}/tomar`.
- Resolución por el técnico asignado con `PUT /api/incidencias/{id}/resolver` y descripción obligatoria.
- Comentarios usando `GET`/`POST /api/incidencias/{id}/comentarios`; el detalle presenta el historial en orden cronológico.
- Navegación adaptada a escritorio y celular.

## Comprobaciones

```bat
npm run check
npm run build
```

Si el frontend abre pero no consigue conectarse a la API, comprobá que Laravel siga ejecutándose en el puerto 8000 y que el backend permita el origen de Vite mediante la configuración CORS (`CORS_ALLOWED_ORIGINS` en el `.env` del backend). En el desarrollo local de este proyecto, el backend usa `CORS_ALLOWED_ORIGINS=*` como valor predeterminado.

## Estructura principal

- `src/api.ts`: llamadas AJAX y adaptación del JSON de Laravel al modelo de la interfaz.
- `src/App.tsx`: sesión, navegación y composición de pantallas.
- `src/views/Login.tsx`: autenticación.
- `src/views/IncidentList.tsx`: listado y filtros.
- `src/views/NewIncident.tsx`: alta de incidencias.
- `src/views/IncidentDetail.tsx`: detalle, comentarios, toma y resolución.
- `src/index.css`: estilos del diseño original y reglas responsive.

