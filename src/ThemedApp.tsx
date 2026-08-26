import { ReactNode, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAppSelector } from "./app/hooks";
import { getTheme } from "./theme/theme";

/**
 * Reads the persisted light/dark preference from Redux and builds the MUI theme from
 * it, inside the Provider so it reacts live to the toggle instead of being fixed at
 * module load time.
 */
export default function ThemedApp({ children }: { children: ReactNode }) {
  const mode = useAppSelector((s) => s.ui.mode);
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
