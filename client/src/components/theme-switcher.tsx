import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, Check } from 'lucide-react';

export default function ThemeSwitcher() {
  const { currentTheme, themeName, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeIcons: Record<string, string> = {
    heritageRefined: '🏛️',
    modernMinimal: '✨',
    darkElegant: '🌙',
  };

  const themePreviewColors: Record<string, { bg: string; primary: string; secondary: string }> = {
    heritageRefined: {
      bg: 'hsl(30, 26%, 96%)',
      primary: 'hsl(38, 69%, 59%)',
      secondary: 'hsl(120, 25%, 25%)',
    },
    modernMinimal: {
      bg: 'hsl(0, 0%, 100%)',
      primary: 'hsl(189, 94%, 43%)',
      secondary: 'hsl(215, 25%, 35%)',
    },
    darkElegant: {
      bg: 'hsl(222, 47%, 11%)',
      primary: 'hsl(38, 92%, 50%)',
      secondary: 'hsl(217, 33%, 17%)',
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="theme-switcher-container">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: currentTheme.colors.primaryForeground,
            }}
            data-testid="button-theme-switcher"
          >
            <Palette className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-80 p-2"
          style={{
            backgroundColor: currentTheme.colors.card,
            borderColor: currentTheme.colors.border,
          }}
        >
          <div className="p-2 mb-2">
            <h3
              className="font-semibold text-sm mb-1"
              style={{ color: currentTheme.colors.foreground }}
            >
              Choose Theme
            </h3>
            <p
              className="text-xs"
              style={{ color: currentTheme.colors.mutedForeground }}
            >
              Select your preferred visual style
            </p>
          </div>

          {Object.values(themes).map((theme) => {
            const preview = themePreviewColors[theme.name];
            const isActive = themeName === theme.name;

            return (
              <DropdownMenuItem
                key={theme.name}
                className="cursor-pointer p-0 mb-2"
                onSelect={() => setTheme(theme.name)}
                data-testid={`theme-option-${theme.name}`}
              >
                <Card
                  className="w-full border-2 transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    borderColor: isActive
                      ? currentTheme.colors.primary
                      : currentTheme.colors.border,
                    backgroundColor: currentTheme.colors.card,
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{themeIcons[theme.name]}</span>
                        <div>
                          <h4
                            className="font-semibold text-sm"
                            style={{ color: currentTheme.colors.foreground }}
                          >
                            {theme.displayName}
                          </h4>
                          <p
                            className="text-xs"
                            style={{ color: currentTheme.colors.mutedForeground }}
                          >
                            {theme.description}
                          </p>
                        </div>
                      </div>
                      {isActive && (
                        <Check
                          className="h-5 w-5"
                          style={{ color: currentTheme.colors.primary }}
                        />
                      )}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <div
                        className="h-8 flex-1 rounded"
                        style={{ backgroundColor: preview.bg }}
                      />
                      <div
                        className="h-8 flex-1 rounded"
                        style={{ backgroundColor: preview.primary }}
                      />
                      <div
                        className="h-8 flex-1 rounded"
                        style={{ backgroundColor: preview.secondary }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
