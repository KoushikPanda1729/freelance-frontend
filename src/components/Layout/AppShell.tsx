import { useEffect, useState } from "react";
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
import Tooltip from "@mui/material/Tooltip";
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
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closeSnackbar, setRole, toggleMode } from "../../app/uiSlice";
import ChatWidget from "../ChatWidget/ChatWidget";

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
  const mode = useAppSelector((s) => s.ui.mode);
  const snackbar = useAppSelector((s) => s.ui.snackbar);

  // Landing on/navigating to any /admin/* route (typed URL, bookmark, browser
  // back/forward, or a refresh) must keep you in admin mode - otherwise API calls
  // would go out with the wrong x-user-role header and 403. This is deliberately
  // one-directional: "/" (Dashboard) and other non-/admin routes are shared by both
  // roles, so simply not being on an /admin/* path must NOT force role back to
  // "user" - that would silently kick an admin back to user mode just for clicking
  // the shared Dashboard link.
  useEffect(() => {
    if (location.pathname.startsWith("/admin") && role !== "admin") {
      dispatch(setRole("admin"));
    }
  }, [location.pathname, role, dispatch]);

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
          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton onClick={() => dispatch(toggleMode())} size="small">
              {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
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

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, minWidth: 0, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMdUp ? "permanent" : "temporary"}
          open={isMdUp ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          // disableScrollLock: MUI's Modal otherwise adds padding-right to <body> to
          // compensate for the hidden scrollbar while the mobile drawer is open, and
          // that padding can get stuck - which shrinks every page's right-hand edge
          // uniformly, exactly what looked like "no padding on the right, everywhere."
          ModalProps={{ keepMounted: true, disableScrollLock: true }}
          sx={{
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* minWidth: 0 overrides the flex item's default min-width:auto, which otherwise lets
          this refuse to shrink below its content's natural width (e.g. Grid's internal
          negative-margin layout) and can force the whole row wider than the viewport -
          the overflow-hidden safety net then clips that overflow from the right, which is
          exactly what looked like "no right padding, everywhere" on mobile. */}
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar />
        <Box
          sx={{
            px: { xs: 2.5, sm: 3, md: 4 },
            py: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1200,
            mx: "auto",
            overflowX: "hidden",
          }}
        >
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

      <ChatWidget />
    </Box>
  );
}
