
import React from 'react'
import { bodyAreas } from '@/data/body-areas'
import { exercises } from '@/data/exercises'
import ExerciseCard from '@/components/exercise-card'
import * as Icons from 'lucide-react'
import Link from 'next/link'

export default function BereichePage() {
  // Group exercises by difficulty
  const exercisesByDifficulty = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.difficulty]) {
      acc[exercise.difficulty] = [];
    }
    acc[exercise.difficulty].push(exercise);
    return acc;
  }, {} as Record<string, typeof exercises>);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-charcoal-900 mb-6">
            🗺️ Alle Körperbereiche im Überblick
          </h1>
          <p className="text-xl text-charcoal-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Entdecke alle {bodyAreas.length} Hauptbereiche der Körperoptimierung mit 
            über {exercises.length} wissenschaftlich fundierten Techniken für deine 
            ganzheitliche Transformation.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-terracotta-500 to-ocher-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Icons.Map size={20} />
            Zur interaktiven Körperkarte
          </Link>
        </div>
      </section>

      {/* Körperbereiche Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-playfair text-3xl font-semibold text-charcoal-900 mb-12 text-center">
            ✨ Die 8 Hauptbereiche
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {bodyAreas.map((area, index) => {
              const IconComponent = Icons[area.icon as keyof typeof Icons] as any;
              
              return (
                <Link 
                  key={area.id} 
                  href={`/bereich/${area.slug}`}
                  className="group block"
                >
                  <div className="organic-card p-6 h-full hover:shadow-organic-hover transition-all duration-300 group-hover:scale-105">
                    <div 
                      className="w-12 h-12 rounded-xl shadow-md mb-4 flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: area.color }}
                    >
                      {area.id === 'nervensystem' && '🧠'}
                      {area.id === 'hormone' && '⚡'}
                      {area.id === 'zirkadian' && '☀️'}
                      {area.id === 'mikrobiom' && '🦠'}
                      {area.id === 'bewegung' && '💪'}
                      {area.id === 'fasten' && '⏰'}
                      {area.id === 'kaelte' && '❄️'}
                      {area.id === 'licht' && '💡'}
                    </div>
                    
                    <h3 className="font-playfair font-semibold text-charcoal-900 mb-3 group-hover:text-terracotta-600 transition-colors">
                      {area.title}
                    </h3>
                    
                    <p className="text-sm text-charcoal-700 mb-4 leading-relaxed">
                      {area.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-charcoal-500">
                        {area.exerciseCount} Techniken
                      </span>
                      <span className="text-terracotta-500 group-hover:text-terracotta-600 transition-colors">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Übungen nach Schwierigkeit */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-playfair text-3xl font-semibold text-charcoal-900 mb-12 text-center">
            🎯 Techniken nach Schwierigkeit
          </h2>

          {['Anfänger', 'Fortgeschritten', 'Experte'].map((difficulty) => {
            const difficultyExercises = exercisesByDifficulty[difficulty] || [];
            if (difficultyExercises.length === 0) return null;

            const getDifficultyInfo = (diff: string) => {
              switch (diff) {
                case 'Anfänger':
                  return {
                    emoji: '🌱',
                    color: 'from-forest-400 to-forest-600',
                    description: 'Perfekt für den Einstieg - einfach umsetzbar und sofort wirksam'
                  };
                case 'Fortgeschritten':
                  return {
                    emoji: '🎯',
                    color: 'from-ocher-400 to-ocher-600',
                    description: 'Für Erfahrene - komplexere Techniken mit verstärkter Wirkung'
                  };
                case 'Experte':
                  return {
                    emoji: '👑',
                    color: 'from-terracotta-500 to-terracotta-700',
                    description: 'Für Meister - anspruchsvolle Praktiken für tiefe Transformation'
                  };
                default:
                  return { emoji: '✨', color: 'from-gray-400 to-gray-600', description: '' };
              }
            };

            const diffInfo = getDifficultyInfo(difficulty);

            return (
              <div key={difficulty} className="mb-16">
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${diffInfo.color} text-white rounded-xl shadow-lg mb-4`}>
                    <span className="text-2xl">{diffInfo.emoji}</span>
                    <span className="font-playfair font-semibold text-xl">{difficulty}</span>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                      {difficultyExercises.length} Übungen
                    </span>
                  </div>
                  <p className="text-charcoal-600 max-w-2xl mx-auto">
                    {diffInfo.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {difficultyExercises.map((exercise, index) => (
                    <ExerciseCard 
                      key={exercise.id} 
                      exercise={exercise} 
                      index={index}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gold-50 to-terracotta-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="organic-card p-8 lg:p-12">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-charcoal-900 mb-6">
              Bereit für deine Transformation?
            </h2>
            <p className="text-lg text-charcoal-700 mb-8 leading-relaxed">
              Wähle einen Bereich aus, der dich besonders anspricht, oder starte mit 
              einer einfachen Atemübung. Jeder Schritt bringt dich näher zu einem 
              optimierten, vitalen und bewussten Leben.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-terracotta-500 to-ocher-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Icons.BarChart3 className="mr-2" size={20} />
                Mein Dashboard
              </Link>
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/80 text-charcoal-700 font-semibold rounded-xl shadow-md hover:shadow-lg border border-white/20 transition-all duration-300 hover:scale-105"
              >
                <Icons.Map className="mr-2" size={20} />
                Zur Körperkarte
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
