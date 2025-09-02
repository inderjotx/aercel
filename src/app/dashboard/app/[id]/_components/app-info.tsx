import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Calendar } from "lucide-react";
import { api } from "@/trpc/server";

export async function AppInfo({ id }: { id: string }) {
  const app = await api.app.getApp({ id: id });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{app.name}</CardTitle>
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center text-sm">
              <GitBranch className="mr-2 h-4 w-4" />
              <span>Branch: {app.gitBranch}</span>
            </div>
            <div className="text-muted-foreground flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                Created {new Date(app.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Git URL:</span>
              <div className="bg-muted mt-1 rounded p-2 font-mono text-xs break-all">
                {app.gitUrl}
              </div>
            </div>
            {app.gitFolder && app.gitFolder !== "." && (
              <div className="text-sm">
                <span className="text-muted-foreground">Folder:</span>
                <span className="ml-2 font-mono">{app.gitFolder}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Start Command:</span>
            <div className="bg-muted mt-1 rounded p-2 font-mono text-xs">
              {app.startCommand}
            </div>
          </div>
          {app.installCommand && (
            <div className="text-sm">
              <span className="text-muted-foreground">Install Command:</span>
              <div className="bg-muted mt-1 rounded p-2 font-mono text-xs">
                {app.installCommand}
              </div>
            </div>
          )}
          {app.buildCommand && (
            <div className="text-sm">
              <span className="text-muted-foreground">Build Command:</span>
              <div className="bg-muted mt-1 rounded p-2 font-mono text-xs">
                {app.buildCommand}
              </div>
            </div>
          )}
        </div>
        <div>
          {Object.keys(app.environmentVariables as Record<string, string>)
            .length > 0 && (
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm">
                Environment Variables:
              </span>
              <div className="space-y-1">
                {Object.entries(
                  app.environmentVariables as Record<string, string>,
                ).map(([key, value]) => (
                  <div key={key} className="flex items-center text-sm">
                    <span className="bg-muted mr-2 rounded px-2 py-1 font-mono text-xs">
                      {key}
                    </span>
                    <span className="text-muted-foreground">=</span>
                    <span className="bg-muted ml-2 rounded px-2 py-1 font-mono text-xs">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
