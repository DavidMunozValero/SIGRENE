import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/director")({
  beforeLoad: () => {
    if (!api.isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <AppShell role="director_tecnico" />,
});
