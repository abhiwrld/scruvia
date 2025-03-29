"use client";

import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  // Simplest possible layout - just render children without any auth checks
  return <>{children}</>;
}
