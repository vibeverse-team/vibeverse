'use client';

import { useEffect, useState } from 'react';

import Providers from '@/providers';
import './globals.css';
import { Onboarding } from '@/components';

const Dynamic = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }
  return <>{children}</>;
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="bg-black">
      <body className="h-full">
        <Dynamic>
          <Providers>
            {children}
            <Onboarding />
          </Providers>
        </Dynamic>
      </body>
    </html>
  );
}
