"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    TextField,
    MenuItem,
    Skeleton,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

type LeadRow = {
    id: string;
    external_id: string | null;
    make: string | null;
    model: string | null;
    year: number | null;
    price_estimation: number | null;

    call_successful: boolean | null;
    needs_recall: boolean;

    asking_price: number | null;
    willingness_to_negotiate: string | null;
    expected_handover_date: string | null;
    car_condition: string | null;
    user_sentiment: string | null;

    score: number;
    created_at: string;
};

function scoreChip(score: number) {
    if (score >= 75) return <Chip label={`Hot • ${score}`} color="success" size="small" />;
    if (score >= 50) return <Chip label={`Warm • ${score}`} color="warning" size="small" />;
    return <Chip label={`Cold • ${score}`} color="default" size="small" />;
}

export default function DashboardPage() {
    const router = useRouter();

    const [rows, setRows] = React.useState<LeadRow[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [minScore, setMinScore] = React.useState(0);
    const [handover, setHandover] = React.useState<string>("all");
    const [recallOnly, setRecallOnly] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 2000);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    React.useEffect(() => {
        (async () => {
            setLoading(true);

            let q = supabase
                .from("leads")
                .select(
                    "id, external_id, make, model, year, price_estimation, call_successful, needs_recall, asking_price, willingness_to_negotiate, expected_handover_date, car_condition, user_sentiment, score, created_at"
                )
                .order("score", { ascending: false });

            if (minScore > 0) q = q.gte("score", minScore);
            if (handover !== "all") q = q.eq("expected_handover_date", handover);
            if (recallOnly) q = q.eq("needs_recall", true);
            if (debouncedSearchQuery) {
                const term = debouncedSearchQuery.trim();
                let queryParts = [
                    `make.ilike.%${term}%`,
                    `model.ilike.%${term}%`,
                    `external_id.ilike.%${term}%`,
                    `willingness_to_negotiate.ilike.%${term}%`,
                    `car_condition.ilike.%${term}%`,
                    `user_sentiment.ilike.%${term}%`
                ];

                const numVal = Number(term);
                if (!isNaN(numVal) && term !== "") {
                    queryParts.push(`year.eq.${numVal}`);
                    queryParts.push(`asking_price.eq.${numVal}`);
                    queryParts.push(`score.eq.${numVal}`);
                }

                q = q.or(queryParts.join(","));
            }

            const { data, error } = await q;
            if (error) console.error(error);

            // Simulate network delay for skeleton showcase
            await new Promise((resolve) => setTimeout(resolve, 800));

            setRows((data as LeadRow[]) || []);
            setLoading(false);
        })();
    }, [minScore, handover, recallOnly, debouncedSearchQuery]);

    const hot = rows.filter((r) => r.score >= 75 && !r.needs_recall).length;
    const needsRecall = rows.filter((r) => r.needs_recall).length;
    const avg = rows.length
        ? Math.round(rows.reduce((a, b) => a + (b.score ?? 0), 0) / rows.length)
        : 0;
    const totalLeads = rows.length;

    const columns: GridColDef[] = [
        { field: "make", headerName: "Make", flex: 1, minWidth: 120 },
        { field: "model", headerName: "Model", flex: 1, minWidth: 140 },
        { field: "year", headerName: "Year", width: 90 },
        {
            field: "asking_price",
            headerName: "Asking €",
            width: 120,
            valueFormatter: (value) =>
                value != null ? `€${Number(value).toLocaleString()}` : "—",
        },
        {
            field: "car_condition",
            headerName: "Condition",
            width: 120,
            valueFormatter: (value) => value ?? "—",
        },
        {
            field: "expected_handover_date",
            headerName: "Handover",
            width: 130,
            valueFormatter: (value) => value ?? "—",
        },
        {
            field: "willingness_to_negotiate",
            headerName: "Negotiate",
            width: 120,
            valueFormatter: (value) => value ?? "—",
        },
        {
            field: "needs_recall",
            headerName: "Recall",
            width: 130,
            renderCell: (p) =>
                p.value ? (
                    <Chip label="Needs recall" size="small" color="error" variant="outlined" />
                ) : (
                    <Chip label="OK" size="small" color="success" variant="outlined" />
                ),
            sortable: true,
        },
        {
            field: "score",
            headerName: "Score",
            width: 120,
            renderCell: (p) => scoreChip(p.value as number),
            sortable: true,
        },
    ];

    return (
        <Box p={4} sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Real-time lead scoring and prioritization insights.
                    </Typography>
                </Box>
            </Stack>

            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                mb={4}
                sx={{ "& > *": { flex: 1 } }}
            >
                {/* Card 1: Total/Hot Leads */}
                <StatCard
                    title="Hot Leads 🔥"
                    value={loading ? undefined : hot}
                    loading={loading}
                />

                {/* Card 2: Needs Recall */}
                <StatCard
                    title="Needs Recall 📞"
                    value={loading ? undefined : needsRecall}
                    loading={loading}
                />

                {/* Card 3: Avg Score */}
                <StatCard
                    title="Avg Score 📊"
                    value={loading ? undefined : avg}
                    loading={loading}
                />

                {/* Card 4: Action/Explore */}
                <Card
                    sx={{
                        flex: 1,
                        p: 2.5,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
                        borderRadius: 3,
                        backgroundColor: "#fff",
                        border: "1px solid #f0f0f0",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
                        },
                        minHeight: 120,
                    }}
                >
                    {loading ? (
                        <Stack spacing={1}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="90%" />
                            <Skeleton variant="rectangular" height={36} width={120} sx={{ borderRadius: 1 }} />
                        </Stack>
                    ) : (
                        <>
                            <Stack>
                                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                    Explore Leads
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.4 }}>
                                    Uncover hidden opportunities.
                                </Typography>
                            </Stack>
                        </>
                    )}
                </Card>
            </Stack>

            {/* Filters & Data Grid */}
            <Card sx={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", borderRadius: 3, overflow: 'hidden' }}>
                <Box p={2} borderBottom="1px solid #eee" bgcolor="white">
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                        <Typography variant="h6" fontWeight={700} sx={{ mr: 'auto', px: 1 }}>
                            Recent Leads
                        </Typography>
                        <TextField
                            label="Search..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ width: 220 }}
                            placeholder="Make, Model, or ID"
                        />
                        <TextField
                            label="Min Score"
                            type="number"
                            size="small"
                            value={minScore}
                            onChange={(e) => setMinScore(Number(e.target.value || 0))}
                            sx={{ width: 140 }}
                        />

                        <TextField
                            select
                            label="Handover"
                            size="small"
                            value={handover}
                            onChange={(e) => setHandover(e.target.value)}
                            sx={{ width: 180 }}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="immediate">immediate</MenuItem>
                            <MenuItem value="1-2 weeks">1-2 weeks</MenuItem>
                            <MenuItem value="2-4 weeks">2-4 weeks</MenuItem>
                            <MenuItem value="flexible">flexible</MenuItem>
                            <MenuItem value="unclear">unclear</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Recall"
                            size="small"
                            value={recallOnly ? "yes" : "no"}
                            onChange={(e) => setRecallOnly(e.target.value === "yes")}
                            sx={{ width: 180 }}
                        >
                            <MenuItem value="no">All leads</MenuItem>
                            <MenuItem value="yes">Needs recall only</MenuItem>
                        </TextField>
                    </Stack>
                </Box>

                <div style={{ height: 600, width: "100%" }}>
                    {loading ? (
                        <Stack spacing={1} p={2}>
                            {[...Array(10)].map((_, i) => (
                                <Skeleton key={i} variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
                            ))}
                        </Stack>
                    ) : (
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            loading={loading}
                            getRowId={(r) => r.id}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10, page: 0 } },
                                sorting: { sortModel: [{ field: "score", sort: "desc" }] },
                            }}
                            onRowClick={(p) => router.push(`/lead/${p.id}`)}
                            getRowClassName={(p) =>
                                p.row.needs_recall ? "row-recall" : p.row.score >= 75 ? "row-hot" : ""
                            }
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid #f0f0f0',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f9fafb',
                                    borderBottom: '1px solid #e0e0e0',
                                    fontWeight: 700,
                                }

                            }}
                        />
                    )}
                </div>
            </Card>
        </Box>
    );
}

// --- Components ---

function StatCard({
    title,
    value,
    loading,
}: {
    title: string;
    value?: number;
    loading: boolean;
}) {
    return (
        <Card
            sx={{
                p: 2.5,
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 120,
                border: "1px solid #f0f0f0",
                position: "relative",
                overflow: "visible",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.08)",
                },
            }}
        >
            {loading ? (
                <>
                    <Skeleton variant="text" width={100} height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" width={60} height={40} />
                </>
            ) : (
                <>
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="text.primary" sx={{ mt: 1 }}>
                        {value}
                    </Typography>
                </>
            )}
        </Card>
    );
}
