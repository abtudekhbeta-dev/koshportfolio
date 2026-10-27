import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { NotFound } from "@/components/not-found";
import { RoutePending } from "@/components/route-pending";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
    defaultPendingComponent: RoutePending,
    // Paint the shell quickly on a slow chunk instead of a blank document.
    defaultPendingMs: 150,
    scrollRestoration: true,
  });
}
