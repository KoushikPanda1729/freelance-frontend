import { describe, expect, it } from "vitest";
import { EMPTY_ADDRESS, isAddressComplete, resolvedAddressToPayload } from "./types";
import type { AddressNode } from "../../api/types";

function node(overrides: Partial<AddressNode> = {}): AddressNode {
  return {
    id: "id-1",
    level: "AREA",
    name: "Sector 62",
    normalizedKey: "sector62",
    code: null,
    status: "ACTIVE",
    isUserSubmitted: false,
    parentId: "parent-1",
    mergedIntoId: null,
    createdBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("isAddressComplete", () => {
  it("is false when nothing is selected", () => {
    expect(isAddressComplete(EMPTY_ADDRESS)).toBe(false);
  });

  it("is false when Area (a required level) is still missing", () => {
    const addr = {
      ...EMPTY_ADDRESS,
      country: node({ level: "COUNTRY" }),
      state: node({ level: "STATE" }),
      city: node({ level: "CITY" }),
      pincode: node({ level: "PINCODE" }),
    };
    expect(isAddressComplete(addr)).toBe(false);
  });

  it("is true once Country, State, City, Pincode and Area are all set", () => {
    const addr = {
      ...EMPTY_ADDRESS,
      country: node({ level: "COUNTRY" }),
      state: node({ level: "STATE" }),
      city: node({ level: "CITY" }),
      pincode: node({ level: "PINCODE" }),
      area: node({ level: "AREA" }),
    };
    expect(isAddressComplete(addr)).toBe(true);
  });

  it("does not require Sub-area", () => {
    const addr = {
      ...EMPTY_ADDRESS,
      country: node({ level: "COUNTRY" }),
      state: node({ level: "STATE" }),
      city: node({ level: "CITY" }),
      pincode: node({ level: "PINCODE" }),
      area: node({ level: "AREA" }),
      subArea: null,
    };
    expect(isAddressComplete(addr)).toBe(true);
  });
});

describe("resolvedAddressToPayload", () => {
  it("maps resolved nodes to the ids the API expects", () => {
    const addr = {
      ...EMPTY_ADDRESS,
      country: node({ id: "c1", level: "COUNTRY" }),
      state: node({ id: "s1", level: "STATE" }),
      city: node({ id: "ci1", level: "CITY" }),
      pincode: node({ id: "p1", level: "PINCODE" }),
      area: node({ id: "a1", level: "AREA" }),
      line1: "Plot 12",
    };
    const payload = resolvedAddressToPayload(addr);
    expect(payload).toMatchObject({
      countryId: "c1",
      stateId: "s1",
      cityId: "ci1",
      pincodeId: "p1",
      areaId: "a1",
      subAreaId: null,
      line1: "Plot 12",
    });
  });

  it("omits blank free-text fields instead of sending empty strings", () => {
    const payload = resolvedAddressToPayload(EMPTY_ADDRESS);
    expect(payload.line1).toBeUndefined();
    expect(payload.line2).toBeUndefined();
    expect(payload.landmark).toBeUndefined();
  });
});
