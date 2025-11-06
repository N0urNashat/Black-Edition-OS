'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Workflow, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NewAutomationPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${orgSlug}/automations`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Automations
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Workflow className="h-6 w-6 text-[#93DA97]" />
            Visual Workflow Builder
          </CardTitle>
          <CardDescription>
            Create powerful automations with drag-and-drop simplicity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-[#93DA97]/10 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-[#93DA97]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              The Visual Workflow Builder is currently under development. This powerful tool will allow you to create complex automations with an intuitive drag-and-drop interface.
            </p>

            <div className="max-w-2xl mx-auto mt-8 p-6 bg-muted/50 rounded-lg text-left">
              <h4 className="font-semibold mb-3">Planned Features:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#93DA97] mt-1.5"></div>
                  <span>Drag-and-drop workflow builder with visual nodes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#93DA97] mt-1.5"></div>
                  <span>Multiple trigger types (Lead Created, Project Completed, Invoice Paid, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#93DA97] mt-1.5"></div>
                  <span>Conditional logic and branching paths</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#93DA97] mt-1.5"></div>
                  <span>Actions: Send Email, Create Task, Update Status, Assign User, etc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#93DA97] mt-1.5"></div>
                  <span>Time delays and scheduled triggers</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#93DA97] mt-1.5"></div>
                  <span>Integration with external services (Slack, email, webhooks)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#93DA97] mt-1.5"></div>
                  <span>Template library for common automation patterns</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link href={`/${orgSlug}/automations`}>
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Automations
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
