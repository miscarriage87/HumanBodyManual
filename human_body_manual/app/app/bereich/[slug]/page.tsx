
import React from 'react'
import { notFound } from 'next/navigation'
import { getBodyAreaBySlug } from '@/data/body-areas'
import { getExercisesByCategory } from '@/data/exercises'
import ExerciseCard from '@/components/exercise-card'
import * as Icons from 'lucide-react'
import Link from 'next/link'

interface BereichPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const slugs = [
    'nervensystem',
    'hormone', 
    'zirkadian',
    'mikrobiom',
    'bewegung',
    'fasten',
    'kaelte',
    'licht'
  ];
  
  return slugs.map((slug) => ({
    slug,
  }))
}

export default function BereichPage({ params }: BereichPageProps) {
  const area = getBodyAreaBySlug(params.slug);
  
  if (!area) {
    notFound();
  }

  const exercises = getExercisesByCategory(area.id);
  const IconComponent = Icons[area.icon as keyof typeof Icons] as any;

  const getAreaEmoji = (id: string) => {
    switch (id) {
      case 'nervensystem': return '🧠';
      case 'hormone': return '⚡';
      case 'zirkadian': return '☀️';
      case 'mikrobiom': return '🦠';
      case 'bewegung': return '💪';
      case 'fasten': return '⏰';
      case 'kaelte': return '❄️';
      case 'licht': return '💡';
      default: return '✨';
    }
  };

  const getAreaDescription = (id: string) => {
    switch (id) {
      case 'nervensystem':
        return 'Das Nervensystem ist die Schaltzentrale deines Körpers. Durch gezielte Vagusnerv-Stimulation kannst du tiefe Entspannung, emotionale Balance und erhöhte Resilienz erreichen. Entdecke kraftvolle Techniken wie bewusste Atmung, Kälteexposition und Vokalisierung.';
      case 'hormone':
        return 'Hormone orchestrieren nahezu alle Körperfunktionen. Eine optimale Balance zwischen Testosteron, Östrogen und anderen Hormonen ist der Schlüssel zu Vitalität, Energie und Wohlbefinden. Erfahre, wie du durch natürliche Methoden dein hormonelles Gleichgewicht wiederherstellst.';
      case 'zirkadian':
        return 'Dein innerer Taktgeber steuert Schlaf, Wachheit, Stoffwechsel und Regeneration. Durch die Synchronisation mit natürlichen Licht-Dunkel-Zyklen optimierst du deine Energie, verbesserst deinen Schlaf und stärkst deine mentale Klarheit.';
      case 'mikrobiom':
        return 'Dein Darm beherbergt Billionen von Mikroorganismen, die direkt mit deinem Gehirn kommunizieren. Ein gesundes Mikrobiom stärkt nicht nur deine Verdauung, sondern auch deine Stimmung, dein Immunsystem und deine kognitive Funktion.';
      case 'bewegung':
        return 'Bewegung ist Leben. Durch intelligentes Faszientraining, funktionelle Bewegungsmuster und bewusste Körperarbeit befreist du deinen Körper von Verspannungen und schaffst die Grundlage für lebenslange Mobilität und Kraft.';
      case 'fasten':
        return 'Bewusstes Fasten aktiviert kraftvolle zelluläre Reparaturmechanismen. Intermittierendes Fasten und längere Fastenphasen fördern Autophagie, verbessern die Insulinsensitivität und können deine Lebensspanne verlängern.';
      case 'kaelte':
        return 'Kontrollierte Kälteexposition ist ein uraltes Werkzeug zur Stärkung von Körper und Geist. Kältetherapie aktiviert braunes Fettgewebe, stärkt das Immunsystem und baut mentale Resilienz auf.';
      case 'licht':
        return 'Licht ist nicht nur Energie für deine Augen - es ist Information für deinen gesamten Körper. Gezielter Einsatz von natürlichem und therapeutischem Licht optimiert deine Hormone, unterstützt die Heilung und steigert deine Vitalität.';
      default:
        return area.description;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white/20 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-charcoal-600">
            <Link href="/" className="hover:text-terracotta-600 transition-colors">
              Körperkarte
            </Link>
            <Icons.ChevronRight size={16} />
            <span className="text-charcoal-900 font-medium">{area.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div 
              className="inline-flex items-center justify-center w-24 h-24 rounded-2xl shadow-lg text-white text-4xl mb-6"
              style={{ backgroundColor: area.color }}
            >
              {getAreaEmoji(area.id)}
            </div>
            <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-charcoal-900 mb-6">
              {area.title}
            </h1>
            <p className="text-xl text-charcoal-700 leading-relaxed max-w-3xl mx-auto">
              {getAreaDescription(area.id)}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
              <Icons.BookOpen size={16} className="text-ocher-500" />
              <span className="text-charcoal-700">{exercises.length} Techniken</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
              <Icons.Clock size={16} className="text-forest-500" />
              <span className="text-charcoal-700">5-60 Min. pro Übung</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
              <Icons.TrendingUp size={16} className="text-sky-500" />
              <span className="text-charcoal-700">Alle Schwierigkeitsgrade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Übungen Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="font-playfair text-3xl font-semibold text-charcoal-900 mb-4">
              🎯 Verfügbare Techniken
            </h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              Wähle eine Technik aus, die zu deinem aktuellen Level und deinen Zielen passt. 
              Jede Übung enthält detaillierte Anleitungen und wissenschaftliche Hintergründe.
            </p>
          </div>

          {exercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exercises.map((exercise, index) => (
                <ExerciseCard 
                  key={exercise.id} 
                  exercise={exercise} 
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="font-playfair text-2xl font-semibold text-charcoal-900 mb-4">
                Übungen werden geladen
              </h3>
              <p className="text-charcoal-600 max-w-md mx-auto">
                Die Techniken für diesen Bereich werden gerade finalisiert. 
                Schaue bald wieder vorbei!
              </p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gradient-to-r from-terracotta-500 to-ocher-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Icons.ArrowLeft size={20} />
                Zurück zur Körperkarte
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Verwandte Bereiche */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-playfair text-2xl font-semibold text-charcoal-900 mb-8 text-center">
            🔗 Verwandte Bereiche erkunden
          </h2>
          <div className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 text-charcoal-700 font-semibold rounded-xl shadow-md hover:shadow-lg border border-white/20 transition-all duration-300 hover:scale-105"
            >
              <Icons.Map size={20} />
              Zurück zur Körperkarte
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
