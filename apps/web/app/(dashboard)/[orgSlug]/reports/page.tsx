'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, FolderKanban, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const params = useParams();
  const _orgSlug = params.orgSlug as string;

  // Fetch dashboard analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/analytics/dashboard', {
        headers: { 'x-organization-id': 'org_black_edition' },
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      return data.data;
    },
  });

  // Mock revenue over time data for the chart
  const revenueData = [
    { month: 'Jan', revenue: 45000, projects: 8 },
    { month: 'Feb', revenue: 52000, projects: 10 },
    { month: 'Mar', revenue: 48000, projects: 9 },
    { month: 'Apr', revenue: 61000, projects: 12 },
    { month: 'May', revenue: 55000, projects: 11 },
    { month: 'Jun', revenue: 67000, projects: 13 },
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-[#93DA97]" />
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive insights into your agency's performance
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              EGP {analytics?.financials.totalRevenue.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {analytics?.financials.totalInvoices || 0} paid invoices
            </p>
          </CardContent>
        </Card>

        {/* Total Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.leads.total || 0}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {analytics?.summary.conversionRate || 0}% conversion
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects in Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.projects.active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.projects.total || 0} total projects
            </p>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.tasks.completed || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.tasks.total || 0} total tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Lead Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Performance</CardTitle>
            <CardDescription>Breakdown of lead status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">New Leads</span>
              <span className="font-semibold">{analytics?.leads.new || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Qualified</span>
              <span className="font-semibold text-blue-600">{analytics?.leads.qualified || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Contacted</span>
              <span className="font-semibold">{analytics?.leads.contacted || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Converted</span>
              <span className="font-semibold text-green-600">{analytics?.leads.converted || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Current project distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active</span>
              <span className="font-semibold text-green-600">{analytics?.projects.active || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed</span>
              <span className="font-semibold text-blue-600">{analytics?.projects.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">On Hold</span>
              <span className="font-semibold text-yellow-600">{analytics?.projects.onHold || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Hours</span>
              <span className="font-semibold">{analytics?.projects.totalHoursTracked.toFixed(1) || '0.0'}h</span>
            </div>
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Health</CardTitle>
            <CardDescription>Revenue and invoicing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Revenue</span>
              <span className="font-semibold text-green-600">
                EGP {analytics?.financials.totalRevenue.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Outstanding</span>
              <span className="font-semibold text-yellow-600">
                EGP {analytics?.financials.outstandingRevenue.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Unpaid Invoices</span>
              <span className="font-semibold">{analytics?.financials.unpaidInvoiceCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Collection Rate</span>
              <span className="font-semibold text-blue-600">{analytics?.summary.collectionRate || '0'}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Monthly revenue and project trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#93DA97"
                  strokeWidth={2}
                  name="Revenue (EGP)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="projects"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Projects"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Automated insights from your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics && (
              <>
                {analytics.leads.thisMonth > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {analytics.leads.thisMonth} new leads this month
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Your lead generation is performing well
                      </p>
                    </div>
                  </div>
                )}
                {analytics.financials.unpaidInvoiceCount > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <DollarSign className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        {analytics.financials.unpaidInvoiceCount} unpaid invoices
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Total outstanding: EGP {analytics.financials.outstandingRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {analytics.projects.active > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FolderKanban className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {analytics.projects.active} projects in progress
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {analytics.projects.totalHoursTracked.toFixed(1)} hours tracked across all projects
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
