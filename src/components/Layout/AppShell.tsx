import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import ApartmentIcon from "@mui/icons-material/ApartmentOutlined";
import ContactPhoneIcon from "@mui/icons-material/ContactPhoneOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import StoreIcon from "@mui/icons-material/StorefrontOutlined";
import EventIcon from "@mui/icons-material/EventAvailableOutlined";
import ReceiptIcon from "@mui/icons-material/ReceiptLongOutlined";
import MapIcon from "@mui/icons-material/MapOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActionsOutlined";
import MergeTypeIcon from "@mui/icons-material/MergeTypeOutlined";
import HistoryIcon from "@mui/icons-material/HistoryOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closeSnackbar, setRole } from "../../app/uiSlice";

const DRAWER_WIDTH = 260;

const ENTRY_NAV = [
  { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/entry/property-listing", label: "Property Listing", icon: <ApartmentIcon /> },
  { to: "/entry/lead", label: "Lead Capture", icon: <ContactPhoneIcon /> },
  { to: "/entry/profile", label: "User Profile / KYC", icon: <BadgeIcon /> },
  { to: "/entry/branch", label: "Office / Branch", icon: <StoreIcon /> },
  { to: "/entry/site-visit", label: "Site Visit", icon: <EventIcon /> },
  { to: "/entry/invoice", label: "Invoice / Billing", icon: <ReceiptIcon /> },
];

const ADMIN_NAV = [
  { to: "/admin/master", label: "Address Master", icon: <MapIcon /> },
  { to: "/admin/pending", label: "Pending Review", icon: <PendingActionsIcon /> },
  { to: "/admin/merge", label: "Duplicate / Merge", icon: <MergeTypeIcon /> },
  { to: "/admin/audit-log", label: "Audit History", icon: <HistoryIcon /> },
  { to: "/admin/search", label: "Search & Report", icon: <SearchIcon /> },
];

export default function AppShell() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.ui.role);
  const snackbar = useAppSelector((s) => s.ui.snackbar);

  const nav = role === "admin" ? [...ENTRY_NAV.slice(0, 1), ...ADMIN_NAV] : ENTRY_NAV;

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar>
        <Typography variant="h6" color="primary" fontWeight={800}>
          AB Address
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1 }}>
        {nav.map((item) => (
          <ListItemButton
            key={item.to}
            selected={location.pathname === item.to}
            onClick={() => {
              navigate(item.to);
              if (!isMdUp) setMobileOpen(false);
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          AcreBytes &middot; Central Address Master
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider", zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ gap: 2 }}>
          {!isMdUp && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}>
            {role === "admin" ? "Address Master Administration" : "AcreBytes Address Capture"}
          </Typography>
          <Chip
            size="small"
            label={role === "admin" ? "Admin console" : "Live demo"}
            color={role === "admin" ? "secondary" : "default"}
            variant="outlined"
            sx={{ display: { xs: "none", sm: "flex" } }}
          />
          <ToggleButtonGroup
            size="small"
            exclusive
            value={role}
            onChange={(_e, v) => {
              if (v) {
                dispatch(setRole(v));
                navigate(v === "admin" ? "/admin/master" : "/");
              }
            }}
          >
            <ToggleButton value="user">User</ToggleButton>
            <ToggleButton value="admin">Admin</ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMdUp ? "permanent" : "temporary"}
          open={isMdUp ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: "auto" }}>
          <Outlet />
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => dispatch(closeSnackbar())}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => dispatch(closeSnackbar())}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
