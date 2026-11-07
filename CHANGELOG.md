# Changelog

## [2.0.0] - 2026-11-07

The project is renamed from **AI Forest Assistant** to **Wildfire Sentinel AI** and refocused on wildfire reporting and alerting.

### Added

- Image analysis with Gemini Vision: photos sent over WhatsApp are checked for smoke, fire, fire size and nearby houses or roads, and priority is adjusted automatically.
- Text geocoding: users can answer a location request with a place name (mountain, path, area) instead of coordinates.
- Pending-location flow: reports without location are stored as `PENDIENTE_UBICACION` and completed when the location arrives, with a supervisor notification.
- WhatsApp message deduplication by message ID.
- Wildfire subtypes in the classification (`HUMO`, `FUEGO`, `RAYO`, `COLILLA`, `QUEMA_ILEGAL`, `BARBACOA`, `MAQUINARIA`, `LINEA_ELECTRICA`, `FOCO_TERMICO`, `OTRO_RIESGO`).
- Guardrails outside the AI: greetings and loose coordinates never create a case.
- English README, Spanish README and `CHANGELOG.md`.

### Changed

- Classification reduced to `INCENDIO` / `OTRO`.
- Metrics workflow now runs daily at 8:00 and only reads `forest_incidents` and `fire_alerts`. Top locations use the geocoded municipality or place name.
- Weather alerts are sent only for `ALTO` and `EXTREMO` risk; `BRIGADISTAS_WHATSAPP` is now a JSON array.
- Workflow files renamed to `Wildfire_Sentinel_AI_0X_*.json`.
- `env.example` renamed to `.env.example`.

### Removed

- Pest cases, forestry permits, work reports and the legal/normative assistant, with their tables (`pest_cases`, `permits`, `work_reports`, `queries`), indexes and triggers.
- Screenshots of the removed features.

### Security

- Exported workflows no longer include `pinData`, real phone numbers as defaults, credential IDs or the Google Sheets document ID.
