'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { 
  Download, 
  FileText, 
  Database, 
  Calendar,
  Trophy,
  Activity,
  Brain,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { exportService } from '@/lib/export-service';
import { DataExportRequest, DateRange } from '@/lib/types';
import { toast } from 'sonner';

interface ProgressExportProps {
  userId: string;
  className?: string;
}

export default function ProgressExport({
  userId,
  className = ''
}: ProgressExportProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [includeAchievements, setIncludeAchievements] = useState(true);
  const [includeBiometrics, setIncludeBiometrics] = useState(false);
  const [includeInsights, setIncludeInsights] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportPreview, setExportPreview] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadExportPreview();
  }, [dateRange]);

  if (!mounted) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const loadExportPreview = async () => {
    try {
      // Create a mock preview for now - in a real implementation this would be a separate method
      const exportRequest: DataExportRequest = {
        userId,
        format: 'json',
        dateRange,
        includeAchievements,
        includeBiometrics,
        includeInsights
      };
      
      // Generate export data to get preview info
      const exportData = await exportService.generateUserDataExport(exportRequest);
      const parsedData = JSON.parse(exportData);
      
      const preview = {
        totalSessions: parsedData.progressData?.length || 0,
        totalMinutes: parsedData.progressData?.reduce((sum: number, p: any) => sum + (p.durationMinutes || 0), 0) || 0,
        bodyAreasCount: new Set(parsedData.progressData?.map((p: any) => p.bodyArea) || []).size,
        achievementsCount: parsedData.achievements?.length || 0,
        dateRangeText: dateRange ? `${dateRange.from?.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString()}` : 'Alle Daten'
      };
      
      setExportPreview(preview);
    } catch (error) {
      console.error('Error loading export preview:', error);
      toast.error('Fehler beim Laden der Export-Vorschau');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportRequest: DataExportRequest = {
        userId,
        format: exportFormat,
        dateRange,
        includeAchievements,
        includeBiometrics,
        includeInsights
      };

      // Generate export
      const exportData = await exportService.generateUserDataExport(exportRequest);
      const filename = `human-body-manual-export-${userId}-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      
      // Create and download file
      const blob = new Blob([exportData], { 
        type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Daten erfolgreich als ${exportFormat.toUpperCase()} exportiert!`);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Fehler beim Exportieren der Daten');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: 'csv' | 'json') => {
    return format === 'csv' ? <FileText className="w-4 h-4" /> : <Database className="w-4 h-4" />;
  };

  const getFormatDescription = (format: 'csv' | 'json') => {
    return format === 'csv' 
      ? 'Kompatibel mit Excel, Google Sheets und anderen Tabellenkalkulationen'
      : 'Strukturiertes Format für Entwickler und erweiterte Datenanalyse';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-playfair font-semibold text-2xl text-charcoal-900 mb-2">
            📥 Daten-Export
          </h2>
          <p className="text-sm text-charcoal-600">
            Exportiere deine Fortschrittsdaten für externe Analyse oder Backup
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export-Konfiguration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">Export-Format</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['csv', 'json'] as const).map((format) => (
                    <div
                      key={format}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        exportFormat === format
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setExportFormat(format)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getFormatIcon(format)}
                        <span className="font-medium uppercase">{format}</span>
                        {exportFormat === format && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        {getFormatDescription(format)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Date Range */}
              <div>
                <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Zeitraum (optional)
                </Label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Alle Daten exportieren"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Leer lassen, um alle verfügbaren Daten zu exportieren
                </p>
              </div>

              <Separator />

              {/* Data Inclusion Options */}
              <div>
                <Label className="text-base font-medium mb-3 block">Zusätzliche Daten</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="achievements"
                      checked={includeAchievements}
                      onCheckedChange={(checked) => setIncludeAchievements(checked === true)}
                    />
                    <Label htmlFor="achievements" className="flex items-center gap-2 cursor-pointer">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      Errungenschaften einschließen
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="insights"
                      checked={includeInsights}
                      onCheckedChange={(checked) => setIncludeInsights(checked === true)}
                    />
                    <Label htmlFor="insights" className="flex items-center gap-2 cursor-pointer">
                      <Brain className="w-4 h-4 text-blue-600" />
                      Persönliche Einblicke einschließen
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="biometrics"
                      checked={includeBiometrics}
                      onCheckedChange={(checked) => setIncludeBiometrics(checked === true)}
                    />
                    <Label htmlFor="biometrics" className="flex items-center gap-2 cursor-pointer">
                      <Activity className="w-4 h-4 text-red-600" />
                      Biometrische Daten einschließen
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Privacy Notice */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Datenschutz-Hinweis</h4>
                    <p className="text-sm text-blue-800">
                      Deine exportierten Daten enthalten persönliche Informationen. 
                      Teile sie nur mit vertrauenswürdigen Quellen und bewahre sie sicher auf.
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exportiere...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Als {exportFormat.toUpperCase()} exportieren
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Export-Vorschau
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exportPreview ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700 mb-1">
                        {exportPreview.totalSessions}
                      </div>
                      <div className="text-sm text-green-600">Sessions</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700 mb-1">
                        {Math.round(exportPreview.totalMinutes / 60)}h
                      </div>
                      <div className="text-sm text-blue-600">Übungszeit</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Körperbereiche mit Daten</span>
                      <Badge variant="secondary">{exportPreview.bodyAreasCount}</Badge>
                    </div>
                    
                    {includeAchievements && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Errungenschaften</span>
                        <Badge variant="secondary">{exportPreview.achievementsCount}</Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Zeitraum</span>
                      <span className="text-sm font-medium">{exportPreview.dateRangeText}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Format</span>
                      <Badge variant="outline" className="uppercase">
                        {getFormatIcon(exportFormat)}
                        <span className="ml-1">{exportFormat}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Was wird exportiert:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Detaillierte Übungsprotokolle</li>
                      <li>• Fortschrittsstatistiken pro Körperbereich</li>
                      <li>• Streak-Informationen und Konsistenz-Daten</li>
                      {includeAchievements && <li>• Errungenschaften und Meilensteine</li>}
                      {includeInsights && <li>• Personalisierte Einblicke und Empfehlungen</li>}
                      {includeBiometrics && <li>• Biometrische Messwerte (falls vorhanden)</li>}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Export History/Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Export-Tipps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">CSV-Format</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ideal für Excel und Google Sheets</li>
                  <li>• Einfache Datenanalyse und Visualisierung</li>
                  <li>• Kompatibel mit den meisten Analyse-Tools</li>
                  <li>• Menschenlesbar und editierbar</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">JSON-Format</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Strukturierte Daten mit Hierarchien</li>
                  <li>• Ideal für Entwickler und APIs</li>
                  <li>• Behält komplexe Datenstrukturen bei</li>
                  <li>• Maschinenlesbar und programmierbar</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Tipp:</strong> Exportiere deine Daten regelmäßig als Backup. 
                So hast du immer eine Kopie deiner Fortschritte, auch wenn du das Gerät wechselst.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}