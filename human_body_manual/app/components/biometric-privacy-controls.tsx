'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Trash2, Info } from 'lucide-react';
import { useBiometricIntegration } from '@/hooks/use-biometric-integration';
import { PrivacySettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface BiometricPrivacyControlsProps {
  userId: string;
}

export function BiometricPrivacyControls({ userId }: BiometricPrivacyControlsProps) {
  const { toast } = useToast();
  const {
    privacySettings,
    loading,
    error,
    updatePrivacySettings,
    deleteBiometricData
  } = useBiometricIntegration({ userId });

  const [localSettings, setLocalSettings] = useState<Partial<PrivacySettings>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Update local settings when privacy settings are loaded
  useState(() => {
    if (privacySettings && Object.keys(localSettings).length === 0) {
      setLocalSettings(privacySettings);
    }
  });

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      await updatePrivacySettings(localSettings);
      setHasChanges(false);
      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre Datenschutzeinstellungen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteData = async () => {
    try {
      await deleteBiometricData();
      toast({
        title: "Daten gelöscht",
        description: "Alle biometrischen Daten wurden erfolgreich gelöscht.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Daten konnten nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  if (!privacySettings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Biometrische Datenschutzeinstellungen
          </CardTitle>
          <CardDescription>
            Kontrollieren Sie, wie Ihre biometrischen Daten gesammelt und verwendet werden.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Biometric Collection Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-biometric">Biometrische Datensammlung</Label>
              <p className="text-sm text-muted-foreground">
                Erlauben Sie die Sammlung von Herzfrequenz, HRV und anderen biometrischen Daten
              </p>
            </div>
            <Switch
              id="allow-biometric"
              checked={localSettings.allowBiometricCollection ?? true}
              onCheckedChange={(checked) => handleSettingChange('allowBiometricCollection', checked)}
            />
          </div>

          {/* Community Sharing Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="share-community">Community-Freigabe</Label>
              <p className="text-sm text-muted-foreground">
                Teilen Sie anonymisierte Fortschrittsdaten mit der Community
              </p>
            </div>
            <Switch
              id="share-community"
              checked={localSettings.shareProgressWithCommunity ?? false}
              onCheckedChange={(checked) => handleSettingChange('shareProgressWithCommunity', checked)}
            />
          </div>

          {/* Insight Generation Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-insights">Erkenntnisse generieren</Label>
              <p className="text-sm text-muted-foreground">
                Erlauben Sie die Generierung personalisierter Erkenntnisse aus Ihren Daten
              </p>
            </div>
            <Switch
              id="allow-insights"
              checked={localSettings.allowInsightGeneration ?? true}
              onCheckedChange={(checked) => handleSettingChange('allowInsightGeneration', checked)}
            />
          </div>

          {/* Anonymization Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="anonymize-stats">Anonymisierung in Community-Statistiken</Label>
              <p className="text-sm text-muted-foreground">
                Stellen Sie sicher, dass Ihre Daten in Community-Statistiken vollständig anonymisiert sind
              </p>
            </div>
            <Switch
              id="anonymize-stats"
              checked={localSettings.anonymizeInCommunityStats ?? true}
              onCheckedChange={(checked) => handleSettingChange('anonymizeInCommunityStats', checked)}
            />
          </div>

          {/* Data Retention Slider */}
          <div className="space-y-3">
            <Label>Datenaufbewahrung: {localSettings.dataRetentionDays ?? 365} Tage</Label>
            <p className="text-sm text-muted-foreground">
              Wie lange sollen Ihre biometrischen Daten gespeichert werden?
            </p>
            <Slider
              value={[localSettings.dataRetentionDays ?? 365]}
              onValueChange={([value]) => handleSettingChange('dataRetentionDays', value)}
              max={3650}
              min={30}
              step={30}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30 Tage</span>
              <span>10 Jahre</span>
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
              {loading ? 'Speichern...' : 'Einstellungen speichern'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Data Deletion Section */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Daten löschen
          </CardTitle>
          <CardDescription>
            Löschen Sie alle Ihre biometrischen Daten permanent. Diese Aktion kann nicht rückgängig gemacht werden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Alle biometrischen Daten löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion löscht alle Ihre biometrischen Daten permanent. 
                  Dies umfasst Herzfrequenz, HRV, Stresslevel und alle anderen 
                  biometrischen Messungen. Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Ja, alle Daten löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Über biometrische Daten</p>
              <p className="text-xs text-muted-foreground">
                Biometrische Daten helfen dabei, die Wirksamkeit Ihrer Übungen zu verstehen 
                und personalisierte Empfehlungen zu geben. Alle Daten werden sicher gespeichert 
                und nur gemäß Ihren Datenschutzeinstellungen verwendet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}