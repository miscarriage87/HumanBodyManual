'use client';

import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { motion } from 'framer-motion';
import { Tooltip } from '@/components/ui/tooltip';
import 'react-calendar-heatmap/dist/styles.css';

interface HeatmapValue {
  date: string;
  count: number;
}

interface CalendarHeatmapComponentProps {
  values: HeatmapValue[];
  startDate: Date;
  endDate: Date;
  className?: string;
}

export default function CalendarHeatmapComponent({
  values,
  startDate,
  endDate,
  className = ''
}: CalendarHeatmapComponentProps) {
  const getTooltipDataAttribs = (value: any) => {
    if (!value || !value.date) {
      return {
        'data-tip': 'Keine Aktivität'
      };
    }
    
    const date = new Date(value.date);
    const formattedDate = date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const activityText = value.count === 0 
      ? 'Keine Aktivität' 
      : value.count === 1 
        ? '1 Übung abgeschlossen'
        : `${value.count} Übungen abgeschlossen`;
    
    return {
      'data-tip': `${formattedDate}: ${activityText}`
    };
  };

  const getClassForValue = (value: any) => {
    if (!value || value.count === 0) {
      return 'color-empty';
    }
    if (value.count <= 2) {
      return 'color-scale-1';
    }
    if (value.count <= 4) {
      return 'color-scale-2';
    }
    if (value.count <= 6) {
      return 'color-scale-3';
    }
    return 'color-scale-4';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`calendar-heatmap-container ${className}`}
    >
      <style jsx global>{`
        .react-calendar-heatmap {
          font-family: inherit;
        }
        
        .react-calendar-heatmap .color-empty {
          fill: #ebedf0;
        }
        
        .react-calendar-heatmap .color-scale-1 {
          fill: #c6e48b;
        }
        
        .react-calendar-heatmap .color-scale-2 {
          fill: #7bc96f;
        }
        
        .react-calendar-heatmap .color-scale-3 {
          fill: #239a3b;
        }
        
        .react-calendar-heatmap .color-scale-4 {
          fill: #196127;
        }
        
        .react-calendar-heatmap rect:hover {
          stroke: #555;
          stroke-width: 1px;
        }
        
        .react-calendar-heatmap .month-label {
          font-size: 12px;
          fill: #767676;
        }
        
        .react-calendar-heatmap .day-label {
          font-size: 10px;
          fill: #767676;
        }
        
        .calendar-heatmap-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
          .calendar-heatmap-container {
            padding: 16px;
            overflow-x: auto;
          }
          
          .react-calendar-heatmap {
            min-width: 600px;
          }
        }
      `}</style>
      
      <div className="mb-4">
        <h3 className="font-playfair font-semibold text-lg text-charcoal-900 mb-2">
          📅 Aktivitätsverlauf
        </h3>
        <p className="text-sm text-charcoal-600">
          Deine tägliche Übungspraxis der letzten 90 Tage
        </p>
      </div>
      
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        classForValue={getClassForValue}
        showWeekdayLabels={true}
        showMonthLabels={true}
      />
      
      <div className="flex items-center justify-between mt-4 text-xs text-charcoal-500">
        <span>Weniger</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-200"></div>
          <div className="w-3 h-3 rounded-sm bg-green-200"></div>
          <div className="w-3 h-3 rounded-sm bg-green-400"></div>
          <div className="w-3 h-3 rounded-sm bg-green-600"></div>
          <div className="w-3 h-3 rounded-sm bg-green-800"></div>
        </div>
        <span>Mehr</span>
      </div>
    </motion.div>
  );
}