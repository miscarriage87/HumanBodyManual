'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Clock, 
  TrendingUp, 
  Heart, 
  Lightbulb, 
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useRecommendationEngine } from '../hooks/use-recommendation-engine';
import { OptimalPracticeTime, PlateauDetection, MotivationalMessage, ComplementaryTechnique } from '../lib/recommendation-engine';

interface RecommendationDashboardProps {
  userId: string;
}

export function RecommendationDashboard({ userId }: RecommendationDashboardProps) {
  const {
    optimalTimes,
    plateauDetection,
    motivationalMessage,
    complementaryTechniques,
    insights,
    isLoading,
    error,
    actions
  } = useRecommendationEngine(userId);

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Fehler beim Laden der Empfehlungen: {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={actions.refresh}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Personalisierte Empfehlungen</h2>
          <p className="text-muted-foreground">
            KI-gestützte Insights für deine optimale Wellness-Praxis
          </p>
        </div>
        <Button 
          onClick={actions.refresh} 
          disabled={isLoading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Optimal Practice Times */}
        <OptimalTimesCard 
          optimalTimes={optimalTimes} 
          isLoading={isLoading}
        />

        {/* Motivational Message */}
        <MotivationalMessageCard 
          motivationalMessage={motivationalMessage} 
          isLoading={isLoading}
        />

        {/* Plateau Detection */}
        <PlateauDetectionCard 
          plateauDetection={plateauDetection} 
          isLoading={isLoading}
        />

        {/* Complementary Techniques */}
        <ComplementaryTechniquesCard 
          complementaryTechniques={complementaryTechniques} 
          isLoading={isLoading}
        />
      </div>

      {/* Recent Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Aktuelle Insights
            </CardTitle>
            <CardDescription>
              Personalisierte Erkenntnisse basierend auf deiner Praxis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">{insight.content.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {insight.content.message}
                  </p>
                  {insight.content.actionItems && insight.content.actionItems.length > 0 && (
                    <ul className="text-sm space-y-1">
                      {insight.content.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Badge 
                    variant={insight.content.priority === 'high' ? 'destructive' : 'secondary'}
                    className="mt-2"
                  >
                    {insight.content.priority === 'high' ? 'Hoch' : 
                     insight.content.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OptimalTimesCard({ 
  optimalTimes, 
  isLoading 
}: { 
  optimalTimes: OptimalPracticeTime[]; 
  isLoading: boolean; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Optimale Übungszeiten
        </CardTitle>
        <CardDescription>
          Basierend auf deinen bisherigen Gewohnheiten
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : optimalTimes.length > 0 ? (
          <div className="space-y-3">
            {optimalTimes.slice(0, 2).map((time, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium">
                    {time.hour}:00 Uhr
                    {time.dayOfWeek >= 0 && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][time.dayOfWeek]})
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {time.reasoning}
                  </div>
                </div>
                <Badge variant="outline">
                  {Math.round(time.confidence * 100)}% Sicher
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Sammle mehr Daten für personalisierte Zeitempfehlungen
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MotivationalMessageCard({ 
  motivationalMessage, 
  isLoading 
}: { 
  motivationalMessage: MotivationalMessage | null; 
  isLoading: boolean; 
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Motivation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!motivationalMessage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Motivation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Du machst das großartig! Weiter so! 💪
          </p>
        </CardContent>
      </Card>
    );
  }

  const urgencyColor = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50'
  }[motivationalMessage.urgency];

  return (
    <Card className={urgencyColor}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          {motivationalMessage.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3">{motivationalMessage.message}</p>
        {motivationalMessage.actionItems.length > 0 && (
          <ul className="space-y-1">
            {motivationalMessage.actionItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Target className="h-3 w-3 mt-1 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PlateauDetectionCard({ 
  plateauDetection, 
  isLoading 
}: { 
  plateauDetection: PlateauDetection | null; 
  isLoading: boolean; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Fortschritts-Analyse
        </CardTitle>
        <CardDescription>
          Erkennung von Plateaus und Stagnation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : plateauDetection ? (
          <div className="space-y-3">
            {plateauDetection.isInPlateau ? (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Du befindest dich seit {plateauDetection.plateauDuration} Tagen in einer Plateau-Phase.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Großartig! Du machst kontinuierliche Fortschritte.
                </AlertDescription>
              </Alert>
            )}
            
            {plateauDetection.progressionSuggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Empfehlungen:</h4>
                <ul className="space-y-1">
                  {plateauDetection.progressionSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Target className="h-3 w-3 mt-1 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Sammle mehr Daten für Fortschritts-Analyse
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ComplementaryTechniquesCard({ 
  complementaryTechniques, 
  isLoading 
}: { 
  complementaryTechniques: ComplementaryTechnique[]; 
  isLoading: boolean; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Ergänzende Techniken
        </CardTitle>
        <CardDescription>
          Perfekte Ergänzungen für deine aktuelle Praxis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ) : complementaryTechniques.length > 0 ? (
          <div className="space-y-3">
            {complementaryTechniques.slice(0, 2).map((technique) => (
              <div key={technique.exerciseId} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{technique.exercise.title}</h4>
                  <Badge variant="outline">
                    Priorität {technique.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {technique.synergy}
                </p>
                <p className="text-sm font-medium text-blue-600">
                  {technique.expectedBenefit}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Übe mehr, um personalisierte Empfehlungen zu erhalten
          </p>
        )}
      </CardContent>
    </Card>
  );
}