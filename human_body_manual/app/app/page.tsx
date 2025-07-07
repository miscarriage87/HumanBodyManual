
import React from 'react'
import { motion } from 'framer-motion'
import BodyMap from '@/components/body-map'
import { bodyAreas, getTotalExerciseCount } from '@/data/body-areas'
import { Sparkles, Heart, Brain, Timer } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const totalExercises = getTotalExerciseCount();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal-900 mb-6">
              Bedienungsanleitung für den
              <span className="bg-gradient-to-r from-terracotta-500 to-gold-500 bg-clip-text text-transparent">
                {" "}menschlichen Körper
              </span>
            </h1>
            <p className="text-xl text-charcoal-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              Entdecke das volle Potenzial deines Körpers durch spirituell-bewusste, 
              wissenschaftlich fundierte Optimierungstechniken. Eine interaktive Reise 
              zur Harmonie von Geist, Körper und Seele.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-charcoal-600">
              <div className="flex items-center gap-2">
                <Brain className="text-terracotta-500" size={20} />
                <span>{bodyAreas.length} Körperbereiche</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="text-gold-500" size={20} />
                <span>{totalExercises}+ Techniken</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="text-forest-500" size={20} />
                <span>Spirituell-bewusst</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="text-sky-500" size={20} />
                <span>Interaktive Timer</span>
              </div>
            </div>
          </div>

          {/* Interaktive Körperkarte */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-playfair text-3xl font-semibold text-charcoal-900 mb-4">
                🗺️ Erkunde deinen Körper
              </h2>
              <p className="text-charcoal-600 max-w-2xl mx-auto">
                Klicke auf die verschiedenen Körperbereiche, um spezifische Techniken 
                zur Optimierung zu entdecken. Jeder Bereich bietet einzigartige Übungen 
                für deine ganzheitliche Transformation.
              </p>
            </div>

            <div className="bg-white/30 backdrop-blur-md rounded-3xl border border-white/20 shadow-organic p-8 lg:p-12">
              <BodyMap className="max-w-md mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Körperbereiche Übersicht */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl lg:text-4xl font-semibold text-charcoal-900 mb-6">
              ✨ Die 8 Hauptbereiche der Körperoptimierung
            </h2>
            <p className="text-lg text-charcoal-700 max-w-3xl mx-auto">
              Jeder Bereich enthält wissenschaftlich fundierte Techniken, die in 
              jahrtausendealter Weisheit verwurzelt sind und für die moderne Zeit adaptiert wurden.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bodyAreas.map((area, index) => (
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
                    {area.icon && (
                      <span className="text-2xl">
                        {area.id === 'nervensystem' && '🧠'}
                        {area.id === 'hormone' && '⚡'}
                        {area.id === 'zirkadian' && '☀️'}
                        {area.id === 'mikrobiom' && '🦠'}
                        {area.id === 'bewegung' && '💪'}
                        {area.id === 'fasten' && '⏰'}
                        {area.id === 'kaelte' && '❄️'}
                        {area.id === 'licht' && '💡'}
                      </span>
                    )}
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
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="organic-card p-8 lg:p-12 bg-gradient-to-br from-gold-50 to-terracotta-50">
            <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-charcoal-900 mb-6">
              🌟 Beginne deine Transformation heute
            </h2>
            <p className="text-lg text-charcoal-700 mb-8 leading-relaxed">
              Dein Körper ist ein Meisterwerk der Natur. Mit den richtigen Techniken 
              kannst du sein volles Potenzial entfalten und ein Leben voller Vitalität, 
              Klarheit und innerem Frieden führen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-terracotta-500 to-ocher-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="mr-2" size={20} />
                Mein Dashboard
              </Link>
              <Link 
                href="/bereiche"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/80 text-charcoal-700 font-semibold rounded-xl shadow-md hover:shadow-lg border border-white/20 transition-all duration-300 hover:scale-105"
              >
                <Brain className="mr-2" size={20} />
                Alle Bereiche erkunden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Inspirierendes Zitat */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-charcoal-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="mystical-accent text-2xl lg:text-3xl font-semibold mb-6 text-gold-300">
            "Take care of your body. It's the only place you have to live."
          </blockquote>
          <cite className="text-charcoal-300 text-lg">— Jim Rohn</cite>
        </div>
      </section>
    </div>
  )
}
