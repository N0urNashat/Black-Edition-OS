'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function ClientMeetingsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const _orgSlug = params.orgSlug as string;

  const [formData, setFormData] = useState({
    customerId: 'cust_1', // In a real app, this would be from auth context
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
  });

  // Fetch meetings
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['client-meetings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/meetings', {
        headers: { 'x-organization-id': 'org_black_edition' },
      });
      if (!response.ok) throw new Error('Failed to fetch meetings');
      const data = await response.json();
      return data.data || [];
    },
  });

  // Request meeting mutation
  const requestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('http://localhost:4000/api/meetings/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_black_edition',
          'x-user-id': 'client_1',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request meeting');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-meetings'] });
      setFormData({
        customerId: 'cust_1',
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestMutation.mutate(formData);
  };

  // Separate upcoming and past meetings
  const upcomingMeetings = meetings.filter((m: any) => m.status === 'UPCOMING');
  const pastMeetings = meetings.filter((m: any) =>
    m.status === 'COMPLETED' || m.status === 'CANCELLED'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meetings</h1>
        <p className="text-muted-foreground mt-1">
          View upcoming meetings and request new ones
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Upcoming Meetings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ) : upcomingMeetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold">No upcoming meetings</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Request a meeting using the form
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting: any) => (
                    <div
                      key={meeting.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{meeting.title}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {meeting.status}
                        </Badge>
                      </div>
                      {meeting.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {meeting.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(meeting.startTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(meeting.startTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(meeting.endTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {meeting.meetingLink && (
                          <div className="flex items-center gap-2 text-sm">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>
                      {meeting.project && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            Project: {meeting.project.name}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Meetings */}
          {pastMeetings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Past Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastMeetings.slice(0, 3).map((meeting: any) => (
                    <div key={meeting.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{meeting.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(meeting.startTime).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            meeting.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Request Meeting Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request a Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Project Review"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What would you like to discuss?"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                <Input
                  id="meetingLink"
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={requestMutation.isPending}>
                {requestMutation.isPending ? 'Requesting...' : 'Request Meeting'}
              </Button>

              {requestMutation.isSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                  Meeting request submitted successfully!
                </div>
              )}

              {requestMutation.isError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {requestMutation.error?.message || 'Failed to request meeting'}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
