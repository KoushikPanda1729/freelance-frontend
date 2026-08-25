import { describe, expect, it } from "vitest";
import uiReducer, { closeSnackbar, notify, setRole } from "./uiSlice";

describe("uiSlice", () => {
  it("defaults to the user role", () => {
    const state = uiReducer(undefined, { type: "@@INIT" });
    expect(state.role).toBe("user");
  });

  it("switches role and swaps the identifying email with it", () => {
    const initial = uiReducer(undefined, { type: "@@INIT" });
    const asAdmin = uiReducer(initial, setRole("admin"));
    expect(asAdmin.role).toBe("admin");
    expect(asAdmin.email).toContain("admin");

    const backToUser = uiReducer(asAdmin, setRole("user"));
    expect(backToUser.role).toBe("user");
    expect(backToUser.email).not.toBe(asAdmin.email);
  });

  it("opens a snackbar with the given message and severity", () => {
    const initial = uiReducer(undefined, { type: "@@INIT" });
    const next = uiReducer(initial, notify({ message: "Saved", severity: "success" }));
    expect(next.snackbar).toMatchObject({ open: true, message: "Saved", severity: "success" });
  });

  it("defaults severity to info when not provided", () => {
    const initial = uiReducer(undefined, { type: "@@INIT" });
    const next = uiReducer(initial, notify({ message: "Heads up" }));
    expect(next.snackbar.severity).toBe("info");
  });

  it("closes the snackbar without touching its message", () => {
    const initial = uiReducer(undefined, { type: "@@INIT" });
    const opened = uiReducer(initial, notify({ message: "Saved" }));
    const closed = uiReducer(opened, closeSnackbar());
    expect(closed.snackbar.open).toBe(false);
    expect(closed.snackbar.message).toBe("Saved");
  });
});
