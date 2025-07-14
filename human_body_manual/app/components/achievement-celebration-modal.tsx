'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AchievementBadge from './achievement-badge';
import { cn } from '@/lib/utils';

interface AchievementCelebrationModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

// Confetti particle component
const ConfettiParticle = ({ delay = 0 }: { delay?: number }) => {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: randomColor }}
      initial={{
        x: Math.random() * 400 - 200,
        y: -50,
        rotate: 0,
        scale: 1,
        opacity: 1
      }}
      animate={{
        x: Math.random() * 600 - 300,
        y: 400,
        rotate: 360,
        scale: 0,
        opacity: 0
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: "easeOut"
      }}
    />
  );
};

// Star burst animation component
const StarBurst = () => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: 180 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-8 bg-gradient-to-t from-yellow-400 to-transparent"
          style={{
            left: '50%',
            top: '50%',
            transformOrigin: 'bottom center',
            transform: `translate(-50%, -100%) rotate(${i * 45}deg)`
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ 
            duration: 0.4, 
            delay: 0.2 + i * 0.05,
            ease: "easeOut" 
          }}
        />
      ))}
    </motion.div>
  );
};

export default function AchievementCelebrationModal({
  achievement,
  isOpen,
  onClose
}: AchievementCelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && achievement) {
      setShowConfetti(true);
      // Stop confetti after 4 seconds
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, achievement]);

  if (!achievement) return null;

  const getRarityMessage = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Gut gemacht!';
      case 'rare':
        return 'Beeindruckend!';
      case 'epic':
        return 'Außergewöhnlich!';
      case 'legendary':
        return 'Legendär!';
      default:
        return 'Glückwunsch!';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-slate-600';
      case 'rare':
        return 'text-blue-600';
      case 'epic':
        return 'text-purple-600';
      case 'legendary':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md relative overflow-hidden">
        {/* Confetti Animation */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {[...Array(50)].map((_, i) => (
                <ConfettiParticle key={i} delay={i * 0.1} />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 opacity-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className={cn(
            "w-full h-full rounded-lg",
            achievement.rarity === 'legendary' ? 'bg-gradient-radial from-yellow-400/30 to-transparent' :
            achievement.rarity === 'epic' ? 'bg-gradient-radial from-purple-400/30 to-transparent' :
            achievement.rarity === 'rare' ? 'bg-gradient-radial from-blue-400/30 to-transparent' :
            'bg-gradient-radial from-slate-400/30 to-transparent'
          )} />
        </motion.div>

        <DialogHeader className="text-center relative z-20">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.2 
            }}
            className="mx-auto mb-4 relative"
          >
            <AchievementBadge
              achievement={achievement}
              isEarned={true}
              size="lg"
              showTooltip={false}
            />
            <StarBurst />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <DialogTitle className={cn(
              "text-2xl font-bold mb-2",
              getRarityColor(achievement.rarity)
            )}>
              {getRarityMessage(achievement.rarity)}
            </DialogTitle>
            
            <motion.h3 
              className="text-lg font-semibold text-gray-900 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {achievement.name}
            </motion.h3>
            
            <motion.p 
              className="text-sm text-gray-600 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {achievement.description}
            </motion.p>
          </motion.div>
        </DialogHeader>

        {/* Achievement Details */}
        <motion.div
          className="space-y-4 relative z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          {/* Points and Rarity */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Punkte:</span>
              <span className="font-semibold text-gray-900">+{achievement.points}</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Seltenheit:</span>
              <span className={cn("font-semibold capitalize", getRarityColor(achievement.rarity))}>
                {achievement.rarity}
              </span>
            </div>
          </div>

          {/* Unlocked Content */}
          {achievement.unlocksContent && achievement.unlocksContent.length > 0 && (
            <motion.div
              className="bg-green-50 border border-green-200 rounded-lg p-3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
            >
              <div className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1">
                🔓 Neue Inhalte freigeschaltet!
              </div>
              <div className="space-y-1">
                {achievement.unlocksContent.map((content, index) => (
                  <div key={index} className="text-xs text-green-700">
                    • {content.replace('_', ' ')}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Button */}
          <motion.div
            className="flex justify-center pt-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.4 }}
          >
            <Button
              onClick={onClose}
              className="px-8"
              size="lg"
            >
              Weiter praktizieren
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating particles for legendary achievements */}
        {achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`
                }}
                animate={{
                  y: [-10, -20, -10],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}