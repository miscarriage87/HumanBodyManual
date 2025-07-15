'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Download, Shield, Trash2, Share2, Eye, EyeOff, Database, FileText, Settings } from 'lucide-react';
import { PrivacySettings } from '@/lib/types';

interface PrivacyDashboardProps {
  userId: string;
}

export function PrivacyDashboard({ userId }: PrivacyDashboardProps) {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchPrivacySettings();
  }, [userId]);

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch(`/api/privacy/settings?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setPrivacySettings(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load privacy settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/privacy/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          ...updates
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPrivacySettings(data.data);
        toast({
          title: 'Success',
          description: 'Privacy settings updated successfully'
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/privacy/export?userId=${userId}&format=${format}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `human-body-manual-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Success',
          description: `Data exported successfully as ${format.toUpperCase()}`
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const exportPortabilityData = async (format: 'standard' | 'platform') => {
    try {
      const response = await fetch(`/api/privacy/portability?userId=${userId}&format=${format}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `human-body-manual-portability-${format}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Success',
          description: `Portability data exported in ${format} format`
        });
      } else {
        throw new Error('Portability export failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export portability data',
        variant: 'destructive'
      });
    }
  };

  const deleteAccount = async () => {
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      toast({
        title: 'Error',
        description: 'Please type "DELETE MY ACCOUNT" to confirm',
        variant: 'destructive'
      });
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/privacy/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          confirmationText
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Download final export before showing success message
        if (data.finalExport) {
          const blob = new Blob([data.finalExport], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `final-export-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }

        toast({
          title: 'Account Deleted',
          description: 'Your account and all data have been permanently deleted. A final export has been downloaded.'
        });
        
        // Redirect to home page or login
        window.location.href = '/';
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please contact support.',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!privacySettings) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load privacy settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Privacy & Data Control</h1>
      </div>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Privacy Settings</span>
          </CardTitle>
          <CardDescription>
            Control how your data is used and shared within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="community-sharing">Community Data Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow your anonymized progress to contribute to community statistics
              </p>
            </div>
            <Switch
              id="community-sharing"
              checked={privacySettings.shareProgressWithCommunity}
              onCheckedChange={(checked) => 
                updatePrivacySettings({ shareProgressWithCommunity: checked })
              }
              disabled={updating}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="biometric-collection">Biometric Data Collection</Label>
              <p className="text-sm text-muted-foreground">
                Allow collection and analysis of biometric data from connected devices
              </p>
            </div>
            <Switch
              id="biometric-collection"
              checked={privacySettings.allowBiometricCollection}
              onCheckedChange={(checked) => 
                updatePrivacySettings({ allowBiometricCollection: checked })
              }
              disabled={updating}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="insight-generation">Insight Generation</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI-powered analysis to generate personalized insights and recommendations
              </p>
            </div>
            <Switch
              id="insight-generation"
              checked={privacySettings.allowInsightGeneration}
              onCheckedChange={(checked) => 
                updatePrivacySettings({ allowInsightGeneration: checked })
              }
              disabled={updating}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="anonymize-stats">Anonymize in Community Stats</Label>
              <p className="text-sm text-muted-foreground">
                Ensure complete anonymization when your data contributes to community statistics
              </p>
            </div>
            <Switch
              id="anonymize-stats"
              checked={privacySettings.anonymizeInCommunityStats}
              onCheckedChange={(checked) => 
                updatePrivacySettings({ anonymizeInCommunityStats: checked })
              }
              disabled={updating}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="retention-days">Data Retention Period (Days)</Label>
            <Input
              id="retention-days"
              type="number"
              value={privacySettings.dataRetentionDays}
              onChange={(e) => 
                updatePrivacySettings({ dataRetentionDays: parseInt(e.target.value) || 365 })
              }
              min="30"
              max="3650"
              disabled={updating}
            />
            <p className="text-sm text-muted-foreground">
              How long to keep your data (minimum 30 days, maximum 10 years)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Data Export</span>
          </CardTitle>
          <CardDescription>
            Download your complete data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => exportData('json')}
              disabled={exporting}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Export as JSON</span>
            </Button>
            
            <Button
              onClick={() => exportData('csv')}
              disabled={exporting}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Database className="h-4 w-4" />
              <span>Export as CSV</span>
            </Button>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Data Portability</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Export your data in standardized formats for use with other platforms
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => exportPortabilityData('standard')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Standard Format</span>
              </Button>
              
              <Button
                onClick={() => exportPortabilityData('platform')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Platform Specific</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <span>Delete Account</span>
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete My Account</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                  <p>Before deletion, we will generate a final export of all your data.</p>
                  <p className="font-medium">To confirm, please type "DELETE MY ACCOUNT" below:</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Type DELETE MY ACCOUNT"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmationText('')}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAccount}
                  disabled={deleting || confirmationText !== 'DELETE MY ACCOUNT'}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Your Privacy Rights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Badge variant="secondary">Right to Access</Badge>
              <p className="text-sm text-muted-foreground">
                You can access and download all your personal data at any time
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="secondary">Right to Rectification</Badge>
              <p className="text-sm text-muted-foreground">
                You can correct or update your personal information
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="secondary">Right to Erasure</Badge>
              <p className="text-sm text-muted-foreground">
                You can request complete deletion of your account and data
              </p>
            </div>
            
            <div className="space-y-2">
              <Badge variant="secondary">Right to Portability</Badge>
              <p className="text-sm text-muted-foreground">
                You can export your data in machine-readable formats
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}