"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "./AnnouncementBar";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

function shouldHideSiteChrome(pathname: string) {
  return pathname === "/auth" || pathname.startsWith("/admin");
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome = shouldHideSiteChrome(pathname);

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
