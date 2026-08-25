import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import EventIcon from "@mui/icons-material/EventAvailableOutlined";
import EntryPageTemplate from "../components/EntryPageTemplate";

export default function SiteVisitPage() {
  const [client, setClient] = useState("Rohit Kapoor");
  const [visitDate, setVisitDate] = useState("2026-08-28");

  return (
    <EntryPageTemplate
      entityType="SITE_VISIT"
      entityId="demo-visit-1"
      title="Site Visit Scheduling"
      subtitle="Schedule a client visit to a project location"
      icon={<EventIcon />}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Client name" value={client} onChange={(e) => setClient(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Visit date"
            InputLabelProps={{ shrink: true }}
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
          />
        </Grid>
      </Grid>
    </EntryPageTemplate>
  );
}
