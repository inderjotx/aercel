"use client";

import React from "react";
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
  Play,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface DeploymentsSectionProps {
  appId: string;
}

export function DeploymentsSection({ appId }: DeploymentsSectionProps) {
  const utils = api.useUtils();

  const {
    data: deployments,
    isLoading: deploymentsLoading,
    error: deploymentsError,
  } = api.app.getDeployments.useQuery({
    appId,
    page: 1,
    limit: 20,
  });

  const createDeployment = api.app.createDeployment.useMutation({
    onSuccess: () => {
      void utils.app.getDeployments.invalidate({ appId });
      void utils.app.getApp.invalidate({ id: appId });
    },
  });

  const handleCreateDeployment = () => {
    createDeployment.mutate({ appId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "building":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "stopped":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800";
      case "building":
        return "bg-blue-100 text-blue-800";
      case "stopped":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deployments</CardTitle>
            <CardDescription>
              Manage and monitor your application deployments
            </CardDescription>
          </div>
          <Button
            onClick={handleCreateDeployment}
            disabled={createDeployment.isPending}
          >
            {createDeployment.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Create Deployment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {deploymentsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted h-16 animate-pulse rounded-lg p-4"
              />
            ))}
          </div>
        ) : deploymentsError ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">Error loading deployments</p>
            <p className="mt-2 text-sm text-red-500">
              {deploymentsError.message}
            </p>
          </div>
        ) : !deployments || deployments.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No deployments yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Create your first deployment to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {deployments.map((deployment) => (
              <div
                key={deployment.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(deployment.status ?? "pending")}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        Deployment {deployment.id.slice(0, 8)}
                      </span>
                      <Badge
                        className={getStatusColor(
                          deployment.status ?? "pending",
                        )}
                      >
                        {deployment.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Created {new Date(deployment.createdAt).toLocaleString()}
                    </div>
                    {deployment.url && (
                      <div className="text-muted-foreground text-sm">
                        <ExternalLink className="mr-1 inline h-3 w-3" />
                        <a
                          href={deployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {deployment.url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-muted-foreground text-right text-sm">
                  {deployment.containerId && (
                    <div>Container: {deployment.containerId.slice(0, 12)}</div>
                  )}
                  {deployment.imageTag && (
                    <div>Image: {deployment.imageTag}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
