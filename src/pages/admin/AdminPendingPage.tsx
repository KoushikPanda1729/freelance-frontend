import { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import MergeTypeIcon from "@mui/icons-material/MergeTypeOutlined";
import CompareArrowsIcon from "@mui/icons-material/CompareArrowsOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import {
  useAdminSearchNodesQuery,
  useAdminUpdateNodeMutation,
  useAdminMergeMutation,
  useLazyAdminDuplicateCandidatesQuery,
} from "../../api/addressApi";
import type { AddressNode, ScoredNode } from "../../api/types";
import { useAppDispatch } from "../../app/hooks";
import { notify } from "../../app/uiSlice";

function scoreColor(score: number): "warning" | "info" {
  return score >= 0.85 ? "warning" : "info";
}

function PendingRow({ node }: { node: AddressNode }) {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const [candidates, setCandidates] = useState<ScoredNode[] | null>(null);
  const [fetchCandidates, { isFetching }] = useLazyAdminDuplicateCandidatesQuery();
  const [updateNode] = useAdminUpdateNodeMutation();
  const [merge] = useAdminMergeMutation();

  const toggleExpand = async () => {
    setExpanded((e) => !e);
    if (!candidates) {
      const result = await fetchCandidates(node.id).unwrap();
      setCandidates(result);
    }
  };

  const approve = async () => {
    await updateNode({ id: node.id, status: "ACTIVE" }).unwrap();
    dispatch(notify({ message: `"${node.name}" approved as a standard master value.`, severity: "success" }));
  };

  const reject = async () => {
    await updateNode({ id: node.id, status: "INACTIVE" }).unwrap();
    dispatch(notify({ message: `"${node.name}" rejected.`, severity: "info" }));
  };

  const mergeInto = async (primary: AddressNode) => {
    const result = await merge({ primaryId: primary.id, duplicateIds: [node.id] }).unwrap();
    dispatch(
      notify({
        message: `Merged "${node.name}" into "${primary.name}" — ${result.totalRelinked} record(s) relinked.`,
        severity: "success",
      })
    );
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5} alignItems={{ sm: "center" }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={node.level} variant="outlined" />
              <Typography fontWeight={700}>{node.name}</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Under {node.parent?.name ?? "—"} &middot; submitted by {node.createdBy ?? "unknown"} on{" "}
              {new Date(node.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button size="small" startIcon={<MergeTypeIcon />} onClick={toggleExpand} endIcon={<ExpandMoreIcon />}>
              Check duplicates
            </Button>
            <Button size="small" color="success" variant="contained" startIcon={<CheckCircleIcon />} onClick={approve}>
              Approve as new
            </Button>
            <Button size="small" color="error" startIcon={<BlockIcon />} onClick={reject}>
              Reject
            </Button>
          </Stack>
        </Stack>

        <Collapse in={expanded} unmountOnExit>
          <Box sx={{ mt: 2 }}>
            {isFetching && <LinearProgress />}
            {!isFetching && candidates && candidates.length === 0 && (
              <Alert severity="success" variant="outlined">
                No close matches found — safe to approve as a genuinely new value.
              </Alert>
            )}
            {!isFetching && candidates && candidates.length > 0 && (
              <Stack spacing={1.25}>
                <Typography variant="caption" color="text.secondary">
                  Possible matches already in the master — compare before approving as new:
                </Typography>
                {candidates.map((c) => {
                  const color = c.aiSuggested ? "secondary" : scoreColor(c.score);
                  return (
                    <Paper
                      key={c.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderLeft: 4,
                        borderLeftColor: `${color}.main`,
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        alignItems={{ sm: "center" }}
                        justifyContent="space-between"
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          {c.aiSuggested ? (
                            <AutoAwesomeIcon fontSize="small" color="secondary" />
                          ) : (
                            <CompareArrowsIcon fontSize="small" color="disabled" />
                          )}
                          <Box>
                            <Typography fontWeight={700}>{c.name}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                              <Chip
                                size="small"
                                color={color}
                                label={c.aiSuggested ? "AI suggested match" : `${Math.round(c.score * 100)}% match`}
                              />
                              <Chip size="small" variant="outlined" label={c.status} />
                            </Stack>
                          </Box>
                        </Stack>
                        <Button
                          size="small"
                          variant="contained"
                          color={color}
                          startIcon={<MergeTypeIcon />}
                          onClick={() => mergeInto(c)}
                        >
                          Merge into this
                        </Button>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default function AdminPendingPage() {
  const { data, isFetching } = useAdminSearchNodesQuery({ status: "PENDING", page: 1, pageSize: 100 });

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Pending Review</Typography>
      <Typography variant="body2" color="text.secondary">
        New Country / State / City / Pincode / Area / Sub-area values submitted from any entry page land here until
        an admin standardises them.
      </Typography>

      {isFetching && <LinearProgress />}

      {!isFetching && (data?.items.length ?? 0) === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Nothing pending — the master is fully standardised.</Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {(data?.items ?? []).map((node) => (
          <PendingRow key={node.id} node={node} />
        ))}
      </Stack>
    </Stack>
  );
}
