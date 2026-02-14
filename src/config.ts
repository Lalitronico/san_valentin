export type LoveConfig = {
  girlfriendName: string;
  myName: string;
  anniversaryMessage: string;
  insideJokes: string[];
  dates: {
    valentine: string;
    londonStart: string;
  };
  secretCode: string;
};

export const LOVE_CONFIG: LoveConfig = {
  girlfriendName: 'Mi amor',
  myName: 'Yo',
  anniversaryMessage:
    'No pude entregarte un regalo físico esta vez, pero hice esta aventura para decirte que te amo y que cada paso nos acerca. Londres será nuestro próximo gran nivel.',
  insideJokes: [
    'Patch notes de nuestra historia: +1000 ternura, -0 paciencia contigo.',
    'Misión diaria: extrañarte un poquito y quererte muchísimo.',
    'Economía del amor: oferta ilimitada de abrazos.'
  ],
  dates: {
    valentine: '14 de febrero de 2026',
    londonStart: 'Septiembre 2026'
  },
  secretCode: 'LSE2026❤'
};
