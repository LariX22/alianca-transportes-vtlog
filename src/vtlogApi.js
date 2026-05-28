const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dataDir = path.join(__dirname, '..', 'data');
const vtlogDataFile = path.join(dataDir, 'vtlog-api-cache.json');

function cleanApiUrl(value) {
  return String(value || 'https://api.vtlog.net').trim().replace(/\/+$/, '') || 'https://api.vtlog.net';
}

function cleanToken() {
  const token = String(process.env.VTLOG_API_TOKEN || '').trim();
  if (!token || token.includes('COLE_AQUI') || token.includes('SEU_TOKEN')) return '';
  return token;
}

function cleanVtcId() {
  const id = String(process.env.VTLOG_VTC_ID || '').trim();
  return /^\d+$/.test(id) ? id : '';
}

function cleanSteamId() {
  const id = String(process.env.VTLOG_STEAM_ID || '').trim();
  return /^\d{17}$/.test(id) ? id : '';
}

function vtlogMode() {
  const raw = String(process.env.VTLOG_MODE || '').trim().toLowerCase();
  if (['personal', 'pessoal', 'user', 'steam'].includes(raw)) return 'personal';
  return 'vtc';
}

function defaultCache() {
  return {
    lastSyncAt: null,
    status: 'never_synced',
    error: null,
    mode: vtlogMode(),
    apiUrl: cleanApiUrl(process.env.VTLOG_API_URL),
    steamId: cleanSteamId() || null,
    vtcId: cleanVtcId() || null,
    summary: {
      jobs: 0,
      members: 0,
      trucks: 0,
      garages: 0,
      ongoing: 0,
      profit: 0,
      distance: 0,
      fuel: 0
    },
    jobs: [],
    members: [],
    stats: null,
    vtc: null,
    trucks: [],
    garages: [],
    ongoing: [],
    bank: null,
    fuelStations: [],
    raw: {}
  };
}

function ensureVtlogStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(vtlogDataFile)) {
    fs.writeFileSync(vtlogDataFile, JSON.stringify(defaultCache(), null, 2), 'utf8');
  }
}

function readVtlogCache() {
  ensureVtlogStore();

  try {
    const parsed = JSON.parse(fs.readFileSync(vtlogDataFile, 'utf8'));
    return {
      ...defaultCache(),
      ...parsed,
      summary: {
        ...defaultCache().summary,
        ...(parsed.summary || {})
      }
    };
  } catch (error) {
    return {
      ...defaultCache(),
      status: 'cache_error',
      error: error.message
    };
  }
}

function writeVtlogCache(cache) {
  ensureVtlogStore();
  fs.writeFileSync(vtlogDataFile, JSON.stringify(cache, null, 2), 'utf8');
}

function tokenConfigured() {
  return Boolean(cleanToken());
}

function getConfigStatus() {
  const cache = readVtlogCache();

  return {
    ok: true,
    apiUrl: cleanApiUrl(process.env.VTLOG_API_URL || cache.apiUrl),
    tokenConfigured: tokenConfigured(),
    mode: vtlogMode(),
    steamId: cleanSteamId() || process.env.VTLOG_STEAM_ID || null,
    vtcId: cleanVtcId() || cache.vtcId || null,
    lastSyncAt: cache.lastSyncAt,
    status: cache.status,
    error: cache.error,
    summary: cache.summary,
    endpoints: {
      userJobs: '/v2/user/{steam_id}/jobs',
      vtc: '/v2/vtc/{vtc_id}',
      jobs: '/v2/vtc/{vtc_id}/jobs',
      members: '/v2/vtc/{vtc_id}/members',
      stats: '/v2/vtc/{vtc_id}/stats',
      trucks: '/v2/vtc/{vtc_id}/trucks',
      garages: '/v2/vtc/{vtc_id}/garages',
      ongoing: '/v2/vtc/{vtc_id}/jobs/ongoing'
    }
  };
}

function buildUrl(pathname, query = {}) {
  const base = cleanApiUrl(process.env.VTLOG_API_URL || 'https://api.vtlog.net');
  const url = new URL(`${base}${pathname}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function vtlogRequest(pathname, query = {}) {
  const token = cleanToken();
  const headers = {
    Accept: 'application/json'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(pathname, query), { headers });
  const text = await response.text();

  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (_error) {
    payload = { raw: text };
  }

  if (!response.ok) {
    const detail = payload?.error || payload?.message || response.statusText || `HTTP ${response.status}`;
    throw new Error(detail);
  }

  return payload;
}

function unwrap(payload) {
  if (!payload) return null;
  if (Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data;
  return payload;
}

function asArray(payload) {
  const data = unwrap(payload);

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.jobs)) return data.jobs;
  if (data && Array.isArray(data.items)) return data.items;

  return data ? [data] : [];
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
}

function unixToDate(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return new Date().toISOString().slice(0, 10);
  }

  const ms = numeric < 1e12 ? numeric * 1000 : numeric;
  return new Date(ms).toISOString().slice(0, 10);
}

function memberMap(members) {
  const map = new Map();

  for (const member of members || []) {
    const key = String(member.steam_id || member.steamId || '').trim();
    if (key) map.set(key, member);
  }

  return map;
}

function normalizeJob(job = {}, membersBySteam = new Map()) {
  const member = membersBySteam.get(String(job.steam_id || '').trim()) || {};

  const driverName = firstNonEmpty(
    member.name,
    member.username,
    job.username,
    job.driverName,
    job.steam_id,
    'Motorista VTLog'
  );

  const origin = firstNonEmpty(
    job.departure_city_name,
    job.origin?.city_name,
    job.origin,
    job.source,
    'Origem VTLog'
  );

  const destination = firstNonEmpty(
    job.arrival_city_name,
    job.destination?.city_name,
    job.destination,
    'Destino VTLog'
  );

  const cargo = firstNonEmpty(
    job.cargo_name,
    job.cargo?.name,
    job.cargo,
    'Carga VTLog'
  );

  const distance = number(job.distance_client ?? job.distance ?? job.km);
  const profit = number(job.profit ?? job.value ?? job.income_distance_profit);
  const income = number(job.income);
  const expense = number(job.expense);

  const truck = firstNonEmpty(
    job.truck_brand_name,
    job.truck?.model?.display_name,
    job.truck_id,
    job.truck_license_plate,
    '-'
  );

  const statusRaw = String(job.job_status || job.status || 'Importada');
  const status = /delivered|entreg/i.test(statusRaw) ? 'Entregue' : statusRaw;

  return {
    id: `vtlog_${job.job_id || `${Date.now()}_${Math.random().toString(16).slice(2)}`}`,
    source: 'VTLog API',
    jobId: job.job_id || null,
    driverName: String(driverName),
    steamId: job.steam_id || member.steam_id || null,
    origin: String(origin),
    destination: String(destination),
    cargo: String(cargo),
    km: distance,
    value: profit,
    status,
    date: unixToDate(job.arrival || job.departure || job.date || job.created_at),
    importedAt: new Date().toISOString(),
    board: job.board || null,
    game: job.game || null,
    map: job.map || null,
    truck,
    truckPlate: job.truck_license_plate || null,
    weightKg: number(job.cargo_mass),
    fuelLiters: number(job.fuel_used),
    fuelEconomy: job.fuel_economy ?? null,
    truckDamage: Math.max(
      number(job.truck_cabin_damage),
      number(job.truck_chassis_damage),
      number(job.truck_engine_damage),
      number(job.truck_transmission_damage),
      number(job.truck_wheels_damage)
    ),
    trailersDamage: Math.max(
      number(job.trailers_chassis_damage),
      number(job.trailers_wheels_damage),
      number(job.trailers_body_damage)
    ),
    cargoDamage: number(job.trailer_cargo_damage),
    income,
    expense,
    profit,
    raw: job
  };
}

function normalizeMember(member = {}) {
  return {
    name: member.name || member.username || member.steam_id || 'Membro VTLog',
    steamId: member.steam_id || null,
    avatar: member.avatar || null,
    role: member.role || null,
    memberSince: member.member_since || member.created_at || null
  };
}

function normalizeTruck(truck = {}) {
  return {
    truckId: truck.truck_id || null,
    name: firstNonEmpty(
      truck.custom_name,
      truck.model?.display_name,
      truck.model?.brand,
      'Caminhão VTLog'
    ),
    brand: truck.model?.brand || null,
    model: truck.model?.display_name || null,
    status: truck.status || 'desconhecido',
    garage: truck.garage?.name || null,
    currentDriver: truck.current_driver?.username || null,
    km: number(truck.odometer?.total_km),
    healthPct: number(truck.health_pct, 0),
    game: truck.game || null,
    retired: Boolean(truck.is_retired)
  };
}

function normalizeGarage(garage = {}) {
  return {
    garageId: garage.garage_id || null,
    name: garage.name || 'Garagem VTLog',
    truckSlots: number(garage.truck_slots),
    totalDistanceKm: number(garage.stats?.total_distance_km),
    jobsCompleted: number(garage.stats?.jobs_completed),
    totalRevenue: number(garage.stats?.total_revenue),
    managers: Array.isArray(garage.managers) ? garage.managers : [],
    upgrades: garage.upgrades || {}
  };
}

function summarize(jobs, members, trucks, garages, ongoing, stats) {
  const statsData = stats?.stats || {};

  return {
    jobs: jobs.length || number(statsData.jobs),
    members: members.length,
    trucks: trucks.length,
    garages: garages.length,
    ongoing: ongoing.length,
    profit: number(statsData.profit, jobs.reduce((sum, item) => sum + number(item.profit), 0)),
    distance: number(statsData.distance, jobs.reduce((sum, item) => sum + number(item.km), 0)),
    fuel: number(statsData.fuel, jobs.reduce((sum, item) => sum + number(item.fuelLiters), 0))
  };
}

async function syncPersonalVtlogData(options = {}) {
  const steamId = cleanSteamId();

  if (!steamId) {
    throw new Error('Configure VTLOG_STEAM_ID com seu Steam ID de 17 dígitos.');
  }

  const jobLimit = Math.min(
    Math.max(number(options.limit, number(process.env.VTLOG_JOBS_LIMIT, 25)), 1),
    25
  );

  const game = options.game || process.env.VTLOG_GAME || 'ETS2';
  const board = options.board || process.env.VTLOG_BOARD || '';

  const query = {
    limit: jobLimit,
    game,
    board
  };

  const cache = readVtlogCache();

  try {
    // MODO PESSOAL:
    // Aqui NÃO chamamos /v2/user/{steam_id}
    // Aqui NÃO chamamos /v2/fuel-stations
    // Aqui NÃO chamamos /v2/vtc/...
    const jobsPayload = await vtlogRequest(`/v2/user/${steamId}/jobs`, query);

    const rawJobs = asArray(jobsPayload);
    const pseudoMember = {
      steam_id: steamId,
      name: `Steam ${steamId}`,
      username: `Steam ${steamId}`,
      avatar: null
    };

    const members = [pseudoMember];
    const membersBySteam = memberMap(members);
    const normalizedJobs = rawJobs.map(job => normalizeJob(job, membersBySteam));
    const normalizedMembers = members.map(normalizeMember);

    const nextCache = {
      ...cache,
      lastSyncAt: new Date().toISOString(),
      status: 'ok',
      error: null,
      mode: 'personal',
      apiUrl: cleanApiUrl(process.env.VTLOG_API_URL || 'https://api.vtlog.net'),
      steamId,
      vtcId: null,
      vtc: null,
      jobs: normalizedJobs,
      members: normalizedMembers,
      stats: null,
      trucks: [],
      garages: [],
      ongoing: [],
      fuelStations: [],
      summary: summarize(normalizedJobs, normalizedMembers, [], [], [], null),
      raw: {
        jobs: rawJobs
      }
    };

    writeVtlogCache(nextCache);
    return nextCache;
  } catch (error) {
    const failedCache = {
      ...cache,
      mode: 'personal',
      status: 'error',
      error: error.message,
      lastSyncAt: new Date().toISOString(),
      apiUrl: cleanApiUrl(process.env.VTLOG_API_URL || 'https://api.vtlog.net'),
      steamId
    };

    writeVtlogCache(failedCache);
    throw error;
  }
}

async function syncVtcVtlogData(options = {}) {
  const token = cleanToken();
  const vtcId = cleanVtcId();

  if (!vtcId) {
    throw new Error('Configure VTLOG_VTC_ID. Para testar sem empresa, use VTLOG_MODE=personal e VTLOG_STEAM_ID.');
  }

  if (!token) {
    throw new Error('Configure VTLOG_API_TOKEN. Para testar sem token, use VTLOG_MODE=personal e VTLOG_STEAM_ID.');
  }

  const jobLimit = Math.min(
    Math.max(number(options.limit, number(process.env.VTLOG_JOBS_LIMIT, 25)), 1),
    25
  );

  const game = options.game || process.env.VTLOG_GAME || 'ETS2';
  const board = options.board || process.env.VTLOG_BOARD || '';
  const commonFilters = { game, board };

  const cache = readVtlogCache();

  try {
    const vtcPayload = await vtlogRequest(`/v2/vtc/${vtcId}`);
    const membersPayload = await vtlogRequest(`/v2/vtc/${vtcId}/members`);
    const statsPayload = await vtlogRequest(`/v2/vtc/${vtcId}/stats`, commonFilters);
    const jobsPayload = await vtlogRequest(`/v2/vtc/${vtcId}/jobs`, {
      ...commonFilters,
      limit: jobLimit
    });
    const trucksPayload = await vtlogRequest(`/v2/vtc/${vtcId}/trucks`, {
      retired: false
    });
    const garagesPayload = await vtlogRequest(`/v2/vtc/${vtcId}/garages`);
    const ongoingPayload = await vtlogRequest(`/v2/vtc/${vtcId}/jobs/ongoing`, {
      limit: 25
    });

    const rawMembers = asArray(membersPayload);
    const membersBySteam = memberMap(rawMembers);
    const rawJobs = asArray(jobsPayload);

    const normalizedJobs = rawJobs.map(job => normalizeJob(job, membersBySteam));
    const normalizedMembers = rawMembers.map(normalizeMember);
    const normalizedTrucks = asArray(trucksPayload).map(normalizeTruck);
    const normalizedGarages = asArray(garagesPayload).map(normalizeGarage);
    const rawOngoing = asArray(ongoingPayload);
    const stats = unwrap(statsPayload);

    const nextCache = {
      ...cache,
      lastSyncAt: new Date().toISOString(),
      status: 'ok',
      error: null,
      mode: 'vtc',
      apiUrl: cleanApiUrl(process.env.VTLOG_API_URL || 'https://api.vtlog.net'),
      vtcId,
      vtc: unwrap(vtcPayload),
      jobs: normalizedJobs,
      members: normalizedMembers,
      stats,
      trucks: normalizedTrucks,
      garages: normalizedGarages,
      ongoing: rawOngoing,
      fuelStations: [],
      summary: summarize(
        normalizedJobs,
        normalizedMembers,
        normalizedTrucks,
        normalizedGarages,
        rawOngoing,
        stats
      ),
      raw: {
        vtc: unwrap(vtcPayload),
        jobs: rawJobs,
        members: rawMembers,
        stats,
        trucks: asArray(trucksPayload),
        garages: asArray(garagesPayload),
        ongoing: rawOngoing
      }
    };

    writeVtlogCache(nextCache);
    return nextCache;
  } catch (error) {
    const failedCache = {
      ...cache,
      mode: 'vtc',
      status: 'error',
      error: error.message,
      lastSyncAt: new Date().toISOString(),
      apiUrl: cleanApiUrl(process.env.VTLOG_API_URL || 'https://api.vtlog.net'),
      vtcId
    };

    writeVtlogCache(failedCache);
    throw error;
  }
}

async function syncVtlogData(options = {}) {
  if (vtlogMode() === 'personal') {
    return syncPersonalVtlogData(options);
  }

  return syncVtcVtlogData(options);
}

module.exports = {
  getConfigStatus,
  readVtlogCache,
  syncVtlogData,
  normalizeJob,
  vtlogRequest
};
