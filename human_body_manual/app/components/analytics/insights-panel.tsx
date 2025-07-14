'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Heart, 
  Brain,
  CheckCircle,
  AlertCircle,
  Info,
  Star,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserInsight, Recommendation, InsightType } from '@/lib/types';

interface InsightsPanelProps {
  insights?: UserInsight[];
  recommendations?: Recommendation[];
  onInsightViewed?: (insightIds: string[]) => void;
  onRefreshInsights?: () => void;
  className?: string;
}

const INSIGHT_ICONS: Record<InsightType, React.ReactNode> = {
  recommendation: <Lightbulb className="w-5 h-5" />,
  pattern_analysis: <TrendingUp className="w-5 h-5" />,
  plateau_detection: <Target className="w-5 h-5" />,
  motivation: <Heart className="w-5 h-5" />,
  optimization: <Brain className="w-5 h-5" />,
};

const PRIORITY_COLORS = {
  high: 'bg-red-50 border-red-200 text-red-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  low: 'bg-blue-50 border-blue-200 text-blue-800',
};

const PRIORITY_ICONS = {
  high: <AlertCircle className="w-4 h-4" />,
  medium: <Info className="w-4 h-4" />,
  low: <CheckCircle className="w-4 h-4" />,
};

export default function InsightsPanel({
  insights = [],
  recommendations = [],
  onInsightViewed,
  onRefreshInsights,
  className = ''
}: InsightsPanelProps) {
  const [activeTab, setActiveTab] = useState('insights');
  const [viewedInsights, setViewedInsights] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Generate mock data if not provided
  const mockInsights: UserInsight[] = insights.length > 0 ? insights : [
    {
      id: 'insight-1',
      userId: 'user-1',
      insightType: 'pattern_analysis',
      content: {
        title: 'Deine Übungsmuster',
        message: 'Du übst am liebsten am Morgen und bist besonders aktiv am Montag. Diese Konsistenz ist ein Zeichen für eine gesunde Routine!',
        actionItems: [
          'Nutze deine produktivste Zeit am Morgen für anspruchsvollere Übungen',
          'Plane deine Woche um deinen aktivsten Tag (Montag) herum'
        ],
        priority: 'medium',
        data: {
          averagePracticeHour: 8,
          mostActiveDay: 1,
          totalSessions: 15
        }
      },
      generatedAt: new Date(),
    },
    {
      id: 'insight-2',
      userId: 'user-1',
      insightType: 'plateau_detection',
      content: {
        title: 'Zeit für neue Herausforderungen',
        message: 'Du übst seit 12 Sessions auf Anfänger-Niveau. Dein Körper ist bereit für den nächsten Schritt!',
        actionItems: [
          'Probiere Übungen der nächsthöheren Schwierigkeitsstufe',
          'Verlängere die Dauer deiner aktuellen Übungen',
          'Kombiniere mehrere Übungen in einer Session'
        ],
        priority: 'high',
        data: {
          currentLevel: 'Anfänger',
          sessionsAtLevel: 12,
          suggestedProgression: 'Fortgeschritten'
        }
      },
      generatedAt: new Date(),
    },
    {
      id: 'insight-3',
      userId: 'user-1',
      insightType: 'motivation',
      content: {
        title: 'Baue deine Streak auf',
        message: '8 Sessions in den letzten 30 Tagen zeigen dein Engagement. Du bist auf einem guten Weg!',
        actionItems: [
          'Setze dir das Ziel, 3 Tage in Folge zu üben',
          'Wähle eine einfache 5-Minuten Übung für schwierige Tage',
          'Feiere jeden kleinen Erfolg auf deinem Weg'
        ],
        priority: 'medium',
        data: {
          currentStreak: 2,
          recentSessions: 8,
          encouragement: true
        }
      },
      generatedAt: new Date(),
    }
  ];

  const mockRecommendations: Recommendation[] = recommendations.length > 0 ? recommendations : [
    {
      id: 'rec-1',
      type: 'exercise',
      title: 'Erkunde Kältetherapie',
      description: 'Du hast in den letzten 2 Wochen keine Kältetherapie-Übungen gemacht. Zeit, diesen wichtigen Bereich zu erkunden!',
      bodyArea: 'kaelte',
      priority: 8,
      reasoning: 'Basierend auf deiner aktuellen Aktivität fehlt dir die Balance in diesem Körperbereich.',
      estimatedBenefit: 'Ganzheitliche Körperoptimierung durch ausgewogene Praxis aller Bereiche.',
    },
    {
      id: 'rec-2',
      type: 'progression',
      title: 'Steigere dich in Bewegung',
      description: 'Du zeigst großes Engagement in Bewegung & Faszientraining. Zeit für fortgeschrittene Techniken!',
      bodyArea: 'bewegung',
      priority: 7,
      reasoning: 'Du hast 15 Übungen in diesem Bereich absolviert - bereit für die nächste Stufe.',
      estimatedBenefit: 'Tiefere Wirkung und neue Herausforderungen für kontinuierliches Wachstum.',
    },
    {
      id: 'rec-3',
      type: 'schedule',
      title: 'Optimiere deine Übungszeiten',
      description: 'Deine besten Sessions finden morgens statt. Nutze diese Zeit für intensivere Übungen.',
      priority: 6,
      reasoning: 'Analyse deiner Übungsmuster zeigt höchste Effektivität am Morgen.',
      estimatedBenefit: 'Maximale Wirkung durch optimale Zeitplanung.',
    }
  ];

  const handleMarkAsViewed = (insightIds: string[]) => {
    const newViewedInsights = new Set([...viewedInsights, ...insightIds]);
    setViewedInsights(newViewedInsights);
    onInsightViewed?.(insightIds);
  };

  const handleMarkAllAsViewed = () => {
    const allInsightIds = mockInsights.map(insight => insight.id);
    handleMarkAsViewed(allInsightIds);
  };

  const unviewedInsights = mockInsights.filter(insight => !viewedInsights.has(insight.id));
  const sortedInsights = [...mockInsights].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.content.priority] - priorityOrder[a.content.priority];
  });

  const sortedRecommendations = [...mockRecommendations].sort((a, b) => b.priority - a.priority);

  return (
    <div className={`space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-playfair font-semibold text-2xl text-charcoal-900 mb-2">
            💡 Persönliche Einblicke
          </h2>
          <p className="text-sm text-charcoal-600">
            Maßgeschneiderte Empfehlungen basierend auf deinen Übungsmustern
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unviewedInsights.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {unviewedInsights.length} neu
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshInsights}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Aktualisieren
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Einblicke ({mockInsights.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Empfehlungen ({mockRecommendations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {unviewedInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Du hast {unviewedInsights.length} neue Einblicke
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsViewed}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Alle als gelesen markieren
              </Button>
            </motion.div>
          )}

          <AnimatePresence>
            {sortedInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${
                  !viewedInsights.has(insight.id) ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${PRIORITY_COLORS[insight.content.priority]}`}>
                          {INSIGHT_ICONS[insight.insightType]}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{insight.content.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={`${PRIORITY_COLORS[insight.content.priority]} border-current`}
                            >
                              {PRIORITY_ICONS[insight.content.priority]}
                              <span className="ml-1 capitalize">{insight.content.priority}</span>
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {insight.generatedAt.toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsViewed([insight.id])}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {viewedInsights.has(insight.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-charcoal-700 mb-4">{insight.content.message}</p>
                    
                    {insight.content.actionItems && insight.content.actionItems.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-charcoal-800 mb-2 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          Empfohlene Schritte:
                        </h4>
                        <ul className="space-y-2">
                          {insight.content.actionItems.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2 text-sm text-charcoal-600">
                              <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {sortedInsights.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-playfair font-semibold text-xl text-gray-600 mb-2">
                Keine Einblicke verfügbar
              </h3>
              <p className="text-gray-500 mb-4">
                Übe regelmäßig, um personalisierte Einblicke zu erhalten
              </p>
              <Button onClick={onRefreshInsights} variant="outline">
                Einblicke generieren
              </Button>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <AnimatePresence>
            {sortedRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-700">
                          {getRecommendationIcon(recommendation.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getRecommendationTypeLabel(recommendation.type)}
                            </Badge>
                            {recommendation.bodyArea && (
                              <Badge variant="secondary" className="text-xs">
                                {getBodyAreaName(recommendation.bodyArea)}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(recommendation.priority / 2)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-charcoal-700 mb-3">{recommendation.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-charcoal-800 min-w-[80px]">Grund:</span>
                        <span className="text-charcoal-600">{recommendation.reasoning}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-charcoal-800 min-w-[80px]">Nutzen:</span>
                        <span className="text-charcoal-600">{recommendation.estimatedBenefit}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Button size="sm" className="w-full">
                        Empfehlung umsetzen
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {sortedRecommendations.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-playfair font-semibold text-xl text-gray-600 mb-2">
                Keine Empfehlungen verfügbar
              </h3>
              <p className="text-gray-500 mb-4">
                Sammle mehr Übungsdaten, um personalisierte Empfehlungen zu erhalten
              </p>
              <Button onClick={onRefreshInsights} variant="outline">
                Empfehlungen generieren
              </Button>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getRecommendationIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    exercise: <Target className="w-5 h-5" />,
    schedule: <TrendingUp className="w-5 h-5" />,
    progression: <Star className="w-5 h-5" />,
    recovery: <Heart className="w-5 h-5" />,
  };
  return icons[type] || <Lightbulb className="w-5 h-5" />;
}

function getRecommendationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    exercise: 'Übung',
    schedule: 'Zeitplan',
    progression: 'Fortschritt',
    recovery: 'Erholung',
  };
  return labels[type] || type;
}

function getBodyAreaName(bodyArea: string): string {
  const names: Record<string, string> = {
    nervensystem: 'Nervensystem',
    hormone: 'Hormone',
    zirkadian: 'Zirkadian',
    mikrobiom: 'Mikrobiom',
    bewegung: 'Bewegung',
    fasten: 'Fasten',
    kaelte: 'Kälte',
    licht: 'Licht',
  };
  return names[bodyArea] || bodyArea;
}