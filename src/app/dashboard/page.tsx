import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DashboardContent } from "./_components/dashboard-content";
import { CreateAppDialog } from "./_components/create-app-dialog";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your applications and deployments
          </p>
        </div>
        <CreateAppDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </CreateAppDialog>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card animate-pulse rounded-lg border p-6">
          <div className="bg-muted mb-2 h-4 w-3/4 rounded" />
          <div className="bg-muted mb-4 h-3 w-1/2 rounded" />
          <div className="bg-muted mb-2 h-3 w-full rounded" />
          <div className="bg-muted h-3 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}
