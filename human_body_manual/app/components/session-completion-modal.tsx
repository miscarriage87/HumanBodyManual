'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Achievement, MoodRating, EnergyRating, DifficultyLevel } from '@/lib/types';
import { Exercise } from '@/data/exercises';
import AchievementCelebrationModal from './achievement-celebration-modal';

interface SessionCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
  sessionDuration?: number;
  onSubmit: (data: SessionCompletionData) => void;
  newAchievements?: Achievement[];
}

export interface SessionCompletionData {
  durationMinutes?: number;
  difficultyLevel: DifficultyLevel;
  sessionNotes?: string;
  mood?: MoodRating;
  energyLevel?: EnergyRating;
}

const moodOptions: { value: MoodRating; label: string; emoji: string; color: string }[] = [
  { value: 'sehr_schlecht', label: 'Sehr schlecht', emoji: '😞', color: 'bg-red-100 text-red-700' },
  { value: 'schlecht', label: 'Schlecht', emoji: '😕', color: 'bg-orange-100 text-orange-700' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-gray-100 text-gray-700' },
  { value: 'gut', label: 'Gut', emoji: '😊', color: 'bg-green-100 text-green-700' },
  { value: 'sehr_gut', label: 'Sehr gut', emoji: '😄', color: 'bg-emerald-100 text-emerald-700' },
];

const energyOptions: { value: EnergyRating; label: string; emoji: string; color: string }[] = [
  { value: 'sehr_niedrig', label: 'Sehr niedrig', emoji: '🔋', color: 'bg-red-100 text-red-700' },
  { value: 'niedrig', label: 'Niedrig', emoji: '🔋', color: 'bg-orange-100 text-orange-700' },
  { value: 'normal', label: 'Normal', emoji: '🔋', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'hoch', label: 'Hoch', emoji: '🔋', color: 'bg-green-100 text-green-700' },
  { value: 'sehr_hoch', label: 'Sehr hoch', emoji: '⚡', color: 'bg-emerald-100 text-emerald-700' },
];

export default function SessionCompletionModal({
  isOpen,
  onClose,
  exercise,
  sessionDuration,
  onSubmit,
  newAchievements = []
}: SessionCompletionModalProps) {
  const [formData, setFormData] = useState<SessionCompletionData>({
    durationMinutes: sessionDuration,
    difficultyLevel: exercise.difficulty,
    sessionNotes: '',
    mood: undefined,
    energyLevel: undefined,
  });
  const [showAchievements, setShowAchievements] = useState(false);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);

  useEffect(() => {
    if (newAchievements.length > 0) {
      setShowAchievements(true);
      setCurrentAchievementIndex(0);
    }
  }, [newAchievements]);

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const handleAchievementClose = () => {
    if (currentAchievementIndex < newAchievements.length - 1) {
      setCurrentAchievementIndex(prev => prev + 1);
    } else {
      setShowAchievements(false);
    }
  };

  const IconComponent = Icons[exercise.icon as keyof typeof Icons] as any;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              {IconComponent && (
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl shadow-md">
                  <IconComponent size={24} className="text-white" />
                </div>
              )}
              <div>
                <div className="font-playfair text-charcoal-900">Session abgeschlossen!</div>
                <div className="text-sm font-normal text-charcoal-600">{exercise.title}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Congratulations Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200"
            >
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="font-playfair text-lg font-semibold text-charcoal-900 mb-2">
                Großartig gemacht!
              </h3>
              <p className="text-charcoal-700">
                Du hast eine weitere Session erfolgreich abgeschlossen. Jede Übung bringt dich näher zu deinen Zielen.
              </p>
            </motion.div>

            {/* Session Duration */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-charcoal-700">
                Session-Dauer (Minuten)
              </label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.durationMinutes || 0]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, durationMinutes: value }))}
                  max={120}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <div className="w-16 text-center font-medium text-charcoal-900">
                  {formData.durationMinutes || 0} min
                </div>
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-charcoal-700">
                Wie schwierig war die Übung für dich heute?
              </label>
              <div className="flex gap-2">
                {(['Anfänger', 'Fortgeschritten', 'Experte'] as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData(prev => ({ ...prev, difficultyLevel: level }))}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.difficultyLevel === level
                        ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                        : 'border-gray-200 bg-white text-charcoal-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{level}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Rating */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-charcoal-700">
                Wie fühlst du dich nach der Session?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setFormData(prev => ({ ...prev, mood: mood.value }))}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                      formData.mood === mood.value
                        ? 'border-terracotta-500 bg-terracotta-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs font-medium text-charcoal-700">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-charcoal-700">
                Wie ist dein Energielevel?
              </label>
              <div className="grid grid-cols-5 gap-2">
                {energyOptions.map((energy) => (
                  <button
                    key={energy.value}
                    onClick={() => setFormData(prev => ({ ...prev, energyLevel: energy.value }))}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                      formData.energyLevel === energy.value
                        ? 'border-terracotta-500 bg-terracotta-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{energy.emoji}</div>
                    <div className="text-xs font-medium text-charcoal-700">{energy.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Notes */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-charcoal-700">
                Notizen zur Session (optional)
              </label>
              <Textarea
                value={formData.sessionNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionNotes: e.target.value }))}
                placeholder="Wie war die Übung? Was hast du bemerkt? Gab es Herausforderungen oder besondere Erkenntnisse?"
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-terracotta-500 to-ocher-500 hover:from-terracotta-600 hover:to-ocher-600 text-white"
              >
                <Icons.CheckCircle size={20} className="mr-2" />
                Session speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Celebration Modal */}
      {showAchievements && newAchievements[currentAchievementIndex] && (
        <AchievementCelebrationModal
          isOpen={showAchievements}
          onClose={handleAchievementClose}
          achievement={newAchievements[currentAchievementIndex]}
        />
      )}
    </>
  );
}