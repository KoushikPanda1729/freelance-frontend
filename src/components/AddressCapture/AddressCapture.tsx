import { useEffect, useRef, useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import AddressLevelField from "./AddressLevelField";
import { EMPTY_ADDRESS, isAddressComplete, LEVEL_SEQUENCE, ResolvedAddress } from "./types";
import type { AddressLevel, AddressNode } from "../../api/types";
import { useLazyGetNodeAncestorsQuery } from "../../api/addressApi";

interface Props {
  /** Prefills the form, e.g. when editing an entity that already has a saved address. */
  initialValue?: Partial<ResolvedAddress>;
  onChange: (value: ResolvedAddress, isComplete: boolean) => void;
  disabled?: boolean;
  title?: string;
  dense?: boolean;
}

/**
 * AB's single shared address-capture surface. Every entry point (property listing,
 * lead capture, KYC, branch setup, site visits, invoicing, ...) renders this same
 * component so the matching/standardisation rules only live in one place.
 */
export default function AddressCapture({ initialValue, onChange, disabled, title, dense }: Props) {
  const [addr, setAddr] = useState<ResolvedAddress>({ ...EMPTY_ADDRESS, ...initialValue });
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    onChange(addr, isAddressComplete(addr));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addr]);

  const setLevel = (level: AddressLevel, node: AddressNode | null) => {
    setAddr((prev) => {
      const idx = LEVEL_SEQUENCE.indexOf(level);
      const next = { ...prev };
      LEVEL_SEQUENCE.forEach((lvl, i) => {
        const key = { COUNTRY: "country", STATE: "state", CITY: "city", PINCODE: "pincode", AREA: "area", SUBAREA: "subArea" }[
          lvl
        ] as keyof ResolvedAddress;
        if (i === idx) (next as any)[key] = node;
        else if (i > idx) (next as any)[key] = null;
      });
      return next;
    });
  };

  const [fetchAncestors] = useLazyGetNodeAncestorsQuery();

  // Reverse pincode lookup: whichever way Pincode got resolved (typed directly, or
  // reached via the Country -> State -> City cascade), pull its real Country/State/City
  // from the master and fill them in - so typing a known Pincode alone is enough.
  const handlePincodeResolved = async (node: AddressNode | null) => {
    setLevel("PINCODE", node);
    if (!node) return;
    try {
      const [country, state, city] = await fetchAncestors(node.id).unwrap();
      setAddr((prev) => ({
        ...prev,
        country: country ?? prev.country,
        state: state ?? prev.state,
        city: city ?? prev.city,
      }));
    } catch {
      // Freshly-created pending pincode with no parent yet - nothing to backfill.
    }
  };

  const spacing = dense ? 1.5 : 2;

  return (
    <Stack spacing={spacing}>
      {title && (
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      )}
      <Grid container spacing={spacing}>
        <Grid item xs={12} sm={6} md={3}>
          <AddressLevelField
            level="COUNTRY"
            parentId={null}
            value={addr.country}
            onResolved={(n) => setLevel("COUNTRY", n)}
            required
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AddressLevelField
            level="STATE"
            parentId={addr.country?.id ?? null}
            value={addr.state}
            onResolved={(n) => setLevel("STATE", n)}
            required
            disabled={disabled || !addr.country}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AddressLevelField
            level="CITY"
            parentId={addr.state?.id ?? null}
            value={addr.city}
            onResolved={(n) => setLevel("CITY", n)}
            required
            disabled={disabled || !addr.state}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AddressLevelField
            level="PINCODE"
            parentId={addr.city?.id ?? null}
            value={addr.pincode}
            onResolved={handlePincodeResolved}
            required
            disabled={disabled}
            allowGlobalSearch
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AddressLevelField
            level="AREA"
            parentId={addr.pincode?.id ?? null}
            value={addr.area}
            onResolved={(n) => setLevel("AREA", n)}
            required
            disabled={disabled || !addr.pincode}
            helperText={!addr.pincode ? "Select Pincode first" : "Type to search, or enter a new area / locality"}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AddressLevelField
            level="SUBAREA"
            parentId={addr.area?.id ?? null}
            value={addr.subArea}
            onResolved={(n) => setLevel("SUBAREA", n)}
            disabled={disabled || !addr.area}
            helperText={!addr.area ? "Select Area first" : "Optional — e.g. block, tower or sub-sector"}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      <Grid container spacing={spacing}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address line (flat / house / plot no., street)"
            value={addr.line1}
            disabled={disabled}
            onChange={(e) => setAddr((prev) => ({ ...prev, line1: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address line 2 (optional)"
            value={addr.line2}
            disabled={disabled}
            onChange={(e) => setAddr((prev) => ({ ...prev, line2: e.target.value }))}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Landmark (optional)"
            value={addr.landmark}
            disabled={disabled}
            onChange={(e) => setAddr((prev) => ({ ...prev, landmark: e.target.value }))}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}

export type { ResolvedAddress };
