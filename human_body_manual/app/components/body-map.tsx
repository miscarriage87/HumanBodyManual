
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { bodyAreas } from '@/data/body-areas';
import Link from 'next/link';
import * as Icons from 'lucide-react';

interface BodyMapProps {
  className?: string;
}

export default function BodyMap({ className = '' }: BodyMapProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  return (
    <div className={`relative w-full max-w-md mx-auto ${className}`}>
      {/* SVG Body Silhouette */}
      <svg
        viewBox="0 0 100 120"
        className="w-full h-auto drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body Background Silhouette */}
        <path
          d="M45 8 C40 5, 35 8, 35 15 C35 18, 37 20, 40 22 L40 35 C38 38, 35 42, 30 45 C25 48, 20 52, 20 58 L20 75 C20 80, 25 85, 30 88 L30 105 C30 110, 35 115, 45 115 L55 115 C65 115, 70 110, 70 105 L70 88 C75 85, 80 80, 80 75 L80 58 C80 52, 75 48, 70 45 C65 42, 62 38, 60 35 L60 22 C63 20, 65 18, 65 15 C65 8, 60 5, 55 8 C53 6, 47 6, 45 8 Z"
          fill="rgba(255, 215, 0, 0.1)"
          stroke="rgba(210, 105, 30, 0.3)"
          strokeWidth="0.5"
          className="drop-shadow-sm"
        />

        {/* Interaktive Körperbereiche */}
        {bodyAreas.map((area) => {
          const IconComponent = Icons[area.icon as keyof typeof Icons] as any;
          const isHovered = hoveredArea === area.id;

          return (
            <g key={area.id}>
              {/* Klickbarer Bereich */}
              <rect
                x={area.position.x}
                y={area.position.y}
                width={area.position.width}
                height={area.position.height}
                fill={isHovered ? area.color : 'transparent'}
                fillOpacity={isHovered ? 0.3 : 0.1}
                stroke={area.color}
                strokeWidth={isHovered ? 2 : 1}
                strokeOpacity={isHovered ? 0.8 : 0.4}
                rx="3"
                className="cursor-pointer transition-all duration-300 body-area-hotspot"
                onMouseEnter={() => setHoveredArea(area.id)}
                onMouseLeave={() => setHoveredArea(null)}
              />

              {/* Icon im Zentrum des Bereichs */}
              <foreignObject
                x={area.position.x + area.position.width / 2 - 3}
                y={area.position.y + area.position.height / 2 - 3}
                width="6"
                height="6"
                className="pointer-events-none"
              >
                <div className="flex items-center justify-center w-full h-full">
                  {IconComponent && (
                    <IconComponent
                      size={isHovered ? 20 : 16}
                      color={area.color}
                      className={`transition-all duration-300 ${
                        isHovered ? 'drop-shadow-lg' : ''
                      }`}
                    />
                  )}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hoveredArea && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-white/20 z-10"
        >
          {(() => {
            const area = bodyAreas.find(a => a.id === hoveredArea);
            if (!area) return null;

            const IconComponent = Icons[area.icon as keyof typeof Icons] as any;

            return (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {IconComponent && (
                    <IconComponent size={20} color={area.color} />
                  )}
                  <h3 className="font-playfair font-semibold text-charcoal-900">
                    {area.title}
                  </h3>
                </div>
                <p className="text-sm text-charcoal-700 mb-3 max-w-xs">
                  {area.description}
                </p>
                <Link
                  href={`/bereich/${area.slug}`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-terracotta-500 to-ocher-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Erkunden
                  <Icons.ArrowRight size={16} />
                </Link>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Mystische Aura-Effekte */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gold-400 rounded-full opacity-60 animate-spiritual-pulse" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-terracotta-400 rounded-full opacity-50 animate-spiritual-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-forest-400 rounded-full opacity-40 animate-spiritual-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
