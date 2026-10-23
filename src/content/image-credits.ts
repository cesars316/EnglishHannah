/**
 * Creditos de las fotos de terceros.
 *
 * Las licencias CC BY y CC BY-SA obligan a nombrar al autor y enlazar la
 * licencia. Esta lista es la fuente de verdad y se muestra en `/privacidad`.
 * El detalle (archivo local, recorte y conversion) esta en
 * `docs/IMAGE-CREDITS.md`.
 */
export type ImageCredit = {
  /** Palabra a la que acompaña la foto. */
  word: string;
  /** Archivo servido desde `public/images/vocabulary`. */
  file: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
};

export const IMAGE_CREDITS: readonly ImageCredit[] = [
  {
    word: "hello",
    file: "hello.webp",
    author: "Sudan Envoy (Flickr)",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sudan_Envoy_-_Shaking_Hands.jpg",
  },
  {
    word: "hi",
    file: "hi.webp",
    author: "Matthew Guitguit",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Child_waving-Rwanda.jpg",
  },
  {
    word: "goodbye",
    file: "goodbye.webp",
    author: "Jorge Royan",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Munich_-_ICE_train_Hauptbahnhof_Munich,_Germany_-_5553.jpg",
  },
  {
    word: "please",
    file: "please.webp",
    author: "Albrecht Dürer (1508)",
    license: "Dominio publico",
    licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Albrecht_D%C3%BCrer_-_Praying_Hands,_1508_-_Google_Art_Project.jpg",
  },
  {
    word: "thank you",
    file: "thank-you.webp",
    author: "MOIBARDE",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:A_student_receiving_gift_from_her_mentor.jpg",
  },
  {
    word: "sorry",
    file: "sorry.webp",
    author: "Luis Miguel Bugallo Sánchez (Lmbuga)",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:01_Tristeza.jpg",
  },
];
