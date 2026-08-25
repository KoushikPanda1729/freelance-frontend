import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import ContactPhoneIcon from "@mui/icons-material/ContactPhoneOutlined";
import EntryPageTemplate from "../components/EntryPageTemplate";

export default function LeadCapturePage() {
  const [name, setName] = useState("Priya Sharma");
  const [phone, setPhone] = useState("+91 98765 43210");

  return (
    <EntryPageTemplate
      entityType="LEAD"
      entityId="demo-lead-1"
      title="Lead Capture"
      subtitle="Log a buyer enquiry with their preferred / current location"
      icon={<ContactPhoneIcon />}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Lead name" value={name} onChange={(e) => setName(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Grid>
      </Grid>
    </EntryPageTemplate>
  );
}
