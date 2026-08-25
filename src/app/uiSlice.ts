import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Role = "admin" | "user";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface UiState {
  role: Role;
  email: string;
  snackbar: SnackbarState;
}

const initialState: UiState = {
  role: "user",
  email: "ravi.agent@acrebytes.com",
  snackbar: { open: false, message: "", severity: "info" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<Role>) {
      state.role = action.payload;
      state.email = action.payload === "admin" ? "admin@acrebytes.com" : "ravi.agent@acrebytes.com";
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

export const { setRole, notify, closeSnackbar } = uiSlice.actions;
export default uiSlice.reducer;
