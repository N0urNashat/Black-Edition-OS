'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const approvalStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function ClientProjectDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const projectId = params.id as string;
  const orgSlug = params.orgSlug as string;

  // Fetch project
  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['client-project', projectId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}`, {
        headers: { 'x-organization-id': 'org_black_edition' },
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error('Project not found');
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      return data.data;
    },
  });

  // Fetch milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ['client-milestones', projectId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:4000/api/projects/${projectId}/milestones`,
        { headers: { 'x-organization-id': 'org_black_edition' } }
      );
      if (!response.ok) throw new Error('Failed to fetch milestones');
      const data = await response.json();
      return data.data || [];
    },
  });

  // Update milestone approval mutation
  const updateApprovalMutation = useMutation({
    mutationFn: async ({
      milestoneId,
      approvalStatus,
    }: {
      milestoneId: string;
      approvalStatus: string;
    }) => {
      const response = await fetch(
        `http://localhost:4000/api/projects/${projectId}/milestones/${milestoneId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-organization-id': 'org_black_edition',
            'x-user-id': 'client_1',
          },
          body: JSON.stringify({ approvalStatus }),
        }
      );

      if (!response.ok) throw new Error('Failed to update approval status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-milestones', projectId] });
    },
  });

  if (loadingProject) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold">Project not found</h3>
          <p className="text-red-600 text-sm mt-1">
            The project you're looking for doesn't exist.
          </p>
          <Link href={`/${orgSlug}/c/projects`} className="mt-4 inline-block">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${orgSlug}/c/projects`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className={statusColors[project.status]}>
          {project.status}
        </Badge>
      </div>

      {/* Project Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">
                {new Date(project.startDate).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {project.endDate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">End Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Hours Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">
                {project.totalHours?.toFixed(1) || '0.0'}h
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Milestone</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.map((milestone: any) => (
                  <TableRow key={milestone.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{milestone.name}</p>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(milestone.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {milestone.completed ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm">Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Circle className="h-4 w-4" />
                          <span className="text-sm">In Progress</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={approvalStatusColors[milestone.approvalStatus]}
                      >
                        {milestone.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {milestone.completed && milestone.approvalStatus === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() =>
                              updateApprovalMutation.mutate({
                                milestoneId: milestone.id,
                                approvalStatus: 'APPROVED',
                              })
                            }
                            disabled={updateApprovalMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() =>
                              updateApprovalMutation.mutate({
                                milestoneId: milestone.id,
                                approvalStatus: 'REJECTED',
                              })
                            }
                            disabled={updateApprovalMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
