'use client';

import { MoonStar, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';

export function ThemeToggle() {
  const { mounted, theme, toggleTheme } = useTheme();

  return (
    <Button variant="outline" type="button" onClick={toggleTheme} className="gap-2">
      {mounted && theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      {mounted && theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    </Button>
  );
}
