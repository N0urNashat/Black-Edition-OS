'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Calendar,
  User,
  DollarSign,
  Clock,
  TrendingUp,
  Plus,
  CheckCircle2,
  Circle,
  Target,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusColors: Record<string, string> = {
  PLANNING: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const healthColors: Record<string, string> = {
  ON_TRACK: 'bg-green-100 text-green-800',
  AT_RISK: 'bg-yellow-100 text-yellow-800',
  DELAYED: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const orgSlug = params.orgSlug as string;
  const queryClient = useQueryClient();

  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    dueDate: '',
  });

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    assignedToId: '',
    dueDate: '',
  });
  const [taskFilter, setTaskFilter] = useState('all');

  const [mainTab, setMainTab] = useState('tasks');
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [timeForm, setTimeForm] = useState({
    taskId: '',
    duration: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  // Fetch project using React Query
  const { data: project, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}`, {
        headers: {
          'x-organization-id': 'org_black_edition',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      return data.data;
    },
  });

  // Fetch milestones
  const { data: milestones = [], isLoading: loadingMilestones } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}/milestones`, {
        headers: {
          'x-organization-id': 'org_black_edition',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch milestones');

      const data = await response.json();
      return data.data || [];
    },
    enabled: !!projectId,
  });

  // Create milestone mutation
  const createMilestoneMutation = useMutation({
    mutationFn: async (data: typeof milestoneForm) => {
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_black_edition',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create milestone');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
      setShowMilestoneForm(false);
      setMilestoneForm({ name: '', description: '', dueDate: '' });
    },
  });

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    createMilestoneMutation.mutate(milestoneForm);
  };

  // Fetch tasks
  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}/tasks`, {
        headers: {
          'x-organization-id': 'org_black_edition',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      return data.data || [];
    },
    enabled: !!projectId,
  });

  // Fetch users for assignee dropdown
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/users', {
        headers: {
          'x-organization-id': 'org_black_edition',
        },
      });

      if (!response.ok) {
        // If users endpoint doesn't exist, return mock users from the database
        return [
          { id: 'user_1', name: 'John Doe', email: 'john@example.com' },
          { id: 'user_2', name: 'Jane Smith', email: 'jane@example.com' },
        ];
      }

      const data = await response.json();
      return data.data || [];
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: typeof taskForm) => {
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_black_edition',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create task');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setShowTaskForm(false);
      setTaskForm({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        assignedToId: '',
        dueDate: '',
      });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(taskForm);
  };

  // Fetch time entries
  const { data: timeEntries = [], isLoading: loadingTimeEntries } = useQuery({
    queryKey: ['time-entries', projectId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}/time-entries`, {
        headers: {
          'x-organization-id': 'org_black_edition',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch time entries');

      const data = await response.json();
      return data.data || [];
    },
    enabled: !!projectId,
  });

  // Create time entry mutation
  const createTimeEntryMutation = useMutation({
    mutationFn: async (data: typeof timeForm) => {
      const response = await fetch(`http://localhost:4000/api/tasks/${data.taskId}/time-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_black_edition',
        },
        body: JSON.stringify({
          duration: parseFloat(data.duration),
          date: data.date,
          description: data.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create time entry');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setShowTimeForm(false);
      setTimeForm({
        taskId: '',
        duration: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    },
  });

  // Delete time entry mutation
  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:4000/api/time-entries/${id}`, {
        method: 'DELETE',
        headers: {
          'x-organization-id': 'org_black_edition',
        },
      });

      if (!response.ok) throw new Error('Failed to delete time entry');

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const handleCreateTimeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    createTimeEntryMutation.mutate(timeForm);
  };

  const handleDeleteTimeEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      deleteTimeEntryMutation.mutate(id);
    }
  };

  // Filter tasks based on tab
  const filteredTasks = taskFilter === 'all'
    ? tasks
    : tasks.filter((task: any) => task.status === taskFilter);

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

  if (error || (!loading && !project)) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold">Error loading project</h3>
          <p className="text-red-600 text-sm mt-1">{error?.message || 'Project not found'}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
            <Link href={`/${orgSlug}/projects`}>
              <Button variant="outline">Back to Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${orgSlug}/projects`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={statusColors[project.status]}>
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className={healthColors[project.health]}>
                {project.health.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className={priorityColors[project.priority]}>
                {project.priority}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 md:col-span-2">
          {/* Description */}
          {project.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{project.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#93DA97]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {project.budget && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Budget</p>
                      <p className="text-sm text-muted-foreground">
                        EGP {project.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {(project.estimatedHours || project.actualHours > 0) && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Hours</p>
                      <p className="text-sm text-muted-foreground">
                        {project.actualHours} / {project.estimatedHours || '—'} hours
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Milestones
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                  variant={showMilestoneForm ? 'outline' : 'default'}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {showMilestoneForm ? 'Cancel' : 'New Milestone'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Create Milestone Form */}
              {showMilestoneForm && (
                <form onSubmit={handleCreateMilestone} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="milestone-name">Milestone Name *</Label>
                    <Input
                      id="milestone-name"
                      placeholder="e.g., MVP Launch"
                      value={milestoneForm.name}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestone-description">Description</Label>
                    <Textarea
                      id="milestone-description"
                      placeholder="Milestone description..."
                      value={milestoneForm.description}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestone-dueDate">Due Date *</Label>
                    <Input
                      id="milestone-dueDate"
                      type="date"
                      value={milestoneForm.dueDate}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={createMilestoneMutation.isPending} className="w-full">
                    {createMilestoneMutation.isPending ? 'Creating...' : 'Create Milestone'}
                  </Button>
                  {createMilestoneMutation.isError && (
                    <p className="text-sm text-red-600">
                      {createMilestoneMutation.error?.message || 'Failed to create milestone'}
                    </p>
                  )}
                </form>
              )}

              {/* Milestones List */}
              {loadingMilestones ? (
                <div className="space-y-2">
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : milestones.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold">No milestones yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create milestones to track project progress
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((milestone: any) => {
                    const isPast = new Date(milestone.dueDate) < new Date();
                    const isCompleted = milestone.completed;
                    return (
                      <div
                        key={milestone.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isPast ? 'text-red-500' : 'text-gray-400'}`} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {milestone.name}
                          </p>
                          {milestone.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className={`text-xs ${isPast && !isCompleted ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                              {new Date(milestone.dueDate).toLocaleDateString()}
                              {isPast && !isCompleted && ' (Overdue)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks & Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks & Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Main Tabs: Tasks and Time Log */}
              <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="time">Time Log</TabsTrigger>
                </TabsList>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="mt-4">
                  <div className="space-y-4">
                    {/* New Task Button */}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => setShowTaskForm(!showTaskForm)}
                        variant={showTaskForm ? 'outline' : 'default'}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {showTaskForm ? 'Cancel' : 'New Task'}
                      </Button>
                    </div>
              {/* Create Task Form */}
              {showTaskForm && (
                <form onSubmit={handleCreateTask} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title *</Label>
                    <Input
                      id="task-title"
                      placeholder="e.g., Implement user authentication"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      placeholder="Task description..."
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-status">Status</Label>
                      <Select
                        value={taskForm.status}
                        onValueChange={(value) => setTaskForm({ ...taskForm, status: value })}
                      >
                        <SelectTrigger id="task-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODO">To Do</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="IN_REVIEW">In Review</SelectItem>
                          <SelectItem value="BLOCKED">Blocked</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-priority">Priority</Label>
                      <Select
                        value={taskForm.priority}
                        onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                      >
                        <SelectTrigger id="task-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-assignee">Assign To</Label>
                      <Select
                        value={taskForm.assignedToId}
                        onValueChange={(value) => setTaskForm({ ...taskForm, assignedToId: value })}
                      >
                        <SelectTrigger id="task-assignee">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-dueDate">Due Date</Label>
                      <Input
                        id="task-dueDate"
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={createTaskMutation.isPending} className="w-full">
                    {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                  </Button>
                  {createTaskMutation.isError && (
                    <p className="text-sm text-red-600">
                      {createTaskMutation.error?.message || 'Failed to create task'}
                    </p>
                  )}
                </form>
              )}

              {/* Tasks Tabs */}
              <Tabs value={taskFilter} onValueChange={setTaskFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
                  <TabsTrigger value="TODO">To Do</TabsTrigger>
                  <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
                  <TabsTrigger value="DONE">Done</TabsTrigger>
                  <TabsTrigger value="BLOCKED">Blocked</TabsTrigger>
                </TabsList>

                <TabsContent value={taskFilter} className="mt-4">
                  {loadingTasks ? (
                    <div className="space-y-2">
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold">No tasks found</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {taskFilter === 'all' ? 'Create tasks to get started' : `No tasks with status: ${taskFilter.replace('_', ' ')}`}
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Due Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTasks.map((task: any) => (
                            <TableRow key={task.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{task.title}</p>
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={
                                    task.status === 'DONE'
                                      ? 'bg-green-100 text-green-800'
                                      : task.status === 'IN_PROGRESS'
                                      ? 'bg-blue-100 text-blue-800'
                                      : task.status === 'BLOCKED'
                                      ? 'bg-red-100 text-red-800'
                                      : task.status === 'IN_REVIEW'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {task.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={
                                    task.priority === 'URGENT'
                                      ? 'bg-red-100 text-red-800'
                                      : task.priority === 'HIGH'
                                      ? 'bg-orange-100 text-orange-800'
                                      : task.priority === 'MEDIUM'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {task.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">
                                    {task.assignedTo?.name || 'Unassigned'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {task.dueDate ? (
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
                  </div>
                </TabsContent>

                {/* Time Log Tab */}
                <TabsContent value="time" className="mt-4">
                  <div className="space-y-4">
                    {/* Log Time Button */}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => setShowTimeForm(!showTimeForm)}
                        variant={showTimeForm ? 'outline' : 'default'}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {showTimeForm ? 'Cancel' : 'Log Time'}
                      </Button>
                    </div>

                    {/* Log Time Form */}
                    {showTimeForm && (
                      <form onSubmit={handleCreateTimeEntry} className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <div className="space-y-2">
                          <Label htmlFor="time-task">Task *</Label>
                          <Select
                            value={timeForm.taskId}
                            onValueChange={(value) => setTimeForm({ ...timeForm, taskId: value })}
                            required
                          >
                            <SelectTrigger id="time-task">
                              <SelectValue placeholder="Select task" />
                            </SelectTrigger>
                            <SelectContent>
                              {tasks.map((task: any) => (
                                <SelectItem key={task.id} value={task.id}>
                                  {task.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="time-duration">Duration (hours) *</Label>
                            <Input
                              id="time-duration"
                              type="number"
                              step="0.25"
                              min="0.25"
                              placeholder="e.g., 2.5"
                              value={timeForm.duration}
                              onChange={(e) => setTimeForm({ ...timeForm, duration: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="time-date">Date *</Label>
                            <Input
                              id="time-date"
                              type="date"
                              value={timeForm.date}
                              onChange={(e) => setTimeForm({ ...timeForm, date: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-description">Description</Label>
                          <Textarea
                            id="time-description"
                            placeholder="What did you work on?"
                            value={timeForm.description}
                            onChange={(e) => setTimeForm({ ...timeForm, description: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <Button type="submit" disabled={createTimeEntryMutation.isPending} className="w-full">
                          {createTimeEntryMutation.isPending ? 'Logging Time...' : 'Log Time'}
                        </Button>
                        {createTimeEntryMutation.isError && (
                          <p className="text-sm text-red-600">
                            {createTimeEntryMutation.error?.message || 'Failed to log time'}
                          </p>
                        )}
                      </form>
                    )}

                    {/* Time Entries Table */}
                    {loadingTimeEntries ? (
                      <div className="space-y-2">
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ) : timeEntries.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold">No time entries yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Log time to track project hours
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Task</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="w-[80px]">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {timeEntries.map((entry: any) => (
                              <TableRow key={entry.id}>
                                <TableCell>
                                  <p className="font-medium text-sm">
                                    {entry.task?.title || 'N/A'}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">
                                      {entry.user?.name || 'Unknown'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(entry.date).toLocaleDateString()}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    {entry.duration}h
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {entry.description || '—'}
                                  </p>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteTimeEntry(entry.id)}
                                    disabled={deleteTimeEntryMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{project.customer?.company || project.customer?.name}</p>
                  {project.customer?.email && (
                    <p className="text-sm text-muted-foreground">{project.customer.email}</p>
                  )}
                </div>
              </div>

              <Link href={`/${orgSlug}/customers/${project.customerId}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Customer
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.createdBy?.name || 'Unknown'}</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {project.startDate && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {project.endDate && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
