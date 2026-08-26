import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../app/store";
import type {
  AddressLevel,
  AddressNode,
  AuditLogEntry,
  ChatMessage,
  NodeStatus,
  Paginated,
  ResolveResponse,
  UserAddress,
} from "./types";

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      headers.set("x-user-role", state.ui.role);
      headers.set("x-user-email", state.ui.email);
      return headers;
    },
  }),
  tagTypes: ["Node", "AdminNode", "UserAddress", "AuditLog", "Search"],
  endpoints: (builder) => ({
    getNodes: builder.query<AddressNode[], { level: AddressLevel; parentId?: string | null; q?: string }>({
      query: ({ level, parentId, q }) => ({
        url: "/nodes",
        params: { level, parentId: parentId ?? undefined, q: q || undefined },
      }),
      transformResponse: (res: { items: AddressNode[] }) => res.items,
      providesTags: (result, _err, arg) => [{ type: "Node" as const, id: `${arg.level}-${arg.parentId ?? "root"}` }],
    }),

    resolveNode: builder.mutation<
      ResolveResponse,
      { level: AddressLevel; name: string; parentId?: string | null; confirmNodeId?: string; ignoreSuggestions?: boolean }
    >({
      query: (body) => ({ url: "/nodes/resolve", method: "POST", body }),
      invalidatesTags: (result, _err, arg) =>
        result?.status !== "suggestions"
          ? [{ type: "Node" as const, id: `${arg.level}-${arg.parentId ?? "root"}` }, "AdminNode"]
          : [],
    }),

    getNodeAncestors: builder.query<AddressNode[], string>({
      query: (id) => `/nodes/${id}/ancestors`,
      transformResponse: (res: { ancestors: AddressNode[] }) => res.ancestors,
    }),

    getUserAddressForEntity: builder.query<UserAddress | null, { entityType: string; entityId: string }>({
      query: ({ entityType, entityId }) => ({ url: "/user-addresses", params: { entityType, entityId } }),
      transformResponse: (res: { address: UserAddress | null }) => res.address,
      providesTags: (result) => (result ? [{ type: "UserAddress" as const, id: result.id }] : []),
    }),

    createUserAddress: builder.mutation<UserAddress, Record<string, unknown>>({
      query: (body) => ({ url: "/user-addresses", method: "POST", body }),
      transformResponse: (res: { address: UserAddress }) => res.address,
      invalidatesTags: ["UserAddress", "Search"],
    }),

    updateUserAddress: builder.mutation<UserAddress, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/user-addresses/${id}`, method: "PUT", body }),
      transformResponse: (res: { address: UserAddress }) => res.address,
      invalidatesTags: ["UserAddress", "Search"],
    }),

    adminSearchNodes: builder.query<
      Paginated<AddressNode>,
      { level?: AddressLevel; status?: NodeStatus; q?: string; page?: number; pageSize?: number }
    >({
      query: (params) => ({ url: "/admin/nodes", params }),
      providesTags: (result) =>
        result
          ? [...result.items.map((n) => ({ type: "AdminNode" as const, id: n.id })), "AdminNode"]
          : ["AdminNode"],
    }),

    adminGetNode: builder.query<AddressNode & { children: AddressNode[]; aliases: any[]; mergedFrom: AddressNode[] }, string>({
      query: (id) => `/admin/nodes/${id}`,
      transformResponse: (res: { node: any }) => res.node,
      providesTags: (_r, _e, id) => [{ type: "AdminNode" as const, id }],
    }),

    adminDuplicateCandidates: builder.query<(AddressNode & { score: number })[], string>({
      query: (id) => `/admin/nodes/${id}/duplicate-candidates`,
      transformResponse: (res: { candidates: any[] }) => res.candidates,
    }),

    adminCreateNode: builder.mutation<
      AddressNode,
      { level: AddressLevel; name: string; parentId?: string | null; code?: string; status?: NodeStatus }
    >({
      query: (body) => ({ url: "/admin/nodes", method: "POST", body }),
      transformResponse: (res: { node: AddressNode }) => res.node,
      invalidatesTags: ["AdminNode", "Node"],
    }),

    adminUpdateNode: builder.mutation<AddressNode, { id: string; name?: string; code?: string; status?: NodeStatus }>({
      query: ({ id, ...body }) => ({ url: `/admin/nodes/${id}`, method: "PUT", body }),
      transformResponse: (res: { node: AddressNode }) => res.node,
      invalidatesTags: (_r, _e, arg) => [{ type: "AdminNode" as const, id: arg.id }, "AdminNode", "Node"],
    }),

    adminMerge: builder.mutation<{ primary: AddressNode; totalRelinked: number }, { primaryId: string; duplicateIds: string[] }>({
      query: (body) => ({ url: "/admin/merge", method: "POST", body }),
      invalidatesTags: ["AdminNode", "Node", "UserAddress", "AuditLog", "Search"],
    }),

    adminCorrect: builder.mutation<{ primary: AddressNode; totalRelinked: number }, { wrongId: string; correctId: string }>({
      query: (body) => ({ url: "/admin/correct", method: "POST", body }),
      invalidatesTags: ["AdminNode", "Node", "UserAddress", "AuditLog", "Search"],
    }),

    adminAuditLog: builder.query<Paginated<AuditLogEntry>, { nodeId?: string; page?: number; pageSize?: number }>({
      query: (params) => ({ url: "/admin/audit-log", params }),
      providesTags: ["AuditLog"],
    }),

    searchAddresses: builder.query<Paginated<UserAddress>, { q?: string; entityType?: string; page?: number }>({
      query: (params) => ({ url: "/search", params }),
      providesTags: ["Search"],
    }),

    sendChatMessage: builder.mutation<string, { messages: ChatMessage[] }>({
      query: (body) => ({ url: "/chat", method: "POST", body }),
      transformResponse: (res: { reply: string }) => res.reply,
    }),
  }),
});

export const {
  useGetNodesQuery,
  useLazyGetNodesQuery,
  useLazyGetNodeAncestorsQuery,
  useResolveNodeMutation,
  useGetUserAddressForEntityQuery,
  useCreateUserAddressMutation,
  useUpdateUserAddressMutation,
  useAdminSearchNodesQuery,
  useAdminGetNodeQuery,
  useAdminDuplicateCandidatesQuery,
  useLazyAdminDuplicateCandidatesQuery,
  useAdminCreateNodeMutation,
  useAdminUpdateNodeMutation,
  useAdminMergeMutation,
  useAdminCorrectMutation,
  useAdminAuditLogQuery,
  useSearchAddressesQuery,
  useSendChatMessageMutation,
} = addressApi;
