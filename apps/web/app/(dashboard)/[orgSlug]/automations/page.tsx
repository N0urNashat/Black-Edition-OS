'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Zap, Plus, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AutomationsPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;

  // Fetch workflows
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/workflows', {
        headers: { 'x-organization-id': 'org_black_edition' },
      });
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      return data.data || [];
    },
  });

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-[#93DA97]" />
            Automations
          </h1>
          <p className="text-muted-foreground mt-1">
            Automate repetitive tasks and streamline your workflow
          </p>
        </div>
        <Button onClick={() => router.push(`/${orgSlug}/automations/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          New Automation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Workflows</CardTitle>
          <CardDescription>
            Manage your automated workflows and triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold">No workflows yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating your first automation
              </p>
              <Button
                onClick={() => router.push(`/${orgSlug}/automations/new`)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow: any) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">{workflow.name}</TableCell>
                    <TableCell>
                      {workflow.description || (
                        <span className="text-muted-foreground italic">No description</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{workflow.trigger.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      {workflow.isActive ? (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                          <span className="text-sm text-gray-600">Inactive</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {workflow.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <PowerOff className="h-4 w-4 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                          >
                            <Power className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Example Automation Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Automation Templates</CardTitle>
          <CardDescription>Quick start with pre-built workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <h4 className="font-semibold mb-2">Auto-assign New Leads</h4>
              <p className="text-sm text-muted-foreground">
                Automatically assign new leads to team members based on availability
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <h4 className="font-semibold mb-2">Invoice Reminders</h4>
              <p className="text-sm text-muted-foreground">
                Send automated payment reminders for overdue invoices
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <h4 className="font-semibold mb-2">Project Status Updates</h4>
              <p className="text-sm text-muted-foreground">
                Notify clients when project milestones are completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
