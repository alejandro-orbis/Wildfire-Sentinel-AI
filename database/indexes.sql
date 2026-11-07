-- ============================================================
-- Wildfire Sentinel AI - Indexes
-- PostgreSQL + PostGIS
-- ============================================================

-- ============================================================
-- forest_incidents
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_forest_incidents_created_at
ON forest_incidents(created_at);

CREATE INDEX IF NOT EXISTS idx_forest_incidents_case_id
ON forest_incidents(case_id);

CREATE INDEX IF NOT EXISTS idx_forest_incidents_type
ON forest_incidents(incident_type);

CREATE INDEX IF NOT EXISTS idx_forest_incidents_priority
ON forest_incidents(priority);

CREATE INDEX IF NOT EXISTS idx_forest_incidents_status
ON forest_incidents(status);

CREATE INDEX IF NOT EXISTS idx_forest_incidents_location
ON forest_incidents
USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_forest_incidents_metadata
ON forest_incidents
USING GIN(metadata);

-- ============================================================
-- fire_alerts
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_fire_alerts_created_at
ON fire_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_fire_alerts_fire_risk
ON fire_alerts(fire_risk);

CREATE INDEX IF NOT EXISTS idx_fire_alerts_alert_sent
ON fire_alerts(alert_sent);

CREATE INDEX IF NOT EXISTS idx_fire_alerts_metadata
ON fire_alerts
USING GIN(metadata);

-- ============================================================
-- conversation_state
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_conversation_state_current_state
ON conversation_state(current_state);

CREATE INDEX IF NOT EXISTS idx_conversation_state_pending_case_id
ON conversation_state(pending_case_id);

CREATE INDEX IF NOT EXISTS idx_conversation_state_updated_at
ON conversation_state(updated_at);
