import ReactMarkdown from "react-markdown";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";

/** Renders assistant replies with real markdown - headings, lists, bold, code, links -
 * mapped onto MUI components so it inherits the app's theme (light/dark) automatically. */
export default function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <Typography variant="body2" sx={{ mb: 1, "&:last-child": { mb: 0 } }}>
            {children}
          </Typography>
        ),
        h1: ({ children }) => (
          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1, mb: 0.5 }}>
            {children}
          </Typography>
        ),
        h2: ({ children }) => (
          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1, mb: 0.5 }}>
            {children}
          </Typography>
        ),
        h3: ({ children }) => (
          <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1, mb: 0.5 }}>
            {children}
          </Typography>
        ),
        ul: ({ children }) => <Box component="ul" sx={{ pl: 2.5, m: 0, mb: 1 }}>{children}</Box>,
        ol: ({ children }) => <Box component="ol" sx={{ pl: 2.5, m: 0, mb: 1 }}>{children}</Box>,
        li: ({ children }) => (
          <Typography component="li" variant="body2" sx={{ mb: 0.25 }}>
            {children}
          </Typography>
        ),
        a: ({ children, href }) => (
          <Link href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </Link>
        ),
        code: ({ children }) => (
          <Box
            component="code"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.85em",
              bgcolor: "action.hover",
              px: 0.5,
              py: 0.1,
              borderRadius: 0.5,
            }}
          >
            {children}
          </Box>
        ),
        pre: ({ children }) => (
          <Box
            component="pre"
            sx={{
              bgcolor: "action.hover",
              p: 1.25,
              borderRadius: 1,
              overflowX: "auto",
              fontSize: "0.8em",
              mb: 1,
            }}
          >
            {children}
          </Box>
        ),
        strong: ({ children }) => <Box component="strong" sx={{ fontWeight: 700 }}>{children}</Box>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
