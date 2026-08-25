import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MergeTypeIcon from "@mui/icons-material/MergeTypeOutlined";
import type { AddressLevel, AddressNode, ScoredNode } from "../../api/types";
import {
  useAdminSearchNodesQuery,
  useAdminMergeMutation,
  useAdminCorrectMutation,
  useLazyAdminDuplicateCandidatesQuery,
} from "../../api/addressApi";
import { useAppDispatch } from "../../app/hooks";
import { notify } from "../../app/uiSlice";

const LEVELS: AddressLevel[] = ["COUNTRY", "STATE", "CITY", "PINCODE", "AREA", "SUBAREA"];

function MergeDuplicatesTab() {
  const dispatch = useAppDispatch();
  const [level, setLevel] = useState<AddressLevel>("AREA");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AddressNode[]>([]);
  const [primaryId, setPrimaryId] = useState<string>("");
  const [lastResult, setLastResult] = useState<string | null>(null);

  const { data } = useAdminSearchNodesQuery({ level, status: "ACTIVE", q: query, pageSize: 25 });
  const [merge, { isLoading }] = useAdminMergeMutation();

  useEffect(() => {
    setSelected([]);
    setPrimaryId("");
    setLastResult(null);
  }, [level]);

  const handleMerge = async () => {
    const duplicateIds = selected.filter((s) => s.id !== primaryId).map((s) => s.id);
    if (!primaryId || duplicateIds.length === 0) return;
    const result = await merge({ primaryId, duplicateIds }).unwrap();
    setLastResult(
      `Merged ${duplicateIds.length} duplicate value(s) into "${result.primary.name}" — ${result.totalRelinked} linked record(s) relinked automatically.`
    );
    dispatch(notify({ message: "Duplicates merged.", severity: "success" }));
    setSelected([]);
    setPrimaryId("");
  };

  return (
    <Stack spacing={2.5} sx={{ pt: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Pick the level, select two or more values that mean the same real-world place (e.g. "Sec 62", "Sector-62"),
        choose which one becomes the standard, and merge. Every user record already linked to a duplicate is
        relinked to the primary value automatically.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField select label="Level" size="small" sx={{ minWidth: 160 }} value={level} onChange={(e) => setLevel(e.target.value as AddressLevel)}>
          {LEVELS.map((l) => (
            <MenuItem key={l} value={l}>
              {l}
            </MenuItem>
          ))}
        </TextField>
        <Autocomplete
          multiple
          fullWidth
          options={data?.items ?? []}
          value={selected}
          getOptionLabel={(o) => `${o.name}${o.parent ? " · " + o.parent.name : ""}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          onChange={(_e, v) => setSelected(v)}
          onInputChange={(_e, v) => setQuery(v)}
          renderInput={(params) => <TextField {...params} label="Search and select duplicate values" size="small" />}
        />
      </Stack>

      {selected.length >= 2 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Choose the standard (primary) value
          </Typography>
          <RadioGroup value={primaryId} onChange={(e) => setPrimaryId(e.target.value)}>
            {selected.map((s) => (
              <FormControlLabel
                key={s.id}
                value={s.id}
                control={<Radio />}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>{s.name}</Typography>
                    {s.parent && <Chip size="small" variant="outlined" label={s.parent.name} />}
                  </Stack>
                }
              />
            ))}
          </RadioGroup>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" startIcon={<MergeTypeIcon />} disabled={!primaryId || isLoading} onClick={handleMerge}>
              Merge {selected.length - 1} value(s) into selected primary
            </Button>
          </Box>
        </Paper>
      )}

      {lastResult && <Alert severity="success">{lastResult}</Alert>}
    </Stack>
  );
}

function CorrectWrongAddressTab() {
  const dispatch = useAppDispatch();
  const [level, setLevel] = useState<AddressLevel>("AREA");
  const [wrongQuery, setWrongQuery] = useState("");
  const [correctQuery, setCorrectQuery] = useState("");
  const [wrong, setWrong] = useState<AddressNode | null>(null);
  const [correct, setCorrect] = useState<AddressNode | null>(null);
  const [suggested, setSuggested] = useState<ScoredNode[]>([]);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const { data: wrongOptions } = useAdminSearchNodesQuery({ level, status: "ACTIVE", q: wrongQuery, pageSize: 25 });
  const { data: correctOptions } = useAdminSearchNodesQuery({ level, status: "ACTIVE", q: correctQuery, pageSize: 25 });
  const [fetchCandidates] = useLazyAdminDuplicateCandidatesQuery();
  const [correctMutation, { isLoading }] = useAdminCorrectMutation();

  useEffect(() => {
    setWrong(null);
    setCorrect(null);
    setSuggested([]);
    setLastResult(null);
  }, [level]);

  const onSelectWrong = async (node: AddressNode | null) => {
    setWrong(node);
    setCorrect(null);
    setSuggested([]);
    if (node) {
      const candidates = await fetchCandidates(node.id).unwrap();
      setSuggested(candidates);
    }
  };

  const handleCorrect = async () => {
    if (!wrong || !correct) return;
    const result = await correctMutation({ wrongId: wrong.id, correctId: correct.id }).unwrap();
    setLastResult(
      `"${wrong.name}" now maps to "${result.primary.name}" — ${result.totalRelinked} existing record(s) relinked automatically.`
    );
    dispatch(notify({ message: "Address correction applied.", severity: "success" }));
    setWrong(null);
    setCorrect(null);
    setSuggested([]);
  };

  return (
    <Stack spacing={2.5} sx={{ pt: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Use this when a value is simply wrong (mis-tagged, misspelled beyond a fuzzy match, or the wrong location
        entirely) and needs to point straight at the correct master. Linked records move over automatically.
      </Typography>

      <TextField select label="Level" size="small" sx={{ maxWidth: 200 }} value={level} onChange={(e) => setLevel(e.target.value as AddressLevel)}>
        {LEVELS.map((l) => (
          <MenuItem key={l} value={l}>
            {l}
          </MenuItem>
        ))}
      </TextField>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Autocomplete
          fullWidth
          options={wrongOptions?.items ?? []}
          value={wrong}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          onChange={(_e, v) => onSelectWrong(v)}
          onInputChange={(_e, v) => setWrongQuery(v)}
          renderInput={(params) => <TextField {...params} label="Wrong / incorrect value" size="small" />}
        />
        <Autocomplete
          fullWidth
          options={(correctOptions?.items ?? []).filter((o) => o.id !== wrong?.id)}
          value={correct}
          getOptionLabel={(o) => o.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          onChange={(_e, v) => setCorrect(v)}
          onInputChange={(_e, v) => setCorrectQuery(v)}
          disabled={!wrong}
          renderInput={(params) => <TextField {...params} label="Correct value" size="small" />}
        />
      </Stack>

      {wrong && suggested.length > 0 && !correct && (
        <Paper variant="outlined" sx={{ p: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
            Suggested matches
          </Typography>
          <List dense>
            {suggested.map((s) => (
              <ListItemButton key={s.id} onClick={() => setCorrect(s)}>
                <ListItemText primary={s.name} secondary={`${Math.round(s.score * 100)}% similar`} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      <Box>
        <Button variant="contained" disabled={!wrong || !correct || isLoading} onClick={handleCorrect}>
          Apply correction
        </Button>
      </Box>

      {lastResult && <Alert severity="success">{lastResult}</Alert>}
    </Stack>
  );
}

export default function AdminMergePage() {
  const [tab, setTab] = useState(0);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Duplicate / Merge &amp; Correction</Typography>
      <Paper variant="outlined" sx={{ px: 2 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="fullWidth">
          <Tab label="Merge Duplicates" />
          <Tab label="Correct Wrong Address" />
        </Tabs>
        {tab === 0 ? <MergeDuplicatesTab /> : <CorrectWrongAddressTab />}
      </Paper>
    </Stack>
  );
}
