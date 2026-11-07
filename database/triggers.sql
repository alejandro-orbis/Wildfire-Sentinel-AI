-- ============================================================
-- Wildfire Sentinel AI - Triggers
-- PostgreSQL + PostGIS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- updated_at helper
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PostGIS location helper
-- ============================================================

CREATE OR REPLACE FUNCTION set_location_from_coordinates()
RETURNS trigger AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- forest_incidents triggers
-- ============================================================

DROP TRIGGER IF EXISTS trg_forest_incidents_updated_at ON forest_incidents;
CREATE TRIGGER trg_forest_incidents_updated_at
BEFORE UPDATE ON forest_incidents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_forest_incidents_location ON forest_incidents;
CREATE TRIGGER trg_forest_incidents_location
BEFORE INSERT OR UPDATE ON forest_incidents
FOR EACH ROW
EXECUTE FUNCTION set_location_from_coordinates();

-- ============================================================
-- conversation_state triggers
-- ============================================================

DROP TRIGGER IF EXISTS trg_conversation_state_updated_at ON conversation_state;
CREATE TRIGGER trg_conversation_state_updated_at
BEFORE UPDATE ON conversation_state
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
