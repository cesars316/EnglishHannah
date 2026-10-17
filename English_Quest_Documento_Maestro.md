# ENGLISH QUEST --- Documento maestro de producto y especificación para agente de desarrollo

**Versión:** 1.0\
**Fecha:** 2026-10-16\
**Estado:** Especificación inicial para implementación por etapas\
**Repositorio/proyecto local previsto:** `C:\Proyectos\english-quest`\
**Audiencia:** agente de desarrollo autónomo (OpenCode u otro),
desarrollador responsable y propietario del producto.

------------------------------------------------------------------------

## 0. Instrucción principal para el agente

Actúa como arquitecto de software, desarrollador full-stack, diseñador
UX/UI, especialista en pruebas y responsable de documentación. Construye
una aplicación web educativa real llamada **English Quest**, destinada
inicialmente a una niña de 9 años hispanohablante que empieza inglés
desde cero y necesita progresar hacia objetivos A1.

No te limites a generar una maqueta. Entrega funcionalidades
ejecutables, persistencia real, pruebas, instrucciones para desarrollo
local y despliegue. Trabaja en incrementos pequeños, verificables y
funcionales. Antes de cambiar archivos existentes, inspecciona el
repositorio, su estado Git, versiones instaladas y convenciones
existentes. No sobrescribas trabajo previo sin entenderlo.

### Reglas de trabajo del agente

1.  Primero inspecciona el proyecto y produce
    `docs/IMPLEMENTATION_PLAN.md` y `docs/ARCHITECTURE.md`.
2.  Si el directorio está vacío, inicializa el proyecto. Si ya hay
    código, conserva lo válido y adapta el plan.
3.  No te detengas después del plan: empieza a implementar la Fase 0 y
    continúa fase por fase, informando resultados y bloqueos reales.
4.  No afirmes que una función está terminada si no está implementada y
    probada.
5.  No inventes claves, secretos, credenciales, dominios ni valores de
    producción. Crea `.env.example` con placeholders.
6.  Prioriza tecnologías gratuitas o con nivel gratuito. No introduzcas
    APIs pagas obligatorias para el funcionamiento básico.
7.  No agregues complejidad empresarial innecesaria: sin microservicios,
    CQRS ni mensajería en el MVP.
8.  Mantén tipado estricto, accesibilidad, responsive design y
    separación de responsabilidades.
9.  Todos los botones y enlaces visibles deben funcionar. Evita botones
    decorativos sin acción.
10. Usa contenido original y recursos con licencias compatibles. No
    descargues imágenes con copyright ni uses marcas/personajes de
    videojuegos conocidos.
11. No guardes grabaciones de voz, fotos ni vídeo. No implementes
    publicidad, chat público, analítica invasiva ni perfiles públicos.
12. Ante una decisión reversible, elige la opción más sencilla,
    documenta la decisión y continúa. Pregunta al propietario solo si
    existe una decisión bloqueante, un coste no autorizado o un riesgo
    de seguridad.
13. Tras cada fase ejecuta lint, pruebas y build; corrige los errores
    antes de avanzar.
14. Mantén `README.md` actualizado y registra decisiones importantes en
    `docs/adr/`.
15. No hagas despliegues ni publiques repositorios sin confirmación
    explícita del propietario.

### Definición de terminado

Una funcionalidad se considera terminada cuando: - funciona en el
navegador y se integra con el flujo principal; - tiene estados de carga,
vacío, error y éxito cuando corresponda; - valida datos en cliente y
servidor cuando aplica; - es usable con teclado y en móvil/escritorio; -
tiene pruebas automatizadas apropiadas; - no expone secretos ni datos
personales; - está documentada; - el lint, pruebas y build aplicables
pasan.

------------------------------------------------------------------------

## 1. Visión y objetivos

### 1.1 Concepto

English Quest es una aventura educativa en la que la jugadora ayuda a
reconstruir **English Island**, una isla cuyos mundos han perdido sus
palabras en inglés. Un personaje guía acompaña a la jugadora y le
propone misiones breves. Completar actividades permite recuperar
palabras, abrir zonas, decorar el avatar y ganar insignias.

La interfaz de navegación y las instrucciones de apoyo estarán en
español al inicio. Las palabras, audios, frases y diálogos de las
lecciones estarán en inglés, con traducciones y ayudas en español. La
exposición al inglés aumentará gradualmente.

### 1.2 Objetivos educativos

Desarrollar habilidades iniciales alineadas con descriptores A1 del
MCER/CEFR: - reconocer palabras y expresiones familiares en mensajes
lentos y claros; - entender vocabulario frecuente relacionado con la
persona, familia y entorno; - comprender palabras, nombres y oraciones
muy sencillas; - participar en intercambios breves si el interlocutor
habla despacio y ofrece ayuda; - formular y comprender frases sencillas
sobre información personal y necesidades concretas; - escribir palabras
y completar frases básicas.

La aplicación **no certifica oficialmente** un nivel A1. Mostrará
progreso y evidencias de práctica, no una certificación académica.

### 1.3 Principios pedagógicos

-   sesiones breves de 10--15 minutos, sin obligación de racha diaria;
-   practicar escuchar, ver, leer, recordar y hablar;
-   repetir vocabulario en diferentes contextos y días;
-   corregir con amabilidad: nunca avergonzar ni quitar puntos por
    equivocarse;
-   permitir escuchar de nuevo, pedir una pista y saltar una actividad;
-   introducir pocas palabras nuevas por sesión y repasar palabras
    anteriores;
-   premiar el esfuerzo, la constancia y la mejora, no solo la
    velocidad;
-   evitar temporizadores agresivos, vidas limitantes o penalizaciones;
-   no usar reconocimiento de voz como calificación definitiva de
    pronunciación;
-   el contenido debe ser seguro, apropiado para la edad y no recoger
    datos innecesarios.

### 1.4 Público y roles

**Estudiante:** una niña de 9 años, español como lengua de apoyo e
inglés como lengua objetivo. En el futuro se pueden soportar otros
perfiles infantiles.

**Adulto responsable:** configura el perfil, revisa el progreso,
gestiona permisos y puede activar/desactivar cámara y micrófono.

**Administrador de contenido (futuro/opcional):** gestiona mundos,
lecciones, palabras, traducciones y recursos. En el MVP, el contenido
puede vivir en JSON versionado en el repositorio y cargarse mediante
seed idempotente; no construir un CMS complejo.

------------------------------------------------------------------------

## 2. Alcance por versiones

### MVP --- primera entrega funcional

1.  Página de bienvenida y selección de perfil local o autenticación
    parental sencilla.
2.  Avatar básico y nombre visible configurable.
3.  Mapa de mundos y desbloqueo por progreso.
4.  Cuatro mundos completos: Hello, Colors, Numbers y Animals.
5.  Tarjetas de vocabulario con ilustración, palabra, traducción,
    ejemplo y audio.
6.  Cinco tipos de actividad: escuchar y elegir, elegir imagen, parejas,
    ordenar letras/palabras y completar frase.
7.  Recompensas XP, monedas virtuales, insignias y resumen de sesión.
8.  Repaso de palabras pendientes.
9.  Dashboard parental con avance, palabras practicadas y privacidad.
10. Backend API, MongoDB persistente, seed reproducible y pruebas.
11. Diseño responsive para escritorio, tableta y móvil.
12. Web Speech API para síntesis de voz cuando esté disponible; fallback
    visual y texto si no.
13. Reconocimiento de voz opcional, con detección de compatibilidad y
    alternativa manual.
14. Cámara: dejar el servicio y una primera misión de cámara para fase
    posterior si compromete el MVP. No simular reconocimiento de objetos
    que no exista.

### V1.1

-   mundos Family, Food, House y Clothes;
-   repaso espaciado configurable;
-   insignias adicionales y cosméticos;
-   mejor informe de habilidades.

### V2

-   micrófono mejorado con ejercicios de repetición y frases guiadas;
-   misiones de cámara: mostrar un objeto/color y confirmar manualmente
    la respuesta;
-   lectura de mini-historias;
-   conversaciones guiadas con personajes, sin chat abierto;
-   PWA e instalación, caché de recursos seguros y modo offline parcial.

### V3

-   mundos restantes, evaluación formativa por habilidades;
-   reconocimiento de objetos opcional y local si resulta viable;
-   integración de IA solo tras evaluación de privacidad, coste,
    consentimiento y utilidad;
-   panel de administración de contenido si realmente se necesita.

------------------------------------------------------------------------

## 3. Currículo A1 y mapa de mundos

Diseñar una ruta de 12 mundos. Cada mundo debe incluir objetivos
medibles, vocabulario, estructuras, audio, una historia breve,
ejercicios de comprensión y una misión final. La cantidad de vocabulario
indicada es orientativa y se debe evitar sobrecargar cada sesión.

  -----------------------------------------------------------------------------
  Orden             Mundo             Contenido         Estructuras/funciones
                                      principal         
  ----------------- ----------------- ----------------- -----------------------
  1                 Hello Village     hello, hi,        Hello. What's your
                                      goodbye, please,  name? My name is... How
                                      thank you, sorry, are you? I'm
                                      yes, no, name     fine/happy.

  2                 Color Forest      red, blue,        What color is it? It's
                                      yellow, green,    blue. I like red.
                                      orange, purple,   
                                      pink, black,      
                                      white, brown      

  3                 Number Beach      numbers 1--20,    How old are you? I'm
                                      age, quantities   nine. I have three...

  4                 Animal Park       dog, cat, bird,   It's a... I like... It
                                      fish, rabbit,     can run/swim/fly.
                                      horse, cow, duck, 
                                      lion, monkey      

  5                 Family Home       mother/mom,       This is my... He is/She
                                      father/dad,       is...
                                      sister, brother,  
                                      grandma, grandpa, 
                                      family            

  6                 Food Market       apple, banana,    I like/don't like...
                                      orange, bread,    Can I have...?
                                      rice, egg, milk,  
                                      water, cheese,    
                                      pizza             

  7                 My House          house, bedroom,   This is my... Where
                                      kitchen,          is...? It's in/on...
                                      bathroom, living  
                                      room, door,       
                                      window, table,    
                                      chair, bed        

  8                 Clothes Street    shirt, pants,     I'm wearing... My shirt
                                      dress, shoes,     is...
                                      socks, hat,       
                                      jacket            

  9                 Feelings Garden   happy, sad,       How are you? I'm...
                                      tired, hungry,    
                                      thirsty, scared,  
                                      excited, okay     

  10                Weather Mountain  sunny, rainy,     What's the weather
                                      cloudy, windy,    like? It's sunny.
                                      hot, cold,        
                                      weather           

  11                School & Hobbies  book, pencil,     I can... I like to...
                                      teacher, friend,  This is my...
                                      read, draw,       
                                      dance, swim,      
                                      sing, play        

  12                English Castle    repaso integrado  presentarse, responder
                                      de los mundos     preguntas sencillas,
                                      anteriores        describir objetos y
                                                        preferencias
  -----------------------------------------------------------------------------

### Requisitos para cada mundo

Cada mundo debe tener: - pantalla de introducción con personaje,
historia y objetivo; - 3--5 lecciones cortas; - 8--15 palabras nuevas
inicialmente, distribuidas por sesión; - 2--4 estructuras comunicativas,
introducidas gradualmente; - al menos una actividad de listening y una
de lectura/selección; - ejercicios de recuperación de palabras de mundos
anteriores; - una misión final sin límite de tiempo; - una insignia y un
resumen de lo aprendido; - indicador de dominio por palabra y por
habilidad; - audio con botón para repetir; - traducción disponible
mediante botón, no siempre visible si ya no se necesita; - contenido
alternativo si el audio o micrófono no está disponible.

### Ejemplo de contenido completo: mundo Colors

Objetivos: 1. reconocer ocho colores en inglés; 2. comprender "What
color is it?"; 3. responder "It's red/blue/green..."; 4. leer palabras
cortas; 5. decir al menos una frase de preferencia con ayuda.

Palabras: red, blue, yellow, green, orange, purple, pink, black, white,
brown.

Actividades: 1. **Meet the colors:** tarjetas con ilustraciones y audio.
2. **Listen and tap:** escucha "blue" y elige el objeto azul. 3. **Color
pairs:** relaciona palabra y muestra de color. 4. **Build the word:**
ordena letras de "green". 5. **Complete:** "The sun is \_\_\_." con
opciones apropiadas al contenido. 6. **Find something:** "Find something
red" como misión opcional en el entorno real. 7. **Final quest:**
secuencia de escucha, lectura y frase oral opcional.

Respuestas incorrectas: - animación amable; - "Good try! Let's listen
again."; - volver a reproducir audio; - mostrar una pista visual o
traducción; - permitir continuar sin perder XP acumulado.

------------------------------------------------------------------------

## 4. Experiencia de usuario y diseño visual

### 4.1 Dirección visual

-   ilustración 2D original, alegre, amable y consistente;
-   paleta de colores cálida y accesible; evitar saturación excesiva;
-   botones grandes, con texto e icono, adecuados a una niña;
-   tarjetas redondeadas, sombras sutiles y animaciones breves;
-   tipografía legible, alto contraste y lenguaje claro;
-   no depender solo del color para indicar correcto/incorrecto;
-   animaciones respetan `prefers-reduced-motion`;
-   los elementos de juego no deben bloquear la lectura ni ralentizar
    dispositivos modestos;
-   crear ilustraciones SVG/CSS originales o usar recursos libres con
    licencia documentada. Evitar personajes reconocibles de terceros.

### 4.2 Navegación principal

-   **Home / Adventure:** misión recomendada, progreso y botón
    "Continue".
-   **Map:** mapa de mundos desbloqueados y bloqueados.
-   **Play:** lista de actividades y repaso.
-   **My Collection:** insignias, avatar y objetos cosméticos.
-   **Parent Zone:** entrada protegida con una operación sencilla para
    adultos y, cuando haya cuentas, autenticación real.

No mostrar enlaces de administración en la navegación infantil.

### 4.3 Pantallas obligatorias

1.  Landing / bienvenida.
2.  Configuración inicial del adulto.
3.  Selección de perfil.
4.  Home del juego.
5.  Mapa de mundos.
6.  Detalle del mundo.
7.  Introducción de lección.
8.  Tarjeta de vocabulario.
9.  Pantalla de minijuego.
10. Feedback de respuesta.
11. Resumen de sesión.
12. Colección/recompensas.
13. Panel parental.
14. Ajustes de privacidad y permisos.
15. Pantalla de error y estado sin conexión.
16. Página no encontrada.

### 4.4 Comportamiento de UI

-   mostrar siempre cómo salir o volver;
-   guardar progreso tras cada actividad terminada;
-   prevenir doble envío de respuestas;
-   estados de carga con feedback comprensible;
-   al recargar la página, restaurar el progreso confirmado desde el
    backend;
-   si falla la red, no fingir que el progreso se guardó: indicar
    claramente el estado y permitir reintentar;
-   en modo invitado, advertir que el progreso puede depender del
    dispositivo si no existe cuenta;
-   evitar sonidos automáticos al cargar; audio solo tras interacción
    del usuario.

------------------------------------------------------------------------

## 5. Minijuegos reutilizables

Implementar actividades como componentes/configuraciones reutilizables,
no una pantalla distinta programada desde cero para cada palabra.

### 5.1 `listen-and-choose`

Reproduce una palabra o frase y muestra 3--4 opciones visuales. La
jugadora selecciona una.

### 5.2 `image-choice`

Muestra una instrucción o palabra ("Find the cat") y varias
ilustraciones.

### 5.3 `matching-pairs`

Relaciona palabra con imagen o audio con imagen. En móvil, usar una
interacción accesible por toque; no depender solo de arrastrar.

### 5.4 `word-builder`

Ordena letras o bloques de palabras. Añadir opción de teclado/selección,
además de drag-and-drop.

### 5.5 `sentence-completion`

Completa una oración con 2--4 opciones; dar pistas contextuales.

### 5.6 `speak-and-check`

Muestra un objetivo oral, permite reproducir ejemplo y activar
micrófono. Si el reconocimiento está disponible, compara texto
reconocido con respuestas aceptadas normalizadas. Si no está disponible
o falla, ofrecer "I said it!" y autoevaluación guiada, sin penalización.

### 5.7 `camera-hunt`

Pide encontrar un objeto o color real. En el MVP puede abrir cámara solo
después de una acción explícita, mostrar vista previa y permitir
confirmar manualmente. No almacenar ni subir la imagen. No afirmar que
el sistema detectó el objeto si no existe reconocimiento implementado.

### 5.8 `story-quiz`

Muestra/lee una historia de 3--6 frases y formula 2--4 preguntas
sencillas.

### Motor de actividad

Cada actividad debe tener: - identificador estable; - tipo; -
instrucciones en español e inglés cuando corresponda; - objetivo de
aprendizaje; - contenido y opciones; - respuesta o respuestas válidas; -
pistas; - audio opcional; - puntuación formativa; - dificultad; -
habilidades trabajadas; - telemetría educativa mínima; - orden aleatorio
controlado sin duplicar opciones; - mecanismo para volver a intentarlo.

No enviar al cliente respuestas correctas en actividades de evaluación
que requieran evitar manipulación; para el MVP familiar el riesgo es
limitado, pero el servidor debe validar los resultados que afectan
recompensas.

------------------------------------------------------------------------

## 6. Recompensas y progreso educativo

### 6.1 XP y monedas

-   completar actividad: 10 XP base;
-   responder correctamente: pequeño bonus configurable;
-   completar una lección: bonus;
-   terminar un mundo: insignia;
-   repasar una palabra difícil: recompensa por el esfuerzo;
-   no quitar XP por errores;
-   evitar recompensas por hacer clic repetidamente o enviar la misma
    respuesta.

Los valores deben centralizarse en configuración del backend, no estar
dispersos en componentes.

### 6.2 Dominio de vocabulario

Mantener, por cada usuario y palabra: - veces presentada; - respuestas
correctas/incorrectas; - última práctica; - próxima fecha sugerida; -
resultados de reconocimiento auditivo; - práctica oral
intentada/completada, si se usa; - nivel de confianza de dominio
calculado; - origen del último resultado.

Estados pedagógicos: - `new`: nunca practicada; - `learning`: está
conociéndola; - `practicing`: la reconoce algunas veces; - `review`:
necesita repetición; - `mastered`: evidencia suficiente de dominio
provisional.

No usar "mastered" tras una única respuesta correcta. Ejemplo de regla
inicial configurable: marcar dominio provisional tras 4 aciertos
distribuidos en al menos 2 sesiones y al menos 2 tipos de actividad;
bajar a repaso si hay errores posteriores. Esta regla es heurística y
debe documentarse, no presentarse como evaluación científica.

### 6.3 Repaso espaciado sencillo

Para el MVP usar una lógica sencilla y determinista: - error: proponer
repaso en la misma sesión o al día siguiente; - acierto después de un
error: repasar en 1--2 días; - varios aciertos en sesiones diferentes:
ampliar intervalo; - palabras dominadas vuelven ocasionalmente en
historias y juegos.

No introducir una librería compleja de repetición espaciada salvo
justificación.

### 6.4 Panel de progreso

Mostrar: - mundos visitados y completados; - minutos aproximados de
actividad, sin vigilar continuamente; - palabras vistas y palabras con
dominio provisional; - resumen por listening, reading, vocabulary y
speaking practice; - palabras sugeridas para repaso; - actividades
recientes; - insignias obtenidas.

No mostrar ranking público, comparación con otros niños ni puntuaciones
que avergüencen.

------------------------------------------------------------------------

## 7. Micrófono, voz y cámara

### 7.1 Texto a voz

Implementar una abstracción `SpeechService` con: -
`speak(text, language='en-US')`; - `stop()`; - `isSupported()`; -
control de velocidad moderadamente lenta; - manejo de ausencia de
voces; - botón para repetir y botón para detener; - fallback a audio
pregrabado cuando exista; - no asumir que la voz exacta existe en todos
los sistemas.

Puede utilizarse `window.speechSynthesis` como primera implementación.
Probar en los navegadores objetivo.

### 7.2 Reconocimiento de voz

Implementar una abstracción `SpeechRecognitionService`, sin acoplar la
UI a una implementación de navegador: - detectar `SpeechRecognition` y
`webkitSpeechRecognition`; - establecer idioma `en-US`; - mostrar estado
"Listening..."; - permitir cancelar; - detener al abandonar la
pantalla; - controlar errores de permisos, falta de dispositivo, timeout
y ausencia de soporte; - normalizar mayúsculas, puntuación y espacios; -
aceptar variaciones declaradas en el contenido; - no exponer el
transcript a otras pantallas ni persistir audio; - permitir repetir sin
límite; - fallback manual siempre disponible.

La API de reconocimiento tiene soporte desigual entre navegadores y
puede enviar audio a servicios remotos del proveedor. No prometer
procesamiento local ni privacidad absoluta. Mostrar aviso parental claro
y mantener el uso de micrófono opcional. La función principal del juego
debe servir aunque no exista reconocimiento.

### 7.3 Cámara

Usar `navigator.mediaDevices.getUserMedia({ video: true })` solo tras
pulsar una acción explícita. Requisitos: - HTTPS en despliegue y
`localhost` en desarrollo; - mostrar por qué se solicita el permiso; -
indicador visible de cámara activa; - botón de apagar/cerrar que libere
todas las pistas (`track.stop()`); - no tomar fotos automáticamente; -
no enviar ni guardar imagen; - no activar cámara en segundo plano; -
fallback: completar la misión señalando el objeto fuera de cámara o
eligiendo entre ilustraciones; - gestionar permiso denegado, cámara
ausente y error de dispositivo.

### 7.4 Seguridad infantil y privacidad

-   no guardar audio, fotos ni vídeo por defecto;
-   no utilizar voz o cámara para identificación biométrica;
-   no recopilar ubicación;
-   no publicar nombre completo ni datos de escuela;
-   permitir alias;
-   recoger solo datos necesarios para progreso;
-   página de privacidad clara en español;
-   el adulto puede borrar el perfil y su progreso;
-   no integrar publicidad ni rastreadores de terceros;
-   documentar que la función de reconocimiento puede depender de un
    proveedor de navegador;
-   no permitir acceso a zona parental desde un botón infantil sin
    verificación;
-   antes de añadir proveedores externos de IA/voz, revisar términos,
    transferencias de datos y consentimiento.

------------------------------------------------------------------------

## 8. Stack técnico

### 8.1 Stack elegido para el MVP

Priorizar velocidad de desarrollo, coste bajo y facilidad de operación.
El stack recomendado es:

-   **Frontend:** Next.js + React + TypeScript.
-   **Estilos:** Tailwind CSS y componentes propios accesibles.
-   **Validación:** Zod en formularios y contratos de API.
-   **Backend:** Next.js Route Handlers como API inicial, con separación
    por módulos/casos de uso.
-   **Persistencia:** MongoDB Atlas Free si el plan vigente y la región
    lo permiten.
-   **ODM/driver:** MongoDB Node.js driver o Mongoose; elegir uno solo.
    Preferencia inicial: driver oficial para mantener el modelo
    explícito y evitar magia innecesaria.
-   **Autenticación:** no exigir OAuth para jugar localmente. Diseñar
    una zona parental protegida. Si se incorpora Google OAuth, hacerlo
    mediante Auth.js y validar los cambios recientes de
    configuración/proveedor.
-   **Audio:** Web Speech API y archivos de audio propios/libres.
-   **Pruebas unitarias:** Vitest.
-   **Pruebas de componentes:** React Testing Library.
-   **Pruebas E2E:** Playwright.
-   **Calidad:** ESLint, Prettier y TypeScript estricto.
-   **Control de versiones:** Git + GitHub.
-   **Despliegue web:** Vercel Hobby u otro hosting gratuito compatible,
    revisando condiciones vigentes antes de publicar.
-   **Recursos estáticos:** recursos versionados en el repositorio al
    principio; CDN/S3 solo si se justifica.
-   **CI:** GitHub Actions para lint, test y build.

No agregar .NET al MVP porque la opción Next.js full-stack evita
mantener y pagar dos servicios de backend separados. Si más adelante se
requiere una API .NET, puede extraerse a ASP.NET Core sin cambiar el
contrato de API pública.

### 8.2 Reglas de arquitectura

-   modular monolith, no microservicios;
-   UI separada de lógica de negocio;
-   acceso a MongoDB solo desde servidor;
-   rutas API finas, lógica en servicios/casos de uso;
-   validación de entrada en servidor;
-   repositorios para persistencia cuando aporten valor;
-   DTOs explícitos y contratos compartidos;
-   errores con formato uniforme;
-   variables de entorno validadas al arrancar;
-   seed idempotente;
-   migraciones/cambios de esquema documentados;
-   dependencias fijadas mediante lockfile;
-   no guardar secretos en Git.

### 8.3 Estructura propuesta

``` text
english-quest/
├── public/
│   ├── images/
│   ├── audio/
│   ├── icons/
│   └── manifest.webmanifest
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (game)/
│   │   ├── parent/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── game/
│   │   ├── map/
│   │   ├── vocabulary/
│   │   └── parent/
│   ├── features/
│   │   ├── auth/
│   │   ├── worlds/
│   │   ├── lessons/
│   │   ├── activities/
│   │   ├── progress/
│   │   ├── rewards/
│   │   ├── speech/
│   │   └── camera/
│   ├── server/
│   │   ├── db/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── use-cases/
│   │   ├── auth/
│   │   └── validation/
│   ├── content/
│   │   ├── worlds/
│   │   ├── lessons/
│   │   ├── vocabulary/
│   │   └── activities/
│   ├── lib/
│   └── types/
├── scripts/
│   ├── seed.ts
│   └── validate-content.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── CONTENT_GUIDE.md
│   ├── PRIVACY.md
│   └── adr/
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── ...
```

La estructura es una guía. El agente puede ajustarla si explica el
motivo y mantiene los límites entre UI, dominio y persistencia.

------------------------------------------------------------------------

## 9. MongoDB: modelo de datos

No almacenar todo el contenido de lecciones repetido en cada perfil. El
contenido base se versiona en JSON/TypeScript y MongoDB guarda progreso,
perfil y estado de juego. El seed puede importar contenido a MongoDB si
se necesita administración dinámica; escoger una única fuente de verdad
por tipo de dato y documentarla.

### 9.1 Colecciones iniciales

#### `profiles`

``` json
{
  "_id": "ObjectId",
  "ownerId": "id-del-adulto-o-id-local",
  "displayName": "Explorer",
  "avatarId": "fox-explorer",
  "locale": "es-CO",
  "targetLanguage": "en-US",
  "createdAt": "ISODate",
  "updatedAt": "ISODate",
  "settings": {
    "microphoneEnabled": false,
    "cameraEnabled": false,
    "soundEnabled": true,
    "reducedMotion": false
  }
}
```

No pedir apellido, escuela, fecha de nacimiento exacta, ubicación ni
otros datos innecesarios. El nombre visible debe poder ser un alias.

#### `worlds`

``` json
{
  "_id": "hello-village",
  "title": { "es": "Pueblo Hola", "en": "Hello Village" },
  "order": 1,
  "description": { "es": "Aprende a saludar y presentarte." },
  "level": "pre-A1/A1",
  "prerequisites": [],
  "lessonIds": ["hello-01", "hello-02", "hello-03"],
  "badgeId": "hello-star",
  "contentVersion": 1,
  "published": true
}
```

#### `lessons`

``` json
{
  "_id": "hello-01",
  "worldId": "hello-village",
  "order": 1,
  "title": { "es": "¡Hola!", "en": "Hello!" },
  "objectives": ["Recognize greetings", "Say hello"],
  "vocabularyIds": ["hello", "hi", "goodbye", "please", "thank-you"],
  "activityIds": ["hello-listen-01", "hello-choice-01"],
  "estimatedMinutes": 8,
  "contentVersion": 1,
  "published": true
}
```

#### `vocabulary`

``` json
{
  "_id": "dog",
  "worldId": "animal-park",
  "word": "dog",
  "translation": "perro",
  "partOfSpeech": "noun",
  "phonetic": "dawg",
  "image": "/images/vocabulary/dog.svg",
  "audio": "/audio/en-us/dog.mp3",
  "example": {
    "en": "It's a dog.",
    "es": "Es un perro."
  },
  "acceptedAnswers": ["dog", "a dog"],
  "tags": ["animals", "beginner"],
  "contentVersion": 1
}
```

La transcripción fonética simplificada es una ayuda orientativa, no debe
presentarse como transcripción IPA si no lo es. El contenido debe
revisarse lingüísticamente.

#### `activities`

``` json
{
  "_id": "animals-listen-01",
  "worldId": "animal-park",
  "lessonId": "animals-01",
  "type": "listen-and-choose",
  "skill": "listening",
  "prompt": {
    "es": "Escucha y elige el animal correcto.",
    "en": "Listen and choose."
  },
  "stimulus": {
    "type": "audio",
    "value": "/audio/en-us/dog.mp3"
  },
  "options": [
    { "id": "dog", "image": "/images/vocabulary/dog.svg" },
    { "id": "cat", "image": "/images/vocabulary/cat.svg" },
    { "id": "fish", "image": "/images/vocabulary/fish.svg" }
  ],
  "answerKey": { "optionId": "dog" },
  "hints": [{ "es": "Piensa en el animal que dice el audio." }],
  "xp": 10,
  "contentVersion": 1
}
```

Si se guarda en MongoDB, la API pública no debe devolver `answerKey`
antes de responder. En un repositorio de contenido estático, reconocer
que un cliente puede inspeccionar el bundle y no confiar en él para
recompensas de alto valor.

#### `progress`

``` json
{
  "_id": "ObjectId",
  "profileId": "profile-id",
  "entityType": "vocabulary",
  "entityId": "dog",
  "status": "learning",
  "seenCount": 3,
  "correctCount": 2,
  "incorrectCount": 1,
  "activityTypesCompleted": ["image-choice", "listen-and-choose"],
  "lastPracticedAt": "ISODate",
  "nextReviewAt": "ISODate",
  "masteryScore": 0.55,
  "updatedAt": "ISODate"
}
```

#### `activityAttempts`

``` json
{
  "_id": "ObjectId",
  "profileId": "profile-id",
  "activityId": "animals-listen-01",
  "skill": "listening",
  "isCorrect": true,
  "attemptNumber": 1,
  "durationMs": 5200,
  "hintUsed": false,
  "xpAwarded": 10,
  "createdAt": "ISODate"
}
```

No almacenar audio, transcripciones de voz identificables ni imágenes.
En ejercicios de habla, guardar solo el resultado mínimo (p. ej.,
completado/no completado) salvo que se apruebe una necesidad concreta.

#### `gameState`

``` json
{
  "_id": "profile-id",
  "xp": 250,
  "coins": 42,
  "currentWorldId": "color-forest",
  "unlockedWorldIds": ["hello-village", "color-forest"],
  "completedLessonIds": ["hello-01"],
  "earnedBadgeIds": ["first-steps"],
  "lastActivityAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### 9.2 Índices

-   `profiles.ownerId`;
-   `progress`: índice único compuesto
    `{ profileId, entityType, entityId }`;
-   `activityAttempts`: `{ profileId, createdAt: -1 }`;
-   `activityAttempts`: `{ profileId, activityId }`;
-   `lessons`: `{ worldId, order }` si se consulta dinámicamente;
-   `vocabulary`: `{ worldId }` si se consulta dinámicamente.

Evitar índices innecesarios en un clúster gratuito. Documentar índices
en el inicializador y hacerlos idempotentes.

### 9.3 Validación de contenido

Crear `scripts/validate-content.ts` para comprobar: - IDs únicos; -
referencias a mundos, lecciones, palabras, imágenes y audios
existentes; - respuesta correcta presente en opciones; - traducciones e
instrucciones requeridas; - no hay rutas de recursos inexistentes; - los
mundos y lecciones tienen orden válido; - no hay respuestas aceptadas
vacías; - el contenido está bien formado antes del seed.

------------------------------------------------------------------------

## 10. API y contratos

Usar prefijo `/api/v1`. JSON como formato de intercambio. Los nombres
definitivos se documentan en `docs/API.md`.

### Endpoints mínimos

  -----------------------------------------------------------------------------------------
  Método                  Ruta                                      Función
  ----------------------- ----------------------------------------- -----------------------
  GET                     `/api/v1/health`                          Estado de la app y
                                                                    disponibilidad básica
                                                                    de DB sin revelar
                                                                    secretos

  POST                    `/api/v1/profiles`                        Crear perfil infantil
                                                                    con datos mínimos

  GET                     `/api/v1/profiles/:profileId`             Consultar perfil
                                                                    autorizado

  PATCH                   `/api/v1/profiles/:profileId/settings`    Actualizar ajustes
                                                                    permitidos

  GET                     `/api/v1/worlds`                          Listar mundos y estado
                                                                    de desbloqueo

  GET                     `/api/v1/worlds/:worldId`                 Obtener detalle del
                                                                    mundo

  GET                     `/api/v1/lessons/:lessonId`               Obtener lección y
                                                                    actividades sin claves
                                                                    de respuesta

  POST                    `/api/v1/activities/:activityId/answer`   Validar respuesta y
                                                                    registrar intento

  POST                    `/api/v1/lessons/:lessonId/complete`      Marcar lección
                                                                    terminada y otorgar
                                                                    recompensa idempotente

  GET                     `/api/v1/profiles/:profileId/progress`    Consultar progreso
                                                                    agregado

  GET                     `/api/v1/profiles/:profileId/review`      Obtener
                                                                    actividades/palabras
                                                                    para repasar

  GET                     `/api/v1/profiles/:profileId/rewards`     Obtener XP, monedas e
                                                                    insignias

  DELETE                  `/api/v1/profiles/:profileId`             Eliminar perfil y datos
                                                                    asociados, con
                                                                    autorización parental
  -----------------------------------------------------------------------------------------

### Formato de respuesta

Éxito:

``` json
{
  "data": {},
  "meta": {
    "requestId": "correlation-id"
  }
}
```

Error:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisa la información e inténtalo de nuevo.",
    "details": []
  },
  "meta": {
    "requestId": "correlation-id"
  }
}
```

No incluir stack traces, consultas, credenciales ni datos sensibles en
respuestas al cliente.

### Seguridad de API

-   validar parámetros, body y tamaño de petición;
-   rate limiting básico en endpoints sensibles;
-   verificar autorización y pertenencia del perfil en todas las
    operaciones;
-   no confiar en `profileId` enviado por cliente sin comprobar el
    permiso;
-   operaciones de recompensa idempotentes;
-   proteger creación/borrado de perfiles;
-   CORS restrictivo si la API se separa del frontend;
-   cookies seguras si se usa sesión;
-   CSRF según mecanismo de autenticación;
-   sanitizar contenido de texto que se renderiza;
-   no registrar tokens ni datos de voz/cámara.

------------------------------------------------------------------------

## 11. Autenticación y modo de uso

### MVP local/familiar

El producto debe ser sencillo de probar. El agente debe elegir una de
estas opciones tras inspeccionar el estado actual: - modo local de un
solo perfil, con identificador generado y persistencia de servidor; - o
zona parental autenticada y perfiles ligados al adulto.

No almacenar contraseñas en texto plano. No simular seguridad con un PIN
fijo visible en el código.

Si se añade Google OAuth: - usar Auth.js con proveedor Google; - guardar
secretos solo en variables de entorno; - validar URLs callback y
variables; - restringir la zona parental a usuarios autorizados; - nunca
exponer datos de perfiles infantiles entre cuentas; - documentar cómo
crear credenciales OAuth; - permitir seguir jugando sin Google cuando
sea razonable.

Para despliegue público multiusuario, no usar un `ownerId` enviado
libremente por el navegador como control de acceso. La identidad debe
proceder de la sesión autenticada. El modo local sin login debe estar
limitado al entorno local o diseñarse explícitamente como almacenamiento
local, no como cuenta segura en un servidor público.

------------------------------------------------------------------------

## 12. Seguridad, privacidad y cumplimiento

Crear `docs/PRIVACY.md` con: - datos recogidos y propósito; - dónde se
guardan; - periodo de conservación; - procedimiento de borrado; -
dependencias de terceros; - uso del micrófono y cámara; - limitaciones
de reconocimiento de voz; - opciones de consentimiento y
desactivación; - recomendaciones para despliegue público.

Controles mínimos: - `.env` fuera de Git; - `.env.example` sin
secretos; - cabeceras de seguridad razonables; - Content Security Policy
evaluada y documentada; - HTTPS en producción; - dependencias
auditadas; - control de acceso a endpoints; - logs sin datos infantiles
innecesarios; - no indexar perfiles ni panel parental por motores de
búsqueda; - no usar cookies publicitarias ni trackers; - endpoint de
borrado que elimine los documentos relacionados; - política de respaldo
y borrado consistente con el proveedor.

No afirmar cumplimiento legal automático. Antes de abrir el producto a
otros niños o hacerlo público, revisar las obligaciones aplicables a
protección de datos de menores en Colombia y las condiciones del
hosting, MongoDB y cualquier proveedor de voz.

------------------------------------------------------------------------

## 13. Accesibilidad y calidad

-   HTML semántico;
-   navegación por teclado;
-   foco visible;
-   textos alternativos para imágenes significativas;
-   controles con etiquetas accesibles;
-   subtítulos/transcripción textual para audio de aprendizaje;
-   no usar únicamente audio para transmitir una instrucción;
-   contraste legible;
-   objetivos táctiles amplios;
-   no depender exclusivamente de arrastrar;
-   respetar `prefers-reduced-motion`;
-   avisos de error comprensibles;
-   soporte mínimo para viewport de 360 px de ancho;
-   probar en Chrome y Edge de escritorio, además de un navegador móvil
    cuando sea posible.

------------------------------------------------------------------------

## 14. Estrategia de pruebas

### Unitarias

-   normalización de respuestas;
-   cálculo de XP y monedas;
-   regla de desbloqueo;
-   cálculo de dominio provisional;
-   selección de repaso;
-   validación de contenido;
-   validadores Zod;
-   reglas de idempotencia.

### Integración

-   acceso a MongoDB con base de pruebas;
-   creación y lectura de perfil;
-   registrar respuesta correcta e incorrecta;
-   evitar doble recompensa por repetir petición;
-   bloquear acceso a perfil ajeno;
-   eliminar perfil y datos asociados;
-   endpoint de salud sin exponer configuración.

### E2E Playwright

1.  primera visita y creación/selección de perfil;
2.  navegar al primer mundo;
3.  abrir tarjeta de vocabulario y reproducir audio;
4.  completar una actividad correctamente;
5.  responder incorrectamente y recibir pista amable;
6.  completar una lección y obtener recompensa una sola vez;
7.  recargar página y verificar persistencia;
8.  abrir panel parental autorizado;
9.  comprobar layout móvil;
10. verificar fallback de micrófono sin soporte;
11. denegar permiso de cámara y comprobar fallback;
12. borrar perfil con autorización.

### Criterios de calidad

-   TypeScript estricto sin errores;
-   lint y build pasan;
-   pruebas principales pasan en CI;
-   no hay errores de consola en flujos críticos;
-   no existen enlaces/botones rotos;
-   el contenido se valida antes de desplegar;
-   secretos y `.env` no están en Git;
-   README permite levantar el proyecto siguiendo pasos desde cero.

------------------------------------------------------------------------

## 15. Despliegue y coste

### Desarrollo local

-   Node.js LTS compatible con la versión elegida de Next.js;
-   npm y lockfile;
-   MongoDB Atlas Free si está disponible para el usuario, o MongoDB
    local para desarrollo;
-   `.env.local` ignorado por Git;
-   comandos `npm install`, `npm run dev`, `npm run lint`,
    `npm run test`, `npm run build`, `npm run seed` claramente
    documentados.

El usuario usa Windows y anteriormente ha utilizado Node 24.21.0 y npm
11.19.0. Comprueba compatibilidad real antes de fijar `engines`; no
degradar ni cambiar versiones instaladas sin explicar el motivo.

### Variables de entorno de ejemplo

``` dotenv
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
MONGODB_DB=english_quest
AUTH_SECRET=replace-with-a-long-random-secret
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
APP_BASE_URL=http://localhost:3000
```

Las variables de OAuth son opcionales si no se activa el proveedor.
Validar configuración al arrancar según el modo. Nunca usar credenciales
reales en este archivo.

### Despliegue

-   GitHub como repositorio;
-   Vercel Hobby o alternativa equivalente compatible;
-   MongoDB Atlas Free;
-   CI GitHub Actions;
-   HTTPS;
-   secretos definidos en la plataforma, no en archivos;
-   verificar límites, políticas de uso y condiciones comerciales
    vigentes antes de usar un plan gratuito;
-   no publicar hasta autorización explícita del propietario.

------------------------------------------------------------------------

## 16. Observabilidad y métricas útiles

Medir solo lo que ayuda a mejorar aprendizaje y fiabilidad: - lecciones
iniciadas/completadas; - palabras practicadas; - aciertos por tipo de
actividad; - palabras que requieren repaso; - tasa de error de API; -
latencia de endpoints; - fallos de audio/micrófono/cámara por tipo de
error, sin capturar datos personales; - errores de persistencia.

No incorporar analítica invasiva ni rastreo publicitario. En el MVP,
métricas agregadas del panel parental y logs técnicos bastan. No
optimizar el producto por "tiempo de pantalla"; optimizar por
aprendizaje, autonomía y experiencia positiva.

------------------------------------------------------------------------

## 17. Contenido inicial obligatorio

El agente debe implementar datos suficientes para que el MVP no parezca
vacío.

### Mundo 1: Hello Village

Palabras/frases: - hello, hi, goodbye, please, thank you, sorry, yes,
no; - What's your name? - My name is... - How are you? - I'm fine. - I'm
happy.

Actividades: - escuchar saludo y elegir personaje; - relacionar palabra
con situación; - completar "My name \_\_\_ Alex"; - ordenar "Hello, my
name is Sam"; - diálogo guiado con opciones.

### Mundo 2: Color Forest

Palabras: red, blue, yellow, green, orange, purple, pink, black, white,
brown.

Actividades: - escuchar y elegir color; - relacionar palabra y color; -
ordenar letras; - completar "The banana is yellow"; - misión "Find
something red" sin obligación de usar cámara.

### Mundo 3: Number Beach

Números 1--20, edad y cantidades.

Actividades: - escuchar número; - contar objetos; - elegir el número
correcto; - completar "I have three apples"; - preguntar "How old are
you?" con respuestas predefinidas, sin exigir información personal real.

### Mundo 4: Animal Park

Palabras: dog, cat, bird, fish, rabbit, horse, cow, duck, lion, monkey.

Actividades: - escuchar sonido o palabra y seleccionar animal; -
emparejar palabra e imagen; - "It's a..."; - "I like..."; - historia
breve y quiz; - misión final de cinco preguntas mezclando listening,
lectura y vocabulario.

Cada palabra debe tener: - traducción; - imagen local; - audio real o
fallback TTS; - ejemplo corto; - respuestas aceptadas si aplica; - tags
de mundo; - fuente/licencia del recurso; - objetivo pedagógico.

------------------------------------------------------------------------

## 18. Historias y personajes

Crear personajes originales: - **Pip:** zorro explorador que guía las
misiones; - **Mia:** niña exploradora ficticia que modela frases; -
**Bloop:** criatura amistosa que representa retos, nunca un enemigo
intimidante; - habitantes propios de cada mundo.

Las frases de los personajes deben ser cortas, naturales y A1. El
español sirve de apoyo, no debe reemplazar continuamente al inglés. No
usar datos de la niña para construir historias públicas. El nombre
visible es opcional y editable.

------------------------------------------------------------------------

## 19. Plan de ejecución para OpenCode

Trabaja en las siguientes fases y no intentes generar toda la aplicación
en un único cambio masivo.

### Fase 0 --- Inspección y plan

-   inspeccionar directorio, Git, Node, package manager y archivos
    existentes;
-   crear plan de implementación, arquitectura y ADR de stack;
-   identificar variables y dependencias;
-   confirmar que no se sobrescribe trabajo existente.

**Entregable:** plan documentado, decisiones registradas y lista de
tareas.

### Fase 1 --- Fundación

-   crear Next.js + TypeScript;
-   configurar estilos, lint, format y tests;
-   layout responsive y sistema visual;
-   páginas de bienvenida, home, mapa y error;
-   componentes reutilizables;
-   CI básica.

**Aceptación:** aplicación arranca, build/lint/tests pasan y las rutas
principales son navegables.

### Fase 2 --- Contenido y juego

-   definir esquema tipado de contenido;
-   implementar validación de contenido;
-   añadir cuatro mundos y sus lecciones;
-   construir motor reutilizable de minijuegos;
-   implementar audio TTS con fallback;
-   crear feedback y navegación de misión.

**Aceptación:** se puede completar una lección sin backend y el
contenido no contiene referencias rotas.

### Fase 3 --- Backend y persistencia

-   conectar MongoDB desde servidor;
-   crear repositorios/servicios/casos de uso;
-   implementar API v1;
-   seed idempotente e índices;
-   persistir perfiles, intentos, progreso y recompensas;
-   validar autorización y evitar doble recompensa.

**Aceptación:** al recargar, el progreso permanece; integración probada;
la API no filtra respuestas correctas antes de contestar cuando se
requiere validación server-side.

### Fase 4 --- Progreso y panel parental

-   desbloqueo de mundos;
-   XP, monedas e insignias;
-   repaso recomendado;
-   panel de progreso;
-   privacidad, exportación/borrado según alcance;
-   protección parental.

**Aceptación:** estadísticas coherentes con intentos reales y zona
parental no accesible a un perfil infantil sin control.

### Fase 5 --- Voz y cámara

-   TTS;
-   reconocimiento de voz con detección de soporte;
-   fallback manual;
-   permisos y estados de error;
-   misión de cámara con vista previa temporal;
-   cierre correcto de dispositivos.

**Aceptación:** el juego sigue funcionando cuando permisos se niegan o
APIs no están disponibles; no se almacenan grabaciones ni fotos.

### Fase 6 --- Calidad y despliegue

-   completar pruebas unitarias, integración y E2E;
-   revisar accesibilidad y responsive;
-   revisar dependencias y seguridad;
-   README completo;
-   pipeline CI;
-   instrucciones de despliegue;
-   no desplegar sin aprobación del propietario.

**Aceptación:** build limpio, pruebas críticas verdes, guía reproducible
y lista de limitaciones conocidas.

### Fase 7 --- Expansión de contenido

-   mundos 5--12;
-   historias y repaso espaciado;
-   más actividades;
-   ajuste de dificultad a partir del progreso;
-   PWA/offline parcial si es viable.

**Aceptación:** cada mundo tiene objetivos, contenido revisado y
actividades diversas; la aplicación no presenta contenido vacío o
duplicado como avance.

------------------------------------------------------------------------

## 20. Instrucción de inicio para el agente

Empieza ahora con este procedimiento:

1.  Inspecciona `C:\Proyectos\english-quest`, sin borrar ni reemplazar
    archivos.
2.  Resume brevemente qué existe, qué versiones de Node/npm están
    disponibles y qué falta.
3.  Crea o actualiza `docs/IMPLEMENTATION_PLAN.md`,
    `docs/ARCHITECTURE.md` y `docs/adr/0001-stack.md`.
4.  Si no existe una aplicación funcional, inicializa Next.js con
    TypeScript estricto y el stack definido.
5.  Implementa primero una experiencia vertical completa: bienvenida →
    mapa → mundo Colors → tarjeta de vocabulario → minijuego → feedback
    → recompensa.
6.  Después conecta MongoDB y persiste progreso real.
7.  Ejecuta pruebas y build tras cada incremento; corrige fallos antes
    de seguir.
8.  Mantén un checklist actualizado en `docs/IMPLEMENTATION_PLAN.md`.
9.  Al finalizar cada fase, reporta: archivos principales
    creados/modificados, funcionalidades completadas, comandos
    ejecutados, resultados de pruebas, limitaciones y siguiente fase.
10. No te limites a explicar cómo se haría: realiza el trabajo en el
    repositorio usando las herramientas disponibles.

**Primera entrega funcional obligatoria:** la ruta de Colors debe poder
jugarse de principio a fin y guardar su progreso de forma persistente
antes de ampliar el contenido a los otros mundos.

------------------------------------------------------------------------

## 21. Checklist de aceptación final

-   [ ] El proyecto se instala desde cero siguiendo README.
-   [ ] El desarrollo local funciona en Windows.
-   [ ] La interfaz es responsive y amigable para una niña de 9 años.
-   [ ] Existen los cuatro mundos MVP con contenido real.
-   [ ] Las tarjetas muestran palabra, traducción, ejemplo e imagen.
-   [ ] El audio se reproduce o se ofrece un fallback claro.
-   [ ] Los cinco minijuegos MVP son funcionales.
-   [ ] Las respuestas incorrectas generan ayuda amable.
-   [ ] XP y recompensas no se duplican con reintentos HTTP.
-   [ ] Los mundos se desbloquean según reglas reales.
-   [ ] MongoDB persiste progreso.
-   [ ] El panel parental muestra información útil y real.
-   [ ] El perfil y sus datos se pueden borrar con autorización.
-   [ ] El micrófono es opcional y tiene fallback.
-   [ ] La cámara es opcional, se activa explícitamente y se apaga al
    salir.
-   [ ] No se almacenan audio, fotos ni vídeo.
-   [ ] Los secretos no están versionados.
-   [ ] Validación de contenido y pruebas automatizadas funcionan.
-   [ ] Lint, tests y build pasan.
-   [ ] README, arquitectura, API y privacidad están documentados.
-   [ ] No hay despliegue público sin autorización.

------------------------------------------------------------------------

## 22. Referencias técnicas para verificar antes de implementar

-   CEFR / Consejo de Europa, descriptores:
    https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors
-   MDN Web Speech API (síntesis y reconocimiento, compatibilidad y
    limitaciones):
    https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
-   MDN `getUserMedia()` (HTTPS, permisos y privacidad):
    https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
-   Next.js documentación oficial: https://nextjs.org/docs
-   MongoDB documentación oficial: https://www.mongodb.com/docs/
-   Playwright documentación oficial: https://playwright.dev/docs/intro

Verificar documentación y condiciones de los servicios en el momento de
implementar; no asumir que la disponibilidad, los precios o los límites
gratuitos permanecen constantes.
