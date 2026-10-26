// Expedition Manifest & Chapter Definitions
export const EXPEDITION_DATA = {
  totalGizaFrames: 600,
  totalConstructionFrames: 192,
  gizaPathPattern: (index) => `assets/frames/giza/frame_${String(index).padStart(4, '0')}.jpg`,
  constructionPathPattern: (index) => `assets/frames/construction/construction_${String(index).padStart(4, '0')}.jpg`,
  audio: {
    src: 'assets/audio/egypt_ambient.mp3',
    title: 'Ancient Egypt Atmosphere'
  },
  video: {
    src: 'assets/video/Building_the_Great_Pyramid_of_20261026164155.mp4',
    title: 'Building the Great Pyramid of Giza'
  },
  images: {
    dendera: {
      src: 'assets/images/0c012c790161efe92b2af750530d4527.jpg',
      title: 'Hypostyle Hall of Dendera Temple',
      caption: 'Spectacular Hathor-headed stone pillars and celestial astronomical ceiling preserved with original ancient lapis and ochre pigments.'
    },
    tombSanctuary: {
      src: 'assets/images/f6c47d05680dc898be8042e3cd65ad6b.jpg',
      title: 'The Subterranean Sarcophagus Chamber',
      caption: 'Sacred limestone crypt guarded by carved wall reliefs, hieroglyphic door jambs, and the statue of the pharaoh looking into eternity.'
    }
  },
  scenes: [
    {
      id: 'scene-01',
      index: 0,
      roman: 'I',
      number: '01',
      name: 'Giza at Dawn',
      headline: 'EGYPT — A CIVILIZATION THAT LIVES FOREVER',
      frameStart: 1,
      frameEnd: 155
    },
    {
      id: 'scene-02',
      index: 1,
      roman: 'II',
      number: '02',
      name: 'The Sacred Nile',
      headline: 'BORN FROM THE NILE',
      frameStart: 156,
      frameEnd: 230
    },
    {
      id: 'scene-03',
      index: 2,
      roman: 'III',
      number: '03',
      name: 'Monumental Vision',
      headline: 'A VISION CARVED IN STONE',
      frameStart: 231,
      frameEnd: 315
    },
    {
      id: 'scene-04',
      index: 3,
      roman: 'IV',
      number: '04',
      name: 'The Builders',
      headline: 'THE HANDS THAT SHAPED HISTORY',
      frameStart: 316,
      frameEnd: 380
    },
    {
      id: 'scene-05',
      index: 4,
      roman: 'V',
      number: '05',
      name: 'Knowledge & Art',
      headline: 'WHERE ART BECAME ETERNITY',
      frameStart: 381,
      frameEnd: 450
    },
    {
      id: 'scene-06',
      index: 5,
      roman: 'VI',
      number: '06',
      name: 'Sacred Temples',
      headline: 'MONUMENTS TO THE DIVINE',
      frameStart: 451,
      frameEnd: 510
    },
    {
      id: 'scene-07',
      index: 6,
      roman: 'VII',
      number: '07',
      name: 'Living Soul',
      headline: 'AN ANCIENT SOUL. A LIVING WORLD.',
      frameStart: 511,
      frameEnd: 560
    },
    {
      id: 'scene-08',
      index: 7,
      roman: 'VIII',
      number: '08',
      name: 'Eternal Legacy',
      headline: 'SOME WONDERS ARE NEVER FORGOTTEN.',
      frameStart: 561,
      frameEnd: 600
    }
  ]
};
