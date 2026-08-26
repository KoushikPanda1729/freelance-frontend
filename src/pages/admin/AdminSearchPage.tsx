import { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import ClearIcon from "@mui/icons-material/CloseOutlined";
import { ENTITY_TYPES } from "../../api/types";
import { useSearchAddressesQuery } from "../../api/addressApi";

function highlightMatch(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const idx = text.toLowerCase().indexOf(trimmed.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <Box
        component="mark"
        sx={{ bgcolor: "warning.light", color: "text.primary", px: 0.25, borderRadius: 0.5 }}
      >
        {text.slice(idx, idx + trimmed.length)}
      </Box>
      {text.slice(idx + trimmed.length)}
    </>
  );
}

export default function AdminSearchPage() {
  const [q, setQ] = useState("");
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(0);

  const { data, isFetching } = useSearchAddressesQuery({
    q: q || undefined,
    entityType: entityType || undefined,
    page: page + 1,
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Search &amp; Report</Typography>
      <Typography variant="body2" color="text.secondary">
        Search always runs against the clean master address, regardless of the raw text originally typed on any
        page — merges and corrections are reflected here immediately.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            label="Search clean address"
            placeholder="e.g. Sector 62, Gurugram..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: q && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQ("")} edge="end">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Entity type"
            size="small"
            sx={{ minWidth: 200 }}
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(0);
            }}
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

      <Typography variant="body2" color="text.secondary">
        {isFetching
          ? "Searching…"
          : q || entityType
            ? `${data?.total ?? 0} result${data?.total === 1 ? "" : "s"} for this filter`
            : `${data?.total ?? 0} saved address${data?.total === 1 ? "" : "es"} across all pages`}
      </Typography>

      <Paper variant="outlined">
        {isFetching && <LinearProgress />}
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
                  <TableCell>{highlightMatch(ua.fullAddressCache, q)}</TableCell>
                  <TableCell>{new Date(ua.updatedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {!isFetching && (data?.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        {q || entityType
                          ? "No addresses match this search."
                          : "No addresses saved yet — try one of the entry pages first."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {(data?.total ?? 0) > 0 && (
          <TablePagination
            component="div"
            count={data?.total ?? 0}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={data?.pageSize ?? 25}
            rowsPerPageOptions={[data?.pageSize ?? 25]}
          />
        )}
      </Paper>
    </Stack>
  );
}
