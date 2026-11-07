-- ============================================================
-- Wildfire Sentinel AI - Database Schema
-- PostgreSQL + PostGIS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- General forest incidents
-- ============================================================

CREATE TABLE IF NOT EXISTS forest_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT UNIQUE,
    incident_type TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'MEDIA',
    reporter_name TEXT,
    reporter_phone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOMETRY(Point, 4326),
    parcela TEXT,
    status TEXT DEFAULT 'ABIERTO',
    ai_classification TEXT,
    assigned_to TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Weather / wildfire risk alerts
-- ============================================================

CREATE TABLE IF NOT EXISTS fire_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name TEXT,
    temperature NUMERIC,
    humidity NUMERIC,
    wind_speed NUMERIC,
    fire_risk TEXT,
    alert_sent BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Conversation state for multi-step WhatsApp flows
-- ============================================================

CREATE TABLE IF NOT EXISTS conversation_state (
    user_phone TEXT PRIMARY KEY,
    current_state TEXT,
    pending_case_id TEXT,
    pending_type TEXT,
    context_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
