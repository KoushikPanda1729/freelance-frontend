import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddressCapture from "./AddressCapture";
import type { AddressNode } from "../../api/types";

function node(overrides: Partial<AddressNode>): AddressNode {
  return {
    id: "id",
    level: "COUNTRY",
    name: "name",
    normalizedKey: "name",
    code: null,
    status: "ACTIVE",
    isUserSubmitted: false,
    parentId: null,
    mergedIntoId: null,
    createdBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const india = node({ id: "india", level: "COUNTRY", name: "India", normalizedKey: "india" });
const usa = node({ id: "usa", level: "COUNTRY", name: "USA", normalizedKey: "usa" });
const haryana = node({ id: "haryana", level: "STATE", name: "Haryana", normalizedKey: "haryana", parentId: "india" });

const getNodesMock = vi.fn();
const resolveNodeTrigger = vi.fn();
const ancestorsTrigger = vi.fn();

vi.mock("../../api/addressApi", () => ({
  useGetNodesQuery: (...args: any[]) => getNodesMock(...args),
  useResolveNodeMutation: () => [resolveNodeTrigger, { isLoading: false }],
  useLazyGetNodeAncestorsQuery: () => [ancestorsTrigger],
}));

function setupOptions() {
  getNodesMock.mockImplementation((args: { level: string; parentId?: string | null }) => {
    if (args.level === "COUNTRY") return { data: [india, usa], isFetching: false };
    if (args.level === "STATE" && args.parentId === "india") return { data: [haryana], isFetching: false };
    return { data: [], isFetching: false };
  });
  resolveNodeTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ status: "linked", node: india }) });
  ancestorsTrigger.mockReturnValue({ unwrap: () => Promise.resolve([]) });
}

describe("AddressCapture", () => {
  it("disables every level below Country until its parent is chosen (Pincode excepted for reverse lookup)", () => {
    setupOptions();
    render(<AddressCapture onChange={vi.fn()} />);

    expect(screen.getByLabelText(/^country/i)).toBeEnabled();
    expect(screen.getByLabelText(/^state/i)).toBeDisabled();
    expect(screen.getByLabelText(/^city/i)).toBeDisabled();
    expect(screen.getByLabelText(/^area/i)).toBeDisabled();
    expect(screen.getByLabelText(/sub-area/i)).toBeDisabled();
    // Pincode intentionally stays enabled so a known pincode can be typed directly.
    expect(screen.getByLabelText(/^pincode/i)).toBeEnabled();
  });

  it("enables State once Country is selected, and resets it if Country is changed afterwards", async () => {
    setupOptions();
    const userEv = userEvent.setup();
    render(<AddressCapture onChange={vi.fn()} />);

    const countryInput = screen.getByLabelText(/^country/i);
    await userEv.click(countryInput);
    await userEv.click(await screen.findByText("India"));

    const stateInput = screen.getByLabelText(/^state/i);
    await waitFor(() => expect(stateInput).toBeEnabled());

    await userEv.click(stateInput);
    await userEv.click(await screen.findByText("Haryana"));
    expect(screen.getByDisplayValue("Haryana")).toBeInTheDocument();

    // Picking a different Country must cascade-reset the already-chosen State
    // (it stays enabled - USA is still a valid country to pick a new state under).
    await userEv.click(countryInput);
    await userEv.click(await screen.findByText("USA"));

    await waitFor(() => expect(screen.queryByDisplayValue("Haryana")).not.toBeInTheDocument());
    expect(screen.getByLabelText(/^state/i)).toBeEnabled();
  });

  it("does not report a change on first render, and reports incomplete once only Country is chosen", async () => {
    setupOptions();
    const onChange = vi.fn();
    const userEv = userEvent.setup();
    render(<AddressCapture onChange={onChange} />);

    expect(onChange).not.toHaveBeenCalled();

    await userEv.click(screen.getByLabelText(/^country/i));
    await userEv.click(await screen.findByText("India"));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const [, isComplete] = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(isComplete).toBe(false);
  });
});
