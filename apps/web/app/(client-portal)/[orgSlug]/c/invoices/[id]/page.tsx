'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, Wallet, Building2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  VIEWED: 'bg-purple-100 text-purple-800',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function ClientInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const orgSlug = params.orgSlug as string;

  // PayMob checkout mutation
  const payMobMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await fetch('http://localhost:4000/api/payments/paymob/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org_black_edition',
        },
        body: JSON.stringify({ invoiceId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initiate payment');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const paymentToken = data.data.paymentToken;
      const iframeId = process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID || '862767';

      // Redirect to PayMob IFrame
      window.location.href = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
    },
    onError: (error: any) => {
      toast.error('Payment Error', {
        description: error.message || 'Failed to initiate payment. Please try again.',
      });
    },
  });

  const handlePayMobPayment = () => {
    payMobMutation.mutate(invoiceId);
  };

  // Fetch invoice
  const { data: invoice, isLoading: loadingInvoice } = useQuery({
    queryKey: ['client-invoice', invoiceId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:4000/api/invoices/${invoiceId}`, {
        headers: { 'x-organization-id': 'org_black_edition' },
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error('Invoice not found');
        throw new Error('Failed to fetch invoice');
      }

      const data = await response.json();
      return data.data;
    },
  });

  // Fetch payment settings
  const { data: settings } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:4000/api/settings/payment', {
        headers: { 'x-organization-id': 'org_black_edition' },
      });

      if (!response.ok) throw new Error('Failed to fetch payment settings');

      const data = await response.json();
      return data.data;
    },
  });

  if (loadingInvoice) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold">Invoice not found</h3>
          <p className="text-red-600 text-sm mt-1">The invoice you're looking for doesn't exist.</p>
          <Link href={`/${orgSlug}/c/invoices`} className="mt-4 inline-block">
            <Button variant="outline">Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href={`/${orgSlug}/c/invoices`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 md:col-span-2">
            {/* Invoice Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{invoice.invoiceNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className={statusColors[invoice.status]}>
                    {invoice.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">From</p>
                    <p className="font-medium">Black Edition Agency</p>
                  </div>
                  {invoice.project && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Project</p>
                      <p className="font-medium">{invoice.project.name}</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                    <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Currency</p>
                    <p>{invoice.currency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lineItems?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {invoice.currency} {item.rate}
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.currency} {item.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span>{invoice.currency} {invoice.subtotal}</span>
                  </div>
                  {invoice.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Tax ({invoice.taxRate}%):</span>
                      <span>{invoice.currency} {invoice.taxAmount}</span>
                    </div>
                  )}
                  {invoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm">Discount:</span>
                      <span>-{invoice.currency} {invoice.discount}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{invoice.currency} {invoice.total}</span>
                  </div>
                  {invoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm">Paid:</span>
                        <span className="text-green-600">
                          -{invoice.currency} {invoice.paidAmount}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-red-600">
                        <span>Balance Due:</span>
                        <span>{invoice.currency} {invoice.total - invoice.paidAmount}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.terms) && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {invoice.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Terms & Conditions
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{invoice.terms}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Payment Methods */}
          <div className="space-y-6">
            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && settings && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* PayMob */}
                  {settings.payMobEnabled && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handlePayMobPayment}
                      disabled={payMobMutation.isPending}
                    >
                      {payMobMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2 text-[#93DA97]" />
                          Pay with PayMob
                        </>
                      )}
                    </Button>
                  )}

                  {/* InstaPay */}
                  {settings.instapayEnabled && settings.instapayLink && (
                    <a href={settings.instapayLink} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Wallet className="h-4 w-4 mr-2 text-[#93DA97]" />
                        Pay with InstaPay
                      </Button>
                    </a>
                  )}

                  {/* Bank Transfer */}
                  {settings.bankTransferEnabled && settings.bankDetails && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-[#93DA97]" />
                        <p className="font-medium text-sm">Bank Transfer</p>
                      </div>
                      <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                        {settings.bankDetails}
                      </pre>
                    </div>
                  )}

                  {!settings.payMobEnabled &&
                    !settings.instapayEnabled &&
                    !settings.bankTransferEnabled && (
                      <div className="text-center py-4">
                        <FileText className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-sm text-muted-foreground mt-2">
                          No payment methods configured
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Invoice Status Info */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant="secondary" className={statusColors[invoice.status]}>
                    {invoice.status.replace('_', ' ')}
                  </Badge>
                </div>
                {invoice.sentAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sent At</p>
                    <p className="text-sm">{new Date(invoice.sentAt).toLocaleString()}</p>
                  </div>
                )}
                {invoice.viewedAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Viewed At</p>
                    <p className="text-sm">{new Date(invoice.viewedAt).toLocaleString()}</p>
                  </div>
                )}
                {invoice.paidAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid At</p>
                    <p className="text-sm">{new Date(invoice.paidAt).toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
