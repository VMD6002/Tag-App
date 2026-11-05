import type { ToasterProps } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { Toaster as StockToaster } from "@/components/ui/sonner";

// Stock Toaster reads next-themes; pass the app's theme instead (stock spreads props after its own `theme`).
export function Toaster(props: ToasterProps) {
  const { theme } = useTheme();
  return <StockToaster theme={theme} {...props} />;
}
