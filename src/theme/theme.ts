import { createTheme, Theme } from "@mui/material/styles";
import type { ThemeMode } from "../app/uiSlice";

const shared = {
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: ['"Inter"', "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
    h1: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none" as const, fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 700, whiteSpace: "nowrap" as const } },
    },
  },
};

export function getTheme(mode: ThemeMode): Theme {
  if (mode === "dark") {
    return createTheme({
      ...shared,
      palette: {
        mode: "dark",
        primary: { main: "#4FB09A", light: "#7BC7B5", dark: "#2E7E6A", contrastText: "#00201A" },
        secondary: { main: "#E0A052" },
        background: { default: "#121212", paper: "#1B1B1B" },
        success: { main: "#66BB6A" },
        warning: { main: "#FFA726" },
        error: { main: "#EF5350" },
        divider: "rgba(255,255,255,0.12)",
      },
    });
  }

  return createTheme({
    ...shared,
    palette: {
      mode: "light",
      primary: { main: "#1B5E4F", light: "#3E8672", dark: "#0F3D33", contrastText: "#fff" },
      secondary: { main: "#C77B2E" },
      background: { default: "#F5F7F6", paper: "#FFFFFF" },
      success: { main: "#2E7D32" },
      warning: { main: "#ED6C02" },
      error: { main: "#C62828" },
    },
  });
}
