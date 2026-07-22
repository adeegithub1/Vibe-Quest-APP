'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Map, Target, Users, User, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Map },
  { href: '/missions', label: 'Missions', icon: Target },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const left = NAV_ITEMS.slice(0, 2);
  const right = NAV_ITEMS.slice(2);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex h-[82px] max-w-[430px] items-center justify-around border-t border-white/10 bg-[#0f0e18]/85 pb-2.5 backdrop-blur-xl">
      <button
        onClick={() => router.push('/ai')}
        aria-label="Open Vibe AI mission generator"
        className="absolute -top-6 left-1/2 flex h-[58px] w-[58px] -translate-x-1/2 items-center justify-center rounded-full bg-quest-gradient shadow-quest-glow ring-8 ring-void animate-pulse"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </button>

      {left.map((item) => (
        <NavItem key={item.href} {...item} active={pathname === item.href} />
      ))}
      <div className="w-[52px]" />
      {right.map((item) => (
        <NavItem key={item.href} {...item} active={pathname === item.href} />
      ))}
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-[52px] flex-col items-center gap-1 font-mono text-[9.5px] font-bold uppercase tracking-wide transition-colors ${
        active ? 'text-ink' : 'text-ink-mute'
      }`}
    >
      <Icon className={`h-[19px] w-[19px] ${active ? '' : 'opacity-55 grayscale'}`} />
      {label}
    </Link>
  );
}
