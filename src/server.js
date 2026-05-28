const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, '..', 'public');
const dataDir = path.join(__dirname, '..', 'data');
const discordDataFile = path.join(dataDir, 'discord-entregas.json');
const webhookDataFile = path.join(dataDir, 'vtlog-webhook-entregas.json');
const { getConfigStatus, readVtlogCache, syncVtlogData, normalizeJob } = require('./vtlogApi');
const { parseVTLogMessage } = require('./discordBot');

function ensureDataStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(discordDataFile)) fs.writeFileSync(discordDataFile, '[]', 'utf8');
  if (!fs.existsSync(webhookDataFile)) fs.writeFileSync(webhookDataFile, '[]', 'utf8');
}

function readDiscordDeliveries() {
  ensureDataStore();
  try {
    const content = fs.readFileSync(discordDataFile, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Erro ao ler entregas Discord/VTLog:', error.message);
    return [];
  }
}

function writeDiscordDeliveries(deliveries) {
  ensureDataStore();
  fs.writeFileSync(discordDataFile, JSON.stringify(deliveries, null, 2), 'utf8');
}

function readWebhookDeliveries() {
  ensureDataStore();
  try {
    const content = fs.readFileSync(webhookDataFile, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Erro ao ler entregas VTLog Webhook:', error.message);
    return [];
  }
}

function writeWebhookDeliveries(deliveries) {
  ensureDataStore();
  fs.writeFileSync(webhookDataFile, JSON.stringify(deliveries, null, 2), 'utf8');
}

function webhookSecretConfigured() {
  const secret = String(process.env.VTLOG_WEBHOOK_SECRET || '').trim();
  return Boolean(secret && !secret.includes('COLE_AQUI') && !secret.includes('TROQUE'));
}

function isAuthorizedVtlogWebhook(req) {
  const expected = String(process.env.VTLOG_WEBHOOK_SECRET || '').trim();
  if (!expected || expected.includes('COLE_AQUI') || expected.includes('TROQUE')) return true;
  const provided = req.get('x-vtlog-webhook-secret') || req.get('x-webhook-secret') || req.query.secret || req.body?.secret;
  return String(provided || '').trim() === expected;
}

function extractWebhookText(payload) {
  const parts = [];
  const visit = (value, depth = 0) => {
    if (depth > 5 || value === null || value === undefined) return;
    if (typeof value === 'string') {
      if (/Job\s*#|Driver|Source|Destination|Cargo|Profit|VTLog|Motorista|Origem|Destino|Carga|Lucro/i.test(value)) {
        parts.push(value);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(item => visit(item, depth + 1));
      return;
    }
    if (typeof value === 'object') {
      for (const key of ['content', 'description', 'title', 'name', 'value', 'text', 'raw', 'message']) {
        if (value[key]) visit(value[key], depth + 1);
      }
      for (const key of ['fields', 'embeds', 'data', 'job', 'payload', 'message_snapshots', 'messageSnapshots', 'snapshots']) {
        if (value[key]) visit(value[key], depth + 1);
      }
    }
  };
  visit(payload);
  return parts.filter(Boolean).join('\n');
}

function candidateJobPayload(payload = {}) {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.job_id || payload.jobId || payload.departure_city_name || payload.arrival_city_name || payload.cargo_name || payload.profit) return payload;
  for (const key of ['data', 'job', 'payload', 'event', 'body']) {
    const value = payload[key];
    if (value && typeof value === 'object') {
      const candidate = candidateJobPayload(value);
      if (candidate) return candidate;
    }
  }
  return null;
}

function normalizeWebhookJob(payload = {}) {
  const job = candidateJobPayload(payload);
  if (job) {
    const normalized = normalizeJob(job);
    return {
      ...normalized,
      id: `vtlog_webhook_${job.job_id || job.jobId || Date.now()}_${Math.random().toString(16).slice(2)}`,
      source: 'VTLog Webhook',
      webhookEventId: payload.event_id || payload.eventId || payload.id || null,
      raw: payload
    };
  }

  const text = extractWebhookText(payload);
  const parsed = parseVTLogMessage(text);
  if (parsed) {
    return {
      ...parsed,
      id: `vtlog_webhook_${parsed.jobNumber || Date.now()}_${Math.random().toString(16).slice(2)}`,
      source: 'VTLog Webhook',
      webhookEventId: payload.event_id || payload.eventId || payload.id || null,
      raw: text || JSON.stringify(payload).slice(0, 8000)
    };
  }
  return null;
}

function mergeVtlogAndWebhookDeliveries(cache) {
  return [...readWebhookDeliveries(), ...(cache.jobs || [])];
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeDelivery(body = {}) {
  const now = new Date();
  const value = safeNumber(body.value || body.valor || body.profit || body.lucro);
  const km = safeNumber(body.km || body.distance || body.distancia);
  return {
    id: body.id || `discord_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    source: body.source || body.fonte || 'Discord/VTLog',
    discordMessageId: body.discordMessageId || null,
    discordChannelId: body.discordChannelId || null,
    driverName: String(body.driverName || body.motorista || 'Motorista não identificado').trim(),
    origin: String(body.origin || body.origem || 'Origem não informada').trim(),
    destination: String(body.destination || body.destino || 'Destino não informado').trim(),
    cargo: String(body.cargo || body.carga || 'Carga não informada').trim(),
    km,
    value,
    status: String(body.status || 'Importada').trim(),
    date: body.date || body.data || now.toISOString().slice(0, 10),
    raw: String(body.raw || body.textoOriginal || '').slice(0, 8000),
    importedAt: now.toISOString(),
    jobNumber: body.jobNumber || null,
    board: body.board || null,
    driveTime: body.driveTime || null,
    truck: body.truck || null,
    weightKg: safeNumber(body.weightKg),
    fuelLiters: safeNumber(body.fuelLiters),
    fuelEconomy: body.fuelEconomy || null,
    truckDamage: safeNumber(body.truckDamage),
    trailersDamage: safeNumber(body.trailersDamage),
    cargoDamage: safeNumber(body.cargoDamage),
    income: safeNumber(body.income),
    expense: safeNumber(body.expense),
    profit: safeNumber(body.profit || value),
    steamId: body.steamId || null
  };
}

function isAuthorizedImport(req) {
  const expected = process.env.DISCORD_IMPORT_SECRET;
  if (!expected) return true;
  return req.get('x-discord-import-secret') === expected || req.body?.secret === expected;
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir, { extensions: ['html'] }));


app.get('/api/vtlog/status', (req, res) => {
  const status = getConfigStatus();
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  res.json({
    ...status,
    webhook: {
      enabled: true,
      secretConfigured: webhookSecretConfigured(),
      deliveriesCount: readWebhookDeliveries().length,
      endpoint: `${protocol}://${host}/api/vtlog/webhook/job`,
      localEndpoint: `http://localhost:${PORT}/api/vtlog/webhook/job`
    }
  });
});

app.get('/api/vtlog/entregas', (_req, res) => {
  const cache = readVtlogCache();
  res.json({
    ok: cache.status !== 'error',
    lastSyncAt: cache.lastSyncAt,
    status: cache.status,
    error: cache.error,
    deliveries: mergeVtlogAndWebhookDeliveries(cache),
    summary: cache.summary || {}
  });
});

app.get('/api/vtlog/data', (_req, res) => {
  const cache = readVtlogCache();
  res.json({
    ok: cache.status !== 'error',
    lastSyncAt: cache.lastSyncAt,
    status: cache.status,
    error: cache.error,
    summary: cache.summary || {},
    vtc: cache.vtc || null,
    jobs: mergeVtlogAndWebhookDeliveries(cache),
    webhookJobs: readWebhookDeliveries(),
    members: cache.members || [],
    stats: cache.stats || null,
    trucks: cache.trucks || [],
    garages: cache.garages || [],
    ongoing: cache.ongoing || [],
    fuelStations: cache.fuelStations || []
  });
});

app.post('/api/vtlog/sincronizar', async (req, res) => {
  try {
    const cache = await syncVtlogData(req.body || {});
    res.json({ ok: true, lastSyncAt: cache.lastSyncAt, summary: cache.summary, deliveries: mergeVtlogAndWebhookDeliveries(cache) });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message, status: getConfigStatus() });
  }
});

app.get('/api/vtlog/sincronizar', async (req, res) => {
  try {
    const cache = await syncVtlogData(req.query || {});
    res.json({ ok: true, lastSyncAt: cache.lastSyncAt, summary: cache.summary, deliveries: mergeVtlogAndWebhookDeliveries(cache) });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message, status: getConfigStatus() });
  }
});


app.get('/api/vtlog/webhook/status', (req, res) => {
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  res.json({
    ok: true,
    enabled: true,
    secretConfigured: webhookSecretConfigured(),
    deliveriesCount: readWebhookDeliveries().length,
    endpoint: `${protocol}://${host}/api/vtlog/webhook/job`,
    localEndpoint: `http://localhost:${PORT}/api/vtlog/webhook/job`,
    method: 'POST',
    acceptedHeaders: ['Content-Type: application/json', 'x-vtlog-webhook-secret: <seu segredo se configurado>']
  });
});

app.get('/api/vtlog/webhook/entregas', (_req, res) => {
  res.json({ ok: true, deliveries: readWebhookDeliveries() });
});

app.post('/api/vtlog/webhook/job', (req, res) => {
  if (!isAuthorizedVtlogWebhook(req)) {
    return res.status(401).json({ ok: false, error: 'Segredo do webhook VTLog inválido.' });
  }

  const delivery = normalizeWebhookJob(req.body || {});
  if (!delivery) {
    return res.status(422).json({
      ok: false,
      error: 'Payload recebido, mas não consegui identificar campos de job VTLog.',
      preview: extractWebhookText(req.body || {}).slice(0, 1500),
      receivedKeys: Object.keys(req.body || {})
    });
  }

  const deliveries = readWebhookDeliveries();
  const duplicated = (delivery.jobId && deliveries.some(item => String(item.jobId) === String(delivery.jobId))) ||
    (delivery.webhookEventId && deliveries.some(item => String(item.webhookEventId) === String(delivery.webhookEventId)));

  if (duplicated) {
    return res.json({ ok: true, duplicated: true, delivery: deliveries.find(item => String(item.jobId) === String(delivery.jobId) || String(item.webhookEventId) === String(delivery.webhookEventId)) });
  }

  deliveries.unshift({ ...delivery, importedAt: new Date().toISOString() });
  writeWebhookDeliveries(deliveries.slice(0, 500));
  res.status(201).json({ ok: true, delivery: deliveries[0] });
});

app.post('/api/vtlog/webhook/test', (req, res) => {
  const sample = req.body && Object.keys(req.body).length ? req.body : {
    job_id: 2348776,
    job_status: 'cancelled',
    steam_id: '76561198943363609',
    departure_city_name: 'Votuporanga',
    arrival_city_name: 'Santo A. da Barra',
    cargo_name: 'Fluido de Freio',
    distance_client: 1470,
    fuel_used: 373,
    fuel_economy: 25.4,
    cargo_mass: 5316,
    truck_brand_name: 'Scania Série 5 Streamline',
    board: 'Realistic',
    income: 0,
    expense: 1193,
    profit: -1193,
    truck_cabin_damage: 13,
    trailers_chassis_damage: 2.8,
    trailer_cargo_damage: 0,
    arrival: Math.floor(Date.now() / 1000),
    game: 'ETS2'
  };

  const delivery = normalizeWebhookJob(sample);
  const deliveries = readWebhookDeliveries();
  deliveries.unshift({ ...delivery, importedAt: new Date().toISOString(), test: true });
  writeWebhookDeliveries(deliveries.slice(0, 500));
  res.status(201).json({ ok: true, delivery: deliveries[0] });
});

app.get('/api/discord/status', (_req, res) => {
  res.json({
    ok: true,
    botTokenConfigured: Boolean(process.env.DISCORD_BOT_TOKEN && !String(process.env.DISCORD_BOT_TOKEN).includes('COLE_AQUI')),
    vtlogChannelId: process.env.DISCORD_VTLOG_CHANNEL_ID || null,
    alertChannelId: process.env.DISCORD_ALERT_CHANNEL_ID || null,
    reportChannelId: process.env.DISCORD_REPORT_CHANNEL_ID || null,
    errorChannelId: process.env.DISCORD_ERROR_CHANNEL_ID || null,
    deliveriesCount: readDiscordDeliveries().length
  });
});

app.get('/api/discord/entregas', (_req, res) => {
  res.json({ ok: true, deliveries: readDiscordDeliveries() });
});

app.post('/api/discord/importar', (req, res) => {
  if (!isAuthorizedImport(req)) {
    return res.status(401).json({ ok: false, error: 'Chave de importação inválida.' });
  }

  const delivery = normalizeDelivery(req.body);
  if (!delivery.origin || !delivery.destination || (!delivery.driverName && !delivery.raw)) {
    return res.status(400).json({ ok: false, error: 'Dados insuficientes para importar a entrega.' });
  }

  const deliveries = readDiscordDeliveries();
  const duplicated = delivery.discordMessageId && deliveries.some(item => item.discordMessageId === delivery.discordMessageId);
  if (duplicated) {
    return res.json({ ok: true, duplicated: true, delivery: deliveries.find(item => item.discordMessageId === delivery.discordMessageId) });
  }

  deliveries.unshift(delivery);
  writeDiscordDeliveries(deliveries.slice(0, 300));
  res.status(201).json({ ok: true, delivery });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

function startServer() {
  ensureDataStore();
  return app.listen(PORT, () => {
    console.log(`Aliança Transportes LTDA rodando em http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, readDiscordDeliveries, writeDiscordDeliveries, readWebhookDeliveries, writeWebhookDeliveries, normalizeWebhookJob };
