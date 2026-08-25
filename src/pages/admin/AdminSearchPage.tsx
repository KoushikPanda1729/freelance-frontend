import { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { ENTITY_TYPES } from "../../api/types";
import { useSearchAddressesQuery } from "../../api/addressApi";

export default function AdminSearchPage() {
  const [q, setQ] = useState("Sector 62");
  const [entityType, setEntityType] = useState("");

  const { data, isFetching } = useSearchAddressesQuery({ q: q || undefined, entityType: entityType || undefined });

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Search &amp; Report</Typography>
      <Typography variant="body2" color="text.secondary">
        Search always runs against the clean master address, regardless of the raw text originally typed on any
        page — merges and corrections are reflected here immediately.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField fullWidth label="Search clean address" value={q} onChange={(e) => setQ(e.target.value)} />
          <TextField
            select
            label="Entity type"
            size="small"
            sx={{ minWidth: 200 }}
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          >
            <MenuItem value="">All entity types</MenuItem>
            {ENTITY_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <Paper variant="outlined">
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Entity type</TableCell>
                <TableCell>Entity ID</TableCell>
                <TableCell>Clean master address</TableCell>
                <TableCell>Last updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.items ?? []).map((ua) => (
                <TableRow key={ua.id} hover>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={ua.entityType} />
                  </TableCell>
                  <TableCell>{ua.entityId}</TableCell>
                  <TableCell>{ua.fullAddressCache}</TableCell>
                  <TableCell>{new Date(ua.updatedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {!isFetching && (data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography color="text.secondary">No addresses match this search.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
