'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Achievement } from '@/lib/types';
import AchievementBadge from './achievement-badge';

interface MobileAchievementCelebrationProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  onShare?: () => void;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: {
    x: number;
    y: number;
  };
}

export default function MobileAchievementCelebration({
  achievement,
  isVisible,
  onClose,
  onShare
}: MobileAchievementCelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Generate confetti particles
  const generateConfetti = () => {
    const particles: ConfettiParticle[] = [];
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2
        }
      });
    }
    
    setConfetti(particles);
    setShowConfetti(true);
    
    // Clear confetti after animation
    setTimeout(() => {
      setShowConfetti(false);
      setConfetti([]);
    }, 3000);
  };

  useEffect(() => {
    if (isVisible) {
      generateConfetti();
      
      // Trigger haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [isVisible]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#6B7280';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 500,
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.3
      }
    }
  };

  const badgeVariants = {
    hidden: {
      scale: 0,
      rotate: -180
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        damping: 15,
        stiffness: 300,
        delay: 0.2
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Confetti */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50">
              {confetti.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute rounded-full"
                  style={{
                    backgroundColor: particle.color,
                    width: particle.size,
                    height: particle.size,
                    left: particle.x,
                    top: particle.y
                  }}
                  initial={{
                    y: particle.y,
                    x: particle.x,
                    rotate: particle.rotation
                  }}
                  animate={{
                    y: window.innerHeight + 100,
                    x: particle.x + particle.velocity.x * 100,
                    rotate: particle.rotation + 720
                  }}
                  transition={{
                    duration: 3,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>
          )}

          {/* Achievement Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${getRarityGradient(achievement.rarity)} p-6 text-center relative overflow-hidden`}>
                {/* Animated background pattern */}
                <motion.div
                  className="absolute inset-0 opacity-20"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%']
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />
                
                <motion.div
                  variants={pulseVariants}
                  animate="pulse"
                  className="text-4xl mb-2"
                >
                  🎉
                </motion.div>
                
                <h2 className="text-white font-playfair font-bold text-xl mb-1">
                  Glückwunsch!
                </h2>
                
                <p className="text-white/90 text-sm">
                  Du hast eine neue Errungenschaft freigeschaltet
                </p>
              </div>

              {/* Achievement Content */}
              <div className="p-6 text-center">
                {/* Achievement Badge */}
                <motion.div
                  variants={badgeVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex justify-center mb-4"
                >
                  <AchievementBadge
                    achievement={achievement}
                    isEarned={true}
                    size="lg"
                  />
                </motion.div>

                {/* Achievement Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-playfair font-bold text-xl text-charcoal-900 mb-2">
                    {achievement.name}
                  </h3>
                  
                  <p className="text-charcoal-600 text-sm mb-4 leading-relaxed">
                    {achievement.description}
                  </p>

                  {/* Rarity and Points */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex items-center gap-1">
                      <Icons.Star 
                        size={16} 
                        className="text-yellow-500" 
                        fill="currentColor" 
                      />
                      <span className="text-sm font-medium text-charcoal-700 capitalize">
                        {achievement.rarity}
                      </span>
                    </div>
                    
                    {achievement.points > 0 && (
                      <div className="flex items-center gap-1">
                        <Icons.Zap 
                          size={16} 
                          className="text-blue-500" 
                        />
                        <span className="text-sm font-medium text-charcoal-700">
                          +{achievement.points} Punkte
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3"
                >
                  {onShare && (
                    <button
                      onClick={onShare}
                      className="flex-1 flex items-center justify-center gap-2 bg-forest-100 text-forest-700 py-3 px-4 rounded-xl font-medium text-sm hover:bg-forest-200 transition-colors duration-200"
                    >
                      <Icons.Share2 size={16} />
                      Teilen
                    </button>
                  )}
                  
                  <button
                    onClick={onClose}
                    className="flex-1 bg-forest-600 text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-forest-700 transition-colors duration-200"
                  >
                    Weiter
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile Achievement Notification Toast
interface MobileAchievementToastProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  onClick?: () => void;
}

export function MobileAchievementToast({
  achievement,
  isVisible,
  onClose,
  onClick
}: MobileAchievementToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const toastVariants = {
    hidden: {
      opacity: 0,
      y: -100,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 500
      }
    },
    exit: {
      opacity: 0,
      y: -100,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-4 left-4 right-4 z-50"
        >
          <div
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 cursor-pointer"
            onClick={onClick}
          >
            <div className="flex items-center gap-3">
              {/* Achievement Icon */}
              <div className="flex-shrink-0">
                <AchievementBadge
                  achievement={achievement}
                  isEarned={true}
                  size="sm"
                />
              </div>
              
              {/* Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-charcoal-900">
                    Neue Errungenschaft! 🎉
                  </span>
                </div>
                <h4 className="font-semibold text-charcoal-900 text-sm truncate">
                  {achievement.name}
                </h4>
              </div>
              
              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="flex-shrink-0 p-1 text-charcoal-400 hover:text-charcoal-600 transition-colors"
              >
                <Icons.X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}