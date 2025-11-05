export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          BLACK EDITION OS
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-8">
          Agency Operating System - Coming Soon
        </p>
        <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">CRM</h3>
            <p className="text-sm text-muted-foreground">
              Manage leads and customers with AI-powered scoring
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Projects</h3>
            <p className="text-sm text-muted-foreground">
              Track projects and tasks with time management
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-2">Invoicing</h3>
            <p className="text-sm text-muted-foreground">
              Create invoices and manage payments seamlessly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
