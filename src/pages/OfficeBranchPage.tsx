import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import StoreIcon from "@mui/icons-material/StorefrontOutlined";
import EntryPageTemplate from "../components/EntryPageTemplate";

export default function OfficeBranchPage() {
  const [branchName, setBranchName] = useState("AB Gurugram Sector 62 Branch");
  const [manager, setManager] = useState("Neha Verma");

  return (
    <EntryPageTemplate
      entityType="OFFICE_BRANCH"
      entityId="demo-branch-1"
      title="Office / Branch"
      subtitle="Register a branch office location for AB operations"
      icon={<StoreIcon />}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Branch name" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Branch manager" value={manager} onChange={(e) => setManager(e.target.value)} />
        </Grid>
      </Grid>
    </EntryPageTemplate>
  );
}
