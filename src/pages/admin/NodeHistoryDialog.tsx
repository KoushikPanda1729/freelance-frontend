import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import { useAdminGetNodeQuery } from "../../api/addressApi";

interface Props {
  nodeId: string | null;
  onClose: () => void;
}

/**
 * Shows the actual names behind a node's Aliases / Merged-from counts -
 * a bare number doesn't tell an admin WHICH old entries are involved.
 */
export default function NodeHistoryDialog({ nodeId, onClose }: Props) {
  const { data: node, isFetching } = useAdminGetNodeQuery(nodeId ?? "", { skip: !nodeId });

  return (
    <Dialog open={Boolean(nodeId)} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{node ? `Merge history — ${node.name}` : "Merge history"}</DialogTitle>
      <DialogContent>
        {isFetching && <LinearProgress />}
        {node && (
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">
                Aliases ({node.aliases.length}) — old names that now redirect straight here
              </Typography>
              {node.aliases.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No alternate names merged in yet.
                </Typography>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {node.aliases.map((a: { id: string; aliasText: string }) => (
                    <Chip key={a.id} label={a.aliasText} size="small" variant="outlined" />
                  ))}
                </Stack>
              )}
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle2">
                Merged from ({node.mergedFrom.length}) — retired duplicate entries
              </Typography>
              {node.mergedFrom.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nothing merged into this value yet.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {node.mergedFrom.map((m) => (
                    <ListItem key={m.id} disableGutters>
                      <ListItemText
                        primary={m.name}
                        secondary={`was ${m.level.toLowerCase()} · retired ${new Date(m.updatedAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
