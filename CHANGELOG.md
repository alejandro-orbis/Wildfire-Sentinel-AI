# Changelog

## [2.1.0] - 2026-11-07

### Fixed

- **Gemini failures no longer drop reports.** If the classifier fails or returns invalid JSON, messages with fire words create an `INCENDIO` case with `MEDIA` priority, tagged `[Clasificado sin IA]` and escalated; other messages get a reply asking for detail and mentioning 112.
- **Photos without smoke or fire no longer create cases.** The Gemini Vision result (`es_incendio_forestal_probable`, `hay_humo`, `hay_fuego`) is now respected. If Vision fails, the photo is treated as a possible fire and escalated.
- **Images now go through the rate limiter and the pending-state check.** A photo sent while a location is pending reminds the user instead of opening a new case.
- **Pending location state expires** after `PENDING_STATE_TTL_MINUTES` (30 by default), and casual replies ("vale, gracias") are no longer geocoded as place names.
- **Weather alerts have a cooldown.** Crews are alerted only on the first alert for a zone, when the risk level rises, or after `ALERT_COOLDOWN_HOURS` (12 by default). The reason is stored in `fire_alerts.metadata.alert_reason`.
- The crew alert message showed `No especificado (0 pts)` because it read the inserted row instead of the risk calculation. It now shows the real level and score.

### Changed

- Pending-state read and delete queries now use query parameters instead of string interpolation.

### Added

- GET webhook on the same path to answer Meta's webhook verification (`hub.challenge`), checking `META_VERIFY_TOKEN`.
- `tests/code-nodes.test.js`: tests for the Code nodes with decision logic (`node tests/code-nodes.test.js`).

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
