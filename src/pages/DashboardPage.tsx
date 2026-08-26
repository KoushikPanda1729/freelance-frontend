import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import ApartmentIcon from "@mui/icons-material/ApartmentOutlined";
import ContactPhoneIcon from "@mui/icons-material/ContactPhoneOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import StoreIcon from "@mui/icons-material/StorefrontOutlined";
import EventIcon from "@mui/icons-material/EventAvailableOutlined";
import ReceiptIcon from "@mui/icons-material/ReceiptLongOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActionsOutlined";
import MapIcon from "@mui/icons-material/MapOutlined";
import { useAppSelector } from "../app/hooks";
import { useAdminSearchNodesQuery } from "../api/addressApi";

const ENTRY_CARDS = [
  { to: "/entry/property-listing", label: "Property Listing", icon: <ApartmentIcon /> },
  { to: "/entry/lead", label: "Lead Capture", icon: <ContactPhoneIcon /> },
  { to: "/entry/profile", label: "User Profile / KYC", icon: <BadgeIcon /> },
  { to: "/entry/branch", label: "Office / Branch", icon: <StoreIcon /> },
  { to: "/entry/site-visit", label: "Site Visit", icon: <EventIcon /> },
  { to: "/entry/invoice", label: "Invoice / Billing", icon: <ReceiptIcon /> },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const role = useAppSelector((s) => s.ui.role);
  const { data: pending } = useAdminSearchNodesQuery({ status: "PENDING", pageSize: 1 }, { skip: role !== "admin" });
  const { data: active } = useAdminSearchNodesQuery({ status: "ACTIVE", pageSize: 1 }, { skip: role !== "admin" });

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" gutterBottom>
          One address, everywhere in AB
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          Every page below shares the same Address Master &amp; Mapping component. Country, State, City and Pincode
          are always picked from the central master; Area and Sub-area accept new values that flow into Admin's
          pending review queue and get standardised — with every linked record relinked automatically on merge.
        </Typography>
        {role === "admin" && (
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
            <Chip icon={<PendingActionsIcon />} label={`${pending?.total ?? 0} pending review`} color="warning" variant="outlined" />
            <Chip icon={<MapIcon />} label={`${active?.total ?? 0} active master values`} color="success" variant="outlined" />
          </Stack>
        )}
      </Paper>

      <Typography variant="h6">Address entry points</Typography>
      <Grid container spacing={2}>
        {ENTRY_CARDS.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.to}>
            <Card variant="outlined">
              <CardActionArea onClick={() => navigate(c.to)}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main" }}>{c.icon}</Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {c.label}
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
