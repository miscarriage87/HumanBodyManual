
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface BreathingTimerProps {
  config: {
    inhale: number;
    hold: number;
    exhale: number;
    cycles: number;
  };
  onComplete?: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'pause';

export default function BreathingTimer({ config, onComplete }: BreathingTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [timeRemaining, setTimeRemaining] = useState(config.inhale);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = config.inhale + config.hold + config.exhale;
  const phaseProgress = ((totalTime - timeRemaining) / totalTime) * 100;

  const phaseConfig = {
    inhale: { duration: config.inhale, instruction: 'Einatmen', color: 'from-sky-400 to-sky-600' },
    hold: { duration: config.hold, instruction: 'Halten', color: 'from-gold-400 to-gold-600' },
    exhale: { duration: config.exhale, instruction: 'Ausatmen', color: 'from-forest-400 to-forest-600' },
    pause: { duration: 1, instruction: 'Bereit?', color: 'from-terracotta-400 to-terracotta-600' }
  };

  const currentPhaseConfig = phaseConfig[currentPhase];

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      // Phase wechseln
      if (currentPhase === 'inhale') {
        setCurrentPhase('hold');
        setTimeRemaining(config.hold);
      } else if (currentPhase === 'hold') {
        setCurrentPhase('exhale');
        setTimeRemaining(config.exhale);
      } else if (currentPhase === 'exhale') {
        const nextCycle = currentCycle + 1;
        if (nextCycle >= config.cycles) {
          // Session beendet
          setIsActive(false);
          setCurrentCycle(0);
          setCurrentPhase('inhale');
          setTimeRemaining(config.inhale);
          onComplete?.();
        } else {
          // Nächster Zyklus
          setCurrentCycle(nextCycle);
          setCurrentPhase('pause');
          setTimeRemaining(1);
        }
      } else if (currentPhase === 'pause') {
        setCurrentPhase('inhale');
        setTimeRemaining(config.inhale);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining, currentPhase, currentCycle, config, onComplete]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeRemaining(config.inhale);
  };

  const getCircleScale = () => {
    if (currentPhase === 'inhale') {
      return 1 + (0.5 * (1 - timeRemaining / config.inhale));
    } else if (currentPhase === 'exhale') {
      return 1.5 - (0.5 * (1 - timeRemaining / config.exhale));
    }
    return 1.5; // hold phase
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-organic">
      {/* Haupt-Atemkreis */}
      <div className="relative mb-8">
        <motion.div
          className={`w-64 h-64 rounded-full bg-gradient-to-br ${currentPhaseConfig.color} shadow-mystical flex items-center justify-center`}
          animate={{
            scale: getCircleScale(),
          }}
          transition={{
            duration: isActive ? currentPhaseConfig.duration : 0.5,
            ease: "easeInOut"
          }}
        >
          <div className="text-center text-white">
            <div className="text-3xl font-playfair font-semibold mb-2">
              {timeRemaining}
            </div>
            <div className="text-lg font-medium opacity-90">
              {currentPhaseConfig.instruction}
            </div>
          </div>
        </motion.div>

        {/* Fortschrittsring */}
        <svg className="absolute inset-0 w-64 h-64 -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="rgba(255,215,0,0.8)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - phaseProgress / 100)}
            className="transition-all duration-1000"
          />
        </svg>
      </div>

      {/* Session Info */}
      <div className="text-center mb-6">
        <div className="text-lg font-playfair font-semibold text-charcoal-800 mb-2">
          Zyklus {currentCycle + 1} von {config.cycles}
        </div>
        <div className="text-sm text-charcoal-600">
          {config.inhale}s Einatmen • {config.hold}s Halten • {config.exhale}s Ausatmen
        </div>
      </div>

      {/* Steuerung */}
      <div className="flex items-center gap-4">
        <button
          onClick={isActive ? handlePause : handleStart}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-terracotta-500 to-ocher-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center justify-center w-12 h-12 bg-white/80 text-charcoal-700 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-center w-12 h-12 bg-white/80 text-charcoal-700 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Atemführung Text */}
      <motion.div
        key={currentPhase}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        <div className="text-2xl mystical-accent text-charcoal-700">
          {currentPhase === 'inhale' && '🌬️ Atme tief ein...'}
          {currentPhase === 'hold' && '⏸️ Halte den Atem...'}
          {currentPhase === 'exhale' && '💨 Lass los und atme aus...'}
          {currentPhase === 'pause' && '✨ Bereite dich vor...'}
        </div>
      </motion.div>

      {/* Ambient Sounds Toggle (Future Feature) */}
      <div className="mt-4 text-xs text-charcoal-500 text-center">
        <div className="mb-2">💫 Finde deinen inneren Rhythmus</div>
        <div className="opacity-60">Konzentriere dich nur auf deinen Atem</div>
      </div>
    </div>
  );
}
