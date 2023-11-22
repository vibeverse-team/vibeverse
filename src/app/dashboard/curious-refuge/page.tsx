'use client';

import Image from 'next/image';
import { useEffect } from 'react';

import { Mixpanel } from '@/components/Mixpanel';
import CommunityPage from '@/components/community/CuriousRefuge';

export default function Dashboard() {
  useEffect(() => {
    Mixpanel.track('Curious Refuge visited');
  }, []);

  return (
    <div className="relative mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <Image
        src="/images/dashboard/magical_castle.png"
        layout="fill"
        objectFit="cover"
        quality={1000}
        alt="Background"
      />
      <div className="relative mb-20">
        <CommunityPage />
      </div>
    </div>
  );
}