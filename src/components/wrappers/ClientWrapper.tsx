'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/app/auth/useAuthStore';

interface IProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: IProps) {
  const { isAuth, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuth) {
      router.push('/notAuth');
    }
  }, [isAuth, isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
