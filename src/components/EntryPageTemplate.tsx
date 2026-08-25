import { ReactNode, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import PlaceIcon from "@mui/icons-material/PlaceOutlined";
import { AddressCapture, ResolvedAddress } from "./AddressCapture";
import {
  useCreateUserAddressMutation,
  useGetUserAddressForEntityQuery,
  useUpdateUserAddressMutation,
} from "../api/addressApi";
import { resolvedAddressToPayload } from "./AddressCapture/types";
import { useAppDispatch } from "../app/hooks";
import { notify } from "../app/uiSlice";
import type { UserAddress } from "../api/types";

interface Props {
  entityType: string;
  entityId?: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  /** Domain-specific fields rendered above the shared address block (kept local to the demo). */
  children?: ReactNode;
}

function toInitialValue(address?: UserAddress | null): Partial<ResolvedAddress> | undefined {
  if (!address) return undefined;
  return {
    country: address.country,
    state: address.state,
    city: address.city,
    pincode: address.pincode,
    area: address.area,
    subArea: address.subArea,
    line1: address.line1 ?? "",
    line2: address.line2 ?? "",
    landmark: address.landmark ?? "",
  };
}

export default function EntryPageTemplate({ entityType, entityId = "demo-1", title, subtitle, icon, children }: Props) {
  const dispatch = useAppDispatch();
  const { data: existingAddress, isLoading } = useGetUserAddressForEntityQuery({ entityType, entityId });
  const [createAddress, { isLoading: isCreating }] = useCreateUserAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateUserAddressMutation();

  const [pending, setPending] = useState<ResolvedAddress | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSave = async () => {
    if (!pending || !isComplete) {
      dispatch(notify({ message: "Please complete Country, State, City, Pincode and Area.", severity: "warning" }));
      return;
    }
    const payload = { entityType, entityId, ...resolvedAddressToPayload(pending) };
    if (existingAddress) {
      await updateAddress({ id: existingAddress.id, body: payload }).unwrap();
    } else {
      await createAddress(payload).unwrap();
    }
    dispatch(notify({ message: "Address saved using the AB Address Master.", severity: "success" }));
  };

  const saving = isCreating || isUpdating;

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: "primary.main" }}>{icon}</Avatar>}
          title={title}
          subheader={subtitle}
        />
        {children && (
          <>
            <Divider />
            <CardContent>
              <Stack spacing={2}>{children}</Stack>
            </CardContent>
          </>
        )}
      </Card>

      <Card variant="outlined">
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: "secondary.main" }}><PlaceIcon /></Avatar>}
          title="Address"
          subheader="Powered by the shared AB Address Master & Mapping component"
        />
        {isLoading ? (
          <LinearProgress />
        ) : (
          <CardContent>
            <Stack spacing={2}>
              {existingAddress && (
                <Alert severity="info" variant="outlined">
                  Currently linked to master: <strong>{existingAddress.fullAddressCache}</strong>
                </Alert>
              )}
              <AddressCapture
                initialValue={toInitialValue(existingAddress)}
                onChange={(addr, complete) => {
                  setPending(addr);
                  setIsComplete(complete);
                }}
              />
              <Box>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
                  {existingAddress ? "Update address" : "Save address"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        )}
      </Card>
    </Stack>
  );
}
