export type AddressLevel = "COUNTRY" | "STATE" | "CITY" | "PINCODE" | "AREA" | "SUBAREA";
export type NodeStatus = "ACTIVE" | "PENDING" | "MERGED" | "INACTIVE";
export type AuditAction = "CREATE" | "UPDATE" | "ACTIVATE" | "DEACTIVATE" | "MERGE" | "CORRECT" | "RELINK";

export interface AddressNode {
  id: string;
  level: AddressLevel;
  name: string;
  normalizedKey: string;
  code: string | null;
  status: NodeStatus;
  isUserSubmitted: boolean;
  parentId: string | null;
  mergedIntoId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: AddressNode | null;
  _count?: { mergedFrom: number; aliases: number };
}

export interface ScoredNode extends AddressNode {
  score: number;
  /** True when this candidate was found by the AI semantic matcher, not text similarity - it won't have a meaningful score. */
  aiSuggested?: boolean;
}

export type ResolveResponse =
  | { status: "linked"; node: AddressNode }
  | { status: "suggestions"; suggestions: ScoredNode[] }
  | { status: "created_pending"; node: AddressNode };

export interface UserAddress {
  id: string;
  entityType: string;
  entityId: string;
  countryId: string;
  stateId: string;
  cityId: string;
  pincodeId: string;
  areaId: string;
  subAreaId: string | null;
  line1: string | null;
  line2: string | null;
  landmark: string | null;
  rawAreaText: string | null;
  rawSubAreaText: string | null;
  fullAddressCache: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  country: AddressNode;
  state: AddressNode;
  city: AddressNode;
  pincode: AddressNode;
  area: AddressNode;
  subArea: AddressNode | null;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  nodeId: string | null;
  targetNodeId: string | null;
  relinkedCount: number | null;
  reason: string | null;
  meta: Record<string, unknown> | null;
  performedBy: string | null;
  performedAt: string;
  node?: AddressNode | null;
  targetNode?: AddressNode | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const ENTITY_TYPES = [
  { value: "PROPERTY_LISTING", label: "Property Listing" },
  { value: "LEAD", label: "Lead / Enquiry" },
  { value: "USER_PROFILE", label: "User Profile (KYC)" },
  { value: "OFFICE_BRANCH", label: "Office / Branch" },
  { value: "SITE_VISIT", label: "Site Visit Scheduling" },
  { value: "INVOICE", label: "Invoice / Billing" },
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number]["value"];
