
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Exercise } from '@/data/exercises';

interface ExerciseCardProps {
  exercise: Exercise;
  index?: number;
}

export default function ExerciseCard({ exercise, index = 0 }: ExerciseCardProps) {
  const IconComponent = Icons[exercise.icon as keyof typeof Icons] as any;

  const getDifficultyColor = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'Anfänger':
        return 'from-forest-400 to-forest-600 text-white';
      case 'Fortgeschritten':
        return 'from-ocher-400 to-ocher-600 text-white';
      case 'Experte':
        return 'from-terracotta-500 to-terracotta-700 text-white';
      default:
        return 'from-gray-400 to-gray-600 text-white';
    }
  };

  const getDifficultyIcon = (difficulty: Exercise['difficulty']) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link href={`/uebung/${exercise.slug}`}>
        <div className="organic-card p-6 h-full flex flex-col hover:shadow-organic-hover transition-all duration-300">
          {/* Header mit Icon und Schwierigkeit */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {IconComponent && (
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-md">
                  <IconComponent size={24} className="text-white" />
                </div>
              )}
              <div>
                <h3 className="font-playfair font-semibold text-charcoal-900 text-lg group-hover:text-terracotta-600 transition-colors">
                  {exercise.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(exercise.difficulty)}`}>
                    {getDifficultyIcon(exercise.difficulty)}
                    {exercise.difficulty}
                  </span>
                  {exercise.hasTimer && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                      <Icons.Timer size={12} />
                      Timer
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Beschreibung */}
          <p className="text-charcoal-700 text-sm leading-relaxed mb-4 flex-grow">
            {exercise.description}
          </p>

          {/* Dauer und Benefits Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <Icons.Clock size={16} className="text-ocher-500" />
              <span>{exercise.duration}</span>
            </div>

            {/* Top Benefits */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                Hauptvorteile:
              </div>
              <div className="space-y-1">
                {exercise.benefits.slice(0, 2).map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-charcoal-700">
                    <Icons.Sparkles size={14} className="text-gold-500 mt-0.5 flex-shrink-0" />
                    <span className="leading-snug">{benefit}</span>
                  </div>
                ))}
                {exercise.benefits.length > 2 && (
                  <div className="text-xs text-charcoal-500 italic">
                    +{exercise.benefits.length - 2} weitere Vorteile
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-6 pt-4 border-t border-charcoal-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-terracotta-600 group-hover:text-terracotta-700 transition-colors">
                Übung starten
              </span>
              <Icons.ArrowRight 
                size={20} 
                className="text-terracotta-500 group-hover:text-terracotta-600 group-hover:translate-x-1 transition-all duration-300" 
              />
            </div>
          </div>

          {/* Wissenschaftlicher Background Indikator */}
          {exercise.scientificBackground && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center justify-center w-8 h-8 bg-white/80 rounded-full shadow-sm">
                <Icons.Microscope size={16} className="text-forest-600" />
              </div>
            </div>
          )}

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-400/0 to-terracotta-400/0 group-hover:from-gold-400/5 group-hover:to-terracotta-400/5 transition-all duration-500 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}
