'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  UserCheck,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const orgSlug = params.orgSlug as string;

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  async function fetchLead() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:4000/api/leads/${leadId}`, {
        headers: {
          'x-organization-id': 'org_black_edition',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Lead not found');
        }
        throw new Error('Failed to fetch lead');
      }

      const data = await response.json();
      setLead(data.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching lead:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete lead "${lead.name}"?`)) return;

    try {
      const response = await fetch(`http://localhost:4000/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'x-organization-id': 'org_black_edition',
        },
      });

      if (!response.ok) throw new Error('Failed to delete lead');

      // Redirect to leads list
      router.push(`/${orgSlug}/leads`);
    } catch (err: any) {
      alert('Failed to delete lead: ' + err.message);
    }
  }

  async function handleConvert() {
    if (!confirm(`Convert "${lead.name}" to a customer? This will mark the lead as WON.`)) return;

    try {
      const response = await fetch(`http://localhost:4000/api/leads/${leadId}/convert`, {
        method: 'POST',
        headers: {
          'x-organization-id': 'org_black_edition',
          'x-user-id': 'user_2',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to convert lead');
      }

      // Refresh the lead data to show updated status
      await fetchLead();
      alert('Lead converted to customer successfully!');
    } catch (err: any) {
      alert('Failed to convert lead: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="h-64 bg-gray-200 rounded md:col-span-2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold">Error loading lead</h3>
          <p className="text-red-600 text-sm mt-1">{error || 'Lead not found'}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={fetchLead} variant="outline">
              Try Again
            </Button>
            <Link href={`/${orgSlug}/leads`}>
              <Button variant="outline">Back to Leads</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Score color and quality
  const scoreColor = lead.score >= 70 ? 'text-green-600' :
                     lead.score >= 40 ? 'text-yellow-600' : 'text-red-600';
  const scoreQuality = lead.score >= 70 ? 'Hot Lead 🔥' :
                       lead.score >= 40 ? 'Warm Lead ⚡' : 'Cold Lead ❄️';

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-purple-100 text-purple-800',
    QUALIFIED: 'bg-green-100 text-green-800',
    PROPOSAL: 'bg-yellow-100 text-yellow-800',
    NEGOTIATION: 'bg-orange-100 text-orange-800',
    WON: 'bg-green-600 text-white',
    LOST: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${orgSlug}/leads`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{lead.name}</h1>
            <p className="text-muted-foreground">{lead.company || 'No company'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/${orgSlug}/leads/${leadId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Lead Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{lead.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{lead.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{lead.company || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {lead.website}
                      </a>
                    ) : (
                      <p className="font-medium">Not provided</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <p className="text-sm text-muted-foreground">
                  {lead.requirements || 'No requirements specified'}
                </p>
              </div>

              {lead.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{lead.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.activities?.length > 0 ? (
                <div className="space-y-4">
                  {lead.activities.map((activity: any, index: number) => (
                    <div key={activity.id || index} className="flex gap-3 border-l-2 border-gray-200 pl-4">
                      <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {activity.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{activity.description}</p>
                        {activity.user && (
                          <p className="text-xs text-muted-foreground mt-1">
                            by {activity.user.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activities yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-5xl font-bold ${scoreColor}`}>
                  {lead.score}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {scoreQuality}
                </p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      lead.score >= 70 ? 'bg-green-600' :
                      lead.score >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${lead.score}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className={`${statusColors[lead.status]} border-none`}>
                  {lead.status}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Source</p>
                <Badge variant="outline">{lead.source || 'Unknown'}</Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Timeline</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">
                    {lead.timeline || 'Not set'}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Budget</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {lead.budget ? `EGP ${lead.budget.toLocaleString()}` : 'Not specified'}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Decision Maker</p>
                <span className="text-sm font-medium">
                  {lead.decisionMaker ? '✓ Yes' : '✗ No'}
                </span>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Assigned To</p>
                <span className="text-sm font-medium">
                  {lead.assignedTo?.name || 'Unassigned'}
                </span>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <span className="text-sm">
                  {new Date(lead.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="default"
                onClick={handleConvert}
                disabled={lead?.status === 'WON' || lead?.status === 'LOST'}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {lead?.status === 'WON' ? 'Already Converted' : 'Convert to Customer'}
              </Button>
              <Button className="w-full" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Link href={`/${orgSlug}/leads/${leadId}/edit`} className="block">
                <Button className="w-full" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Lead
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
