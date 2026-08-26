import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Radio from "@mui/material/Radio";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MergeTypeIcon from "@mui/icons-material/MergeTypeOutlined";
import RuleIcon from "@mui/icons-material/RuleOutlined";
import HistoryIcon from "@mui/icons-material/HistoryOutlined";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import type { AddressLevel, AddressNode, AuditLogEntry, ScoredNode } from "../../api/types";
import {
  useAdminSearchNodesQuery,
  useAdminMergeMutation,
  useAdminCorrectMutation,
  useAdminAuditLogQuery,
  useLazyAdminDuplicateCandidatesQuery,
} from "../../api/addressApi";
import { useAppDispatch } from "../../app/hooks";
import { notify } from "../../app/uiSlice";

const LEVELS: AddressLevel[] = ["COUNTRY", "STATE", "CITY", "PINCODE", "AREA", "SUBAREA"];

function StepLabel({ n, children }: { n: number; children: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Avatar sx={{ width: 22, height: 22, fontSize: 13, bgcolor: "primary.main" }}>{n}</Avatar>
      <Typography variant="subtitle2">{children}</Typography>
    </Stack>
  );
}

function scoreColor(score: number): "warning" | "info" {
  return score >= 0.85 ? "warning" : "info";
}

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
    <Stack spacing={3}>
      <Alert severity="info" variant="outlined" icon={<MergeTypeIcon fontSize="small" />}>
        Use this when two or more values genuinely mean the same real place (e.g. "Sec 62", "Sector-62"). Every
        record already linked to a duplicate relinks to your chosen primary automatically.
      </Alert>

      <Stack spacing={1.5}>
        <StepLabel n={1}>Find the duplicate values</StepLabel>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Level"
            size="small"
            sx={{ minWidth: 160 }}
            value={level}
            onChange={(e) => setLevel(e.target.value as AddressLevel)}
          >
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
      </Stack>

      {selected.length >= 2 && (
        <Stack spacing={1.5}>
          <StepLabel n={2}>Choose which one becomes the standard</StepLabel>
          <Stack spacing={1}>
            {selected.map((s) => {
              const isChosen = primaryId === s.id;
              return (
                <Paper
                  key={s.id}
                  variant="outlined"
                  onClick={() => setPrimaryId(s.id)}
                  sx={{
                    p: 1.5,
                    cursor: "pointer",
                    borderWidth: isChosen ? 2 : 1,
                    borderColor: isChosen ? "primary.main" : "divider",
                    bgcolor: isChosen ? "action.selected" : "transparent",
                    transition: "border-color 0.15s, background-color 0.15s",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Radio checked={isChosen} size="small" sx={{ p: 0 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600}>{s.name}</Typography>
                      {s.parent && (
                        <Typography variant="caption" color="text.secondary">
                          under {s.parent.name}
                        </Typography>
                      )}
                    </Box>
                    {isChosen && <Chip size="small" color="primary" icon={<CheckCircleIcon />} label="Primary" />}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>

          <Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<MergeTypeIcon />}
              disabled={!primaryId || isLoading}
              onClick={handleMerge}
            >
              Merge {selected.length - 1} value{selected.length - 1 === 1 ? "" : "s"} into primary
            </Button>
          </Box>
        </Stack>
      )}

      {lastResult && (
        <Alert severity="success" variant="filled">
          {lastResult}
        </Alert>
      )}
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
    <Stack spacing={3}>
      <Alert severity="warning" variant="outlined" icon={<RuleIcon fontSize="small" />}>
        Use this only when a value is simply wrong — mis-tagged, misspelled beyond a fuzzy match, or the wrong
        location entirely. Linked records move to the correct value automatically.
      </Alert>

      <Stack spacing={1.5}>
        <StepLabel n={1}>Pick the level, then the wrong and correct values</StepLabel>
        <TextField
          select
          label="Level"
          size="small"
          sx={{ maxWidth: 200 }}
          value={level}
          onChange={(e) => setLevel(e.target.value as AddressLevel)}
        >
          {LEVELS.map((l) => (
            <MenuItem key={l} value={l}>
              {l}
            </MenuItem>
          ))}
        </TextField>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
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
          <ArrowRightAltIcon color="disabled" sx={{ display: { xs: "none", sm: "block" } }} />
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
      </Stack>

      {wrong && suggested.length > 0 && !correct && (
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Suggested matches for "{wrong.name}"
          </Typography>
          {suggested.map((s) => {
            const color = s.aiSuggested ? "secondary" : scoreColor(s.score);
            return (
              <Paper
                key={s.id}
                variant="outlined"
                onClick={() => setCorrect(s)}
                sx={{
                  p: 1.5,
                  cursor: "pointer",
                  borderLeft: 4,
                  borderLeftColor: `${color}.main`,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {s.aiSuggested && <AutoAwesomeIcon fontSize="small" color="secondary" />}
                    <Typography fontWeight={600}>{s.name}</Typography>
                  </Stack>
                  <Chip
                    size="small"
                    color={color}
                    label={s.aiSuggested ? "AI suggested" : `${Math.round(s.score * 100)}% match`}
                  />
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      <Box>
        <Button variant="contained" size="large" startIcon={<RuleIcon />} disabled={!wrong || !correct || isLoading} onClick={handleCorrect}>
          Apply correction
        </Button>
      </Box>

      {lastResult && (
        <Alert severity="success" variant="filled">
          {lastResult}
        </Alert>
      )}
    </Stack>
  );
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function RecentActivity() {
  const { data, isFetching } = useAdminAuditLogQuery({ page: 1, pageSize: 20 });
  const entries = (data?.items ?? []).filter((e) => e.action === "MERGE" || e.action === "CORRECT").slice(0, 5);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <HistoryIcon fontSize="small" color="action" />
          <Typography variant="subtitle1" fontWeight={600}>
            Recent merges &amp; corrections
          </Typography>
        </Stack>
        {isFetching && <LinearProgress sx={{ mb: 1 }} />}
        {!isFetching && entries.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nothing merged or corrected yet — do one above and it'll show up here immediately.
          </Typography>
        )}
        <Stack spacing={1.5}>
          {entries.map((entry: AuditLogEntry) => {
            const isCorrect = entry.action === "CORRECT";
            return (
              <Stack key={entry.id} direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: isCorrect ? "warning.main" : "primary.main",
                  }}
                >
                  {isCorrect ? <RuleIcon fontSize="small" /> : <MergeTypeIcon fontSize="small" />}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip size="small" label={isCorrect ? "CORRECT" : "MERGE"} color={isCorrect ? "warning" : "primary"} />
                    <Typography fontWeight={600} noWrap>
                      {entry.node?.name ?? "a value"}
                    </Typography>
                    <ArrowRightAltIcon fontSize="small" color="disabled" />
                    <Typography fontWeight={600} noWrap>
                      {entry.targetNode?.name ?? "the primary"}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {entry.performedBy ?? "unknown"} · {timeAgo(entry.performedAt)}
                    {entry.relinkedCount ? ` · ${entry.relinkedCount} record${entry.relinkedCount === 1 ? "" : "s"} relinked` : ""}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AdminMergePage() {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Duplicate / Merge &amp; Correction
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Clean up the master by merging real duplicates or fixing values that are simply wrong.
        </Typography>
      </Box>

      <Card variant="outlined">
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<MergeTypeIcon fontSize="small" />}
            iconPosition="start"
            label={isXs ? "Merge" : "Merge Duplicates"}
          />
          <Tab
            icon={<RuleIcon fontSize="small" />}
            iconPosition="start"
            label={isXs ? "Correct" : "Correct Wrong Address"}
          />
        </Tabs>
        <CardContent>{tab === 0 ? <MergeDuplicatesTab /> : <CorrectWrongAddressTab />}</CardContent>
      </Card>

      <RecentActivity />
    </Stack>
  );
}
