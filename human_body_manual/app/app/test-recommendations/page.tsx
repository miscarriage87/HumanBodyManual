'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RecommendationDashboard } from '../../components/recommendation-dashboard';
import { 
  useOptimalPracticeTimes, 
  usePlateauDetection, 
  useMotivationalMessage, 
  useComplementaryTechniques 
} from '../../hooks/use-recommendation-engine';

export default function TestRecommendationsPage() {
  const [userId, setUserId] = useState('test-user-123');
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const handleTestRecommendations = () => {
    setActiveUserId(userId);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Recommendation Engine Test
        </h1>
        <p className="text-muted-foreground mb-6">
          Teste die KI-gestützten Empfehlungen und Insights für Benutzer.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Setup</CardTitle>
            <CardDescription>
              Gib eine Benutzer-ID ein, um die Empfehlungen zu testen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userId">Benutzer ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="test-user-123"
              />
            </div>
            <Button onClick={handleTestRecommendations}>
              Empfehlungen laden
            </Button>
          </CardContent>
        </Card>
      </div>

      {activeUserId && (
        <>
          <RecommendationDashboard userId={activeUserId} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <IndividualTestCard 
              title="Optimale Übungszeiten"
              userId={activeUserId}
              component={OptimalTimesTest}
            />
            <IndividualTestCard 
              title="Plateau Erkennung"
              userId={activeUserId}
              component={PlateauDetectionTest}
            />
            <IndividualTestCard 
              title="Motivations-Nachrichten"
              userId={activeUserId}
              component={MotivationalMessageTest}
            />
            <IndividualTestCard 
              title="Ergänzende Techniken"
              userId={activeUserId}
              component={ComplementaryTechniquesTest}
            />
          </div>
        </>
      )}
    </div>
  );
}

function IndividualTestCard({ 
  title, 
  userId, 
  component: Component 
}: { 
  title: string; 
  userId: string; 
  component: React.ComponentType<{ userId: string }>; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Component userId={userId} />
      </CardContent>
    </Card>
  );
}

function OptimalTimesTest({ userId }: { userId: string }) {
  const { optimalTimes, isLoading, error, refresh } = useOptimalPracticeTimes(userId);

  if (isLoading) return <div>Lade optimale Zeiten...</div>;
  if (error) return <div className="text-red-500">Fehler: {error}</div>;

  return (
    <div className="space-y-2">
      <Button onClick={refresh} size="sm" variant="outline">
        Aktualisieren
      </Button>
      {optimalTimes.length > 0 ? (
        <div className="space-y-2">
          {optimalTimes.map((time, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
              <div className="font-medium">
                {time.hour}:00 Uhr (Sicherheit: {Math.round(time.confidence * 100)}%)
              </div>
              <div className="text-gray-600">{time.reasoning}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">Keine Daten verfügbar</div>
      )}
    </div>
  );
}

function PlateauDetectionTest({ userId }: { userId: string }) {
  const { plateauDetection, isLoading, error, refresh } = usePlateauDetection(userId);

  if (isLoading) return <div>Analysiere Plateau...</div>;
  if (error) return <div className="text-red-500">Fehler: {error}</div>;

  return (
    <div className="space-y-2">
      <Button onClick={refresh} size="sm" variant="outline">
        Aktualisieren
      </Button>
      {plateauDetection ? (
        <div className="space-y-2">
          <div className={`p-2 rounded text-sm ${
            plateauDetection.isInPlateau ? 'bg-orange-50 text-orange-800' : 'bg-green-50 text-green-800'
          }`}>
            {plateauDetection.isInPlateau 
              ? `Plateau erkannt (${plateauDetection.plateauDuration} Tage)`
              : 'Kein Plateau - gute Fortschritte!'
            }
          </div>
          {plateauDetection.progressionSuggestions.length > 0 && (
            <div className="text-sm">
              <div className="font-medium mb-1">Empfehlungen:</div>
              <ul className="list-disc list-inside space-y-1">
                {plateauDetection.progressionSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500">Keine Daten verfügbar</div>
      )}
    </div>
  );
}

function MotivationalMessageTest({ userId }: { userId: string }) {
  const { motivationalMessage, isLoading, error, refresh } = useMotivationalMessage(userId);

  if (isLoading) return <div>Lade Motivation...</div>;
  if (error) return <div className="text-red-500">Fehler: {error}</div>;

  return (
    <div className="space-y-2">
      <Button onClick={refresh} size="sm" variant="outline">
        Aktualisieren
      </Button>
      {motivationalMessage ? (
        <div className="space-y-2">
          <div className={`p-2 rounded text-sm ${
            motivationalMessage.urgency === 'high' ? 'bg-red-50' :
            motivationalMessage.urgency === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
          }`}>
            <div className="font-medium">{motivationalMessage.title}</div>
            <div className="mt-1">{motivationalMessage.message}</div>
          </div>
          {motivationalMessage.actionItems.length > 0 && (
            <div className="text-sm">
              <div className="font-medium mb-1">Aktionen:</div>
              <ul className="list-disc list-inside space-y-1">
                {motivationalMessage.actionItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500">Keine Motivations-Nachricht</div>
      )}
    </div>
  );
}

function ComplementaryTechniquesTest({ userId }: { userId: string }) {
  const { complementaryTechniques, isLoading, error, refresh } = useComplementaryTechniques(userId);

  if (isLoading) return <div>Lade Techniken...</div>;
  if (error) return <div className="text-red-500">Fehler: {error}</div>;

  return (
    <div className="space-y-2">
      <Button onClick={refresh} size="sm" variant="outline">
        Aktualisieren
      </Button>
      {complementaryTechniques.length > 0 ? (
        <div className="space-y-2">
          {complementaryTechniques.slice(0, 3).map((technique) => (
            <div key={technique.exerciseId} className="p-2 bg-gray-50 rounded text-sm">
              <div className="font-medium">{technique.exercise.title}</div>
              <div className="text-gray-600 text-xs mt-1">
                Priorität: {technique.priority} | {technique.synergy}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">Keine Techniken verfügbar</div>
      )}
    </div>
  );
}