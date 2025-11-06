'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, CreditCard, Wallet, Building2 } from 'lucide-react';

export default function BillingSettingsPage() {
  const queryClient = useQueryClient();

  // Fetch payment settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/settings/payment', {
        headers: {
          'x-organization-id': 'org_black_edition',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch payment settings');

      const data = await response.json();
      return data.data;
    },
  });

  // Local form state
  const [formData, setFormData] = useState({
    payMobEnabled: false,
    payMobApiKey: '',
    payMobIntegrationId: '',
    payMobHmacSecret: '',
    instapayEnabled: false,
    instapayLink: '',
    bankTransferEnabled: false,
    bankDetails: '',
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('http://localhost:4000/api/settings/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_black_edition',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure payment methods for invoices
          </p>
        </div>

        <div className="space-y-6">
          {/* PayMob Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-[#93DA97]" />
                  <div>
                    <CardTitle>PayMob</CardTitle>
                    <CardDescription>Accept online payments via PayMob gateway</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={formData.payMobEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, payMobEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {formData.payMobEnabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymob-api-key">API Key</Label>
                  <Input
                    id="paymob-api-key"
                    type="password"
                    placeholder="Enter your PayMob API key"
                    value={formData.payMobApiKey}
                    onChange={(e) => setFormData({ ...formData, payMobApiKey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymob-integration-id">Integration ID</Label>
                  <Input
                    id="paymob-integration-id"
                    placeholder="Enter your PayMob Integration ID"
                    value={formData.payMobIntegrationId}
                    onChange={(e) =>
                      setFormData({ ...formData, payMobIntegrationId: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymob-hmac">HMAC Secret</Label>
                  <Input
                    id="paymob-hmac"
                    type="password"
                    placeholder="Enter your PayMob HMAC Secret"
                    value={formData.payMobHmacSecret}
                    onChange={(e) =>
                      setFormData({ ...formData, payMobHmacSecret: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* InstaPay Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="h-6 w-6 text-[#93DA97]" />
                  <div>
                    <CardTitle>InstaPay</CardTitle>
                    <CardDescription>Share your InstaPay payment link</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={formData.instapayEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, instapayEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {formData.instapayEnabled && (
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="instapay-link">InstaPay Link</Label>
                  <Input
                    id="instapay-link"
                    placeholder="https://instapay.com/yourlink"
                    value={formData.instapayLink}
                    onChange={(e) => setFormData({ ...formData, instapayLink: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Customers will see this link on invoices
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Bank Transfer Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-[#93DA97]" />
                  <div>
                    <CardTitle>Bank Transfer</CardTitle>
                    <CardDescription>Display bank account details on invoices</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={formData.bankTransferEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, bankTransferEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {formData.bankTransferEnabled && (
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="bank-details">Bank Account Details</Label>
                  <Textarea
                    id="bank-details"
                    placeholder="Bank Name:&#10;Account Number:&#10;Account Holder:&#10;SWIFT/IBAN:"
                    rows={6}
                    value={formData.bankDetails}
                    onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    These details will be shown to customers on invoices
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {saveMutation.isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              Payment settings saved successfully!
            </div>
          )}

          {saveMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {saveMutation.error?.message || 'Failed to save settings'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
