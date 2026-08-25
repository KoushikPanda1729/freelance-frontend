import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1B5E4F", light: "#3E8672", dark: "#0F3D33", contrastText: "#fff" },
    secondary: { main: "#C77B2E" },
    background: { default: "#F5F7F6", paper: "#FFFFFF" },
    success: { main: "#2E7D32" },
    warning: { main: "#ED6C02" },
    error: { main: "#C62828" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: ['"Inter"', "Roboto", "Helvetica", "Arial", "sans-serif"].join(","),
    h1: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
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
      styleOverrides: { head: { fontWeight: 700, whiteSpace: "nowrap" } },
    },
  },
});
