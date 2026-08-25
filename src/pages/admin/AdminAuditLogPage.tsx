import { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import type { AuditAction } from "../../api/types";
import { useAdminAuditLogQuery } from "../../api/addressApi";

const ACTION_COLOR: Record<AuditAction, "success" | "warning" | "info" | "error" | "default"> = {
  CREATE: "info",
  UPDATE: "default",
  ACTIVATE: "success",
  DEACTIVATE: "error",
  MERGE: "warning",
  CORRECT: "warning",
  RELINK: "default",
};

export default function AdminAuditLogPage() {
  const [page, setPage] = useState(0);
  const pageSize = 15;
  const { data, isFetching } = useAdminAuditLogQuery({ page: page + 1, pageSize });

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Audit History</Typography>
      <Typography variant="body2" color="text.secondary">
        Every create, edit, activation, merge and correction is recorded here, including how many linked user
        addresses were automatically relinked.
      </Typography>

      <Paper variant="outlined">
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Standardised to</TableCell>
                <TableCell align="center">Records relinked</TableCell>
                <TableCell>By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.items ?? []).map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>{new Date(entry.performedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip size="small" label={entry.action} color={ACTION_COLOR[entry.action]} />
                  </TableCell>
                  <TableCell>
                    {entry.node ? `${entry.node.level} · ${entry.node.name}` : "—"}
                  </TableCell>
                  <TableCell>{entry.targetNode ? entry.targetNode.name : "—"}</TableCell>
                  <TableCell align="center">{entry.relinkedCount ?? "—"}</TableCell>
                  <TableCell>{entry.performedBy ?? "—"}</TableCell>
                </TableRow>
              ))}
              {!isFetching && (data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography color="text.secondary">No audit history yet.</Typography>
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
    </Stack>
  );
}
