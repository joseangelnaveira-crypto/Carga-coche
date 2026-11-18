# Carga del coche (PWA)

Calcula a qué hora enchufar el coche eléctrico para tenerlo cargado a la hora que lo necesitas. Funciona sin conexión una vez instalada. Todos los datos se guardan solo en el móvil.

## Publicar en GitHub Pages
1. Crea un repositorio público (p. ej. `carga-coche`).
2. Sube TODO el contenido de esta carpeta a la raíz del repo (incluidas `fonts/`, `icons/` y `.nojekyll`).
3. Settings → Pages → Source: "Deploy from a branch" → `main` / `/ (root)`.
4. Tu app quedará en `https://TU-USUARIO.github.io/carga-coche/`.

## Instalar
- iPhone: abrir en Safari → Compartir → "Añadir a pantalla de inicio".
- Android: abrir en Chrome → botón "Instalar" de la app o menú ⋮ → "Instalar aplicación".

## Publicar una versión nueva
Cambia el número en `sw.js` (`const CACHE = "carga-coche-v2"`) y sube los archivos. Los móviles se actualizan solos la siguiente vez que abran la app con conexión.

## Seguridad
- Activa la verificación en dos pasos (2FA) en GitHub.
- Usa el correo `noreply` de GitHub en los commits (Settings → Emails).
- Sin servidores, sin cuentas, sin rastreo ni recursos externos (CSP estricta: todo se sirve desde el mismo origen).

## Licencias
Copyright (c) 2026 JANF. Todos los derechos reservados (ver `LICENSE`). El codigo y el diseno no se pueden copiar ni reutilizar sin permiso.
Fuentes Inter y Space Grotesk (SIL OFL 1.1), ver `fonts/LICENSE-*.txt`.
Los precios de ejemplo y las capacidades de batería son orientativos.
