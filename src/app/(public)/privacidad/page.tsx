import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SITE } from "@/config/game";
import { IMAGE_CREDITS } from "@/content/image-credits";

export const metadata: Metadata = {
  title: "Privacidad y datos",
};

const SECTIONS = [
  {
    title: "Que guardamos",
    body: "Solo lo necesario para que el juego recuerde a cada niño: un alias o apodo (nunca el nombre real), el avatar, el progreso (misiones, XP, monedas e insignias) y los intentos de actividad. Todo se asocia a un identificador de dispositivo anonimo, no a una cuenta con datos personales.",
  },
  {
    title: "Donde se guarda",
    body: "El progreso se guarda en la base de datos del servidor de la aplicacion (MongoDB). El navegador solo recuerda, en su almacenamiento local, que perfil esta activo en este dispositivo: nada mas. Dos cookies tecnicas (httpOnly y firmadas) identifican el dispositivo y autorizan temporalmente la zona de adultos; no contienen datos del niño.",
  },
  {
    title: "Que NO guardamos",
    body: "No guardamos grabaciones de voz, fotos ni video. El microfono y la camara, cuando se usan, funcionan en directo y se apagan al terminar la actividad. No hay cuentas con correo, ni chat, ni publicidad y no se recogen datos personales de menores.",
  },
  {
    title: "Quien puede verlo",
    body: "El progreso se muestra al niño y, en la zona de adultos protegida por un codigo, a la madre, el padre o el tutor. El codigo no se guarda nunca en texto plano: se guarda cifrado (scrypt) en el servidor y sin el no se puede entrar en la zona de adultos.",
  },
  {
    title: "Tus decisiones",
    body: "En la zona de adultos puedes descargar una copia de los datos en un archivo JSON, borrar el progreso de un perfil concreto sin eliminar el perfil, o borrar todo por completo cuando quieras. Borrar un perfil elimina tambien su progreso e intentos.",
  },
  {
    title: "Analitica y terceros",
    body: "La aplicacion no usa servicios de analitica, ni cookies de seguimiento, ni redes sociales. El audio se genera con la voz que ya trae el navegador, sin enviar texto a ningun servidor. El reconocimiento de voz, si el adulto lo habilita, puede delegar el audio en el proveedor del navegador; siempre existe una alternativa manual sin microfono.",
  },
  {
    title: "Buscadores",
    body: "Mientras el proyecto esta en desarrollo, la aplicacion pide a los motores de busqueda que no la indexen, tambien cuando se comparta el enlace. La zona de adultos y los perfiles van con noindex.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transparencia"
        title="Como cuidamos los datos"
        subtitle={`${SITE.name} esta pensado para niñas y niños: cuanta menos informacion se recoge, mejor.`}
      />

      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="space-y-2">
            <h2 className="text-cream-900 text-lg font-extrabold">{section.title}</h2>
            <p className="text-cream-700 text-sm leading-relaxed">{section.body}</p>
          </Card>
        ))}
      </div>

      <Card tone="cool" className="space-y-2">
        <h2 className="text-cream-900 text-lg font-extrabold">Fotos de terceros</h2>
        <p className="text-cream-700 text-sm leading-relaxed">
          Las imágenes de `hello`, `hi`, `goodbye`, `please`, `thank you` y `sorry` provienen
          de Wikimedia Commons. Cumplimos sus términos de licencia:
        </p>
        <ul className="text-cream-700 grid gap-1 text-sm">
          {IMAGE_CREDITS.map((credit) => (
            <li key={credit.file}>
              <strong>{credit.word}</strong> ({credit.file}) —{" "}
              <a
                className="text-brand-700 underline"
                href={credit.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                {credit.author}
              </a>{" "}
              /{" "}
              <a
                className="text-brand-700 underline"
                href={credit.licenseUrl}
                target="_blank"
                rel="noreferrer"
              >
                {credit.license}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-cream-600 text-xs leading-relaxed">
          Las imágenes se han recortado a cuadrado 640x640 y convertido a WebP para optimizar
          la carga. El resto de ilustraciones son SVG originales de este proyecto.
        </p>
      </Card>

      <Card tone="cool" className="space-y-2">
        <h2 className="text-cream-900 text-lg font-extrabold">Dudas o sugerencias</h2>
        <p className="text-cream-700 text-sm leading-relaxed">
          Este es un proyecto educativo en desarrollo. Si eres docente o familia y quieres proponer
          mejoras sobre privacidad o contenido, ese es exactamente el tipo de comentario que ayuda a
          mejorar la aplicacion.
        </p>
      </Card>
    </div>
  );
}
