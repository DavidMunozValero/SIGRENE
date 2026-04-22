import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/app/director")({
  component: () => <AppShell role="director_tecnico" />,
});
