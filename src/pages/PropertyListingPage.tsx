import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ApartmentIcon from "@mui/icons-material/ApartmentOutlined";
import EntryPageTemplate from "../components/EntryPageTemplate";

export default function PropertyListingPage() {
  const [projectName, setProjectName] = useState("Emerald Heights");
  const [propertyType, setPropertyType] = useState("Apartment");

  return (
    <EntryPageTemplate
      entityType="PROPERTY_LISTING"
      entityId="demo-property-1"
      title="Property Listing"
      subtitle="Publish a new property with a standardised location"
      icon={<ApartmentIcon />}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Project / Property name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField select fullWidth label="Property type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            {["Apartment", "Villa", "Plot", "Commercial"].map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </EntryPageTemplate>
  );
}
