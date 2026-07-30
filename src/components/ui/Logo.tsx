'use client';

import Image from 'next/image';

interface LogoProps {
  className?: string;
  dark?: boolean;
}

export default function Logo({ className = "", dark = false }: LogoProps) {
  return (
    <Image
      src="/products/logo/logo.webp"
      alt="S.S. Pharmacy Logo"
      width={180}
      height={60}
      className={className || "w-44 h-auto object-contain"}
      priority
    />
  );
}
