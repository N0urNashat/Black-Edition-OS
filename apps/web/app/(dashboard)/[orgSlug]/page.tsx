'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, FolderKanban, DollarSign, TrendingUp, TrendingDown, Minus, Brain, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const params = useParams();
  const { user } = useUser();
  const orgSlug = params.orgSlug as string;

  // Fetch AI insights
  const { data: aiInsights, isLoading: loadingInsights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/ai/generate-report-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_black_edition',
          'x-user-id': 'user_1',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch insights');
      const data = await response.json();
      return data.data;
    },
  });

  // TODO: Fetch real data from database
  const stats = {
    leads: {
      total: 47,
      trend: 12,
      trendDirection: 'up' as const,
    },
    projects: {
      total: 12,
      trend: 0,
      trendDirection: 'neutral' as const,
    },
    invoices: {
      amount: 125000,
      count: 8,
      trend: -5,
      trendDirection: 'down' as const,
    },
    revenue: {
      amount: 285000,
      trend: 18,
      trendDirection: 'up' as const,
    },
  };

  const recentActivity = [
    {
      id: 1,
      type: 'lead',
      title: 'New lead: Ahmed Hassan',
      description: 'Website redesign project',
      time: '5 minutes ago',
    },
    {
      id: 2,
      type: 'project',
      title: 'Project completed: E-commerce Platform',
      description: 'Customer: Tech Solutions Ltd',
      time: '2 hours ago',
    },
    {
      id: 3,
      type: 'invoice',
      title: 'Invoice paid: INV-2024-045',
      description: 'EGP 45,000',
      time: '1 day ago',
    },
    {
      id: 4,
      type: 'task',
      title: 'Task completed: Design mockups',
      description: 'Project: Mobile App Redesign',
      time: '2 days ago',
    },
  ];

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || 'User'}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your agency today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads.total}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {getTrendIcon(stats.leads.trendDirection)}
              <span className={getTrendColor(stats.leads.trendDirection)}>
                {Math.abs(stats.leads.trend)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects.total}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {getTrendIcon(stats.projects.trendDirection)}
              <span className={getTrendColor(stats.projects.trendDirection)}>
                No change from last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Invoices
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              EGP {stats.invoices.amount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.invoices.count} pending invoices
            </p>
          </CardContent>
        </Card>

        {/* This Month Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              EGP {stats.revenue.amount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {getTrendIcon(stats.revenue.trendDirection)}
              <span className={getTrendColor(stats.revenue.trendDirection)}>
                {Math.abs(stats.revenue.trend)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Insights */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#93DA97]" />
              AI Insights
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your business metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInsights ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Analyzing your data...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                </div>
              </div>
            ) : aiInsights ? (
              <div className="prose prose-sm max-w-none">
                <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {aiInsights.insights}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                AI insights unavailable
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#93DA97]/10">
                      <div className="h-2 w-2 rounded-full bg-[#93DA97]" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  {index < recentActivity.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <a
              href={`/${orgSlug}/leads/new`}
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Add New Lead</p>
                <p className="text-xs text-muted-foreground">
                  Create a new lead entry
                </p>
              </div>
            </a>
            <a
              href={`/${orgSlug}/projects/new`}
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start New Project</p>
                <p className="text-xs text-muted-foreground">
                  Create a new project
                </p>
              </div>
            </a>
            <a
              href={`/${orgSlug}/invoices/new`}
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Generate Invoice</p>
                <p className="text-xs text-muted-foreground">
                  Create a new invoice
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
