import React from "react";
import { api, HydrateClient } from "@/trpc/server";
import { AppInfo } from "./_components/app-info";
import { DeploymentsSection } from "./_components/deployments-section";

export default async function AppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void api.app.getApp.prefetch({ id });
  void api.app.getDeployments.prefetch({ appId: id, page: 1, limit: 20 });

  return (
    <HydrateClient>
      <div className="mt-4 space-y-6">
        <AppInfo id={id} />
        <DeploymentsSection appId={id} />
      </div>
    </HydrateClient>
  );
}
