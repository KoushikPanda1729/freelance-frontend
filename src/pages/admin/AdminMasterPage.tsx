import { useState } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import ToggleOnIcon from "@mui/icons-material/ToggleOnOutlined";
import ToggleOffIcon from "@mui/icons-material/ToggleOffOutlined";
import type { AddressLevel, AddressNode, NodeStatus } from "../../api/types";
import { useAdminSearchNodesQuery, useAdminUpdateNodeMutation } from "../../api/addressApi";
import { useAppDispatch } from "../../app/hooks";
import { notify } from "../../app/uiSlice";
import NodeFormDialog from "./NodeFormDialog";
import NodeHistoryDialog from "./NodeHistoryDialog";
import HistoryIcon from "@mui/icons-material/HistoryOutlined";

const LEVELS: (AddressLevel | "")[] = ["", "COUNTRY", "STATE", "CITY", "PINCODE", "AREA", "SUBAREA"];
const STATUSES: (NodeStatus | "")[] = ["", "ACTIVE", "PENDING", "MERGED", "INACTIVE"];

const STATUS_COLOR: Record<NodeStatus, "success" | "warning" | "default" | "error"> = {
  ACTIVE: "success",
  PENDING: "warning",
  MERGED: "default",
  INACTIVE: "error",
};

export default function AdminMasterPage() {
  const dispatch = useAppDispatch();
  const [level, setLevel] = useState<AddressLevel | "">("");
  const [status, setStatus] = useState<NodeStatus | "">("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<AddressNode | null>(null);
  const [historyNodeId, setHistoryNodeId] = useState<string | null>(null);

  const { data, isFetching } = useAdminSearchNodesQuery({
    level: level || undefined,
    status: status || undefined,
    q: q || undefined,
    page: page + 1,
    pageSize,
  });

  const [updateNode] = useAdminUpdateNodeMutation();

  const toggleActive = async (node: AddressNode) => {
    const next: NodeStatus = node.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await updateNode({ id: node.id, status: next }).unwrap();
    dispatch(notify({ message: `${node.name} marked ${next}.`, severity: "success" }));
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2} alignItems={{ sm: "center" }}>
        <Typography variant="h5">Address Master</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingNode(null);
            setDialogOpen(true);
          }}
        >
          Add master value
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            label="Level"
            size="small"
            sx={{ minWidth: 160 }}
            value={level}
            onChange={(e) => {
              setLevel(e.target.value as AddressLevel | "");
              setPage(0);
            }}
          >
            {LEVELS.map((l) => (
              <MenuItem key={l || "all"} value={l}>
                {l || "All levels"}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            size="small"
            sx={{ minWidth: 160 }}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as NodeStatus | "");
              setPage(0);
            }}
          >
            {STATUSES.map((s) => (
              <MenuItem key={s || "all"} value={s}>
                {s || "All statuses"}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Search by name"
            size="small"
            fullWidth
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
          />
        </Stack>
      </Paper>

      <Paper variant="outlined">
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Level</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Parent</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Aliases</TableCell>
                <TableCell align="center">Merged from</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.items ?? []).map((node) => (
                <TableRow key={node.id} hover>
                  <TableCell>
                    <Chip size="small" label={node.level} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{node.name}</Typography>
                    {node.code && (
                      <Typography variant="caption" color="text.secondary">
                        {node.code}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{node.parent?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={node.status} color={STATUS_COLOR[node.status]} />
                  </TableCell>
                  <TableCell align="center">
                    {(node._count?.aliases ?? 0) > 0 ? (
                      <Chip
                        size="small"
                        label={node._count?.aliases}
                        icon={<HistoryIcon />}
                        color="info"
                        variant="outlined"
                        clickable
                        onClick={() => setHistoryNodeId(node.id)}
                      />
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        0
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {(node._count?.mergedFrom ?? 0) > 0 ? (
                      <Chip
                        size="small"
                        label={node._count?.mergedFrom}
                        icon={<HistoryIcon />}
                        color="info"
                        variant="outlined"
                        clickable
                        onClick={() => setHistoryNodeId(node.id)}
                      />
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        0
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingNode(node);
                          setDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {node.status !== "MERGED" && (
                      <Tooltip title={node.status === "ACTIVE" ? "Deactivate" : "Activate"}>
                        <IconButton size="small" onClick={() => toggleActive(node)}>
                          {node.status === "ACTIVE" ? (
                            <ToggleOnIcon fontSize="small" color="success" />
                          ) : (
                            <ToggleOffIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!isFetching && (data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography color="text.secondary">No master values match these filters.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
        />
      </Paper>

      <NodeFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editingNode={editingNode} />
      <NodeHistoryDialog nodeId={historyNodeId} onClose={() => setHistoryNodeId(null)} />
    </Stack>
  );
}
