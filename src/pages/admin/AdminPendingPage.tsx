import { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import MergeTypeIcon from "@mui/icons-material/MergeTypeOutlined";
import {
  useAdminSearchNodesQuery,
  useAdminUpdateNodeMutation,
  useAdminMergeMutation,
  useLazyAdminDuplicateCandidatesQuery,
} from "../../api/addressApi";
import type { AddressNode, ScoredNode } from "../../api/types";
import { useAppDispatch } from "../../app/hooks";
import { notify } from "../../app/uiSlice";

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
              <List dense disablePadding>
                {candidates.map((c) => (
                  <ListItem
                    key={c.id}
                    secondaryAction={
                      <Button size="small" onClick={() => mergeInto(c)}>
                        Merge into this
                      </Button>
                    }
                  >
                    <ListItemText primary={c.name} secondary={`${Math.round(c.score * 100)}% similar · ${c.status}`} />
                  </ListItem>
                ))}
              </List>
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
