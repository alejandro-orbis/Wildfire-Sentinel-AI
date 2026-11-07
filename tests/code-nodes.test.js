// Tests de los nodos Code de los workflows.
// Ejecuta el código de cada nodo con $input, $() y $env simulados.
// Uso (desde la raíz del repo): node tests/code-nodes.test.js

const fs = require('fs');
const core = JSON.parse(fs.readFileSync(process.argv[2] || 'workflows/Wildfire_Sentinel_AI_01_Core_WhatsApp.json'));
const alerts = JSON.parse(fs.readFileSync(process.argv[3] || 'workflows/Wildfire_Sentinel_AI_02_Alertas_Clima.json'));
const get = (wf, n) => wf.nodes.find(x => x.name === n).parameters.jsCode;
async function run(code, input, refs = {}, env = {}) {
  const $input = { first: () => ({ json: input }), all: () => [{ json: input }] };
  const $ = (n) => ({ first: () => ({ json: refs[n] }) });
  const fn = new (Object.getPrototypeOf(async function(){}).constructor)('$input', '$', '$env', '$getWorkflowStaticData', code);
  return (await fn($input, $, env, () => ({})))[0]?.json;
}
let fails = 0;
const check = (name, cond, extra) => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond ? '' : ' ' + JSON.stringify(extra))); if (!cond) fails++; };
const gem = (obj) => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(obj) }] } }] });
const rl = (message, extra = {}) => ({ from: '34600000000', message, latitude: null, longitude: null, userName: 'Test', ...extra });

(async () => {
  const PC = get(core, 'Procesar Clasificación');
  let r = await run(PC, gem({ tipo: 'INCENDIO', prioridad: 'ALTA', crear_caso: true, descripcion: 'fuego', coordenadas: { lat: null, lon: null } }), { 'Rate Limiter': rl('hay fuego en el monte') });
  check('texto INCENDIO crea caso', r.crearCaso && r.tipo === 'INCENDIO' && r.ai_fallback === false && r.necesita_coordenadas, r);
  r = await run(PC, { error: { message: 'timeout' } }, { 'Rate Limiter': rl('Hay humo cerca del pueblo') });
  check('Gemini caído + humo -> caso MEDIA escalado', r.crearCaso && r.tipo === 'INCENDIO' && r.prioridad === 'MEDIA' && r.requiereEscalado && r.ai_fallback, r);
  r = await run(PC, { error: { message: 'timeout' } }, { 'Rate Limiter': rl('qué tal estás') });
  check('Gemini caído + sin fuego -> sin caso', r.crearCaso === false && r.ai_fallback && /112/.test(r.finalMessage), r);
  r = await run(PC, gem({ tipo: 'OTRO', prioridad: 'BAJA', crear_caso: true }), { 'Rate Limiter': rl('¡Hola!') });
  check('"¡Hola!" no crea caso', r.crearCaso === false, r);
  r = await run(PC, { error: {} }, { 'Rate Limiter': rl('Gracias.') });
  check('Gemini caído + "Gracias." sin caso', r.crearCaso === false, r);

  const PRI = get(core, 'Preparar Resultado Imagen');
  const orig = { from: '34600000000', latitude: null, longitude: null, caption: '' };
  r = await run(PRI, gem({ hay_humo: false, hay_fuego: false, es_incendio_forestal_probable: false, prioridad: 'BAJA' }), { 'Preparar Imagen Base64': orig });
  check('foto sin fuego ni humo -> sin caso', r.crearCaso === false && r.tipo === 'OTRO', r);
  r = await run(PRI, { error: {} }, { 'Preparar Imagen Base64': orig });
  check('Vision caído -> caso MEDIA escalado', r.crearCaso && r.prioridad === 'MEDIA' && r.requiereEscalado && r.vision_fallback && r.necesita_coordenadas, r);
  r = await run(PRI, gem({ hay_humo: true, hay_fuego: true, es_incendio_forestal_probable: true, prioridad: 'MEDIA' }), { 'Preparar Imagen Base64': { ...orig, latitude: 42.3, longitude: -5.9 } });
  check('foto con fuego -> ALTA, subtipo FUEGO', r.crearCaso && r.prioridad === 'ALTA' && r.classification.subtipo === 'FUEGO' && !r.necesita_coordenadas, r);
  r = await run(PRI, gem({ hay_humo: true, hay_fuego: false, es_incendio_forestal_probable: false }), { 'Preparar Imagen Base64': orig });
  check('foto solo humo (probable=false) -> sí crea caso', r.crearCaso && r.classification.subtipo === 'HUMO', r);

  const DT = get(core, 'Detectar Tipo Respuesta Pendiente');
  const dt = async (m, extra = {}) => (await run(DT, { message: m, latitude: null, longitude: null, ...extra })).pending_reply_type;
  check('"Vale, gracias" -> new_report', await dt('Vale, gracias') === 'new_report');
  check('"Monte de Valdespartera" -> place_text', await dt('Monte de Valdespartera') === 'place_text');
  check('"40.4, -3.7" -> coords', await dt('40.4, -3.7') === 'coords');
  check('imagen -> new_report', await dt('[imagen recibida]', { isImage: true }) === 'new_report');
  check('ubicación nativa -> coords', await dt('ubicacion: 1, 2', { latitude: 1, longitude: 2 }) === 'coords');

  const PRU = get(core, 'Preparar Recordatorio Ubicación');
  r = await run(PRU, { from: '+34 600 000 000', pending_case_id: 'FOR-1' });
  check('recordatorio incluye ID', r.whatsappTo === '34600000000' && r.whatsappText.includes('FOR-1'), r);

  const G = get(alerts, 'Guardar en PostgreSQL');
  const risk = (lvl) => ({ zone_name: 'Z', risk_level: lvl, requires_alert: lvl === 'ALTO' || lvl === 'EXTREMO', risk_score: 60, temperature: 34, humidity: 20, wind_speed: 30, timestamp: 'x', full_data: {} });
  const ago = (h) => new Date(Date.now() - h * 36e5).toISOString();
  const g = async (lvl, last, env = {}) => (await run(G, last, { 'Calcular Riesgo': risk(lvl) }, env)).payload;
  check('ALTO sin historial -> envía', (await g('ALTO', {})).alert_sent === true);
  check('ALTO tras ALTO hace 2h -> no envía', (await g('ALTO', { fire_risk: 'ALTO', created_at: ago(2) })).alert_sent === false);
  check('EXTREMO tras ALTO hace 2h -> envía', (await g('EXTREMO', { fire_risk: 'ALTO', created_at: ago(2) })).alert_sent === true);
  check('ALTO tras ALTO hace 13h -> envía', (await g('ALTO', { fire_risk: 'ALTO', created_at: ago(13) })).alert_sent === true);
  check('ALTO tras EXTREMO hace 3h -> no envía', (await g('ALTO', { fire_risk: 'EXTREMO', created_at: ago(3) })).alert_sent === false);
  check('MODERADO -> no envía', (await g('MODERADO', {})).alert_sent === false);
  check('cooldown configurable', (await g('ALTO', { fire_risk: 'ALTO', created_at: ago(5) }, { ALERT_COOLDOWN_HOURS: '4' })).alert_sent === true);

  const PM = get(alerts, 'Preparar Mensajes Brigadistas');
  const msgs = await (async () => {
    const fn = new (Object.getPrototypeOf(async function(){}).constructor)('$input', '$', '$env', PM);
    return fn({ first: () => ({ json: { fire_risk: 'ALTO' } }) }, () => ({ first: () => ({ json: risk('ALTO') }) }), { BRIGADISTAS_WHATSAPP: '["34600000001","34600000002"]' });
  })();
  check('mensaje brigadistas con nivel y puntos reales', msgs.length === 2 && msgs[0].json.message.includes('ALTO (60 pts)'), msgs[0].json.message);

  console.log(fails ? `\n${fails} FALLOS` : '\nTodo OK');
  process.exit(fails ? 1 : 0);
})();
