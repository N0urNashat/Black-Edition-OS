'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Brain, Sparkles, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function AIToolsPage() {
  const params = useParams();
  const _orgSlug = params.orgSlug as string;

  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

  // Fetch leads for proposal generator
  const { data: leads = [] } = useQuery({
    queryKey: ['leads-for-ai'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/leads?limit=100', {
        headers: { 'x-organization-id': 'org_black_edition' },
      });
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      return data.data || [];
    },
  });

  // Generate proposal mutation
  const proposalMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch('http://localhost:4000/api/ai/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_black_edition',
          'x-user-id': 'user_1',
        },
        body: JSON.stringify({ leadId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate proposal');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedProposal(data.data.proposal);
    },
  });

  // AI search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch('http://localhost:4000/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_black_edition',
          'x-user-id': 'user_1',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to search');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.data);
    },
  });

  const handleGenerateProposal = () => {
    if (!selectedLeadId) return;
    proposalMutation.mutate(selectedLeadId);
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    searchMutation.mutate(searchQuery);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-[#93DA97]" />
          AI Tools
        </h1>
        <p className="text-muted-foreground mt-1">
          Harness the power of AI to automate tasks and generate insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Proposal Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#93DA97]" />
              Proposal Generator
            </CardTitle>
            <CardDescription>
              Generate professional project proposals from lead information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lead-select">Select Lead</Label>
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger id="lead-select">
                  <SelectValue placeholder="Choose a lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead: any) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} - {lead.company || 'No company'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateProposal}
              disabled={!selectedLeadId || proposalMutation.isPending}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {proposalMutation.isPending ? 'Generating...' : 'Generate Proposal'}
            </Button>

            {proposalMutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {proposalMutation.error?.message || 'Failed to generate proposal'}
              </div>
            )}

            {generatedProposal && (
              <div className="space-y-2">
                <Label htmlFor="proposal-output">Generated Proposal</Label>
                <Textarea
                  id="proposal-output"
                  value={generatedProposal}
                  onChange={(e) => setGeneratedProposal(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedProposal);
                  }}
                >
                  Copy to Clipboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-[#93DA97]" />
              Natural Language Search
            </CardTitle>
            <CardDescription>
              Search your data using natural language queries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">Enter Your Query</Label>
              <Input
                id="search-query"
                placeholder="e.g., 'show me all qualified leads' or 'active projects'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={!searchQuery || searchMutation.isPending}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {searchMutation.isPending ? 'Searching...' : 'Search'}
            </Button>

            {searchMutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {searchMutation.error?.message || 'Search failed'}
              </div>
            )}

            {searchResults && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    {searchResults.interpretation}
                  </p>
                </div>

                {/* Results Summary */}
                <div className="grid grid-cols-2 gap-3">
                  {searchResults.results.leads.length > 0 && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Leads</p>
                      <p className="text-2xl font-bold text-[#93DA97]">
                        {searchResults.results.leads.length}
                      </p>
                    </div>
                  )}
                  {searchResults.results.customers.length > 0 && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Customers</p>
                      <p className="text-2xl font-bold text-[#93DA97]">
                        {searchResults.results.customers.length}
                      </p>
                    </div>
                  )}
                  {searchResults.results.projects.length > 0 && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Projects</p>
                      <p className="text-2xl font-bold text-[#93DA97]">
                        {searchResults.results.projects.length}
                      </p>
                    </div>
                  )}
                  {searchResults.results.invoices.length > 0 && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Invoices</p>
                      <p className="text-2xl font-bold text-[#93DA97]">
                        {searchResults.results.invoices.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Example Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              'show me all qualified leads',
              'active projects',
              'unpaid invoices',
              'new leads',
            ].map((example) => (
              <Button
                key={example}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(example);
                  searchMutation.mutate(example);
                }}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
