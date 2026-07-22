import BottomNavigation from '@/components/BottomNavigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-1">
      <div className="px-5 pb-[110px] pt-5.5">{children}</div>
      <BottomNavigation />
    </div>
  );
}
