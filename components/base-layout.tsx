import { ReactNode } from "react";
import sdk from "@farcaster/frame-sdk";
import { useEffect } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps) {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <main className="h-full w-full overflow-hidden">
        {children}
      </main>
    </div>
  );
} 