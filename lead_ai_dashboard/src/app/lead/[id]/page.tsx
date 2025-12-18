"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Divider,
  Skeleton,
} from "@mui/material";

export default function LeadDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [lead, setLead] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error(error);

      // Simulate network delay for skeleton showcase
      await new Promise((resolve) => setTimeout(resolve, 800));

      setLead(data);
      setLoading(false);
    })();
  }, [id]);

  const score = lead?.score ?? 0;

  return (
    <Box p={4} sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Button
          onClick={() => router.push("/dashboard")}
          sx={{
            minWidth: 40,
            width: 40,
            height: 40,
            borderRadius: '50%',
            p: 0,
            color: 'text.secondary',
            bgcolor: 'white',
            border: '1px solid #eee',
            '&:hover': { bgcolor: '#f5f5f5', color: 'primary.main' }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </Button>

        <Box>
          {loading ? (
            <Skeleton variant="text" width={300} height={40} />
          ) : (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" fontWeight={800} color="text.primary">
                {lead?.make ?? "Unknown"} {lead?.model ?? "Car"} {lead?.year ? `(${lead.year})` : ""}
              </Typography>
              <Chip
                label={`Score: ${score}`}
                sx={{
                  fontWeight: 700,
                  bgcolor: score >= 75 ? "rgba(76, 175, 80, 0.1)" : score >= 50 ? "rgba(255, 193, 7, 0.1)" : "rgba(158, 158, 158, 0.1)",
                  color: score >= 75 ? "success.main" : score >= 50 ? "warning.dark" : "text.secondary",
                  border: '1px solid',
                  borderColor: score >= 75 ? "rgba(76, 175, 80, 0.2)" : score >= 50 ? "rgba(255, 193, 7, 0.2)" : "rgba(158, 158, 158, 0.2)"
                }}
              />
              {lead?.needs_recall && (
                <Chip
                  label="Needs recall"
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
          )}
        </Box>
      </Stack>


      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        {/* Left Column: Insights */}
        <Box flex={1}>
          <Card sx={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Key Insights
              </Typography>
              <Divider sx={{ mb: 3, opacity: 0.6 }} />

              {loading ? (
                <Stack spacing={2}>
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} variant="text" width="100%" height={30} />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2.5}>
                  <DataRow label="Asking Price" value={lead?.asking_price ? `€${Number(lead.asking_price).toLocaleString()}` : "—"} />
                  <DataRow label="Condition" value={lead?.car_condition} />
                  <DataRow label="Handover" value={lead?.expected_handover_date} />
                  <DataRow label="Negotiation" value={lead?.willingness_to_negotiate} />
                  <DataRow label="Owners" value={lead?.number_of_owners} />
                  <DataRow label="Sentiment" value={lead?.user_sentiment} />
                </Stack>
              )}

              <Stack direction="row" spacing={2} mt={4}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: '#25D366',
                    color: 'white',
                    fontWeight: 700,
                    py: 1.5,
                    '&:hover': { bgcolor: '#1ebe57' }
                  }}
                  disabled={loading}
                >
                  Open WhatsApp
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    fontWeight: 700,
                    py: 1.5,
                    borderColor: '#e0e0e0',
                    color: 'text.primary',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' }
                  }}
                  disabled={loading}
                >
                  Call Seller
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Raw JSON Card (Collapsible style or just simple) */}
          <Card sx={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                Raw Extraction Data
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#f8f9fa",
                  border: "1px solid #eee",
                  whiteSpace: "pre-wrap",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: 12,
                  lineHeight: 1.5,
                  maxHeight: 300,
                  overflow: 'auto',
                  color: 'text.primary'
                }}
              >
                {loading ? <Skeleton variant="rectangular" height={100} /> : (lead?.extraction_json ? JSON.stringify(lead.extraction_json, null, 2) : "—")}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column: Transcript */}
        <Box flex={1.5}>
          <Card sx={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", borderRadius: 3, height: '100%', minHeight: 600 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  Conversation Transcript
                </Typography>
                <Chip label="Analyzed" size="small" color="primary" variant="filled" sx={{ borderRadius: 1, fontWeight: 600 }} />
              </Stack>
              <Divider sx={{ mb: 3, opacity: 0.6 }} />

              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  whiteSpace: "pre-wrap",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: "#374151"
                }}
              >
                {loading ? (
                  <Stack spacing={1}>
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                  </Stack>
                ) : (
                  lead?.transcript ?? "No transcript available."
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color="text.primary">
        {value ?? "—"}
      </Typography>
    </Stack>
  )
}

function ArrowBackIcon(props: any) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
