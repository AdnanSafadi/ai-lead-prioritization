[README.md](https://github.com/user-attachments/files/24237444/README.md)
# 🚗 AI Outreach Agent -- Lead Prioritization Dashboard

This project is a **full-stack MVP** for an AI-powered lead
Prioritization system for car dealers.\
It ingests call transcripts, extracts structured insights using an LLM,
computes a lead quality score, and presents everything in a clean,
actionable dashboard.

------------------------------------------------------------------------

## 🎯 Problem Statement

Car dealers receive many inbound leads, but: - Not all sellers are
equally valuable - Sales teams waste time on low-quality or unreachable
leads - Prioritization is manual and inconsistent

**Goal:**\
Automatically analyze conversations, score leads, and help sales teams
Focus on the best opportunities first.

------------------------------------------------------------------------

## 🧠 Solution Overview

### High-level flow

    Excel (Call Transcripts)
            ↓
    Node.js Backend (Import)
            ↓
    LLM Extraction (Structured JSON)
            ↓
    Scoring Engine (0–100)
            ↓
    Supabase (Postgres)
            ↓
    Next.js Dashboard (Prioritized Leads)

------------------------------------------------------------------------

## 🏗️ Architecture

### Monorepo Structure

    apps/
     ├─ lead-ai-backend/     # Node.js + Express API
     └─ lead-ai-dashboard/      # Next.js + MUI dashboard

### Tech Stack

  Layer        Technology
  ------------ ---------------------------
  Backend      Node.js, Express
  AI           OpenAI (LLM extraction)
  Database     Supabase (PostgreSQL)
  Frontend     Next.js (App Router), MUI
  Data Input   Excel (.xlsx)

------------------------------------------------------------------------

## 🔁 Data Pipeline

### 1. Import

-   Reads a static Excel file with call transcripts
-   Upserts rows into Supabase using `external_id.`
-   Detects call outcome (success/voicemail/no answer)

**Endpoint**

    POST /import

------------------------------------------------------------------------

### 2. Enrichment (AI)

-   Processes **successful calls only**
-   Sends transcript to LLM
-   Extracts structured fields:
    -   Asking price
    -   Willingness to negotiate
    -   Expected handover date
    -   Car condition
    -   Number of owners
    -   Seller sentiment
-   Stores raw JSON + confidence
-   Computes lead score (0--100)

**Endpoint**

    POST /enrich

> Unsuccessful calls are flagged as `needs_recall` and intentionally
> skipped to avoid wasting LLM tokens.

------------------------------------------------------------------------

## 📊 Scoring Logic (Simplified)

  Factor                    Weight
  ------------------------- --------
  Expected handover date    High
  Car condition             High
  Negotiation willingness   Medium
  Seller sentiment          Medium
  Number of owners          Low
  Data completeness bonus   \+ / −

-   Leads are classified as:
    -   **Hot** (≥ 75)
    -   **Warm** (50--74)
    -   **Cold** (\< 50)

------------------------------------------------------------------------

## 🖥️ Dashboard Features

### Dashboard View

-   KPI cards:
    -   Hot Leads 🔥
    -   Needs Recall 📞
    -   Avg Score 📊
-   Sortable & filterable table:
    -   Min score
    -   Handover timeline
    -   Recall-only
-   Visual highlights:
    -   Hot leads
    -   Needs recall
-   Search
    - Make
    - Model
-   Search & Filter per column

### Lead Details Page

-   Full transcript
-   Extracted insights
-   Raw LLM JSON
-   Score + recall status
-   CTA placeholders:
    -   Call seller (Phase 2)
    -   Open WhatsApp (Phase 2)

------------------------------------------------------------------------

## 🚀 Running the Project Locally

### Prerequisites

-   Node.js ≥ 18
-   pnpm
-   Supabase project

------------------------------------------------------------------------

### 1. Install dependencies

From repo root:

``` bash
pnpm install
```

------------------------------------------------------------------------

### 2. Backend

``` bash
cd apps/backend-express
pnpm dev
```

Endpoints: - `POST {{backend-domain}}/import` -
`POST {{backend-domain}}/enrich`

------------------------------------------------------------------------

### 3. Dashboard

``` bash
cd apps/dashboard-next
pnpm dev
```

Open:

    {{domain}}/dashboard

------------------------------------------------------------------------

## 🔐 Security Notes

-   Backend uses **Supabase Service Role Key**
-   Dashboard uses **Supabase Anon Key**
-   **Row Level Security (RLS)** is disabled for MVP simplicity\
    \> In production, RLS would be enabled with role-based access
    policies.

------------------------------------------------------------------------

## 🧪 Assumptions

-   Excel file is static (for MVP)
-   AI calling / WhatsApp outreach already exists
-   This project focuses on **analysis, scoring, and prioritization**

------------------------------------------------------------------------

## 📈 Scaling Considerations (Next Steps)

-   File upload instead of static Excel
-   Background jobs (Bull / queues)
-   Batch LLM processing
-   First-pass cheap model + second-pass refinement
-   Full WhatsApp / Call integration
-   Role-based access & RLS

------------------------------------------------------------------------

## ✅ Status

**MVP complete and production-structured.**

------------------------------------------------------------------------

## 🔮 Next Feature & Scalability Considerations

##  File Upload & Automated Processing Pipeline

The next feature I would build is a file upload and reprocessing pipeline to make the system fully operational for daily use.

    Currently, the MVP works with a static Excel file. The next step would be:

    Allow uploading Excel/CSV files directly from the dashboard

    Store uploaded files in Supabase Storage

    Create a processing “run” (batch ID) for each upload

    Automatically trigger the enrichment and scoring pipeline

    Display processing status (pending / processing / completed / failed)

    Why this feature?
    It removes developer dependency, enables daily usage by sales teams, and allows reprocessing data when prompts or scoring logic are improved.

------------------------------------------------------------------------

## 📈 Scaling & Cost Considerations (1,000 Calls / Day)

To scale the system to handle 1,000 calls per day efficiently and cost-effectively, I would focus on the following areas:

    Background Jobs & Queues

    Move enrichment into background workers using a queue system (e.g. BullMQ + Redis)

    Convert /enrich into a job dispatcher instead of synchronous processing

    Control concurrency, retries, and rate limits

    Benefit: predictable throughput and resilient processing.

-   LLM Cost Optimization

    LLM calls are the main cost driver, so optimization is critical:

    Skip processing for voicemails, empty transcripts, and unsuccessful calls

    Use a two-pass model strategy:

    Pass 1: cheaper, faster model for initial extraction

    Pass 2: stronger model only for high-potential leads

    Summarize long transcripts before extraction to reduce token usage

-   Performance & Throughput

    Process leads in batches

    Run multiple workers in parallel with rate limits

    Implement timeouts and retry strategies

    Store intermediate results to avoid reprocessing failures

    This approach easily supports 1,000 calls/day with consistent latency.

-   Database & Data Modeling Improvements

    Add a runs table to track batch processing status

    Store prompt version and scoring version for reproducibility

    Index frequently queried fields (already applied in the MVP)

    Keep raw transcripts immutable and update derived fields only

-   Caching & Idempotency

    Hash transcripts and skip enrichment if content hasn’t changed

    Cache extraction results per transcript

    Avoid duplicate LLM calls for identical inputs

    Result: significantly reduced API costs and faster processing.
