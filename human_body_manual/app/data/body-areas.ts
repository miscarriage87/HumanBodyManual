
export interface BodyArea {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  position: { x: number; y: number; width: number; height: number };
  exerciseCount: number;
  slug: string;
}

export const bodyAreas: BodyArea[] = [
  {
    id: 'nervensystem',
    title: 'Nervensystem & Vagusnerv',
    description: 'Aktiviere deinen inneren Ruhepol durch gezielte Vagusnerv-Stimulation',
    icon: 'Brain',
    color: '#D2691E', // Terrakotta
    position: { x: 45, y: 5, width: 10, height: 15 }, // Kopf/Gehirn
    exerciseCount: 8,
    slug: 'nervensystem'
  },
  {
    id: 'hormone',
    title: 'Hormonelle Balance',
    description: 'Harmonisiere Testosteron und Östrogen für optimale Vitalität',
    icon: 'Zap',
    color: '#228B22', // Waldgrün
    position: { x: 40, y: 25, width: 20, height: 15 }, // Brust/Drüsen
    exerciseCount: 6,
    slug: 'hormone'
  },
  {
    id: 'zirkadian',
    title: 'Zirkadianer Rhythmus',
    description: 'Synchronisiere deinen inneren Taktgeber mit natürlichen Zyklen',
    icon: 'Sun',
    color: '#FFD700', // Gold
    position: { x: 35, y: 20, width: 30, height: 10 }, // Herz/Brust
    exerciseCount: 7,
    slug: 'zirkadian'
  },
  {
    id: 'mikrobiom',
    title: 'Mikrobiom & Darm-Hirn-Achse',
    description: 'Optimiere dein inneres Ökosystem für mentale Klarheit',
    icon: 'Activity',
    color: '#CC7722', // Ocker
    position: { x: 35, y: 45, width: 30, height: 20 }, // Bauch/Verdauung
    exerciseCount: 5,
    slug: 'mikrobiom'
  },
  {
    id: 'bewegung',
    title: 'Bewegung & Faszientraining',
    description: 'Befreie deinen Körper durch intelligente Bewegung und Faszienarbeit',
    icon: 'Muscle',
    color: '#B87333', // Kupfer
    position: { x: 20, y: 30, width: 60, height: 40 }, // Ganzer Körper/Muskeln
    exerciseCount: 9,
    slug: 'bewegung'
  },
  {
    id: 'fasten',
    title: 'Fasten & Autophagie',
    description: 'Aktiviere zelluläre Erneuerung durch bewusstes Fasten',
    icon: 'Timer',
    color: '#87CEEB', // Himmelblau
    position: { x: 42, y: 40, width: 16, height: 25 }, // Magen/Verdauung
    exerciseCount: 4,
    slug: 'fasten'
  },
  {
    id: 'kaelte',
    title: 'Kältetherapie & Thermogenese',
    description: 'Stärke Immunsystem und Resilienz durch kontrollierte Kältereize',
    icon: 'Snowflake',
    color: '#4682B4', // Stahlblau
    position: { x: 25, y: 25, width: 50, height: 50 }, // Haut/Ganzkörper
    exerciseCount: 6,
    slug: 'kaelte'
  },
  {
    id: 'licht',
    title: 'Lichttherapie & Photobiomodulation',
    description: 'Nutze heilende Lichtfrequenzen für Regeneration und Vitalität',
    icon: 'Lightbulb',
    color: '#DAA520', // Goldgelb
    position: { x: 43, y: 8, width: 14, height: 8 }, // Augen/Gesicht
    exerciseCount: 5,
    slug: 'licht'
  }
];

export const getBodyAreaBySlug = (slug: string): BodyArea | undefined => {
  return bodyAreas.find(area => area.slug === slug);
};

export const getTotalExerciseCount = (): number => {
  return bodyAreas.reduce((total, area) => total + area.exerciseCount, 0);
};
