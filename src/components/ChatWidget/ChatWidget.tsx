import { useEffect, useRef, useState } from "react";
import Fab from "@mui/material/Fab";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Chip from "@mui/material/Chip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, keyframes } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/CloseRounded";
import SendIcon from "@mui/icons-material/SendRounded";
import RestartAltIcon from "@mui/icons-material/RestartAltRounded";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeRounded";
import MarkdownMessage from "./MarkdownMessage";
import { useSendChatMessageMutation } from "../../api/addressApi";
import type { ChatMessage } from "../../api/types";

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the **AB Assistant**. Ask me anything about how the Address Master works, or how many things are pending/active right now — I can check live.",
};

const SUGGESTED_QUESTIONS = [
  "How many items are pending review right now?",
  "How does merging duplicates work?",
  "What's the difference between Merge and Correct?",
  "How many active master values do we have?",
];

const STORAGE_KEY = "ab-chat-history";

function loadStoredMessages(): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

function saveStoredMessages(messages: ChatMessage[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // ignore - storage unavailable, chat still works, just won't persist
  }
}

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 154, 0.55); }
  70% { box-shadow: 0 0 0 14px rgba(76, 175, 154, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 154, 0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

// Mostly still, with a quick two-blink "twinkle" near the end of each cycle -
// constant spinning would be distracting, a periodic sparkle reads as more alive.
const twinkle = keyframes`
  0%, 80%, 100% { transform: rotate(0deg) scale(1); }
  87% { transform: rotate(-18deg) scale(1.2); }
  94% { transform: rotate(18deg) scale(1.2); }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`;

function ThinkingIndicator() {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ px: 0.5, py: 0.25 }}>
      <Typography variant="body2" color="text.secondary">
        Thinking
      </Typography>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: "primary.main",
            animation: `${bounce} 1.4s infinite ease-in-out`,
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </Stack>
  );
}

export default function ChatWidget() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadStoredMessages);
  const [input, setInput] = useState("");
  const [sendMessage, { isLoading }] = useSendChatMessageMutation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const sendText = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const nextHistory = [...messages, { role: "user" as const, content: text.trim() }];
    setMessages(nextHistory);
    setInput("");
    try {
      const reply = await sendMessage({ messages: nextHistory }).unwrap();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      const errorText =
        err?.data?.error ?? "Something went wrong reaching the assistant. Please try again in a moment.";
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${errorText}` }]);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME]);
    setInput("");
  };

  // Compare by content, not reference: messages restored from localStorage are freshly
  // parsed objects, so a reference check against the WELCOME constant would always fail.
  const showSuggestions = messages.length === 1 && messages[0].content === WELCOME.content;

  return (
    <>
      <Fade in={!open}>
        <Fab
          variant="extended"
          onClick={() => setOpen(true)}
          sx={(theme) => ({
            position: "fixed",
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1300,
            px: 2.5,
            color: theme.palette.primary.contrastText,
            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
            animation: `${pulse} 2.5s infinite, ${float} 3s ease-in-out infinite`,
            transition: "transform 0.2s, filter 0.2s",
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              filter: "brightness(1.08)",
              transform: "scale(1.04)",
            },
          })}
          aria-label="Open AB Assistant chat"
        >
          <AutoAwesomeIcon sx={{ mr: 1, animation: `${twinkle} 3s ease-in-out infinite` }} />
          Ask AI
        </Fab>
      </Fade>

      <Fade in={open} unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            ...(isXs
              ? { inset: 0, borderRadius: 0 }
              : {
                  bottom: 24,
                  right: 24,
                  width: 380,
                  height: 560,
                  maxHeight: "calc(100vh - 48px)",
                  borderRadius: 3,
                }),
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ px: 2, py: 1.5, bgcolor: "primary.main", color: "primary.contrastText" }}
          >
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 32, height: 32 }}>
              <SmartToyIcon fontSize="small" />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                AB Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Ask about addresses, matching, merging
              </Typography>
            </Box>
            <Tooltip title="New chat">
              <IconButton size="small" onClick={handleReset} sx={{ color: "inherit" }}>
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "inherit" }} aria-label="Close chat">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Messages */}
          <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "background.default" }}>
            <Stack spacing={1.5}>
              {messages.map((m, i) => (
                <Box
                  key={i}
                  sx={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "88%",
                  }}
                >
                  <Paper
                    variant={m.role === "user" ? "elevation" : "outlined"}
                    elevation={0}
                    sx={{
                      px: 1.5,
                      py: m.role === "user" ? 1 : 0.5,
                      borderRadius: 2,
                      bgcolor: m.role === "user" ? "primary.main" : "background.paper",
                      color: m.role === "user" ? "primary.contrastText" : "text.primary",
                    }}
                  >
                    {m.role === "user" ? (
                      <Typography variant="body2">{m.content}</Typography>
                    ) : (
                      <MarkdownMessage content={m.content} />
                    )}
                  </Paper>
                </Box>
              ))}

              {showSuggestions && !isLoading && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                    Try asking:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <Chip key={q} label={q} size="small" variant="outlined" clickable onClick={() => sendText(q)} />
                    ))}
                  </Stack>
                </Box>
              )}

              {isLoading && (
                <Box sx={{ alignSelf: "flex-start" }}>
                  <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <ThinkingIndicator />
                  </Paper>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Input */}
          <Stack direction="row" spacing={1} sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText(input);
                }
              }}
              disabled={isLoading}
              multiline
              maxRows={4}
            />
            <IconButton color="primary" onClick={() => sendText(input)} disabled={isLoading || !input.trim()}>
              <SendIcon />
            </IconButton>
          </Stack>
        </Paper>
      </Fade>
    </>
  );
}
