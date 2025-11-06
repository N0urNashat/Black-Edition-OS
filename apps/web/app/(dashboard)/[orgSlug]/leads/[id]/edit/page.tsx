'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditLeadPage() {
  const { id, orgSlug } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    source: 'website',
    budget: '',
    timeline: 'soon',
    decisionMaker: false,
    requirements: '',
    notes: '',
  });

  // Fetch lead using React Query
  const { data: lead, isLoading: fetchingLead } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:4000/api/leads/${id}`, {
        headers: {
          'x-organization-id': 'org_black_edition',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lead');
      }

      const data = await response.json();
      return data.data;
    },
  });

  // Pre-fill form when lead data is loaded
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        company: lead.company || '',
        email: lead.email || '',
        phone: lead.phone || '',
        website: lead.website || '',
        source: lead.source || 'website',
        budget: lead.budget ? lead.budget.toString() : '',
        timeline: lead.timeline || 'soon',
        decisionMaker: lead.decisionMaker || false,
        requirements: lead.requirements || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`http://localhost:4000/api/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_black_edition',
          'x-user-id': 'user_2',
        },
        body: JSON.stringify({
          ...data,
          budget: data.budget ? parseFloat(data.budget) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      // Redirect to detail page
      router.push(`/${orgSlug}/leads/${id}`);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate(formData);
  }

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  if (fetchingLead) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#93DA97]" />
          <p className="text-muted-foreground">Loading lead data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href={`/${orgSlug}/leads`} className="hover:text-foreground">
              Leads
            </Link>
            <span>/</span>
            <Link href={`/${orgSlug}/leads/${id}`} className="hover:text-foreground">
              {formData.name}
            </Link>
            <span>/</span>
            <span>Edit</span>
          </div>
          <h1 className="text-3xl font-bold">Edit Lead</h1>
          <p className="text-muted-foreground mt-1">Update lead information and details</p>
        </div>
        <Link href={`/${orgSlug}/leads/${id}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lead
          </Button>
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Basic contact details for the lead</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">
                  Company <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+20 100 123 4567"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lead Details */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
            <CardDescription>Additional information about the lead</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">
                  Source <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleChange('source', value)}
                >
                  <SelectTrigger id="source">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="cold-outreach">Cold Call</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">
                  Timeline <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.timeline}
                  onValueChange={(value) => handleChange('timeline', value)}
                >
                  <SelectTrigger id="timeline">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent (Within 1 month)</SelectItem>
                    <SelectItem value="soon">Soon (1-3 months)</SelectItem>
                    <SelectItem value="future">Future (3+ months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (EGP)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="50000"
                  value={formData.budget}
                  onChange={(e) => handleChange('budget', e.target.value)}
                />
              </div>
              <div className="space-y-2 flex items-center pt-8">
                <input
                  id="decisionMaker"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={formData.decisionMaker}
                  onChange={(e) => handleChange('decisionMaker', e.target.checked)}
                />
                <Label htmlFor="decisionMaker" className="ml-2 cursor-pointer">
                  Contact is decision maker
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Describe what the lead is looking for..."
                rows={4}
                value={formData.requirements}
                onChange={(e) => handleChange('requirements', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this lead..."
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {updateMutation.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {updateMutation.error?.message || 'Failed to update lead'}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={updateMutation.isPending} className="bg-[#93DA97] hover:bg-[#7bc47f] text-black">
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Lead'
            )}
          </Button>
          <Link href={`/${orgSlug}/leads/${id}`}>
            <Button type="button" variant="outline" disabled={updateMutation.isPending}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
