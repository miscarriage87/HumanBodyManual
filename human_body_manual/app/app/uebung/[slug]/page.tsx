
'use client';

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { getExerciseBySlug } from '@/data/exercises'
import { getBodyAreaBySlug } from '@/data/body-areas'
import { markExerciseCompleted, addToFavorites, removeFromFavorites, getProgressData } from '@/lib/progress-tracker'
import BreathingTimer from '@/components/breathing-timer'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface UebungPageProps {
  params: {
    slug: string
  }
}

export default function UebungPage({ params }: UebungPageProps) {
  const [showScientific, setShowScientific] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [mounted, setMounted] = useState(false);

  const exercise = getExerciseBySlug(params.slug);

  useEffect(() => {
    setMounted(true);
    if (exercise) {
      const progress = getProgressData();
      setIsCompleted(progress.completedExercises.includes(exercise.slug));
      setIsFavorited(progress.favoriteExercises.includes(exercise.slug));
    }
  }, [exercise]);

  if (!exercise) {
    notFound();
  }

  const area = getBodyAreaBySlug(exercise.category);
  const IconComponent = Icons[exercise.icon as keyof typeof Icons] as any;

  const handleComplete = () => {
    if (exercise && area) {
      markExerciseCompleted(exercise.slug, exercise.category);
      setIsCompleted(true);
      // Show success message
    }
  };

  const handleFavorite = () => {
    if (exercise) {
      if (isFavorited) {
        removeFromFavorites(exercise.slug);
        setIsFavorited(false);
      } else {
        addToFavorites(exercise.slug);
        setIsFavorited(true);
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Anfänger':
        return 'from-forest-400 to-forest-600';
      case 'Fortgeschritten':
        return 'from-ocher-400 to-ocher-600';
      case 'Experte':
        return 'from-terracotta-500 to-terracotta-700';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Anfänger':
        return <Icons.Sprout size={16} />;
      case 'Fortgeschritten':
        return <Icons.Target size={16} />;
      case 'Experte':
        return <Icons.Crown size={16} />;
      default:
        return <Icons.Circle size={16} />;
    }
  };

  if (!mounted) {
    return (
      <div className="animate-pulse min-h-screen">
        <div className="h-64 bg-gray-200"></div>
        <div className="p-8 space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

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
            <Link 
              href={`/bereich/${area?.slug}`}
              className="hover:text-terracotta-600 transition-colors"
            >
              {area?.title}
            </Link>
            <Icons.ChevronRight size={16} />
            <span className="text-charcoal-900 font-medium">{exercise.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              {IconComponent && (
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl shadow-lg">
                  <IconComponent size={32} className="text-white" />
                </div>
              )}
              <div className="text-left">
                <h1 className="font-playfair text-3xl lg:text-4xl font-bold text-charcoal-900">
                  {exercise.title}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getDifficultyColor(exercise.difficulty)}`}>
                    {getDifficultyIcon(exercise.difficulty)}
                    {exercise.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-charcoal-600">
                    <Icons.Clock size={16} />
                    {exercise.duration}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-lg text-charcoal-700 leading-relaxed max-w-3xl mx-auto mb-8">
              {exercise.description}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleComplete}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-forest-100 text-forest-700 border border-forest-200'
                    : 'bg-gradient-to-r from-terracotta-500 to-ocher-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {isCompleted ? (
                  <>
                    <Icons.CheckCircle size={20} />
                    Abgeschlossen
                  </>
                ) : (
                  <>
                    <Icons.Play size={20} />
                    Übung starten
                  </>
                )}
              </button>

              <button
                onClick={handleFavorite}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border transition-all duration-300 ${
                  isFavorited
                    ? 'bg-gold-100 text-gold-700 border-gold-200'
                    : 'bg-white/80 text-charcoal-700 border-white/20 hover:bg-gold-50'
                }`}
              >
                {isFavorited ? (
                  <>
                    <Icons.Heart size={20} className="fill-current" />
                    Favorit
                  </>
                ) : (
                  <>
                    <Icons.Heart size={20} />
                    Zu Favoriten
                  </>
                )}
              </button>

              {exercise.hasTimer && (
                <button
                  onClick={() => setShowTimer(!showTimer)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sky-100 text-sky-700 rounded-xl font-semibold border border-sky-200 hover:bg-sky-200 transition-all duration-300"
                >
                  <Icons.Timer size={20} />
                  {showTimer ? 'Timer schließen' : 'Timer öffnen'}
                </button>
              )}
            </div>
          </div>

          {/* Timer Component */}
          {exercise.hasTimer && showTimer && exercise.timerConfig && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <BreathingTimer 
                config={exercise.timerConfig}
                onComplete={() => {
                  handleComplete();
                  setShowTimer(false);
                }}
              />
            </motion.div>
          )}
        </div>
      </section>

      {/* Anleitung */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/20">
        <div className="max-w-4xl mx-auto">
          <div className="organic-card p-8">
            <h2 className="font-playfair text-2xl font-semibold text-charcoal-900 mb-6">
              📋 Schritt-für-Schritt Anleitung
            </h2>
            <div className="space-y-4">
              {exercise.instructions.map((instruction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-white/50 rounded-xl"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-terracotta-500 to-ocher-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-charcoal-700 leading-relaxed">{instruction}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vorteile */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="organic-card p-8">
            <h2 className="font-playfair text-2xl font-semibold text-charcoal-900 mb-6">
              ✨ Vorteile dieser Technik
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercise.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-white/50 rounded-xl"
                >
                  <Icons.Sparkles size={20} className="text-gold-500 mt-0.5 flex-shrink-0" />
                  <span className="text-charcoal-700 leading-relaxed">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tipps und Warnungen */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tipps */}
          <div className="organic-card p-8">
            <h3 className="font-playfair text-xl font-semibold text-charcoal-900 mb-6">
              💡 Praktische Tipps
            </h3>
            <div className="space-y-3">
              {exercise.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Icons.Lightbulb size={16} className="text-ocher-500 mt-1 flex-shrink-0" />
                  <span className="text-sm text-charcoal-700 leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warnungen */}
          {exercise.warnings && exercise.warnings.length > 0 && (
            <div className="organic-card p-8">
              <h3 className="font-playfair text-xl font-semibold text-charcoal-900 mb-6">
                ⚠️ Wichtige Hinweise
              </h3>
              <div className="space-y-3">
                {exercise.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Icons.AlertTriangle size={16} className="text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-charcoal-700 leading-relaxed">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Wissenschaftlicher Hintergrund */}
      {exercise.scientificBackground && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="organic-card p-8">
              <button
                onClick={() => setShowScientific(!showScientific)}
                className="flex items-center gap-3 w-full text-left mb-6 hover:text-terracotta-600 transition-colors"
              >
                <Icons.Microscope size={24} className="text-forest-500" />
                <h3 className="font-playfair text-xl font-semibold text-charcoal-900">
                  🧬 Wissenschaftlicher Hintergrund
                </h3>
                <Icons.ChevronDown 
                  size={20} 
                  className={`ml-auto transition-transform ${showScientific ? 'rotate-180' : ''}`}
                />
              </button>
              
              {showScientific && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-charcoal-700 leading-relaxed bg-white/50 rounded-xl p-6"
                >
                  {exercise.scientificBackground}
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={`/bereich/${area?.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 text-charcoal-700 font-semibold rounded-xl shadow-md hover:shadow-lg border border-white/20 transition-all duration-300"
            >
              <Icons.ArrowLeft size={20} />
              Zurück zu {area?.title}
            </Link>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-500 to-forest-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Icons.BarChart3 size={20} />
              Mein Fortschritt
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
