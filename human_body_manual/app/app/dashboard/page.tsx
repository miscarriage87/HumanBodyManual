
'use client';

import React from 'react'
import ProgressDashboard from '@/components/progress-dashboard'
import * as Icons from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gold-50 to-terracotta-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-charcoal-900 mb-6">
            📊 Dein persönliches Dashboard
          </h1>
          <p className="text-xl text-charcoal-700 max-w-3xl mx-auto mb-8 leading-relaxed">
            Verfolge deine Transformation, feiere deine Erfolge und entdecke neue Wege 
            zur Optimierung deines Körpers und Geistes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-terracotta-500 to-ocher-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Icons.Map size={20} />
              Zur Körperkarte
            </Link>
            <Link 
              href="/bereiche"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 text-charcoal-700 font-semibold rounded-xl shadow-md hover:shadow-lg border border-white/20 transition-all duration-300 hover:scale-105"
            >
              <Icons.BookOpen size={20} />
              Alle Bereiche
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ProgressDashboard />
        </div>
      </section>

      {/* Motivational Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-charcoal-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">🌟</div>
          <h2 className="font-playfair text-3xl font-bold mb-6 text-gold-300">
            Jeder Schritt zählt
          </h2>
          <p className="text-lg text-charcoal-300 mb-8 leading-relaxed">
            Transformation ist kein Ziel, sondern eine Reise. Jede Übung, die du absolvierst, 
            jeder bewusste Atemzug und jeder Moment der Achtsamkeit bringt dich näher zu 
            dem Menschen, der du sein möchtest.
          </p>
          <blockquote className="mystical-accent text-xl text-gold-400 italic">
            "Der beste Zeitpunkt, einen Baum zu pflanzen, war vor 20 Jahren. 
            Der zweitbeste Zeitpunkt ist jetzt."
          </blockquote>
        </div>
      </section>
    </div>
  )
}
