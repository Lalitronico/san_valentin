import type { EncounterKey } from '../state';
import { GRID_H, GRID_W } from '../constants';

export type NpcData = {
  id: string;
  name: string;
  x: number;
  y: number;
  lines: string[];
  spriteKey?: string;
};

export type MemoryData = {
  id: string;
  x: number;
  y: number;
  description: string;
};

export type EncounterData = {
  key: EncounterKey;
  title: string;
  x: number;
  y: number;
  intro: string;
  options: { label: string; value: string; bonus: number; response: string }[];
};

export type SignData = {
  id: string;
  x: number;
  y: number;
  lines: string[];
  spriteKey?: string;
};

export type ExitData = {
  x: number;
  y: number;
  w: number;
  h: number;
  to: string;
  requiredLove?: number;
  requiredMemories?: number;
  requiredEncounters?: number;
  requiresFlag?: 'reunionUnlocked';
  lockedText?: string;
};

export type WorldData = {
  label: string;
  tiles: number[][];
  blocked: Set<string>;
  spawn: { x: number; y: number };
  npcs: NpcData[];
  memories: MemoryData[];
  encounters: EncounterData[];
  signs: SignData[];
  exits: ExitData[];
};

const keyOf = (x: number, y: number): string => `${x},${y}`;

const createBase = (): { tiles: number[][]; blocked: Set<string> } => {
  const tiles = Array.from({ length: GRID_H }, () => Array.from({ length: GRID_W }, () => 0));
  const blocked = new Set<string>();

  for (let x = 0; x < GRID_W; x += 1) {
    tiles[0][x] = 9;
    tiles[GRID_H - 1][x] = 9;
    blocked.add(keyOf(x, 0));
    blocked.add(keyOf(x, GRID_H - 1));
  }

  for (let y = 0; y < GRID_H; y += 1) {
    tiles[y][0] = 9;
    tiles[y][GRID_W - 1] = 9;
    blocked.add(keyOf(0, y));
    blocked.add(keyOf(GRID_W - 1, y));
  }

  return { tiles, blocked };
};

const blockRect = (tiles: number[][], blocked: Set<string>, x0: number, y0: number, x1: number, y1: number, tileType: number): void => {
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      tiles[y][x] = tileType;
      blocked.add(keyOf(x, y));
    }
  }
};

const setTile = (tiles: number[][], x: number, y: number, tileType: number, blocked: Set<string>, isBlocked: boolean): void => {
  tiles[y][x] = tileType;
  if (isBlocked) blocked.add(keyOf(x, y));
  else blocked.delete(keyOf(x, y));
};

const buildCrossRoad = (tiles: number[][], blocked: Set<string>, centerX: number, centerY: number): void => {
  // Horizontal road with sidewalks
  for (let x = 2; x <= 30; x += 1) {
    setTile(tiles, x, centerY, 8, blocked, false);
    setTile(tiles, x, centerY - 1, 1, blocked, false);
    setTile(tiles, x, centerY + 1, 1, blocked, false);
  }
  // Vertical road with sidewalks (road-v = 10)
  for (let y = 2; y <= 15; y += 1) {
    setTile(tiles, centerX, y, 10, blocked, false);
    setTile(tiles, centerX - 1, y, 1, blocked, false);
    setTile(tiles, centerX + 1, y, 1, blocked, false);
  }
  // Fix intersection: center = intersection tile (11), restore horizontal road
  setTile(tiles, centerX, centerY, 11, blocked, false);
  setTile(tiles, centerX - 1, centerY, 8, blocked, false);
  setTile(tiles, centerX + 1, centerY, 8, blocked, false);
};

export const createCityData = (): WorldData => {
  const { tiles, blocked } = createBase();

  buildCrossRoad(tiles, blocked, 15, 9);

  blockRect(tiles, blocked, 3, 2, 9, 6, 3);
  blockRect(tiles, blocked, 21, 2, 28, 6, 3);
  blockRect(tiles, blocked, 22, 12, 29, 15, 3);

  // Left house details.
  setTile(tiles, 5, 3, 6, blocked, true);
  setTile(tiles, 6, 3, 6, blocked, true);
  setTile(tiles, 6, 6, 7, blocked, true);

  // Right house details.
  setTile(tiles, 24, 3, 6, blocked, true);
  setTile(tiles, 25, 3, 6, blocked, true);
  setTile(tiles, 26, 3, 6, blocked, true);
  setTile(tiles, 25, 6, 7, blocked, true);

  // Bottom building details.
  setTile(tiles, 24, 13, 6, blocked, true);
  setTile(tiles, 25, 13, 6, blocked, true);
  setTile(tiles, 26, 13, 6, blocked, true);
  setTile(tiles, 25, 15, 7, blocked, true);

  return {
    label: 'Ciudad Nocturna',
    tiles,
    blocked,
    spawn: { x: 3, y: 14 },
    npcs: [
      {
        id: 'npc-city-1',
        name: 'Camille',
        x: 12,
        y: 8,
        spriteKey: 'npc-camille',
        lines: [
          'Vale la pena la espera, incluso cuando pesa.',
          'La ciudad no está triste: está guardando el momento exacto del reencuentro.'
        ]
      },
      {
        id: 'npc-city-2',
        name: 'Músico Chiptune',
        x: 16,
        y: 14,
        spriteKey: 'npc-musico',
        lines: [
          'La melodía suena mejor cuando recuerdas por qué empezaste.',
          'Cada paso en esta calle también es una promesa.'
        ]
      },
      {
        id: 'npc-city-3',
        name: 'Mensajera',
        x: 7,
        y: 11,
        spriteKey: 'npc-mensajera',
        lines: ['Entregué mil cartas, pero la más bonita siempre es la que dices con acciones.']
      },
      {
        id: 'npc-city-4',
        name: 'Conductor del Red Bus',
        x: 28,
        y: 8,
        spriteKey: 'npc-conductor',
        lines: ['Sube cuando quieras: este bus te acerca al reencuentro.']
      }
    ],
    memories: [
      {
        id: 'city-memory-1',
        x: 4,
        y: 13,
        description: 'Recuerdo #1: Esa charla eterna donde me di cuenta de que eras tú.'
      },
      {
        id: 'city-memory-2',
        x: 12,
        y: 4,
        description: 'Recuerdo #2: Reírnos y hablar en el asiento trasero de mi auto hasta olvidar la hora.'
      },
      {
        id: 'city-memory-3',
        x: 18,
        y: 14,
        description: 'Recuerdo #3: Prometer que Londres nos iba a encontrar del mismo lado.'
      }
    ],
    encounters: [
      {
        key: 'duda',
        title: 'Momento: Duda',
        x: 22,
        y: 10,
        intro: 'La Duda aparece: "¿Y si la distancia gana?"',
        options: [
          {
            label: 'Respirar',
            value: 'respirar',
            bonus: 8,
            response: 'Respiras hondo. La Duda se vuelve pequeña cuando recuerdas por qué elegiste amar.'
          },
          {
            label: 'Mensaje bonito',
            value: 'mensaje',
            bonus: 10,
            response: 'Escribes algo simple y honesto. La pantalla se llena de calma.'
          },
          {
            label: 'Planear visita',
            value: 'plan',
            bonus: 12,
            response: 'Pones fecha. La Duda no sabe pelear contra planes concretos.'
          }
        ]
      }
    ],
    signs: [
      {
        id: 'city-sign-1',
        x: 2,
        y: 13,
        lines: ['Objetivo inicial: 3 recuerdos + vencer la Duda.'],
        spriteKey: 'prop-lamp'
      },
      {
        id: 'city-sign-2',
        x: 26,
        y: 10,
        lines: ['Parada al Campus', 'Salida a la derecha.'],
        spriteKey: 'prop-lamp'
      },
      {
        id: 'city-sign-3',
        x: 24,
        y: 8,
        lines: ['Red Bus de noche', 'Un paso más cerca de Londres.'],
        spriteKey: 'prop-bus'
      },
      {
        id: 'city-sign-4',
        x: 20,
        y: 11,
        lines: ['Cabina Roja', 'Promesa guardada: encontrarnos pronto.'],
        spriteKey: 'prop-phonebooth'
      },
      {
        id: 'city-sign-5',
        x: 19,
        y: 11,
        lines: ['Buzón', 'Cartas, mensajes y paciencia.'],
        spriteKey: 'prop-postbox'
      }
    ],
    exits: [{ x: 30, y: 7, w: 2, h: 4, to: 'CampusScene' }]
  };
};

export const createCampusData = (): WorldData => {
  const { tiles, blocked } = createBase();

  buildCrossRoad(tiles, blocked, 16, 9);

  blockRect(tiles, blocked, 19, 2, 29, 7, 3);
  blockRect(tiles, blocked, 3, 2, 8, 5, 3);

  // Old Brick Hall details.
  setTile(tiles, 23, 3, 6, blocked, true);
  setTile(tiles, 24, 3, 6, blocked, true);
  setTile(tiles, 25, 3, 6, blocked, true);
  setTile(tiles, 26, 3, 6, blocked, true);
  setTile(tiles, 24, 7, 7, blocked, true);

  // Secondary building details.
  setTile(tiles, 5, 3, 6, blocked, true);
  setTile(tiles, 6, 3, 6, blocked, true);
  setTile(tiles, 6, 5, 7, blocked, true);

  return {
    label: 'Campus LSE',
    tiles,
    blocked,
    spawn: { x: 2, y: 9 },
    npcs: [
      {
        id: 'campus-npc-1',
        name: 'Tutor Pixel',
        x: 10,
        y: 8,
        spriteKey: 'npc-default',
        lines: ['Bienvenidos al Economics Dept.', 'Aquí se estudia economía... y logística para abrazos pendientes.']
      },
      {
        id: 'campus-npc-2',
        name: 'Bibliotecaria',
        x: 23,
        y: 9,
        spriteKey: 'npc-camille',
        lines: ['Cuando juntes todo, la salida al este te llevará a Londres nocturno.']
      }
    ],
    memories: [
      {
        id: 'campus-memory-1',
        x: 6,
        y: 13,
        description: 'Recuerdo #4: Hablar del futuro como un plan compartido.'
      },
      {
        id: 'campus-memory-2',
        x: 18,
        y: 5,
        description: 'Recuerdo #5: Extrañarte sin perder el humor.'
      },
      {
        id: 'campus-memory-3',
        x: 28,
        y: 14,
        description: 'Recuerdo #6: Decidir encontrarnos, cueste lo que cueste.'
      }
    ],
    encounters: [
      {
        key: 'distancia',
        title: 'Momento: Distancia',
        x: 5,
        y: 10,
        intro: 'Distancia susurra: "No van a coincidir".',
        options: [
          {
            label: 'Mensaje bonito',
            value: 'mensaje',
            bonus: 9,
            response: 'Tu mensaje cruza océanos. Distancia pierde volumen.'
          },
          {
            label: 'Planear visita',
            value: 'plan',
            bonus: 13,
            response: 'Con agenda abierta y ganas reales, Distancia se vuelve un mapa.'
          },
          {
            label: 'Respirar',
            value: 'respirar',
            bonus: 7,
            response: 'Respiras. Amar no siempre es rápido, pero sí firme.'
          }
        ]
      },
      {
        key: 'extrañar',
        title: 'Momento: Extrañar',
        x: 24,
        y: 11,
        intro: 'Extrañar aparece y dice: "Soy el precio de querer mucho".',
        options: [
          {
            label: 'Respirar',
            value: 'respirar',
            bonus: 8,
            response: 'Lo transformas en ternura, no en tristeza.'
          },
          {
            label: 'Mensaje bonito',
            value: 'mensaje',
            bonus: 11,
            response: 'Un mensaje sincero vuelve ligero este peso.'
          },
          {
            label: 'Planear visita',
            value: 'plan',
            bonus: 12,
            response: 'Con una fecha en el calendario, Extrañar ya no manda.'
          }
        ]
      }
    ],
    signs: [
      {
        id: 'campus-sign-1',
        x: 20,
        y: 8,
        lines: ['Old Brick Hall'],
        spriteKey: 'sign-labeled'
      },
      {
        id: 'campus-sign-2',
        x: 19,
        y: 2,
        lines: ['Economics Dept.']
      },
      {
        id: 'campus-sign-3',
        x: 24,
        y: 12,
        lines: ['Salida a Londres', 'Requiere: 6 recuerdos + 3 momentos + LOVE >= 55'],
        spriteKey: 'prop-lamp'
      }
    ],
    exits: [
      { x: 1, y: 8, w: 1, h: 3, to: 'CityScene' },
      {
        x: 29,
        y: 12,
        w: 3,
        h: 4,
        to: 'LondonScene',
        requiredLove: 55,
        requiredMemories: 6,
        requiredEncounters: 3,
        lockedText: 'Aún falta: junta 6 recuerdos, supera 3 momentos y sube LOVE a 55.'
      }
    ]
  };
};

export const createLondonData = (): WorldData => {
  const { tiles, blocked } = createBase();

  // Main avenues north and south.
  for (let x = 2; x <= 30; x += 1) {
    setTile(tiles, x, 5, 8, blocked, false);
    setTile(tiles, x, 4, 1, blocked, false);
    setTile(tiles, x, 6, 1, blocked, false);

    setTile(tiles, x, 13, 8, blocked, false);
    setTile(tiles, x, 12, 1, blocked, false);
    setTile(tiles, x, 14, 1, blocked, false);
  }

  // Thames horizontal river.
  for (let y = 7; y <= 11; y += 1) {
    for (let x = 2; x <= 30; x += 1) {
      setTile(tiles, x, y, 2, blocked, true);
    }
  }

  // Bridge crossing north-south.
  for (let y = 7; y <= 11; y += 1) {
    setTile(tiles, 15, y, 1, blocked, false);
    setTile(tiles, 16, y, 1, blocked, false);
  }

  // Buildings north.
  blockRect(tiles, blocked, 3, 2, 8, 3, 3);
  setTile(tiles, 5, 2, 6, blocked, true);
  setTile(tiles, 6, 2, 6, blocked, true);

  blockRect(tiles, blocked, 21, 2, 28, 3, 3);
  setTile(tiles, 23, 2, 6, blocked, true);
  setTile(tiles, 24, 2, 6, blocked, true);
  setTile(tiles, 25, 2, 6, blocked, true);

  return {
    label: 'Londres Nocturno',
    tiles,
    blocked,
    spawn: { x: 2, y: 13 },
    npcs: [
      {
        id: 'london-npc-1',
        name: 'Guarda del Puente',
        x: 14,
        y: 12,
        spriteKey: 'npc-default',
        lines: ['Dos corazones con plan claro merecen paso prioritario.', 'Reencuentro desbloqueado. Sigue al este.']
      },
      {
        id: 'london-npc-2',
        name: 'Chofer Red Bus',
        x: 6,
        y: 4,
        spriteKey: 'npc-conductor',
        lines: ['Próxima parada: abrazo real, cero escalas emocionales.']
      }
    ],
    memories: [],
    encounters: [],
    signs: [
      {
        id: 'london-sign-1',
        x: 4,
        y: 4,
        lines: ['Red Bus Stop'],
        spriteKey: 'prop-bus'
      },
      {
        id: 'london-sign-2',
        x: 10,
        y: 12,
        lines: ['Underground', 'Northbound to Future Together'],
        spriteKey: 'prop-phonebooth'
      },
      {
        id: 'london-sign-3',
        x: 24,
        y: 4,
        lines: ['Clock Tower View'],
        spriteKey: 'prop-lamp'
      },
      {
        id: 'london-sign-4',
        x: 22,
        y: 12,
        lines: ['Thames Walk'],
        spriteKey: 'prop-postbox'
      },
      {
        id: 'london-sign-5',
        x: 26,
        y: 12,
        lines: ['London Cab Stand'],
        spriteKey: 'prop-taxi'
      },
      {
        id: 'london-sign-6',
        x: 17,
        y: 12,
        lines: ['Royal Guard Route'],
        spriteKey: 'prop-guard'
      }
    ],
    exits: [
      { x: 1, y: 12, w: 1, h: 3, to: 'CampusScene' },
      {
        x: 29,
        y: 12,
        w: 3,
        h: 4,
        to: 'BridgeFinalScene',
        requiresFlag: 'reunionUnlocked',
        lockedText: 'Habla con la Guarda del Puente para abrir el reencuentro.'
      }
    ]
  };
};
