import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Role = "admin" | "user";
export type ThemeMode = "light" | "dark";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface UiState {
  role: Role;
  email: string;
  mode: ThemeMode;
  snackbar: SnackbarState;
}

const THEME_STORAGE_KEY = "ab-theme-mode";

function emailForRole(role: Role) {
  return role === "admin" ? "admin@acrebytes.com" : "ravi.agent@acrebytes.com";
}

// Route is the source of truth for role: landing directly on /admin/* (including a
// hard refresh) must start in admin mode, or the very first API calls would go out
// with the wrong x-user-role header and admin-only endpoints would 403.
function initialRole(): Role {
  if (typeof window === "undefined") return "user";
  return window.location.pathname.startsWith("/admin") ? "admin" : "user";
}

function readStoredMode(): ThemeMode {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light"; // private browsing / storage disabled - fall back silently
  }
}

function writeStoredMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore - nothing we can do if storage is unavailable
  }
}

function initialMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return readStoredMode();
}

const initialState: UiState = {
  role: initialRole(),
  email: emailForRole(initialRole()),
  mode: initialMode(),
  snackbar: { open: false, message: "", severity: "info" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<Role>) {
      state.role = action.payload;
      state.email = emailForRole(action.payload);
    },
    setMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      writeStoredMode(action.payload);
    },
    toggleMode(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
      writeStoredMode(state.mode);
    },
    notify(state, action: PayloadAction<{ message: string; severity?: SnackbarState["severity"] }>) {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity ?? "info",
      };
    },
    closeSnackbar(state) {
      state.snackbar.open = false;
    },
  },
});

export const { setRole, setMode, toggleMode, notify, closeSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
