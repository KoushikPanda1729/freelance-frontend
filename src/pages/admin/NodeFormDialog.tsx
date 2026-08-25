import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import type { AddressLevel, AddressNode, NodeStatus } from "../../api/types";
import { useAdminCreateNodeMutation, useAdminSearchNodesQuery, useAdminUpdateNodeMutation } from "../../api/addressApi";
import { useAppDispatch } from "../../app/hooks";
import { notify } from "../../app/uiSlice";

const LEVELS: AddressLevel[] = ["COUNTRY", "STATE", "CITY", "PINCODE", "AREA", "SUBAREA"];
const PARENT_LEVEL: Record<AddressLevel, AddressLevel | null> = {
  COUNTRY: null,
  STATE: "COUNTRY",
  CITY: "STATE",
  PINCODE: "CITY",
  AREA: "PINCODE",
  SUBAREA: "AREA",
};
const STATUSES: NodeStatus[] = ["ACTIVE", "PENDING", "INACTIVE"];

interface Props {
  open: boolean;
  onClose: () => void;
  editingNode?: AddressNode | null;
}

export default function NodeFormDialog({ open, onClose, editingNode }: Props) {
  const dispatch = useAppDispatch();
  const isEdit = Boolean(editingNode);

  const [level, setLevel] = useState<AddressLevel>(editingNode?.level ?? "AREA");
  const [name, setName] = useState(editingNode?.name ?? "");
  const [code, setCode] = useState(editingNode?.code ?? "");
  const [status, setStatus] = useState<NodeStatus>((editingNode?.status as NodeStatus) ?? "ACTIVE");
  const [parentQuery, setParentQuery] = useState("");
  const [parent, setParent] = useState<AddressNode | null>(editingNode?.parent ?? null);

  useEffect(() => {
    if (open) {
      setLevel(editingNode?.level ?? "AREA");
      setName(editingNode?.name ?? "");
      setCode(editingNode?.code ?? "");
      setStatus((editingNode?.status as NodeStatus) ?? "ACTIVE");
      setParent(editingNode?.parent ?? null);
      setParentQuery("");
    }
  }, [open, editingNode]);

  const parentLevel = PARENT_LEVEL[level];
  const { data: parentOptions } = useAdminSearchNodesQuery(
    { level: parentLevel ?? undefined, status: "ACTIVE", q: parentQuery, pageSize: 20 },
    { skip: !parentLevel || isEdit }
  );

  const [createNode, { isLoading: creating }] = useAdminCreateNodeMutation();
  const [updateNode, { isLoading: updating }] = useAdminUpdateNodeMutation();

  const canSubmit = name.trim().length > 0 && (isEdit || !parentLevel || Boolean(parent));

  const handleSubmit = async () => {
    try {
      if (isEdit && editingNode) {
        await updateNode({ id: editingNode.id, name, code: code || undefined, status }).unwrap();
        dispatch(notify({ message: `${editingNode.level} "${name}" updated.`, severity: "success" }));
      } else {
        await createNode({ level, name, code: code || undefined, parentId: parent?.id ?? null, status }).unwrap();
        dispatch(notify({ message: `${level} "${name}" created.`, severity: "success" }));
      }
      onClose();
    } catch (err: any) {
      dispatch(notify({ message: err?.data?.error ?? "Something went wrong.", severity: "error" }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? "Edit master value" : "Add master value"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label="Level" value={level} disabled={isEdit} onChange={(e) => setLevel(e.target.value as AddressLevel)}>
            {LEVELS.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </TextField>

          {parentLevel && !isEdit && (
            <Autocomplete
              options={parentOptions?.items ?? []}
              getOptionLabel={(o) => o.name}
              value={parent}
              onChange={(_e, v) => setParent(v)}
              onInputChange={(_e, v) => setParentQuery(v)}
              renderInput={(params) => <TextField {...params} label={`Parent (${parentLevel})`} required />}
            />
          )}
          {isEdit && parentLevel && (
            <TextField label={`Parent (${parentLevel})`} value={editingNode?.parent?.name ?? "—"} disabled />
          )}

          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          <TextField label="Code (optional)" value={code ?? ""} onChange={(e) => setCode(e.target.value)} />
          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value as NodeStatus)}>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSubmit || creating || updating} onClick={handleSubmit}>
          {isEdit ? "Save changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
