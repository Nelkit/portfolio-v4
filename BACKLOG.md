# Backlog

Portfolio y blog con panel de administración propio que reemplaza a Strapi.
Contexto, stack y decisiones: ver [CLAUDE.md](CLAUDE.md).

**Cómo usar este documento**

- `[x]` historia terminada · `[ ]` pendiente.
- Al cerrar una historia: marcarla, anotar el commit y mover a **Pendientes** lo que quedó abierto.
- `**Nota:**` es una limitación o decisión conocida, no una tarea.
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
- [x] **6.** Como administrador, quiero gestionar las áreas de expertise y asignarlas a los proyectos, para que los visitantes los exploren por área. Requiere: #4
  _Commit `f3ba27d`._
- [x] **7.** Como administrador, quiero gestionar las categorías de skills y sus skills, para mantener al día mi stack tecnológico. Requiere: #1
  _Commit `0580387`._
- [x] **8.** Como administrador, quiero asignar skills a cada proyecto, para que se vea qué tecnologías usé. Requiere: #4, #7
  _Commit `232f177`._
- [x] **9.** Como administrador, quiero gestionar las entradas de mi trayectoria profesional, para que la línea de tiempo esté al día. Requiere: #1
  _Commit `a2d9073`._
- [x] **10.** Como administrador, quiero gestionar mis entradas de educación, para mostrar mi formación. Requiere: #1
  _Commit `56a0442`._
- [x] **11.** Como administrador, quiero escribir, editar y eliminar posts del blog en un editor dedicado con rich text y vista previa, para publicar artículos con comodidad. Requiere: #1
  _Commit `376a406`._
- [x] **12.** Como administrador, quiero añadir una portada a cada post e insertar imágenes dentro del contenido, para enriquecer los artículos. Requiere: #11
  _Commit `11d2dfa`._
- [x] **13.** Como administrador, quiero gestionar tags y asignarlos a los posts, para que los visitantes encuentren artículos relacionados. Requiere: #11
  _Commit `8367449`._
- [x] **14.** Como administrador, quiero guardar un post como borrador y publicarlo cuando esté listo, para escribir en varias sesiones sin que los visitantes vean artículos a medias. Requiere: #11
  _Commit `c7a4e32`._

- [x] **15.** Como visitante, quiero ver una selección curada de proyectos de IA con categorías, año y organización consistentes, para entender rápido el perfil de AI Product Engineer. Como administrador, quiero ver el progreso y el resultado de cada acción del panel. Requiere: #4, #6, #8
  _Commit `b231d9a`._

Todo el contenido administrable (#3 a #15) se edita en español y en inglés.

---

## Qué falta de verdad

_Revisado el 2026-11-26 contra el código y `www.nelkit.dev`. El detalle por historia está en **Pendientes**._

**Antes de publicar los cambios locales**

- [x] Cambios llevados a `feat/site-improvements`, creada desde `origin/main`.
- [x] Commits y push de `feat/site-improvements`.
- [x] PR #36 fusionado y desplegado en producción (`bf95b49`, 2026-11-25).
- [x] Los previews de Vercel fallan (los de los 3 últimos PR; producción despliega bien): revisar el log. — **Cerrado 2026-11-26 (PR #39, `328bc97`):** la causa era Next 16.0.11, cuyo Turbopack fallaba con las URLs de Google Fonts sin extensión; se arregló actualizando a Next 16.4.6. Opcional: servir las fuentes desde el propio sitio para no depender de Google en el build.
- [x] Bug del importador (`screenshotsPosition`): resuelto al borrar el importador, que ya no se usa (commit `1afdaf9`).
- [x] Respaldo y restauración locales: `pnpm backup` y `pnpm backup:restore` (commit `fcf66d2`).
- [x] Probar en el navegador: capturas en "top" (escritorio y móvil), dictado con micrófono real y "Restart Chat". — **Probado por el propietario, también en iPhone (2026-11-25).**

**Riesgo en producción**

- [x] Respaldos automáticos: `CRON_SECRET` ya existe en Vercel (según el propietario); confirmar `R2_BACKUP_BUCKET` (bucket R2 privado, jurisdicción US, accesible con el token) y que el cron deja `backups/AAAA-MM-DD.json` en él. — **Cerrado 2026-11-25:** el propietario ejecutó el endpoint y el JSON quedó en el bucket.
- [x] Upstash conectado en producción: el propietario ve las claves `portfolio:ratelimit:chat-*` (2026-11-25).
- [x] Límite de uso del chat: entrada validada, 8/min y 40/día por IP, 300/día en total (commit `693bf56`).
- [x] Guardrail de presupuesto de 5 USD en OpenRouter (según el propietario, 2026-11-25).
- [x] El login ya no falla si Upstash falla (pasa a memoria); el modelo de respaldo ahora sí se activa con 402/429 (commit `693bf56`).
- [x] El chat solo leía los primeros 100 bloques de Notion (35 % de la página): ahora lee todo, con tablas y URLs; prompt ajustado y evaluación `pnpm chat:eval`; links y Markdown en las respuestas.
- [x] Elegir el modelo del chat con `pnpm chat:eval` y usar el mismo en local y producción: `gemini-2.5-flash-lite` (producción) dio 429 de su proveedor en las pruebas. — **Cerrado 2026-11-26:** el propietario eligió `openai/gpt-oss-120b`; el chat de producción lo muestra.
- [x] Automatizar las migraciones en el deploy (hoy son manuales y deben correr **antes** de que salga el código nuevo). — **2026-11-26:** `pnpm build` corre `scripts/db/migrate-on-deploy.ts` antes de `next build`, solo en builds de producción de Vercel (las previews comparten la base). Probado sobre una copia de producción (sin cambios) y una base vacía (15 migraciones).
- [x] Ver en el log del primer deploy de producción la línea `Migrations: up to date.` — **Cerrado 2026-11-26:** confirmado por el propietario en el deploy del PR #42.

**Contenido y SEO**

- [x] El blog en español no tiene posts (hay 1 en inglés). — **Cerrado 2026-11-26:** 2 posts en cada idioma.
- [x] El CV enlazado es el mismo archivo (`cv-en-…`) en los dos idiomas. — **Cerrado 2026-11-26:** `/es` enlaza `cv-es-…` y `/en` enlaza `cv-en-…`.
- [x] `sitemap.xml` y `robots.txt`; las URLs canónicas usan `www.nelkit.dev` (el dominio sin `www` redirige). _Commit `5deb25b`, verificado en producción._
- [x] Soft 404 corregido: proyectos y posts inexistentes responden 404 (confirmado en producción, `34d148a`).

---

## Pendientes

### Historia 1 — Login y titular

- [x] Rate limiting del login: 5 intentos por IP cada 15 min (se comprueba antes de la contraseña), además de los 800 ms por intento fallido.
- [x] Crear una base Redis en Upstash (o la integración de Vercel) y configurar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o `KV_REST_API_URL`/`KV_REST_API_TOKEN`). Sin ellas el límite vive en la memoria de cada instancia y no se comparte en producción. — **Cerrado 2026-11-25:** conectada en Vercel.
- [x] Verificar en un deploy de Vercel que el titular se actualiza al guardar, sin redeploy. — **Cerrado 2026-11-26:** hecho por el propietario.
- [x] `package-lock.json` borrado; el proyecto declara `packageManager: pnpm@10.14.0` (la versión que generó `pnpm-lock.yaml`).

### Historia 2 — Español e inglés

- [x] Verificar en producción que `/es/no-existe` muestra el 404 en español (en dev el HTML inicial es el shell de error genérico de Next). — **Cerrado 2026-11-25:** verificado en un navegador: 404 en español y código 404.
- [x] Revisar las traducciones al español de los textos fijos ([es.ts](app/lib/i18n/dictionaries/es.ts)). — **Cerrado 2026-11-26:** revisadas por el propietario ("Mi blog", "Artículos", contacto), commit `7388003`.
- [x] Decidir si el chat debe responder en el idioma de la página (hoy el modelo no lo sabe). — **Cerrado 2026-11-25:** responde en el idioma de la web (`response-language.ts`).
- [x] Node fijado: `.nvmrc` = `22` y `engines.node` = `22.x` (Vercel construye con Node 22).
- [x] En tu terminal: `nvm use` (lee `.nvmrc`) y `corepack enable` para que `pnpm` use la 10.14.0; con el pnpm 9 global el proyecto ahora da `ERR_PNPM_BAD_PM_VERSION`. — **Cerrado 2026-11-26:** la terminal ya usa pnpm 10.14.0.
- [x] Borrar `app/components/sections/CareerTimeline.tsx` (borrado en la #11).

### Historia 3 — Perfil

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0001`, tablas del perfil). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- [x] Bucket R2 `portfolio-bucket` (jurisdicción US) con dominio `media.nelkit.dev` y variables `R2_*` + `R2_JURISDICTION=us` configuradas en local; subida y lectura pública verificadas.
- [x] ⚠️ Resuelto con R2: las subidas ya no quedan en el disco local. Archivos subidos antes a `public/uploads/` (si los hay) siguen solo en tu disco: re-subirlos desde el admin.
- [x] Decidir si las etiquetas de los links ("GitHub", "Email") deben ser bilingües (hoy son las mismas en los dos idiomas). — **Cerrado 2026-11-26:** ya resuelto: el sitio en español muestra "Correo" (`es.ts`); GitHub y LinkedIn son nombres propios.
- [x] Cargar el perfil real desde `/admin/profile` (la base nueva arranca vacía y el hero muestra textos de respaldo). — **Cerrado 2026-11-25:** producción muestra perfil, avatar y CV.

### Historia 4 — Proyectos

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0002`, tablas de proyectos). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- [x] Cargar los proyectos reales desde `/admin/projects` (los de Strapi no se migran). — **Cerrado 2026-11-25:** 15 proyectos en producción.
- [x] Reordenar desde la lista solo está cubierto por tests del repositorio; probarlo a mano en el admin (el botón "Save order" llama al server action desde JavaScript). — **Cerrado 2026-11-26:** hecho por el propietario.
- [x] Un slug inexistente (`/en/projects/nope`) responde 200 con el 404 pintado en el cliente (soft 404): el `loading.tsx` de la ruta envía el loader antes del `notFound()`. Ya pasaba con Strapi; lo mismo en `/blog/[slug]`. — **Resuelto:** el `loading.tsx` quedó solo en los listados.
- **Nota:** Cambiar el slug de un proyecto rompe su URL anterior (sin redirecciones; aceptado porque el SEO no importa).
- [x] Los bloques de código del Markdown no tienen resaltado de sintaxis (Shiki ya está en el proyecto; evaluarlo en la #11). — **Cerrado 2026-11-26:** ya resuelto en la #11 (`376a406`): `app/lib/highlight.ts` resalta con Shiki en el servidor.

### Historia 5 — Imágenes de proyectos

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0003`: tabla `project_screenshots` y columna `image_key`). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- **Nota:** Las imágenes se gestionan en la página de edición del proyecto y se guardan al instante (un request por archivo, máx. 3 MB cada uno). Un proyecto nuevo primero se crea y luego se le agregan imágenes.
- [x] Probar en el navegador el flujo completo del admin (subir varias capturas a la vez, reordenar, quitar). En local se probó llamando a los server actions con el mismo protocolo que usa el navegador, no con el navegador real. — **Cerrado 2026-11-26:** hecho por el propietario.
- **Nota:** La imagen OG usa la URL pública; en local (`/uploads/...`) se resuelve contra `nelkit.dev` y no existe allí. Con R2 la URL ya es absoluta.
- **Nota:** Las capturas usan como texto alternativo "título — número"; no hay alt text editable por captura.

### Historia 6 — Áreas de expertise

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0004`: tablas de áreas y columna `projects.area_id`). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- [x] Crear las áreas en `/admin/areas` y asignarlas a cada proyecto (las de Strapi no se migran). — **Cerrado 2026-11-25:** los 15 proyectos tienen categoría en producción.
- [x] Probar en el navegador el filtro por chips (home y `/projects`): el filtrado es estado del cliente y en local solo se verificó el HTML inicial (chips, conteos y etiquetas), no el clic. — **Cerrado 2026-11-26:** hecho por el propietario.
- **Nota:** El filtro solo aparece cuando hay 2 o más áreas con proyectos.
- **Nota:** La referencia `projects.area_id` no tiene `ON DELETE SET NULL` en la base (SQLite no lo permite en `ALTER TABLE ADD`); el borrado de áreas lo hace explícito en el repositorio. Si se borra un área fuera del admin, sus proyectos quedarían apuntando a un id inexistente (se muestran sin área).

### Historia 7 — Stack tecnológico

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0005`: catálogo de skills y categorías). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- [x] Cargar las categorías y skills reales en `/admin/skills` (los de Strapi no se migran). — **Cerrado 2026-11-25:** visibles en producción.
- [x] Probar en el navegador el campo de etiquetas (Enter/coma para agregar, ‹ › para reordenar, sugerencias del catálogo) y el cambio de pestaña del stack; en local se verificaron los server actions y el HTML, no los clics. — **Cerrado 2026-11-26:** hecho por el propietario.
- [x] Script `pnpm stack:import` que reemplaza las pestañas por las 6 nuevas (IA y Machine Learning, Ciencia de datos, Ingeniería de datos, MLOps y nube, Full-Stack y SIG, Móvil) y conserva las tecnologías que usan los proyectos (commit `f1aa33b`). Probado sobre una copia del backup.
- [x] Aplicarlo en producción. — **2026-11-26:** el stack nuevo ya estaba en producción al hacer el backup (`backups/2026-11-26T05-52-54Z`, posterior al cambio). Las 191 etiquetas de proyectos siguen intactas y "MapBox" pasó a "Mapbox". El estado anterior está en el respaldo diario de R2 `backups/2026-11-26.json` (04:00 UTC). Se ve en el sitio tras desplegar (el stack está en caché).
- **Nota:** Para corregir el nombre de un skill (p. ej. "Pytorch" → "PyTorch") hay que quitarlo y volver a agregarlo en cada categoría; no hay pantalla para renombrar el catálogo.
- [x] Corregido de paso: `SkillsSection` llamaba a `useState` después de un `return` condicional (violaba las reglas de los hooks).

### Historia 8 — Skills de los proyectos

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0006`: tabla `project_skills`). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- [x] Asignar los skills a cada proyecto desde su formulario (campo "Tech stack"). — **Cerrado 2026-11-25:** los 15 tienen "Tech stack" en producción.
- **Nota:** Un proyecto puede usar skills que no están en ninguna categoría (p. ej. Firebase): entran al catálogo y se sugieren, pero no aparecen en la sección del stack.
- [x] Probar en el navegador el campo de etiquetas dentro del formulario del proyecto (en local se probó enviando el formulario, no los clics). — **Cerrado 2026-11-26:** hecho por el propietario.

### Historia 9 — Trayectoria

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0007`: tablas de trayectoria). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- [x] Cargar las entradas reales en `/admin/career` (las de Strapi no se migran). — **Cerrado 2026-11-25:** visibles en producción.
- **Nota:** El orden es automático (puesto actual primero, luego por inicio descendente); no hay orden manual.
- **Nota:** Los años de experiencia se calculan al renderizar la página (que se regenera semanalmente); pueden tardar hasta una semana en sumar un año si no editas nada.
- [x] Probar en el navegador el selector `type="month"` (en Safari antiguo puede verse como texto libre `YYYY-MM`). — **Cerrado 2026-11-26:** hecho por el propietario.
- [x] Corregido de paso: los años de experiencia usaban 2026 escrito a mano y el estado "actual" se deducía buscando "now"/"present" en el texto.

### Historia 10 — Educación

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0008`: tablas de educación). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- [x] Cargar las entradas reales en `/admin/education` (las de Strapi no se migran). — **Cerrado 2026-11-25:** la sección está en producción (revisión de meses: ver "Migración de contenido").
- [x] Editar y borrar entradas solo se probaron con los tests del repositorio (mismo patrón que Trayectoria); probarlos en el navegador. — **Cerrado 2026-11-26:** hecho por el propietario.
- **Nota:** La nota "Plus scholarships" / "Más becas" del encabezado es texto fijo del diccionario, no contenido editable.

### Historia 11 — Editor del blog

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0009`: `posts` y `post_translations`). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- [x] Escribir los posts reales en `/admin/blog` (los de Strapi no se migran). — **Cerrado 2026-11-26:** 2 posts en cada idioma.
- **Nota:** Un post puede estar en uno o ambos idiomas; cada blog lista solo los de su idioma. Si se abre un post en un idioma en que no existe, redirige al listado de ese idioma, pero la redirección ocurre en el cliente (responde 200 por el `loading.tsx` de la ruta, igual que el soft 404).
- **Nota:** El HTML crudo dentro del Markdown no se ejecuta: se muestra escapado o se descarta (comportamiento de `react-markdown`). Si alguna vez necesitas embeber HTML (iframes, etc.), habría que decidir una lista blanca.
- **Nota:** La vista previa del editor no resalta el código; el resaltado (Shiki) solo se aplica en el sitio público.
- [x] Probar en el navegador el editor (pestañas de idioma, vista previa en vivo); en local se probó enviando el formulario. — **Cerrado 2026-11-26:** hecho por el propietario.
- [x] El contenedor del admin pasó de `max-w-3xl` a `max-w-6xl` para que el editor tenga escritura y vista previa lado a lado.

### Historia 12 — Imágenes del blog

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0010`: tabla `post_images` y columna `posts.cover_key`). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- **Nota:** Las imágenes del cuerpo se referencian como `upload:<clave>` y se convierten en URL al renderizar: si cambias de almacenamiento (local → R2) los posts no se rompen. No escribas URLs `/uploads/...` a mano.
- **Nota:** Un post nuevo primero se publica (guarda) y luego se le agregan portada e imágenes.
- **Nota:** No se puede borrar una imagen que el cuerpo guardado todavía usa; si la quitas del texto, guarda antes de borrarla.
- **Nota:** Al subir una imagen se inserta en el cuerpo, pero el post queda sin guardar hasta pulsar "Save" (el editor lo avisa).
- **Nota:** El editor del blog ya no funciona sin JavaScript (el formulario envuelve el server action para limpiar ese aviso). En la práctica siempre se usa con JavaScript.
- [x] Probar en el navegador la subida múltiple, el "Insert" en la posición del cursor y la vista previa con imágenes. — **Cerrado 2026-11-26:** hecho por el propietario.

### Historia 13 — Tags del blog

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0011`: `tags`, `tag_translations`, `post_tags`). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- [x] Crear los tags en `/admin/tags` y marcarlos en cada post. — **Cerrado 2026-11-25:** hay tags con posts en `/en/blog`.
- **Nota:** El filtro de `/blog` solo muestra tags con posts en ese idioma; `?tag=` desconocido muestra todos.
- **Nota:** Los tags no se muestran en las tarjetas del blog ni en "Escritos recientes" del home (no se eligió esa opción); solo en el filtro y en los relacionados.
- [x] Probar en el navegador las casillas de tags del editor y los chips del filtro. — **Cerrado 2026-11-26:** hecho por el propietario.

### Historia 14 — Borradores

- [x] Hacer commit y push.
- [x] Correr `pnpm db:migrate` contra tu base de Turso (migración `0012`: columna `posts.status`; los posts existentes quedan publicados). — **Cerrado 2026-11-25:** aplicada (la `0014`, posterior, ya corrió en orden).
- **Nota:** Un borrador no aparece en listados, home, relacionados ni rutas generadas, y su URL responde como inexistente (404 pintado en el cliente por el `loading.tsx`, igual que el resto de soft 404).
- **Nota:** No hay vista previa "en el sitio" de un borrador: se revisa con la vista previa del editor.
- **Nota:** El estado es por post, no por idioma (no se puede publicar solo una de las dos versiones).
- [x] Probar en el navegador los botones Publicar / Guardar borrador / Despublicar. — **Cerrado 2026-11-26:** hecho por el propietario.

### Strapi como fuente opcional

- [x] El home fallaba porque Strapi ya no responde: ahora `getStrapiData` devuelve vacío si `NEXT_PUBLIC_STRAPI_URL` no está definida o Strapi no responde, y las secciones aún no migradas salen vacías.
- [x] Quitar `NEXT_PUBLIC_STRAPI_URL` de tu `.env` para no esperar los reintentos contra un Strapi caído. — **Cerrado 2026-11-25:** duplicado del punto en "Generales".
- [x] El titular de prueba en caché ya no aplica: en desarrollo no se cachea (`cachedRead`).

### Migración de contenido desde Strapi

- [x] Contenido de Strapi importado a Turso (`portfolio-db-nelkit`) y R2 con `scripts/import-strapi/` (extract → traducción al español → import).
- [x] Completar en el admin lo que Strapi no tenía: resumen de 10 proyectos, descripciones de los 12, área de 11 proyectos; revisar los meses de educación (solo había años: enero/diciembre). **2026-11-25:** proyectos completos; queda revisar los meses de educación. — **Cerrado 2026-11-26:** meses de educación revisados por el propietario.
- [x] Los skills Machine Learning, Postgres y MongoDB no estaban asignados a nada en Strapi y no se importaron. **2026-11-25:** Machine Learning y Postgres ya aparecen en producción; MongoDB no. — **Cerrado 2026-11-26:** el propietario decidió no agregar MongoDB (ningún proyecto la usa).

### Ajustes de UX (2026-11-26, PR #43)

- [x] Visor de capturas: botones redondos visibles (cerrar, zoom, flechas), margen alrededor de la imagen y animación al abrir (commit `9a40433`).
- [x] Los botones "Volver" (detalle de proyecto y de post, `/projects`, `/blog`) regresan a la página de donde vino el visitante; si entró directo, usan su URL. El cambio de idioma reemplaza la entrada del historial (commit `727e6c7`).
- [x] Posts a 900 px con portada 16:9; las tarjetas destacadas de `/projects` y `/blog` ocupan media tarjeta, llenan su altura sin franjas vacías y en tablet ponen la imagen arriba (commit `5726418`). Probado por el propietario.
- [x] Contacto en mobile: las filas de GitHub y LinkedIn ya no se salen por la derecha (la URL larga ensanchaba la columna); la URL se corta si no cabe y el desplazamiento del hover solo aplica con mouse (commit `588699e`).
- [x] Las filas de contacto muestran la URL sin `www.` ni `/` final (`linkedin.com/in/nelkit`); el link sigue siendo la URL completa (commit `295ce77`).

#### Pendientes

- [x] Probar en un teléfono que las filas de contacto quedan con el mismo margen a ambos lados. — **Cerrado 2026-11-27:** probado por el propietario.

### Educación y distinciones (2026-11-26)

- [x] Cada entrada tiene una insignia (`award`, p. ej. "Summa Cum Laude") y una cita destacada (`note`, p. ej. la beca) por idioma; la columna "Status" pasa a "Honours" y la sección a "Education & Honours" (commit `232e3f5`, migración `0015`, ya aplicada).
- [ ] En `/admin/education`: borrar la entrada de la beca HonduFuturo; en UTS poner la insignia "HonduFuturo Scholar", la cita de la beca (con el número de seleccionados) y el proyecto final en la descripción; en UPI, el nombre oficial en inglés, "Politécnica" con tilde y ", Honduras", y "Summa Cum Laude" como insignia.

### Para historias futuras

- [x] **#5:** resuelto sin URLs prefirmadas: un request por archivo (cada uno bajo el límite de 4 MB del server action).
- [x] **#12:** las imágenes de los posts siguen el mismo patrón que la #5 (un request por archivo).
- [x] **#4 a #10:** el home ya no consulta la página de inicio de Strapi; solo quedan los posts recientes del blog (#11 a #14).
- [x] **#8:** las tarjetas y el detalle de proyectos ya muestran imagen (#5), área (#6) y tecnologías (#8).
- [x] **#8 ⚠️:** resuelto: la resolución de nombres y la limpieza de huérfanos viven en `skill-catalog.ts` y conservan los skills usados por cualquier categoría **o** proyecto (con tests de regresión).

### Historia 15: Reposicionamiento AI Product Engineer

- [x] Publicar en este orden: `pnpm db:migrate` (migración `0013`) → `pnpm tsx scripts/data/ai-positioning.ts --confirm` → deploy. Si se despliega antes del script, la caché del deploy nuevo guarda los datos viejos hasta el siguiente guardado en el admin. — **Cerrado 2026-11-25:** desplegado.
- [x] Mientras tanto no usar el admin del deploy anterior: la `0013` hace obligatoria la categoría y ese código todavía puede crear proyectos sin ella. — **Cerrado 2026-11-25:** ya no aplica: está desplegado.
- **Nota:** La migración `0013` está editada a mano: drizzle-kit generó un `INSERT … SELECT` que leía columnas nuevas de la tabla vieja. Un proyecto sin categoría recibe la primera por posición (cubierto por `app/lib/db/migrations.test.ts`).
- [x] Cargar `keyResult` y `role` (EN y ES) de cada proyecto desde `/admin/projects` (quedaron vacíos a propósito). — **Cerrado 2026-11-25:** `keyResult` en los 15, EN y ES; `role` visible en los 15 (EN).
- [x] NKAlert nunca tuvo el tag "SwiftUI" (solo Ryte 2.0); no había nada que quitar. — **Cerrado 2026-11-25:** sin acción necesaria.
- **Nota:** El link "CocoaPods Pod" de NKAlert pasó a "Website" (no hay label "CocoaPods" en la lista cerrada).
- **Nota:** Las subidas muestran "n/total" y un spinner, no un porcentaje: los server actions no exponen progreso (haría falta un endpoint con XHR).
- **Nota:** El aviso de cambios sin guardar cubre cerrar o recargar la pestaña y los links internos, no el botón "atrás" del navegador.
- [x] Borrar `scripts/import-strapi/data/` de tu disco cuando ya no lo necesites (datos personales fuera de git; el script de import se eliminó) y quitar su línea del `.gitignore`. **2026-11-25:** la carpeta ya no está en disco y se quitó la línea del `.gitignore`.
- [x] Corregidos de paso los errores de lint previos: `any` en `app/api/chat/route.ts` y `ClientWrapper.tsx`, `setState` dentro de un efecto en `useTheme.ts` (ahora `useSyncExternalStore`).

### Posición de capturas en el detalle de proyecto

- [x] Selector top/bottom en el admin; "top" muestra las miniaturas en una sola fila bajo la imagen destacada. _Commit `4571cf8`._
- [x] Migración `0014` aplicada en la base configurada en `.env`.
- [x] Si producción usa otra base, correr ahí `pnpm db:migrate` **antes** del deploy. — **Cerrado 2026-11-25:** producción y local muestran los mismos 15 proyectos con las mismas claves de imagen: es casi seguro la misma base.

### Cambios en `feat/site-improvements`

- [x] Links del proyecto sobre la imagen destacada, con ↗ y menos alto; en el home, en línea y con ↗. _Commit `4571cf8`, `cd5c0cb`._
- [x] Labels "Python Package" y "Jupyter Notebook"; el admin filtra los labels por tipo (`github` / `link`). _Commit `46be3bf`._
- [x] Página 404 rediseñada. _Commit `102cd9d`._
- [x] Chat: dictado por voz (Web Speech API), botón "Restart Chat" y respuesta en el idioma de la web. _Commit `520031a`, `3db9814`, `c3c0c65`._
- **Nota:** el dictado no está disponible en Firefox (el botón se oculta) y el menú de la 404 no incluye el CV.

### Generales

- [x] R2 respondía `NoSuchBucket`/`AccessDenied` con credenciales correctas: el bucket tiene jurisdicción **US explícita** y vive en `<account>.us.r2.cloudflarestorage.com`, pero el código usaba siempre el endpoint por defecto. Ahora se configura con `R2_JURISDICTION` (`us` | `eu` | `fedramp`; vacío = por defecto).
- [x] Agregar `R2_JURISDICTION=us` en Vercel (además de las otras `R2_*`). — **Cerrado 2026-11-25:** producción escribe en R2.
- [x] Borrar en Cloudflare los tokens de R2 de prueba que ya no se usan. — **Cerrado 2026-11-26:** hecho por el propietario.

- [x] Caché con datos de forma vieja: `unstable_cache` no cambiaba su clave cuando cambiaba la forma de los datos (p. ej. `ProjectView` ganó `skills` en la #8), y el home fallaba con `Cannot read properties of undefined (reading 'join')`. Corregido en `41f6c65`: todas las lecturas pasan por `cachedRead` (`app/lib/cache/cached-read.ts`): sin caché en desarrollo y, en producción, con el id del deploy en la clave (la Data Cache de Vercel persiste entre deploys).

- [x] Configurar en Vercel: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`, `ADMIN_PASSWORD_HASH` y las `R2_*`. — **Cerrado 2026-11-26:** producción lee la base, inicia sesión y sube a R2.
- [x] Primer deploy de preview y verificación de punta a punta. — **Cerrado 2026-11-25:** el sitio está en producción (`www.nelkit.dev`).
- [x] Automatizar las migraciones en el deploy. — **Duplicado:** se sigue en "Qué falta de verdad".
- [x] Cron diario (`vercel.json` → `/api/cron/daily`, 04:00 UTC): lee todas las tablas (mantiene viva la base) y guarda `backups/AAAA-MM-DD.json`.
- [x] Configurar `CRON_SECRET` en Vercel (sin él, el endpoint rechaza todo). — **Cerrado 2026-11-25:** configurado y probado.
- [x] Crear un bucket R2 **privado** (sin dominio público) para respaldos, configurar `R2_BACKUP_BUCKET` y ampliar el token de R2 a ese bucket. No usar el bucket de medios: es público y los respaldos incluyen borradores. — **Cerrado 2026-11-25:** configurado; el respaldo se guardó en él.
- [x] (Opcional) Regla de ciclo de vida en el bucket de respaldos para borrar los de más de N días. — **Cerrado 2026-11-26:** hecho por el propietario.
- [x] Strapi retirado en la #11: `strapi.ts`, `constant.ts`, `PostBody`, `inlineMarkdown`, los `transform*` de `content.ts`, `CareerTimeline.tsx`, las dependencias `qs`, `@types/qs` y `@strapi/blocks-react-renderer` y los `remotePatterns` de Strapi.
- [x] Quitar `NEXT_PUBLIC_STRAPI_URL` de tu `.env` y de Vercel (ya no se usa). — **Cerrado 2026-11-26:** hecho por el propietario.
