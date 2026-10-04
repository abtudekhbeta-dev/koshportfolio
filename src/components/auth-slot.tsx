import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";

export function AuthSlot() {
  const { isPending } = useCurrentUserState();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || isPending) {
    return <div className="h-8 w-16 animate-pulse rounded-sm bg-surface-2 sm:w-[9.5rem]" aria-hidden />;
  }
  return (
    <>
      <SignedOut>
        <Link to="/login" className="grid h-8 place-items-center rounded-sm px-2.5 text-[13px] text-muted hover:text-fg">
          Sign in
        </Link>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to="/signup">Create account</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}