import type { Metadata } from "next";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SITE } from "@/config/game";

export const metadata: Metadata = {
  title: "Privacidad y datos",
};

const SECTIONS = [
  {
    title: "Que guardamos",
    body: "Solo lo necesario para que el juego recuerde a cada niño: nombre o apodo, avatar, progreso (misiones, XP, monedas, insignias) e intentos de actividad. Todo se guarda en el propio dispositivo (almacenamiento local del navegador).",
  },
  {
    title: "Que NO guardamos",
    body: "No guardamos grabaciones de voz, fotos ni video. El microfono y la camara, cuando se usan, funcionan en directo y se apagan al terminar la actividad. No hay cuentas con correo, ni chat, ni publicidad y no se recogen datos de menores.",
  },
  {
    title: "Quien puede verlo",
    body: "El progreso se muestra al niño y, en la zona de adultos protegida por un codigo, a la madre, el padre o el tutor. El codigo se guarda cifrado (nunca en texto plano) y solo existe en este dispositivo.",
  },
  {
    title: "Tus decisiones",
    body: "En la zona de adultos puedes descargar una copia de los datos en un archivo, borrar el progreso de un perfil concreto o borrar todo por completo cuando quieras.",
  },
  {
    title: "Analitica y terceros",
    body: "La aplicacion no usa servicios de analitica, ni cookies de seguimiento, ni redes sociales. El audio se genera con la voz que ya trae el navegador, sin enviar texto a ningun servidor.",
  },
  {
    title: "Buscadores",
    body: "Mientras el proyecto esta en desarrollo, la aplicacion pide a los motores de busqueda que no la indexen, tambien cuando se comparta el enlace.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Transparencia"
        title="Como cuidamos los datos"
        subtitle={`${SITE.name} esta pensado para niñas y niños: por defecto, cuanta menos informacion salga del dispositivo, mejor.`}
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
