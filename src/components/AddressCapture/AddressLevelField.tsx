import { useEffect, useMemo, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import type { AddressLevel, AddressNode, ScoredNode } from "../../api/types";
import { useGetNodesQuery, useResolveNodeMutation } from "../../api/addressApi";

const LEVEL_LABELS: Record<AddressLevel, string> = {
  COUNTRY: "Country",
  STATE: "State",
  CITY: "City",
  PINCODE: "Pincode",
  AREA: "Area / Locality",
  SUBAREA: "Sub-area / Sector",
};

const PARENT_LEVEL_LABEL: Record<AddressLevel, string> = {
  COUNTRY: "",
  STATE: "Country",
  CITY: "State",
  PINCODE: "City",
  AREA: "Pincode",
  SUBAREA: "Area",
};

interface Props {
  level: AddressLevel;
  label?: string;
  parentId: string | null;
  value: AddressNode | null;
  onResolved: (node: AddressNode | null) => void;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  /** Lets this field be searched/selected before its parent level is chosen (used by Pincode reverse-lookup). */
  allowGlobalSearch?: boolean;
}

export default function AddressLevelField({
  level,
  label,
  parentId,
  value,
  onResolved,
  required,
  disabled,
  helperText,
  allowGlobalSearch,
}: Props) {
  const [inputValue, setInputValue] = useState(value?.name ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [pendingBadge, setPendingBadge] = useState(false);
  const [suggestions, setSuggestions] = useState<ScoredNode[] | null>(null);

  useEffect(() => {
    setInputValue(value?.name ?? "");
    setPendingBadge(value?.status === "PENDING");
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue), 250);
    return () => clearTimeout(t);
  }, [inputValue]);

  const canQuery = level === "COUNTRY" || Boolean(parentId) || allowGlobalSearch;
  const { data: options = [], isFetching } = useGetNodesQuery(
    { level, parentId, q: debouncedQuery },
    { skip: !canQuery || (allowGlobalSearch && !parentId && debouncedQuery.length < 3) }
  );

  const [resolveNode, { isLoading: isResolving }] = useResolveNodeMutation();

  const isDisabled = disabled || !canQuery;
  const isGlobalSearch = Boolean(allowGlobalSearch) && !parentId;

  const runResolve = async (name: string, opts?: { confirmNodeId?: string; ignoreSuggestions?: boolean }) => {
    const trimmed = name.trim();
    if (!trimmed) {
      onResolved(null);
      return;
    }
    const result = await resolveNode({ level, name: trimmed, parentId, ...opts }).unwrap();
    if (result.status === "linked") {
      onResolved(result.node);
      setPendingBadge(false);
    } else if (result.status === "created_pending") {
      onResolved(result.node);
      setPendingBadge(true);
    } else {
      setSuggestions(result.suggestions);
    }
  };

  const handleBlur = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      onResolved(null);
      return;
    }
    if (value && value.name === trimmed) return; // unchanged, already resolved

    if (isGlobalSearch) {
      // No parent chosen yet (e.g. Pincode typed before City): only ever auto-link to
      // something that already exists in the master. Creating a brand new value here
      // would have no City/State to attach to, so that still requires picking City first.
      const exact = options.find((o) => o.name.toLowerCase() === trimmed.toLowerCase());
      onResolved(exact ?? null);
      setPendingBadge(false);
      return;
    }

    runResolve(trimmed);
  };

  const acceptSuggestion = async (node: ScoredNode) => {
    setSuggestions(null);
    await runResolve(inputValue, { confirmNodeId: node.id });
  };

  const rejectSuggestions = async () => {
    const text = inputValue;
    setSuggestions(null);
    await runResolve(text, { ignoreSuggestions: true });
  };

  const displayLabel = label ?? LEVEL_LABELS[level];

  const busy = isFetching || isResolving;

  const helper = useMemo(() => {
    if (helperText) return helperText;
    if (pendingBadge) return "Submitted for admin review — usable now, will be standardised shortly.";
    if (isGlobalSearch) return `Type to find an existing ${LEVEL_LABELS[level].toLowerCase()} — or select ${PARENT_LEVEL_LABEL[level]} above to add a new one`;
    return isDisabled && level !== "COUNTRY" ? `Select ${PARENT_LEVEL_LABEL[level]} first` : undefined;
  }, [helperText, pendingBadge, isDisabled, isGlobalSearch, level]);

  return (
    <>
      <Autocomplete
        freeSolo
        fullWidth
        disabled={isDisabled}
        options={options}
        loading={busy}
        value={value}
        inputValue={inputValue}
        isOptionEqualToValue={(opt, val) => opt.id === (val as AddressNode)?.id}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.name)}
        onInputChange={(_e, newValue, reason) => {
          setInputValue(newValue);
          if (reason === "clear") onResolved(null);
        }}
        onChange={(_e, newValue) => {
          if (newValue && typeof newValue !== "string") {
            onResolved(newValue);
            setPendingBadge(newValue.status === "PENDING");
          }
        }}
        onBlur={handleBlur}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {option.name}
            </Typography>
            {option.status === "PENDING" && <Chip size="small" color="warning" label="pending" sx={{ ml: 1 }} />}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={displayLabel}
            required={required}
            helperText={helper}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {busy ? <CircularProgress color="inherit" size={16} /> : null}
                  {pendingBadge && <Chip size="small" color="warning" label="Pending" sx={{ mr: 1 }} />}
                  {value && value.status === "ACTIVE" && <Chip size="small" color="success" variant="outlined" label="Verified" sx={{ mr: 1 }} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Dialog open={Boolean(suggestions?.length)} onClose={rejectSuggestions} maxWidth="xs" fullWidth>
        <DialogTitle>Did you mean an existing {LEVEL_LABELS[level].toLowerCase()}?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            "{inputValue}" looks similar to values already in the AB Address Master. Choosing one keeps reporting
            and search clean.
          </DialogContentText>
          <List dense>
            {suggestions?.map((s) => (
              <ListItemButton key={s.id} onClick={() => acceptSuggestion(s)}>
                <ListItemText primary={s.name} secondary={`${Math.round(s.score * 100)}% match`} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={rejectSuggestions}>None of these — add "{inputValue}" as new</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
