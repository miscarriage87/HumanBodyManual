'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBiometricIntegration } from '@/hooks/use-biometric-integration';
import { BiometricPrivacyControls } from '@/components/biometric-privacy-controls';
import { Activity, Heart, Brain, TrendingUp, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestBiometricPage() {
  const { toast } = useToast();
  const userId = 'user-123'; // Mock user ID
  
  const {
    biometricData,
    correlations,
    trends,
    privacySettings,
    loading,
    error,
    storeBiometricData,
    fetchCorrelations,
    fetchTrends,
    clearError
  } = useBiometricIntegration({ userId });

  const [testData, setTestData] = useState({
    heartRate: 75,
    hrv: 45,
    stressLevel: 4,
    recoveryScore: 80
  });

  const handleSubmitTestData = async () => {
    try {
      await storeBiometricData({
        heartRate: testData.heartRate,
        hrv: testData.hrv,
        stressLevel: testData.stressLevel,
        recoveryScore: testData.recoveryScore,
        source: 'manual' as const
      }, 'test-exercise-1');

      toast({
        title: "Biometrische Daten gespeichert",
        description: "Die Testdaten wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Daten konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleFetchCorrelations = async () => {
    try {
      await fetchCorrelations('month');
      toast({
        title: "Korrelationen geladen",
        description: "Die Korrelationsanalyse wurde erfolgreich durchgeführt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Korrelationen konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const handleFetchTrends = async () => {
    try {
      await fetchTrends('heartRate', 'month');
      toast({
        title: "Trends geladen",
        description: "Die Trendanalyse wurde erfolgreich durchgeführt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Trends konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-forest-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl lg:text-4xl font-bold text-charcoal-900 mb-4">
            Biometrische Datenintegration - Test
          </h1>
          <p className="text-lg text-charcoal-700 max-w-3xl mx-auto">
            Testen Sie die biometrische Datenintegration, Korrelationsanalyse und Datenschutzkontrollen.
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  Schließen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="data-entry" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="data-entry" className="flex items-center gap-2">
              <Activity size={16} />
              Daten eingeben
            </TabsTrigger>
            <TabsTrigger value="data-view" className="flex items-center gap-2">
              <Heart size={16} />
              Daten anzeigen
            </TabsTrigger>
            <TabsTrigger value="correlations" className="flex items-center gap-2">
              <Brain size={16} />
              Korrelationen
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp size={16} />
              Trends
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield size={16} />
              Datenschutz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data-entry">
            <Card>
              <CardHeader>
                <CardTitle>Biometrische Testdaten eingeben</CardTitle>
                <CardDescription>
                  Geben Sie Testdaten ein, um die biometrische Datenintegration zu testen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heartRate">Herzfrequenz (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      value={testData.heartRate}
                      onChange={(e) => setTestData(prev => ({ ...prev, heartRate: parseInt(e.target.value) }))}
                      min="30"
                      max="220"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hrv">HRV (ms)</Label>
                    <Input
                      id="hrv"
                      type="number"
                      value={testData.hrv}
                      onChange={(e) => setTestData(prev => ({ ...prev, hrv: parseInt(e.target.value) }))}
                      min="0"
                      max="200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stressLevel">Stresslevel (1-10)</Label>
                    <Input
                      id="stressLevel"
                      type="number"
                      value={testData.stressLevel}
                      onChange={(e) => setTestData(prev => ({ ...prev, stressLevel: parseInt(e.target.value) }))}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recoveryScore">Erholungswert (0-100)</Label>
                    <Input
                      id="recoveryScore"
                      type="number"
                      value={testData.recoveryScore}
                      onChange={(e) => setTestData(prev => ({ ...prev, recoveryScore: parseInt(e.target.value) }))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <Button onClick={handleSubmitTestData} disabled={loading} className="w-full">
                  {loading ? 'Speichern...' : 'Testdaten speichern'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-view">
            <Card>
              <CardHeader>
                <CardTitle>Gespeicherte biometrische Daten</CardTitle>
                <CardDescription>
                  Übersicht über alle gespeicherten biometrischen Daten der letzten 30 Tage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {biometricData.length > 0 ? (
                  <div className="space-y-4">
                    {biometricData.slice(0, 10).map((data, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">
                            {new Date(data.timestamp).toLocaleString('de-DE')}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {data.source}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {data.heartRate && (
                            <div>
                              <span className="text-muted-foreground">HR:</span> {data.heartRate} bpm
                            </div>
                          )}
                          {data.hrv && (
                            <div>
                              <span className="text-muted-foreground">HRV:</span> {data.hrv} ms
                            </div>
                          )}
                          {data.stressLevel && (
                            <div>
                              <span className="text-muted-foreground">Stress:</span> {data.stressLevel}/10
                            </div>
                          )}
                          {data.recoveryScore && (
                            <div>
                              <span className="text-muted-foreground">Erholung:</span> {data.recoveryScore}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Noch keine biometrischen Daten vorhanden. Fügen Sie Testdaten hinzu, um sie hier zu sehen.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlations">
            <Card>
              <CardHeader>
                <CardTitle>Korrelationsanalyse</CardTitle>
                <CardDescription>
                  Analyse der Korrelationen zwischen Übungen und biometrischen Daten.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleFetchCorrelations} disabled={loading}>
                  {loading ? 'Analysiere...' : 'Korrelationen analysieren'}
                </Button>
                
                {correlations.length > 0 ? (
                  <div className="space-y-4">
                    {correlations.map((correlation, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{correlation.exerciseId}</h4>
                          <span className="text-sm text-muted-foreground">
                            {correlation.sessionCount} Sessions
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                          {correlation.avgHeartRate && (
                            <div>Ø HR: {Math.round(correlation.avgHeartRate)} bpm</div>
                          )}
                          {correlation.avgHrv && (
                            <div>Ø HRV: {Math.round(correlation.avgHrv)} ms</div>
                          )}
                          {correlation.avgStressLevel && (
                            <div>Ø Stress: {correlation.avgStressLevel.toFixed(1)}/10</div>
                          )}
                          {correlation.avgRecoveryScore && (
                            <div>Ø Erholung: {Math.round(correlation.avgRecoveryScore)}%</div>
                          )}
                        </div>
                        {correlation.insights.length > 0 && (
                          <div className="space-y-1">
                            <h5 className="text-sm font-medium">Erkenntnisse:</h5>
                            {correlation.insights.map((insight, i) => (
                              <p key={i} className="text-xs text-muted-foreground">• {insight}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Noch keine Korrelationsdaten verfügbar. Klicken Sie auf "Korrelationen analysieren".
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Trendanalyse</CardTitle>
                <CardDescription>
                  Trends in biometrischen Daten über die Zeit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleFetchTrends} disabled={loading}>
                  {loading ? 'Analysiere...' : 'Herzfrequenz-Trends laden'}
                </Button>
                
                {Object.keys(trends).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(trends).map(([key, trend]) => (
                      <div key={key} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium capitalize">{trend.metric} - {trend.period}</h4>
                          <span className={`text-sm px-2 py-1 rounded ${
                            trend.trend === 'improving' ? 'bg-green-100 text-green-700' :
                            trend.trend === 'declining' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {trend.trend === 'improving' ? 'Verbesserung' :
                             trend.trend === 'declining' ? 'Verschlechterung' : 'Stabil'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Änderung: {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage.toFixed(1)}%
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {trend.values.length} Datenpunkte über {trend.period}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Noch keine Trenddaten verfügbar. Klicken Sie auf "Trends laden".
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <BiometricPrivacyControls userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}