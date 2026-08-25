import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import EntryPageTemplate from "../components/EntryPageTemplate";

export default function UserProfilePage() {
  const [name, setName] = useState("Arjun Mehta");
  const [email, setEmail] = useState("arjun.mehta@example.com");

  return (
    <EntryPageTemplate
      entityType="USER_PROFILE"
      entityId="demo-user-1"
      title="User Profile / KYC"
      subtitle="Resident/registered address captured during onboarding"
      icon={<BadgeIcon />}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Grid>
      </Grid>
    </EntryPageTemplate>
  );
}
