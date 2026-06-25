import axios from "axios";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Trash2,
  Trophy,
  User,
  CheckCircle2,
  BarChart3,
  Moon,
  Sun,
  Mail,
  Phone,
  XCircle
} from "lucide-react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
  Chip,
  LinearProgress,
  IconButton,
  Stack,
  CssBaseline
} from "@mui/material";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";

const MotionPaper = motion(Paper);
const MotionListItem = motion(ListItem);
const MotionBox = motion(Box);

const springSmooth = { type: "spring", damping: 30, stiffness: 200 };
const springGentle = { type: "spring", damping: 20, stiffness: 120 };

function App() {
  const [jd, setJd] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [themeMode, setThemeMode] = useState("light");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState([]);

  const isDark = themeMode === "dark";

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: { main: "#2e7d32" },
          success: { main: "#2e7d32" },
          warning: { main: "#f59e0b" },
          error: { main: "#dc2626" },
          background: {
            default: isDark ? "#0b1120" : "#f8fafc",
            paper: isDark ? "#111827" : "#ffffff"
          }
        },
        shape: { borderRadius: 16 },
        typography: {
          fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`
        }
      }),
    [themeMode, isDark]
  );

  const palette = {
    bgOverlay: isDark
      ? "linear-gradient(rgba(11,17,32,0.86), rgba(20,83,45,0.74))"
      : "linear-gradient(rgba(248,250,252,0.84), rgba(232,245,233,0.80))",
    paper: isDark ? alpha("#0f172a", 0.72) : alpha("#ffffff", 0.72),
    paperSoft: isDark ? alpha("#0f172a", 0.62) : alpha("#ffffff", 0.62),
    border: isDark
      ? "1px solid rgba(255,255,255,0.10)"
      : "1px solid rgba(255,255,255,0.35)",
    text: isDark ? "#f8fafc" : "#102a1c",
    muted: isDark ? "rgba(226,232,240,0.72)" : "rgba(15,23,42,0.65)",
    cardShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.35)"
      : "0 10px 30px rgba(0,0,0,0.10)"
  };

  const normalizeScore = (score) => {
    const value = Number(score);
    if (!Number.isFinite(value)) return 0;
    return Math.min(Math.max(value, 0), 100);
  };

  const enrichCandidates = (items = []) =>
    items.map((item, index) => ({
      ...item,
      _id:
        item.id ??
        item.email ??
        item.phone ??
        `${item.name || "candidate"}-${index}`,
      score: normalizeScore(item.score)
    }));

  const getStatusType = (status) => {
    const value = String(status).toLowerCase();
    if (value.includes("reject")) return "rejected";
    if (value.includes("short")) return "shortlisted";
    return "neutral";
  };

  const getStatusChipColor = (status) => {
    const type = getStatusType(status);
    if (type === "shortlisted") return "success";
    if (type === "rejected") return "error";
    return "default";
  };

  const getFitLabel = (score) => {
    const value = normalizeScore(score);
    if (value >= 75) return "Strong Fit";
    if (value >= 50) return "Moderate Fit";
    return "Weak Fit";
  };

  const getFitChipProps = (score) => {
    const value = normalizeScore(score);
    if (value >= 75) return { label: "🟢 Strong Fit", color: "success", variant: "filled" };
    if (value >= 50) return { label: "🟡 Moderate Fit", color: "warning", variant: "filled" };
    return { label: "🔴 Weak Fit", color: "error", variant: "filled" };
  };

  const getValidEmailCandidates = (items = []) =>
    items.filter(
      (candidate) =>
        candidate?.email &&
        candidate.email !== "Unknown" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)
    );

  const handleSubmit = async () => {
    if (!jd || files.length === 0) {
      alert("Please add JD and upload resumes");
      return;
    }

    const formData = new FormData();
    formData.append("jd", jd);
    files.forEach((file) => formData.append("files", file));

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:5000/rank", formData);
      const rankedCandidates = enrichCandidates(res.data || []);
      setResults(rankedCandidates);
      setSelectedCandidateId(rankedCandidates[0]?._id || null);
      setShortlistedIds([]);
    } catch (error) {
      console.error(error);
      alert("Backend connection error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (incomingFiles) => {
    const selectedFiles = Array.from(incomingFiles || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const shortlistedCandidates = useMemo(
    () => results.filter((c) => shortlistedIds.includes(c._id)),
    [results, shortlistedIds]
  );

  const shortlistedCount = shortlistedCandidates.length;

  const selectedCandidate = useMemo(
    () => results.find((candidate) => candidate._id === selectedCandidateId) || null,
    [results, selectedCandidateId]
  );

  const topCandidate = results[0] || null;
  const topIsRejected = getStatusType(topCandidate?.status) === "rejected";
  const topScore = topCandidate?.score ?? 0;

  const pageFade = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const listContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  };

  const listItem = {
    hidden: { opacity: 0, x: -16 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const toggleShortlist = (candidateId) => {
    setShortlistedIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const sendEmailToCandidate = async (candidate) => {
    try {
      if (!candidate?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) {
        alert("Selected candidate does not have a valid email");
        return;
      }

      setSendingEmail(true);

      const payload = {
        candidates: [
          {
            name: candidate.name,
            email: candidate.email,
            score: candidate.score,
            status: candidate.status,
            message: `Hi ${candidate.name}, you are shortlisted for the next round.`
          }
        ]
      };

      const res = await axios.post("http://127.0.0.1:5000/send-emails", payload, {
        headers: { "Content-Type": "application/json" }
      });

      alert(res?.data?.message || `Email sent to ${candidate.name}`);
    } catch (error) {
      console.error(error);
      alert("Email sending failed");
    } finally {
      setSendingEmail(false);
    }
  };

  const sendEmailsToTopCandidates = async () => {
    try {
      setSendingEmail(true);

      const validCandidates = getValidEmailCandidates(shortlistedCandidates).slice(0, 3);

      if (validCandidates.length === 0) {
        alert("No valid emails found");
        return;
      }

      const payload = {
        candidates: validCandidates.map((c) => ({
          name: c.name,
          email: c.email,
          score: c.score,
          status: c.status,
          message: `Hi ${c.name}, you are shortlisted for the next round.`
        }))
      };

      const res = await axios.post("http://127.0.0.1:5000/send-emails", payload, {
        headers: { "Content-Type": "application/json" }
      });

      alert(res?.data?.message || "Emails sent successfully");
    } catch (error) {
      console.error(error);
      alert("Bulk email failed");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          position: "relative",
          py: 4,
          color: "text.primary",
          backgroundImage: `${palette.bgOverlay}, url(https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: { xs: "scroll", md: "fixed" }
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? "linear-gradient(rgba(3,7,18,0.30), rgba(3,7,18,0.30))"
              : "linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.10))",
            pointerEvents: "none"
          }}
        />
        <Container
          maxWidth="md"
          component={motion.div}
          variants={pageFade}
          initial="hidden"
          animate="show"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <MotionBox
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            sx={{ textAlign: "center", mb: 4, position: "relative" }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <IconButton
                onClick={() => setThemeMode((prev) => (prev === "light" ? "dark" : "light"))}
                sx={{
                  bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.72)",
                  color: "text.primary",
                  border: "1px solid",
                  borderColor: "divider",
                  backdropFilter: "blur(8px)",
                  "&:hover": { transform: "translateY(-1px)" }
                }}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </IconButton>
            </Box>

            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{
                color: isDark ? "#dcfce7" : "#1b5e20",
                textShadow: isDark
                  ? "0 6px 18px rgba(0,0,0,0.35)"
                  : "0 6px 18px rgba(27,94,32,0.18)",
                letterSpacing: 1
              }}
            >
              HIRESENSE
            </Typography>

            <Typography sx={{ color: isDark ? "rgba(226,232,240,0.82)" : "text.secondary" }}>
              Smart interactive resume screening dashboard
            </Typography>

            <Box
              sx={{
                mt: 2,
                maxWidth: 280,
                mx: "auto",
                height: 8,
                borderRadius: 999,
                overflow: "hidden",
                background: isDark ? "rgba(255,255,255,0.10)" : "rgba(27,94,32,0.10)"
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${topScore}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #2e7d32, #66bb6a)"
                }}
              />
            </Box>
          </MotionBox>

          <AnimatePresence>
            {(files.length > 0 || results.length > 0) && (
              <MotionPaper
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={springGentle}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 4,
                  backdropFilter: "blur(12px)",
                  background: palette.paper,
                  border: palette.border,
                  boxShadow: palette.cardShadow
                }}
              >
                <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
                  <Chip icon={<FileText size={16} />} label={`Resumes: ${files.length}`} />
                  <Chip icon={<BarChart3 size={16} />} label={`Results: ${results.length}`} />
                  <Chip
                    icon={<CheckCircle2 size={16} />}
                    color="success"
                    label={`Shortlisted: ${shortlistedCount}`}
                  />
                  {topCandidate && (
                    <>
                      <Chip
                        icon={<Trophy size={16} />}
                        color="success"
                        variant="outlined"
                        label={`Top Score: ${topCandidate.score.toFixed(2)}`}
                      />
                      <Chip {...getFitChipProps(topCandidate.score)} />
                    </>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Mail size={16} />}
                    onClick={sendEmailsToTopCandidates}
                    disabled={sendingEmail || shortlistedCandidates.length === 0}
                    sx={{ borderRadius: 3, textTransform: "none" }}
                  >
                    {sendingEmail ? "Sending..." : "Email Top Candidates"}
                  </Button>
                </Stack>
              </MotionPaper>
            )}
          </AnimatePresence>

          <MotionPaper
            variants={cardVariants}
            initial="hidden"
            animate="show"
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              backdropFilter: "blur(12px)",
              background: palette.paper,
              border: palette.border,
              boxShadow: palette.cardShadow
            }}
          >
            <Typography variant="h6" gutterBottom>
              Job Description
            </Typography>

            <TextField
              id="job-description"
              fullWidth
              multiline
              rows={5}
              label="Job Description"
              placeholder="Paste Job Description"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              variant="outlined"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                "& .MuiInputLabel-root": {
                  color: isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.6)"
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "primary.main"
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  color: "text.primary",
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.70)",
                  "& fieldset": {
                    borderColor: isDark
                      ? "rgba(255,255,255,0.16)"
                      : "rgba(0,0,0,0.16)"
                  },
                  "&:hover fieldset": {
                    borderColor: "#2e7d32"
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#2e7d32",
                    borderWidth: "2px"
                  }
                }
              }}
            />
          </MotionPaper>

          <MotionPaper
            variants={cardVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.08 }}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              backdropFilter: "blur(12px)",
              background: palette.paper,
              border: palette.border,
              boxShadow: palette.cardShadow
            }}
          >
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleFileChange(e.dataTransfer.files);
              }}
              sx={{
                p: 3,
                borderRadius: 4,
                border: dragActive
                  ? "2px dashed #2e7d32"
                  : isDark
                  ? "2px dashed rgba(134,239,172,0.28)"
                  : "2px dashed rgba(46,125,50,0.28)",
                background: dragActive
                  ? "rgba(76,175,80,0.10)"
                  : isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.32)",
                textAlign: "center"
              }}
            >
              <motion.div
                animate={{ y: dragActive ? [-2, 2, -2] : 0 }}
                transition={{ duration: 1.1, repeat: dragActive ? Infinity : 0 }}
              >
                <Upload size={34} color={isDark ? "#86efac" : "#2e7d32"} />
              </motion.div>

              <Typography variant="h6" sx={{ mt: 1 }}>
                Drag & Drop Resumes
              </Typography>

              <Typography
                sx={{ mb: 2, color: isDark ? "rgba(226,232,240,0.78)" : "text.secondary" }}
              >
                or click below to browse files
              </Typography>

              <Button variant="contained" component="label" sx={{ borderRadius: 3, px: 3, py: 1.2, textTransform: "none", fontWeight: "bold", background: "linear-gradient(135deg, #2e7d32, #43a047)" }}>
                Upload Resumes
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </Button>
            </Box>

            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">📂 Selected Resumes</Typography>

                    <List dense component={motion.div} variants={listContainer} initial="hidden" animate="show">
                      {files.map((file, index) => (
                        <motion.div key={`${file.name}-${index}`} variants={listItem} whileHover={{ x: 4 }}>
                          <ListItem
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label={`Remove ${file.name}`}
                                onClick={() => removeFile(index)}
                                sx={{ color: isDark ? "#f8fafc" : "inherit" }}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            }
                            sx={{
                              borderRadius: 2,
                              mb: 0.8,
                              background: isDark
                                ? "rgba(255,255,255,0.04)"
                                : "rgba(255,255,255,0.45)",
                              border: isDark
                                ? "1px solid rgba(255,255,255,0.08)"
                                : "1px solid rgba(0,0,0,0.05)"
                            }}
                          >
                            <ListItemText
                              primary={file.name}
                              primaryTypographyProps={{
                                sx: { color: "text.primary" }
                              }}
                            />
                          </ListItem>
                        </motion.div>
                      ))}
                    </List>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </MotionPaper>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              py: 1.6,
              borderRadius: 4,
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              background: "linear-gradient(135deg, #1b5e20, #43a047)",
              boxShadow: "0 12px 28px rgba(46,125,50,0.28)"
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CircularProgress size={22} color="inherit" />
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  Ranking resumes...
                </motion.span>
              </Box>
            ) : (
              "Upload & Rank"
            )}
          </Button>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LinearProgress
                sx={{
                  mt: 2,
                  mb: 3,
                  borderRadius: 10,
                  height: 7,
                  backgroundColor: "rgba(76,175,80,0.18)",
                  "& .MuiLinearProgress-bar": { borderRadius: 10 }
                }}
              />
            </motion.div>
          )}

          <Divider sx={{ my: 3, borderColor: isDark ? "rgba(255,255,255,0.12)" : undefined }} />

          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Results
          </Typography>

          {results.length === 0 && !loading && (
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 4,
                background: palette.paperSoft,
                backdropFilter: "blur(10px)",
                border: palette.border,
                boxShadow: palette.cardShadow
              }}
            >
              <Typography variant="h6">📄 No results yet</Typography>
              <Typography sx={{ color: isDark ? "rgba(226,232,240,0.78)" : "text.secondary" }}>
                Upload resumes and rank candidates instantly
              </Typography>
            </Paper>
          )}

          <AnimatePresence>
            {results.length > 0 && (
              <>
                {topCandidate && (
                  <MotionPaper
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={springGentle}
                    sx={{
                      p: 3,
                      mb: 2,
                      borderRadius: 4,
                      background: isDark
                        ? "linear-gradient(135deg, rgba(20,83,45,0.62), rgba(15,23,42,0.82))"
                        : "linear-gradient(135deg, rgba(232,245,233,0.95), rgba(255,255,255,0.88))",
                      border: isDark
                        ? "1px solid rgba(134,239,172,0.18)"
                        : "1px solid rgba(76,175,80,0.20)",
                      boxShadow: isDark
                        ? "0 10px 30px rgba(0,0,0,0.35)"
                        : "0 10px 30px rgba(76,175,80,0.14)"
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap"
                      }}
                    >
                      <Box>
                        <Typography variant="h6">🏆 Best Candidate</Typography>
                        <Typography>
                          <strong>{topCandidate.name}</strong> {topCandidate.status}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {topIsRejected && (
                          <XCircle size={18} color={isDark ? "#fca5a5" : "#dc2626"} />
                        )}
                        <Chip
                          label={`Score: ${topCandidate.score.toFixed(2)}`}
                          color="success"
                          size="medium"
                        />
                        <Chip {...getFitChipProps(topCandidate.score)} size="medium" />
                        {topCandidate?.email && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Mail size={16} />}
                            sx={{ borderRadius: 3, textTransform: "none" }}
                            onClick={() => sendEmailToCandidate(topCandidate)}
                          >
                            Send Email
                          </Button>
                        )}
                        {topCandidate?.phone && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Phone size={16} />}
                            component="a"
                            href={`tel:${topCandidate.phone}`}
                            sx={{ borderRadius: 3, textTransform: "none" }}
                          >
                            Call
                          </Button>
                        )}
                      </Stack>
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDark ? "rgba(226,232,240,0.82)" : "text.secondary",
                          fontWeight: 500
                        }}
                      >
                        Decision: {getFitLabel(topCandidate.score)}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(topCandidate.score, 100)}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          height: 8,
                          borderRadius: 999,
                          background: "linear-gradient(90deg, #2e7d32, #66bb6a)"
                        }}
                      />
                    </Box>
                  </MotionPaper>
                )}

                {selectedCandidate && (
                  <MotionPaper
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={springSmooth}
                    sx={{
                      p: 2.5,
                      mb: 2,
                      borderRadius: 4,
                      background: palette.paper,
                      backdropFilter: "blur(12px)",
                      border: palette.border,
                      boxShadow: palette.cardShadow
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      <User size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
                      Candidate Details
                    </Typography>

                    <Typography><strong>Name:</strong> {selectedCandidate.name}</Typography>
                    <Typography><strong>Score:</strong> {selectedCandidate.score.toFixed(2)}</Typography>
                    <Typography><strong>Job Fit:</strong> {getFitLabel(selectedCandidate.score)}</Typography>
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <Chip {...getFitChipProps(selectedCandidate.score)} size="small" />
                    </Box>
                    <Typography><strong>Status:</strong> {selectedCandidate.status}</Typography>
                    {selectedCandidate.email && (
                      <Typography><strong>Email:</strong> {selectedCandidate.email}</Typography>
                    )}
                    {selectedCandidate.phone && (
                      <Typography><strong>Phone:</strong> {selectedCandidate.phone}</Typography>
                    )}

                    <Stack direction="row" spacing={1.2} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                      {selectedCandidate.email && (
                        <Button
                          variant="contained"
                          startIcon={<Mail size={16} />}
                          sx={{ borderRadius: 3, textTransform: "none" }}
                          onClick={() => sendEmailToCandidate(selectedCandidate)}
                        >
                          Send Email
                        </Button>
                      )}
                      {selectedCandidate.phone && (
                        <Button
                          variant="outlined"
                          startIcon={<Phone size={16} />}
                          component="a"
                          href={`tel:${selectedCandidate.phone}`}
                          sx={{ borderRadius: 3, textTransform: "none" }}
                        >
                          Call Candidate
                        </Button>
                      )}
                    </Stack>
                  </MotionPaper>
                )}

                <MotionPaper
                  variants={listContainer}
                  initial="hidden"
                  animate="show"
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    backdropFilter: "blur(12px)",
                    background: palette.paper,
                    border: palette.border,
                    boxShadow: palette.cardShadow
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    📊 All Candidates
                  </Typography>

                  <List>
                    {results.map((r, i) => {
                      const statusType = getStatusType(r.status);
                      const isRejected = statusType === "rejected";
                      const isSelected = selectedCandidateId === r._id;
                      const isShortlisted = shortlistedIds.includes(r._id);

                      return (
                        <MotionListItem
                          key={r._id}
                          variants={listItem}
                          onClick={() => setSelectedCandidateId(r._id)}
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.995 }}
                          transition={springSmooth}
                          sx={{
                            cursor: "pointer",
                            border: isSelected
                              ? isRejected
                                ? "1px solid rgba(239,68,68,0.45)"
                                : "1px solid rgba(46,125,50,0.35)"
                              : isRejected
                              ? "1px solid rgba(239,68,68,0.20)"
                              : isDark
                              ? "1px solid rgba(255,255,255,0.08)"
                              : "1px solid rgba(0,0,0,0.06)",
                            mb: 1.2,
                            borderRadius: 3,
                            background: isSelected
                              ? isRejected
                                ? isDark
                                  ? "rgba(127,29,29,0.45)"
                                  : "rgba(254,226,226,0.92)"
                                : isDark
                                ? "rgba(22,101,52,0.34)"
                                : "rgba(232,245,233,0.90)"
                              : isRejected
                              ? isDark
                                ? "rgba(127,29,29,0.28)"
                                : "rgba(254,242,242,0.95)"
                              : isDark
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(255,255,255,0.52)",
                            transition:
                              "background-color 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms cubic-bezier(0.16, 1, 0.3, 1)"
                          }}
                        >
                          <Box sx={{ width: "100%" }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 2,
                                flexWrap: "wrap",
                                alignItems: "center"
                              }}
                            >
                              <ListItemText
                                primary={`${i + 1}. ${r.name}`}
                                secondary={`${r.status} • ${getFitLabel(r.score)}`}
                                primaryTypographyProps={{
                                  sx: {
                                    color: isRejected
                                      ? isDark
                                        ? "#fecaca"
                                        : "#b91c1c"
                                      : "text.primary",
                                    fontWeight: 600
                                  }
                                }}
                                secondaryTypographyProps={{
                                  sx: {
                                    color: isRejected
                                      ? isDark
                                        ? "rgba(254,202,202,0.82)"
                                        : "#dc2626"
                                      : isDark
                                      ? "rgba(226,232,240,0.72)"
                                      : "text.secondary"
                                  }
                                }}
                              />

                              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                {isRejected && (
                                  <XCircle size={18} color={isDark ? "#fca5a5" : "#dc2626"} />
                                )}
                                <Chip
                                  size="small"
                                  color={getStatusChipColor(r.status)}
                                  label={r.score.toFixed(2)}
                                />
                                <Chip
                                  size="small"
                                  {...getFitChipProps(r.score)}
                                />
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleShortlist(r._id);
                                  }}
                                  variant={isShortlisted ? "contained" : "outlined"}
                                  size="small"
                                  sx={{ textTransform: "none", borderRadius: 3 }}
                                >
                                  {isShortlisted ? "Unshortlist" : "Shortlist"}
                                </Button>
                              </Stack>
                            </Box>

                            <Box sx={{ mt: 1 }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(r.score, 100)}%` }}
                                transition={{
                                  duration: 0.8,
                                  delay: i * 0.06,
                                  ease: [0.16, 1, 0.3, 1]
                                }}
                                style={{
                                  height: 6,
                                  borderRadius: 999,
                                  background: isRejected
                                    ? "linear-gradient(90deg, #f87171, #dc2626)"
                                    : "linear-gradient(90deg, #66bb6a, #2e7d32)"
                                }}
                              />
                            </Box>
                          </Box>
                        </MotionListItem>
                      );
                    })}
                  </List>
                </MotionPaper>
              </>
            )}
          </AnimatePresence>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;