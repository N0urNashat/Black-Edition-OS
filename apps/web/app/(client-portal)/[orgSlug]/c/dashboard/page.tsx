'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FolderKanban, FileText, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientDashboardPage() {
  const params = useParams();
  const _orgSlug = params.orgSlug as string;

  // Fetch dashboard summary data
  const { data: projects = [] } = useQuery({
    queryKey: ['client-projects'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/projects?limit=100', {
        headers: { 'x-organization-id': 'org_black_edition' },
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      return data.data || [];
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['client-invoices'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/invoices', {
        headers: { 'x-organization-id': 'org_black_edition' },
      });
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      return data.data || [];
    },
  });

  const { data: meetings = [] } = useQuery({
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

  // Calculate statistics
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;
  const unpaidInvoices = invoices.filter((i: any) =>
    i.status !== 'PAID' && i.status !== 'CANCELLED'
  ).length;
  const upcomingMeetings = meetings.filter((m: any) => m.status === 'UPCOMING').length;
  const totalHours = projects.reduce((sum: number, p: any) => sum + (p.totalHours || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your projects, invoices, and meetings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {projects.length} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.length} total invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {meetings.length} total meetings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Tracked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects yet</p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 3).map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.status}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {project.totalHours?.toFixed(1)}h
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 3).map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{invoice.status}</p>
                    </div>
                    <div className="text-sm font-medium">
                      {invoice.currency} {invoice.total}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
