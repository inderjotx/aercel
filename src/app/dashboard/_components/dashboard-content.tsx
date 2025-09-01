"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ExternalLink, GitBranch, Calendar, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { CreateAppDialog } from "./create-app-dialog";

export function DashboardContent() {
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  const utils = api.useUtils();

  const {
    data: apps,
    isLoading,
    error,
  } = api.app.myApps.useQuery({
    page: 1,
    limit: 50,
  });

  const deleteApp = api.app.delete.useMutation({
    onSuccess: () => {
      void utils.app.myApps.invalidate();
      setDeletingAppId(null);
    },
  });

  const handleDeleteApp = (appId: string) => {
    setDeletingAppId(appId);
    deleteApp.mutate({ id: appId });
  };

  if (isLoading) {
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

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">Error loading applications</p>
            <p className="mt-2 text-sm text-red-500">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!apps || apps.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any applications yet.
            </p>
            <p className="text-muted-foreground text-sm">
              Create your first application to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {apps.map((app) => (
        <Card key={app.id} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{app.name}</CardTitle>
                <CardDescription>
                  {app.description ?? "No description"}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="capitalize">
                {app.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center text-sm">
                <GitBranch className="mr-2 h-4 w-4" />
                <span>{app.gitBranch}</span>
              </div>
              <div className="text-muted-foreground flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  Created {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/apps/${app.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>

              <CreateAppDialog
                app={{
                  id: app.id,
                  name: app.name,
                  gitUrl: app.gitUrl,
                  type: app.type,
                  gitBranch: app.gitBranch ?? "main",
                  gitToken: app.gitToken ?? undefined,
                  gitFolder: app.gitFolder ?? undefined,
                  environmentVariables:
                    (app.environmentVariables as Record<string, string>) ?? {},
                  startCommand: app.startCommand ?? "",
                  installCommand: app.installCommand ?? undefined,
                  buildCommand: app.buildCommand ?? undefined,
                }}
              >
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </CreateAppDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the application &quot;{app.name}&quot; and all its
                      associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteApp(app.id)}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deletingAppId === app.id}
                    >
                      {deletingAppId === app.id ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
