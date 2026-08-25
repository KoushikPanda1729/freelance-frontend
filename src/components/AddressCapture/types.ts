import type { AddressLevel, AddressNode } from "../../api/types";

export interface ResolvedAddress {
  country: AddressNode | null;
  state: AddressNode | null;
  city: AddressNode | null;
  pincode: AddressNode | null;
  area: AddressNode | null;
  subArea: AddressNode | null;
  line1: string;
  line2: string;
  landmark: string;
}

export const EMPTY_ADDRESS: ResolvedAddress = {
  country: null,
  state: null,
  city: null,
  pincode: null,
  area: null,
  subArea: null,
  line1: "",
  line2: "",
  landmark: "",
};

export const LEVEL_KEY: Record<AddressLevel, keyof ResolvedAddress> = {
  COUNTRY: "country",
  STATE: "state",
  CITY: "city",
  PINCODE: "pincode",
  AREA: "area",
  SUBAREA: "subArea",
};

export const LEVEL_SEQUENCE: AddressLevel[] = ["COUNTRY", "STATE", "CITY", "PINCODE", "AREA", "SUBAREA"];

export function isAddressComplete(addr: ResolvedAddress): boolean {
  return Boolean(addr.country && addr.state && addr.city && addr.pincode && addr.area);
}

export function resolvedAddressToPayload(addr: ResolvedAddress) {
  return {
    countryId: addr.country?.id,
    stateId: addr.state?.id,
    cityId: addr.city?.id,
    pincodeId: addr.pincode?.id,
    areaId: addr.area?.id,
    subAreaId: addr.subArea?.id ?? null,
    line1: addr.line1 || undefined,
    line2: addr.line2 || undefined,
    landmark: addr.landmark || undefined,
  };
}
