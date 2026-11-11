# Backlog

Portfolio y blog con panel de administración propio que reemplaza a Strapi.
Contexto, stack y decisiones: ver [CLAUDE.md](CLAUDE.md).

**Cómo usar este documento**

- `[x]` historia terminada · `[ ]` pendiente.
- Al cerrar una historia: marcarla, anotar el commit y mover a **Pendientes** lo que quedó abierto.
- Los pendientes se tachan (`[x]`) cuando se resuelven; no se borran, para conservar el historial.

---

## Historias

- [x] **1.** Como administrador, quiero iniciar sesión en el panel y editar el titular del hero, para ver el cambio en el sitio público al instante.
  _Commit `f980dd9` (junto con la #2)._
- [x] **2.** Como visitante, quiero cambiar el sitio entre español e inglés, para leerlo en mi idioma. Requiere: #1
  _Commit `f980dd9`._
- [x] **3.** Como administrador, quiero editar la información de presentación (avatar, intro, CV, redes sociales y CTA), para mantener actualizada mi carta de presentación. Requiere: #1
  _Commit `335cd63`._
- [x] **4.** Como administrador, quiero crear, editar, eliminar y reordenar proyectos con descripción en rich text, para mostrar mi trabajo actual. Requiere: #1
  _Commit `2ec1058`._
- [x] **5.** Como administrador, quiero subir la imagen principal y las capturas de cada proyecto, para que los visitantes vean el resultado. Requiere: #4
  _Commit `710e1eb`._
- [ ] **6.** Como administrador, quiero gestionar las áreas de expertise y asignarlas a los proyectos, para que los visitantes los exploren por área. Requiere: #4
- [ ] **7.** Como administrador, quiero gestionar las categorías de skills y sus skills, para mantener al día mi stack tecnológico. Requiere: #1
- [ ] **8.** Como administrador, quiero asignar skills a cada proyecto, para que se vea qué tecnologías usé. Requiere: #4, #7
- [ ] **9.** Como administrador, quiero gestionar las entradas de mi trayectoria profesional, para que la línea de tiempo esté al día. Requiere: #1
- [ ] **10.** Como administrador, quiero gestionar mis entradas de educación, para mostrar mi formación. Requiere: #1
- [ ] **11.** Como administrador, quiero escribir, editar y eliminar posts del blog en un editor dedicado con rich text y vista previa, para publicar artículos con comodidad. Requiere: #1
- [ ] **12.** Como administrador, quiero añadir una portada a cada post e insertar imágenes dentro del contenido, para enriquecer los artículos. Requiere: #11
- [ ] **13.** Como administrador, quiero gestionar tags y asignarlos a los posts, para que los visitantes encuentren artículos relacionados. Requiere: #11
- [ ] **14.** Como administrador, quiero guardar un post como borrador y publicarlo cuando esté listo, para escribir en varias sesiones sin que los visitantes vean artículos a medias. Requiere: #11

Todo el contenido administrable (#3 a #14) se edita en español y en inglés.

---

## Pendientes

### Historia 1 — Login y titular

- [ ] Rate limiting del login. Hoy solo hay 800 ms de espera por intento fallido; Upstash está instalado pero sin usar.
- [ ] Verificar en un deploy de Vercel que el titular se actualiza al guardar, sin redeploy.
- [ ] Hay dos lockfiles (`package-lock.json` y `pnpm-lock.yaml`); solo se mantiene el de pnpm. Confirmar que Vercel instala con pnpm y borrar el otro.

### Historia 2 — Español e inglés

- [ ] Verificar en producción que `/es/no-existe` muestra el 404 en español (en dev el HTML inicial es el shell de error genérico de Next).
- [ ] Revisar las traducciones al español de los textos fijos ([es.ts](app/lib/i18n/dictionaries/es.ts)).
- [ ] Decidir si el chat debe responder en el idioma de la página (hoy el modelo no lo sabe).
- [ ] Fijar la versión de Node (`.nvmrc` y/o `engines`). Vitest 5 exige Node ≥ 22.12 y la terminal por defecto usa 20.17. Ojo: `engines` también cambia el Node de Vercel.
- [ ] Borrar `app/components/sections/CareerTimeline.tsx` (código muerto, nadie lo importa).

### Historia 3 — Perfil

- [x] Hacer commit y push.
- [ ] Correr `pnpm db:migrate` contra tu base de Turso (migración `0001`, tablas del perfil).
- [ ] Crear el bucket de R2 con dominio propio y configurar `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` y `R2_PUBLIC_URL`. Sin R2 no se puede subir archivos en producción.
- [ ] ⚠️ Hasta tener R2: no subir archivos en local contra la base de producción (el archivo queda en tu disco y producción lo vería roto).
- [ ] Decidir si las etiquetas de los links ("GitHub", "Email") deben ser bilingües (hoy son las mismas en los dos idiomas).
- [ ] Cargar el perfil real desde `/admin/profile` (la base nueva arranca vacía y el hero muestra textos de respaldo).

### Historia 4 — Proyectos

- [x] Hacer commit y push.
- [ ] Correr `pnpm db:migrate` contra tu base de Turso (migración `0002`, tablas de proyectos).
- [ ] Cargar los proyectos reales desde `/admin/projects` (los de Strapi no se migran).
- [ ] Reordenar desde la lista solo está cubierto por tests del repositorio; probarlo a mano en el admin (el botón "Save order" llama al server action desde JavaScript).
- [ ] Un slug inexistente (`/en/projects/nope`) responde 200 con el 404 pintado en el cliente (soft 404): el `loading.tsx` de la ruta envía el loader antes del `notFound()`. Ya pasaba con Strapi; lo mismo en `/blog/[slug]`.
- [ ] Cambiar el slug de un proyecto rompe su URL anterior (sin redirecciones; aceptado porque el SEO no importa).
- [ ] Los bloques de código del Markdown no tienen resaltado de sintaxis (Shiki ya está en el proyecto; evaluarlo en la #11).

### Historia 5 — Imágenes de proyectos

- [x] Hacer commit y push.
- [ ] Correr `pnpm db:migrate` contra tu base de Turso (migración `0003`: tabla `project_screenshots` y columna `image_key`).
- [ ] Las imágenes se gestionan en la página de edición del proyecto y se guardan al instante (un request por archivo, máx. 3 MB cada uno). Un proyecto nuevo primero se crea y luego se le agregan imágenes.
- [ ] Probar en el navegador el flujo completo del admin (subir varias capturas a la vez, reordenar, quitar). En local se probó llamando a los server actions con el mismo protocolo que usa el navegador, no con el navegador real.
- [ ] La imagen OG usa la URL pública; en local (`/uploads/...`) se resuelve contra `nelkit.dev` y no existe allí. Con R2 la URL ya es absoluta.
- [ ] Las capturas usan como texto alternativo "título — número"; no hay alt text editable por captura.

### Strapi como fuente opcional

- [x] El home fallaba porque Strapi ya no responde: ahora `getStrapiData` devuelve vacío si `NEXT_PUBLIC_STRAPI_URL` no está definida o Strapi no responde, y las secciones aún no migradas salen vacías.
- [ ] Quitar `NEXT_PUBLIC_STRAPI_URL` de tu `.env` para no esperar los reintentos contra un Strapi caído.
- [ ] Tu `next dev` sirve un titular de prueba ("Shipping E2E-TEST from Turso") que quedó en su caché por una prueba mía de la historia #1: guarda el titular en `/admin/hero` (invalida la caché) o reinicia el servidor.

### Para historias futuras

- [x] **#5:** resuelto sin URLs prefirmadas: un request por archivo (cada uno bajo el límite de 4 MB del server action).
- [ ] **#12:** las imágenes de los posts pueden seguir el mismo patrón que la #5.
- [ ] **#4 a #14:** al migrar cada sección, quitar su parte de la query de Strapi en el home. (#4: hecho.)
- [ ] **#6 y #8:** las tarjetas y el detalle de proyectos no muestran área ni tecnologías hasta esas historias. (Imágenes: hecho en la #5.)

### Generales

- [ ] Configurar en Vercel: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`, `ADMIN_PASSWORD_HASH` y las `R2_*`.
- [ ] Primer deploy de preview y verificación de punta a punta.
- [ ] Automatizar las migraciones en el deploy (hoy son manuales y deben correr **antes** de que salga el código nuevo).
- [ ] Cron diario que mantenga viva la base de Turso (el plan Free archiva tras 10 días sin actividad) y exporte un respaldo en JSON a R2.
- [ ] Cuando todas las secciones estén migradas: retirar Strapi (`app/lib/strapi.ts`, `qs`, `@strapi/blocks-react-renderer`, `remotePatterns` de Strapi, `NEXT_PUBLIC_STRAPI_URL`).
