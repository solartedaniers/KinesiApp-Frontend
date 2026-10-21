# KinesiApp Frontend

Es la interfaz de KinesiApp, hecha con Next.js (App Router). El deportista graba un salto o una sentadilla en vista lateral, y yo le muestro los ángulos de rodilla y tronco, el riesgo por repetición y un chat que le explica el resultado. El coach sigue a sus deportistas y equipos, y el admin gestiona cuentas y roles.

Despliego en Vercel, en la región `fra1`, junto al backend de Render Frankfurt y la base de Neon.

## Arquitectura: gRPC de punta a punta, sin REST

```
Navegador ──HTML/RSC/Server Actions──▶ Next.js (runtime Node, Vercel fra1)
                                          │  Connect-ES, transporte gRPC-Web (HTTP/1.1)
                                          ▼
                              Envoy ──gRPC nativo──▶ backend grpcio (Render Frankfurt)
                                                         │  gRPC nativo + TLS
                                                         ▼
                                                   IA (Azure Container Apps)
```

- **El navegador nunca habla gRPC ni conoce la URL del backend.** Los Server Components y las Server Actions corren en Node. Ahí llamo al backend con clientes gRPC-Web generados del contrato (`lib/grpc/transport.ts`). Uso gRPC-Web porque Render solo acepta HTTP/1.1 desde internet. Envoy, en el contenedor del backend, lo traduce a gRPC nativo.
- **Contract-first.** Los `.proto` viven en [KinesiApp-Contracts](https://github.com/solartedaniers/KinesiApp-Contracts). Los traigo como submódulo en `contracts/`, fijado a un tag (hoy `v0.11.0`). `npm run generate` (Buf + `protoc-gen-es`) genera `lib/gen/`, que no se versiona ni se edita a mano.
- **Un adaptador por servicio.** `lib/grpc/*-gateway.ts` envuelve cada servicio del contrato: `AuthService`, `AccountService`, `UserAdminService`, `AthleteProfileService`, `ManagedAthleteService`, `TeamService`, `AnalysisService`, `ChatService` y `SystemService`. Cada adaptador pasa los mensajes Protobuf a los tipos de la app (`lib/grpc/mappers.ts`), así ninguna pantalla depende del código generado.
- **Sesión.** El access token y el refresh token viven en cookies `httpOnly`. Viajan en la metadata `authorization` de cada RPC, y el interceptor del backend los verifica. Cuando el access vence, lo renuevo con `RefreshSession`, que rota el refresh token.
- **Errores.** El backend responde con el status code estándar de gRPC más un `google.rpc.ErrorInfo`. `lib/grpc/errors.ts` lee el `reason` (`EMAIL_ALREADY_REGISTERED`, `UNAVAILABLE`...), y `lib/errors.ts` lo convierte en un texto de i18n. Ninguna pantalla compara strings sueltos.
- **Streaming.** Uso dos RPC de server streaming: el progreso del análisis (`WatchAnalysis`) y la respuesta del chat (`StartConversation` y `SendMessage`). Una Server Action devuelve el stream como iterable asíncrono, y una isla de cliente lo consume con `for await`.
- **Archivos.** Ningún video ni imagen pasa por Vercel:
  1. un RPC me da una URL firmada de Neon Storage;
  2. el navegador sube directo al bucket privado;
  3. otro RPC confirma la subida.

  Para reproducir un video, pido una URL firmada de vida corta.
- **Validación en las fronteras.** Todo dato que entra se parsea en runtime antes de usarse; la sección [Por qué las respuestas gRPC no pasan por Zod](#por-qué-las-respuestas-grpc-no-pasan-por-zod) explica con qué. Los límites no se repiten aquí: llegan del backend por `GetClientPolicy`. Son la duración y el tamaño del video, la contraseña, la edad, la estatura, el peso, el largo del chat y los cortes de nivel de riesgo. Cada análisis ya trae su nivel; los cortes solo sirven para lo que calculo aquí, como promedios, la peor repetición y las bandas de los medidores. El backend vuelve a validar todo.
- **Estado de la IA.** Al iniciar sesión disparo `WakeUpAi` y muestro "IA despertando" o "IA activada". Si la IA no responde, el backend devuelve `UNAVAILABLE` y la interfaz lo comunica sin romperse.

## Por qué las respuestas gRPC no pasan por Zod

Sigo la idea de "parsear, no validar": cada dato que cruza una frontera se convierte en un tipo confiable una sola vez, en el borde, y de ahí en adelante el código trabaja con ese tipo.

- **Las respuestas gRPC ya se parsean contra un esquema.** El código que genera `protoc-gen-es` a partir del contrato decodifica el binario de Protobuf campo por campo. Un tipo que no coincide falla al decodificar, los campos desconocidos se descartan y los que faltan toman el valor por defecto del contrato. Es un parseo en runtime contra el esquema del `.proto`, que es la única fuente de verdad. Pasar el resultado por Zod sería repetir el contrato a mano, con el riesgo de que las dos copias se desincronicen.
- **Lo que el contrato no puede saber lo reviso en el adaptador.** `lib/grpc/mappers.ts` convierte los mensajes en tipos de la app y resuelve los casos que Protobuf no distingue, como un enum en `UNSPECIFIED` o un mensaje opcional ausente.
- **Zod va en los bordes sin contrato,** donde no hay nada generado que parsee por mí:
  - las variables de entorno (`lib/grpc/env.ts`, `lib/server-config.ts`, `lib/config.ts` y `lib/demo-login.ts`);
  - lo que llega de los workers y de las otras pestañas (`lib/worker-messages.ts`), aunque los scripts sean propios. Un mensaje que no cumple se descarta: en los workers de una sola respuesta cuenta como falla y uso el respaldo; en el estado de la IA entre pestañas, simplemente lo ignoro.
- **Los demás bordes sin contrato:**
  - Los formularios pasan por los validadores de `lib/validation.ts`, con los límites de `GetClientPolicy`.
  - Las cookies de idioma y tema pasan por guardas de tipo (`isLocale`, `isTheme`) que caen al valor por defecto.
  - Los workers revisan lo que reciben con guardas de tipo, porque son JavaScript servido tal cual, sin bundler ni Zod: `isVideoFile`, `isCompressRequest`, `isReportModel` y el protocolo del Shared Worker. Un mensaje inválido recibe la respuesta de falla o se ignora, nunca se procesa a medias.

## Patrón de rendering por ruta

| Ruta | Patrón | Por qué |
|---|---|---|
| `/`, `/en` (landing) | **SSG** (`generateStaticParams` por idioma) | Es igual para todos y no depende de la sesión. Sale como HTML del build, con su metadata, `hreflang` y un solo `h1`, así es lo más rápido de servir y de indexar. |
| `/guide/jump`, `/guide/squat` y sus versiones `/en` | **ISR** (`revalidate = 3600`) | Son estáticas, pero muestran la duración y el tamaño máximos del video, que vienen de `GetClientPolicy`. Next las regenera cada hora en segundo plano. Si el backend no responde durante el build, salen sin la sección de límites: no guardo una copia local, y la siguiente regeneración la completa. |
| `/offline`, `/en/offline` | **SSG** | El Service Worker la guarda al instalarse y la muestra cuando no hay red. |
| `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml`, `/icon.svg` | **Estáticas** | Son metadatos del sitio y no cambian. |
| `/login`, `/register`, `/verify-email`, `/password-recovery` | **SSR** + Server Actions | Si ya hay sesión, redirigen a `/home`. Los formularios funcionan sin JavaScript (`<form action>`), y la validación en vivo, como los requisitos de la contraseña, es una isla de cliente. |
| `/legal/video-consent` | **SSR** | Es pública y comparte el layout de la app, que lee el idioma y el tema de la cookie. |
| `/home` | **SSR** (redirección) | Lee la sesión en el servidor y manda a la home del rol, sin parpadeo en el cliente. |
| `/athlete`, `/coach`, `/admin` y sus páginas de estadísticas, listados, equipos y deportistas | **SSR con Streaming** (`<Suspense>` + `loading.tsx`) | Son datos privados y cambian a cada rato. El encabezado sale de inmediato y cada bloque llega cuando su RPC responde, así una llamada lenta no frena la página entera. |
| `/analyses/[id]` | **Streaming SSR** + islas CSR | El resultado y las gráficas salen del servidor. El progreso en vivo (`WatchAnalysis`), el chat con respuesta en streaming y la línea de tiempo del video son islas de cliente. |
| `/analyses/new` | **SSR** + isla **CSR** | El servidor decide para quién se graba, si falta aceptar el consentimiento y qué límites aplican. La cámara, `MediaRecorder`, la lectura de metadatos y la subida directa al bucket solo existen en el navegador. |
| `/athlete/profile`, `/coach/athletes/new`, `/coach/athletes/[id]/edit`, `/onboarding`, `/account/password` | **SSR** + Server Actions | Son formularios con validación en los dos lados. Los rangos de la ficha física llegan de `GetClientPolicy`. |
| `/style-guide` y `/style-guide/screens/*` | **SSR** | Es la guía del rediseño con datos de muestra. Es pública para poder revisarla en el preview sin cuenta. La captura simulada toma su tope de `GetClientPolicy`. |
| `/system/ping` | **SSR con Streaming** | Comprueba que el transporte gRPC-Web hasta el backend funciona. |

`proxy.ts` decide qué rutas exigen sesión. Las rutas son privadas por defecto: lo que no está en la lista pública pide sesión.

## Workers: cuáles uso y por qué

Solo los uso donde hay trabajo real que sacar del hilo principal o algo que compartir entre pestañas. Todos se sirven tal cual desde `public/`, porque Turbopack no empaqueta los workers declarados con `new Worker(new URL(...))`. Los mensajes se validan en los dos sentidos: la app parsea con Zod lo que responde cada worker, y cada worker revisa con guardas de tipo lo que recibe (ver [Por qué las respuestas gRPC no pasan por Zod](#por-qué-las-respuestas-grpc-no-pasan-por-zod)). Las pruebas están en `lib/worker-messages.test.ts`; el Shared Worker, que es un script clásico, se prueba corriéndolo en `node:vm` con un puerto falso.

### Web Workers

- **`video-metadata-worker.js`: validar el video antes de subirlo.** Lee la duración, la resolución y el contenedor recorriendo las cajas de MP4/MOV (`moov → mvhd, tkhd`) o los elementos EBML de WebM, por pedazos y sin decodificar. Con esto rechazo en el cliente un video más largo que el tope de `GetClientPolicy` (hoy 40 s). Lo hago en un worker porque un archivo de 100 MB se lee por partes y la página no debe trabarse. Si el worker no entiende el archivo, recurro a `<video preload="metadata">`.
- **`avatar-worker.js`: reducir la foto de perfil.** Decodifica la foto, que puede tener varios megapíxeles, la escala con `OffscreenCanvas` y prueba calidades JPEG hasta que quepa en el tope. Si el navegador no tiene `OffscreenCanvas`, subo la original solo si ya cumple el tamaño (`lib/avatar-upload.ts`).
- **`report-worker.js`: generar el informe en PDF.** Dibuja las curvas y pagina la explicación con `pdf-lib`. Componer el PDF tarda, y en el hilo principal congelaría el botón y la animación.

### Shared Worker

- **`ai-status-worker.js`: un solo estado de la IA para todas las pestañas.** Es un caso legítimo entre pestañas: si abro la app en tres pestañas, solo una debe llamar a `WakeUpAi`, y las otras deben ver "IA despertando" o "IA activada" sin repetir la llamada. El worker guarda el estado y reparte el turno con una comparación de versión. Chrome en Android no tiene Shared Worker, así que ahí uso `BroadcastChannel` con Web Locks (`lib/ai-status/channels.ts`, patrón Strategy), y la app no sabe cuál de los dos usa.

### Service Worker

- **`sw.js`: caché de estáticos y una experiencia offline básica.**
  - Los archivos de `/_next/static/` llevan hash en el nombre, así que van con *cache first*.
  - Las páginas públicas prerenderizadas (landing y guías) van con *stale-while-revalidate*.
  - Sin red, muestro la página offline en el idioma de la ruta.

  Nunca guardo HTML con sesión, payloads RSC, Server Actions ni `/api`: solo lo que es igual para todos. Lo registro en una task aparte, después del evento `load`, para no competir con la hidratación. En desarrollo no lo registro.

## Event loop: tasks y microtasks

- **Microtasks para encadenar trabajo corto.** `lib/text-stream.ts` junta los fragmentos del chat que llegan en la misma task y los entrega en un solo `queueMicrotask`. Así corre después de todas las microtasks del lote y antes de que el navegador pinte, y React recibe un solo cambio por lote en vez de uno por fragmento.
- **Tasks para partir el trabajo largo.** Un análisis de 40 s trae unas 1300 muestras por articulación. `lib/analysis-timeline.ts` las recorre en bloques de 400 y entre bloques cede el hilo con `yieldToMain()`, que usa:
  - `scheduler.yield()` donde existe;
  - si no, `scheduler.postTask()`;
  - en el resto, un mensaje de `MessageChannel`, que agenda una task nueva sin el retraso mínimo de `setTimeout`.

  La línea de tiempo del video y el informe en PDF se arman así, sin bloquear el render.
- **`setTimeout` cuando quiero una task posterior a propósito.** El registro del Service Worker, la espera entre reintentos de `WakeUpAi` y la cuenta regresiva de "reenviar código".
- **`requestAnimationFrame`** solo para animar el medidor en vivo (`LiveGauge`), sincronizado con el pintado.

## Diseño

La identidad visual es de "laboratorio de biomecánica": cuadrícula milimetrada, esqueletos con keypoints, arcos de transportador, cronofotografías SVG propias y trayectorias del centro de gravedad. Los colores, espacios, radios y tipografías son design tokens (variables CSS que consume Tailwind). Los textos están en `lib/i18n/{es,en}.json`, los íconos en `lib/design/icons.ts`, y el modo claro y el oscuro cumplen contraste AA. Las animaciones respetan `prefers-reduced-motion`. La guía completa está en `/style-guide`.

## Cómo correrlo

Necesito Node 20+ y el backend gRPC accesible: local con Docker o el de Render.

```bash
git clone --recurse-submodules https://github.com/solartedaniers/KinesiApp-Frontend.git
cd KinesiApp-Frontend
npm install
cp .env.example .env.local   # GRPC_WEB_BASE_URL apunta al Envoy del backend
npm run dev                  # genera lib/gen/ y copia pdf-lib antes de arrancar
```

Si cambia el contrato, muevo el submódulo al tag nuevo y regenero:

```bash
git -C contracts fetch --tags && git -C contracts checkout v0.11.0
npm run generate
```

## Cuenta de demostración (solo para la evaluación)

El profesor pidió entrar rápido sin escribir credenciales. Para eso hay dos variables opcionales:

- `DEMO_LOGIN_EMAIL`
- `DEMO_LOGIN_PASSWORD`

Si están las dos, `/login` sale prellenado con esa cuenta y un aviso pequeño ("Cuenta de demostración precargada"). La persona solo da clic en **Iniciar sesión**, o puede borrar los campos y escribir otra cuenta. Si falta alguna o están vacías, el login sale vacío como siempre.

- Las lee solo la página de login, en el servidor (`lib/demo-login.ts`, validadas con Zod). No llegan al bundle del cliente ni a otras rutas.
- Un correo mal escrito hace fallar la página en vez de prellenar algo inválido.
- Nada de la cuenta está escrito en el código: vive solo en las variables de Vercel.
- **La contraseña sí llega al navegador.** Prellenar un formulario implica mandar el valor en el HTML de `/login`, así que cualquiera que abra esa página puede verla. No hay forma de prellenar sin exponerla. Lo acepté a propósito para la evaluación: lo pidió el profesor y es una cuenta solo de la app, sin relación con ningún otro servicio.
- **Se quitan cuando termine la evaluación.** Al borrarlas (o dejarlas vacías) y redesplegar, el login vuelve a su forma normal y el riesgo desaparece. Después se cambia la contraseña de esa cuenta, porque ya estuvo expuesta.

## Pruebas

```bash
npm test                            # lógica pura con node:test (validaciones, gráficas, workers, i18n...)
npx tsc --noEmit && npm run lint
npm run build                       # confirma qué rutas salen SSG, ISR o dinámicas
npx playwright install chromium firefox webkit   # una vez
npm run test:e2e                    # Chromium, Firefox, WebKit, Pixel 7 e iPhone 14 contra el build de producción
```

Las pruebas de `e2e/` levantan `next start` sobre el build y recorren las páginas públicas en los cinco navegadores. Cubren:

- la landing estática, el idioma, el tema y la ausencia de scroll horizontal en móvil;
- el movimiento reducido y la validación de formularios;
- los tres Web Workers, el Shared Worker y la página offline del Service Worker.

Leen los textos de los mismos JSON de i18n que la app, así una traducción nueva no las rompe. Con `E2E_BASE_URL=<url del preview>` corren contra Vercel.

Hay tres pruebas que se saltan a propósito, y lo dicen:

- el avatar en los dos proyectos WebKit, porque el WebKit de Playwright para Windows no trae `OffscreenCanvas` (Safari 16.4+ sí);
- el offline en Firefox, donde Playwright no corta la red dentro del Service Worker.

## Despliegue

Vercel construye cada push. Las ramas de trabajo generan un preview, y `main` va a producción.

- Las variables se definen en el proyecto de Vercel y ninguna tiene secretos. Solo `GRPC_WEB_BASE_URL` es obligatoria; las demás tienen su default documentado en `.env.example`.
  - Del servidor: `lib/grpc/env.ts` (timeouts de gRPC) y `lib/server-config.ts` (origen del sitio, tamaño de página, renovación del token).
  - Públicas (`NEXT_PUBLIC_*`, en `lib/config.ts`): zona horaria, renovación de la URL del video, espera del OTP y tiempos del estado de la IA. Next las incrusta al construir, así que cambiarlas pide redesplegar.
  - Todas pasan por Zod: un valor inválido hace fallar el arranque en vez de usarse.
  - Los límites de negocio (duración y tamaño del video, contraseña, edad, estatura, peso, chat) no son variables del frontend: llegan del backend por `GetClientPolicy`.
- Las funciones corren en `fra1` (`vercel.json`), junto al backend.
- La página del análisis declara `maxDuration = 300` porque el stream de `WatchAnalysis` con la IA en frío dura más de un minuto.
