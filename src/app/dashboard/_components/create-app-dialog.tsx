"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface CreateAppDialogProps {
  children: React.ReactNode;
}

export function CreateAppDialog({ children }: CreateAppDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();

  const createApp = api.app.create.useMutation({
    onSuccess: () => {
      setOpen(false);
      void utils.app.myApps.invalidate();
      router.push("/dashboard");
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    gitUrl: "",
    type: "nextjs-app" as const,
    gitBranch: "main",
    gitToken: "",
    gitFolder: ".",
    environmentVariables: "",
    startCommand: "",
    installCommand: "",
    buildCommand: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse environment variables from string to object
    const envVars: Record<string, string> = {};
    if (formData.environmentVariables) {
      formData.environmentVariables.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join("=").trim();
        }
      });
    }

    createApp.mutate({
      name: formData.name,
      gitUrl: formData.gitUrl,
      type: formData.type,
      gitBranch: formData.gitBranch,
      gitToken: formData.gitToken || undefined,
      gitFolder: formData.gitFolder,
      environmentVariables: envVars,
      startCommand: formData.startCommand,
      installCommand: formData.installCommand || undefined,
      buildCommand: formData.buildCommand || undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Application</DialogTitle>
          <DialogDescription>
            Configure your application settings and deployment options.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Application Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="My Awesome App"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Application Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextjs-app">Next.js App</SelectItem>
                  <SelectItem value="discord-bot">Discord Bot</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gitUrl">Git Repository URL *</Label>
            <Input
              id="gitUrl"
              value={formData.gitUrl}
              onChange={(e) => handleInputChange("gitUrl", e.target.value)}
              placeholder="https://github.com/username/repository.git"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gitBranch">Git Branch</Label>
              <Input
                id="gitBranch"
                value={formData.gitBranch}
                onChange={(e) => handleInputChange("gitBranch", e.target.value)}
                placeholder="main"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gitFolder">Root Folder</Label>
              <Input
                id="gitFolder"
                value={formData.gitFolder}
                onChange={(e) => handleInputChange("gitFolder", e.target.value)}
                placeholder="."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gitToken">Git Token (Optional)</Label>
            <Input
              id="gitToken"
              type="password"
              value={formData.gitToken}
              onChange={(e) => handleInputChange("gitToken", e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startCommand">Start Command *</Label>
            <Input
              id="startCommand"
              value={formData.startCommand}
              onChange={(e) =>
                handleInputChange("startCommand", e.target.value)
              }
              placeholder="npm start"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installCommand">Install Command (Optional)</Label>
              <Input
                id="installCommand"
                value={formData.installCommand}
                onChange={(e) =>
                  handleInputChange("installCommand", e.target.value)
                }
                placeholder="npm install"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buildCommand">Build Command (Optional)</Label>
              <Input
                id="buildCommand"
                value={formData.buildCommand}
                onChange={(e) =>
                  handleInputChange("buildCommand", e.target.value)
                }
                placeholder="npm run build"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="environmentVariables">
              Environment Variables (Optional)
            </Label>
            <Textarea
              id="environmentVariables"
              value={formData.environmentVariables}
              onChange={(e) =>
                handleInputChange("environmentVariables", e.target.value)
              }
              placeholder="DATABASE_URL=postgresql://...&#10;API_KEY=your_api_key_here"
              rows={4}
            />
            <p className="text-muted-foreground text-xs">
              Enter environment variables in KEY=VALUE format, one per line
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createApp.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createApp.isPending}>
              {createApp.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
