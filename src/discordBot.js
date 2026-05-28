try { require('dotenv').config(); } catch (_error) { /* dotenv é carregado quando instalado no projeto */ }

function onlyDigits(value = '') {
  return String(value).replace(/\D/g, '');
}

function parseDecimal(value = '') {
  const cleaned = String(value).replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCurrency(value = '') {
  const cleaned = String(value)
    .replace(/R\$/gi, '')
    .replace(/ALI Coins/gi, '')
    .replace(/[ƒ$€£]/g, '')
    .replace(/\s/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const parsed = Number(cleaned.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanLabelLine(value = '') {
  return String(value)
    .replace(/<a?:[\w-]+:\d+>/g, '')
    .replace(/(:[\w_+-]+:\s*)+/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, '')
    .replace(/[\u200B-\u200D\uFE0F]/g, '')
    .replace(/[•|*_`~>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeKey(value = '') {
  return cleanLabelLine(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function getNextValue(lines, startIndex) {
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const value = String(lines[i] || '').trim();
    if (value) return value;
  }
  return '';
}

function findLabel(text, labels) {
  const rawText = String(text || '');
  const wanted = labels.map(normalizeKey);

  // Formato tradicional: "Motorista: Larissa" / "Driver - Larissa".
  for (const label of labels) {
    const regex = new RegExp(`(?:^|\\n)\\s*(?:<a?:[\\w-]+:\\d+>\\s*)*(?::[\\w_+-]+:\\s*)*${escapeRegex(label)}\\s*[:\\-]\\s*(.+)`, 'i');
    const match = rawText.match(regex);
    if (match?.[1]) return match[1].split('\n')[0].replace(/[*_`~]/g, '').trim();
  }

  // Formato real do VTLog/Discord: emoji + rótulo em uma linha e valor na linha seguinte.
  const lines = rawText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const key = normalizeKey(line);
    if (wanted.includes(key)) return getNextValue(lines, i).replace(/[*_`~]/g, '').trim();

    // Alguns embeds chegam como "Driver LarissaR27" ou "Driver — LarissaR27" na mesma linha.
    for (const label of labels) {
      const sameLine = new RegExp(`^(?:<a?:[\\w-]+:\\d+>\\s*)*(?::[\\w_+-]+:\\s*)*${escapeRegex(label)}\\s*(?:[:\\-–—]|\\s{2,})\\s*(.+)$`, 'i').exec(cleanLabelLine(line));
      if (sameLine?.[1]) return sameLine[1].replace(/[*_`~]/g, '').trim();
    }
  }

  return '';
}

function parseDateFromText(text = '') {
  const match = String(text).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*(\d{1,2}:\d{2}))?/);
  if (!match) return '';
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3];
  return `${year}-${month}-${day}`;
}

function translateStatus(status = '') {
  const clean = String(status || '').trim();
  if (/delivered|entregue|conclu[ií]d|finalizad/i.test(clean)) return 'Entregue';
  if (/cancel/i.test(clean)) return 'Cancelada';
  if (/failed|falh|danificad/i.test(clean)) return 'Falhou';
  if (/progress|andamento|active|em rota/i.test(clean)) return 'Em andamento';
  return clean || 'Importada';
}

function extractJobNumber(text = '') {
  return String(text).match(/Job\s*#\s*(\d+)/i)?.[1] || '';
}

function extractSteamId(text = '') {
  return String(text).match(/VTLog\.net.*?(\d{16,20})/i)?.[1] || '';
}

function maxNumber(...values) {
  const parsed = values.map(value => Number(value)).filter(Number.isFinite);
  return parsed.length ? Math.max(...parsed) : 0;
}

function unixToDate(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return '';
  const ms = numeric < 1e12 ? numeric * 1000 : numeric;
  return new Date(ms).toISOString().slice(0, 10);
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function jobToDelivery(job = {}, fallback = {}, rawText = '') {
  const origin = firstNonEmpty(job.departure_city_name, job.origin?.city_name, fallback.origin, 'Origem VTLog');
  const destination = firstNonEmpty(job.arrival_city_name, job.destination?.city_name, fallback.destination, 'Destino VTLog');
  const cargo = firstNonEmpty(job.cargo_name, job.cargo?.name, fallback.cargo, 'Carga VTLog');
  const profit = parseCurrency(job.profit ?? fallback.profit ?? fallback.value);
  const income = parseCurrency(job.income ?? fallback.income);
  const expense = parseCurrency(job.expense ?? fallback.expense);
  const km = Number(job.distance_client ?? job.distance ?? fallback.km ?? 0);

  return {
    ...fallback,
    source: 'Discord/VTLog + API',
    jobNumber: String(job.job_id || fallback.jobNumber || extractJobNumber(rawText) || ''),
    driverName: firstNonEmpty(fallback.driverName, job.username, job.steam_id, 'Motorista VTLog'),
    steamId: firstNonEmpty(job.steam_id, fallback.steamId, extractSteamId(rawText)) || null,
    origin,
    destination,
    cargo,
    km: Number.isFinite(km) ? km : Number(fallback.km || 0),
    value: profit || Number(fallback.value || 0) || income,
    status: translateStatus(job.job_status || fallback.status),
    date: unixToDate(job.arrival || job.departure || job.date) || fallback.date || parseDateFromText(rawText) || new Date().toISOString().slice(0, 10),
    raw: rawText || fallback.raw || JSON.stringify(job),
    board: firstNonEmpty(job.board, fallback.board) || null,
    game: job.game || fallback.game || null,
    map: job.map || fallback.map || null,
    driveTime: fallback.driveTime || null,
    truck: firstNonEmpty(fallback.truck, job.truck_brand_name, job.truck?.model?.display_name, job.truck_id, job.truck_license_plate, '-') || '-',
    truckPlate: job.truck_license_plate || fallback.truckPlate || null,
    weightKg: parseDecimal(job.cargo_mass ?? fallback.weightKg),
    fuelLiters: parseDecimal(job.fuel_used ?? fallback.fuelLiters),
    fuelEconomy: firstNonEmpty(job.fuel_economy, fallback.fuelEconomy) || null,
    truckDamage: maxNumber(job.truck_cabin_damage, job.truck_chassis_damage, job.truck_engine_damage, job.truck_transmission_damage, job.truck_wheels_damage, fallback.truckDamage),
    trailersDamage: maxNumber(job.trailers_chassis_damage, job.trailers_wheels_damage, job.trailers_body_damage, fallback.trailersDamage),
    cargoDamage: parseDecimal(job.trailer_cargo_damage ?? fallback.cargoDamage),
    income,
    expense,
    profit: profit || Number(fallback.profit || fallback.value || 0)
  };
}

async function fetchJobFromVTLog(jobNumber) {
  const id = String(jobNumber || '').trim();
  if (!/^\d+$/.test(id)) return null;
  try {
    const apiUrl = String(process.env.VTLOG_API_URL || 'https://api.vtlog.net').trim().replace(/\/+$/, '') || 'https://api.vtlog.net';
    const response = await fetch(`${apiUrl}/v2/jobs/${id}?events=true&mods=true&trailers=true`, {
      headers: { Accept: 'application/json' }
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || payload?.message || `HTTP ${response.status}`);
    return payload?.data || payload || null;
  } catch (error) {
    console.warn(`Não consegui consultar o Job #${id} na API VTLog:`, error.message);
    return null;
  }
}

function pushEmbedParts(parts, originalEmbed) {
  const embed = typeof originalEmbed?.toJSON === 'function' ? originalEmbed.toJSON() : (originalEmbed?.data || originalEmbed || {});
  if (!embed || typeof embed !== 'object') return;
  if (embed.author?.name) parts.push(embed.author.name);
  if (embed.title) parts.push(embed.title);
  if (embed.description) parts.push(embed.description);
  for (const field of embed.fields || []) {
    if (field?.name || field?.value) {
      // Inclui nos dois formatos para aceitar tanto "rótulo: valor" quanto "rótulo\nvalor".
      parts.push(`${field.name || ''}: ${field.value || ''}`);
      parts.push(`${field.name || ''}\n${field.value || ''}`);
    }
  }
  if (embed.footer?.text) parts.push(embed.footer.text);
  if (embed.timestamp) parts.push(embed.timestamp);
  try {
    const serialized = JSON.stringify(embed);
    if (/Job\s*#|VTLog|Driver|Source|Destination|Profit/i.test(serialized)) parts.push(serialized);
  } catch (_error) {
    // Se o embed não puder ser serializado, apenas segue.
  }
}

function iterableValues(value) {
  if (!value) return [];
  if (typeof value.values === 'function') return Array.from(value.values());
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return Object.values(value);
  return [];
}

function pushMessageLikeParts(parts, messageLike, depth = 0) {
  if (!messageLike || depth > 4) return;
  const object = typeof messageLike.toJSON === 'function' ? messageLike.toJSON() : messageLike;

  if (messageLike.content) parts.push(messageLike.content);
  if (messageLike.cleanContent) parts.push(messageLike.cleanContent);
  if (object?.content) parts.push(object.content);
  if (object?.cleanContent) parts.push(object.cleanContent);

  for (const embed of (messageLike.embeds || object?.embeds || [])) pushEmbedParts(parts, embed);

  const attachments = messageLike.attachments || object?.attachments || [];
  for (const attachment of iterableValues(attachments)) {
    if (attachment?.name || attachment?.filename || attachment?.url) {
      parts.push(`${attachment.name || attachment.filename || 'anexo'} ${attachment.url || ''}`);
    }
  }

  // Mensagens encaminhadas do Discord chegam como Message Snapshots. O conteúdo original
  // não vem em message.content nem em message.embeds; vem dentro do snapshot.
  const snapshotSources = [
    messageLike.messageSnapshots,
    messageLike.message_snapshots,
    messageLike.snapshots,
    object?.messageSnapshots,
    object?.message_snapshots,
    object?.snapshots
  ];

  for (const source of snapshotSources) {
    for (const snapshot of iterableValues(source)) {
      if (!snapshot) continue;
      parts.push('[FORWARDED_MESSAGE_SNAPSHOT]');
      pushMessageLikeParts(parts, snapshot, depth + 1);
      pushMessageLikeParts(parts, snapshot.message, depth + 1);
      pushMessageLikeParts(parts, snapshot.data?.message, depth + 1);
      pushMessageLikeParts(parts, snapshot.raw?.message, depth + 1);
      try {
        const serialized = JSON.stringify(typeof snapshot.toJSON === 'function' ? snapshot.toJSON() : snapshot);
        if (/Job\s*#|VTLog|Driver|Source|Destination|Profit/i.test(serialized)) parts.push(serialized);
      } catch (_error) {
        // Ignora snapshots não serializáveis.
      }
    }
  }
}

function extractMessageText(message) {
  const parts = [];
  pushMessageLikeParts(parts, message, 0);

  // Fallback final: em algumas versões do discord.js, a mensagem encaminhada só aparece
  // dentro do JSON bruto/camelCase. Serializar ajuda o parser a encontrar Job # e campos.
  try {
    const serialized = JSON.stringify(typeof message.toJSON === 'function' ? message.toJSON() : message);
    if (/Job\s*#|VTLog|Driver|Source|Destination|Profit/i.test(serialized)) parts.push(serialized);
  } catch (_error) {
    // Sem fallback serializado.
  }

  return Array.from(new Set(parts.filter(Boolean))).join('\n');
}

function parseVTLogMessage(text = '') {
  const sourceText = String(text || '').trim();
  if (!sourceText) return null;

  const driverName = findLabel(sourceText, ['Motorista', 'Driver', 'Condutor']);
  const origin = findLabel(sourceText, ['Origem', 'Saída', 'Saida', 'Source', 'From']);
  const destination = findLabel(sourceText, ['Destino', 'Chegada', 'Destination', 'To']);
  const cargo = findLabel(sourceText, ['Carga', 'Produto', 'Mercadoria', 'Cargo']) || 'Carga VTLog';
  const distanceRaw = findLabel(sourceText, ['Distância', 'Distancia', 'KM', 'Quilometragem', 'Distance']);
  const profitRaw = findLabel(sourceText, ['Profit', 'Lucro']);
  const valueRaw = profitRaw || findLabel(sourceText, ['Valor', 'Pagamento', 'Faturamento', 'Value', 'Income']);
  const statusRaw = findLabel(sourceText, ['Status', 'Situação', 'Situacao']);
  const dateRaw = findLabel(sourceText, ['Data', 'Date']) || parseDateFromText(sourceText);

  const truck = findLabel(sourceText, ['Truck', 'Caminhão', 'Caminhao']);
  const board = findLabel(sourceText, ['Board', 'Servidor', 'Modo']);
  const driveTime = findLabel(sourceText, ['Drive Time', 'Tempo de Direção', 'Tempo de Direcao']);
  const weightRaw = findLabel(sourceText, ['Weight', 'Peso']);
  const fuelRaw = findLabel(sourceText, ['Fuel', 'Combustível', 'Combustivel']);
  const fuelEconomyRaw = findLabel(sourceText, ['Fuel Economy', 'Consumo']);
  const truckDamageRaw = findLabel(sourceText, ['Truck Damage', 'Dano do Caminhão', 'Dano do Caminhao']);
  const trailersDamageRaw = findLabel(sourceText, ['Trailers Damage', 'Trailer Damage', 'Dano do Reboque']);
  const cargoDamageRaw = findLabel(sourceText, ['Cargo Damage', 'Dano da Carga']);
  const incomeRaw = findLabel(sourceText, ['Income', 'Receita']);
  const expenseRaw = findLabel(sourceText, ['Expense', 'Despesa']);

  const km = Number(onlyDigits(distanceRaw));
  const value = parseCurrency(valueRaw);
  const income = parseCurrency(incomeRaw);
  const expense = parseCurrency(expenseRaw);
  const profit = parseCurrency(profitRaw) || value;

  const looksLikeVTLog = /VTLog\.net|Euro Truck Simulator 2|American Truck Simulator|Job\s*#/i.test(sourceText);
  if (!driverName && !origin && !destination && !value && !looksLikeVTLog) return null;

  return {
    driverName: driverName || 'Motorista VTLog',
    origin: origin || 'Origem VTLog',
    destination: destination || 'Destino VTLog',
    cargo,
    km: Number.isFinite(km) ? km : 0,
    value: profit || value || income,
    status: translateStatus(statusRaw),
    date: dateRaw || new Date().toISOString().slice(0, 10),
    raw: sourceText,
    source: 'Discord/VTLog',
    jobNumber: extractJobNumber(sourceText),
    board,
    driveTime,
    truck,
    weightKg: parseDecimal(weightRaw),
    fuelLiters: parseDecimal(fuelRaw),
    fuelEconomy: fuelEconomyRaw,
    truckDamage: parseDecimal(truckDamageRaw),
    trailersDamage: parseDecimal(trailersDamageRaw),
    cargoDamage: parseDecimal(cargoDamageRaw),
    income,
    expense,
    profit: profit || value,
    steamId: extractSteamId(sourceText)
  };
}

async function sendChannelMessage(client, channelId, payload) {
  const cleanChannelId = String(channelId || '').trim();
  if (!cleanChannelId) return;
  try {
    const channel = await client.channels.fetch(cleanChannelId);
    if (channel?.isTextBased()) await channel.send(payload);
  } catch (error) {
    console.error(`Não consegui enviar mensagem no canal ${cleanChannelId}:`, error.message);
  }
}

async function importDelivery(delivery) {
  const siteUrl = String(process.env.SITE_URL || 'http://localhost:3000').trim().replace(/\/$/, '');
  const response = await fetch(`${siteUrl}/api/discord/importar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-discord-import-secret': process.env.DISCORD_IMPORT_SECRET || ''
    },
    body: JSON.stringify(delivery)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Falha HTTP ${response.status}`);
  return body;
}


function trimForDiscord(value = '', max = 1600) {
  const text = String(value || '').trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

async function sendDebugFailure(client, message, extractedText) {
  const preview = trimForDiscord(extractedText || '(sem texto extraído)', 1200).replace(/```/g, "'''");
  await sendChannelMessage(
    client,
    process.env.DISCORD_ERROR_CHANNEL_ID,
    `⚠️ Não consegui interpretar a mensagem ${message.id} como entrega VTLog.\n` +
    `Canal: ${message.channelId}\n` +
    `Embeds encontrados: ${(message.embeds || []).length}\n` +
    `Prévia lida pelo bot:\n\`\`\`\n${preview}\n\`\`\``
  );
}

function startBot() {
  const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
  const token = String(process.env.DISCORD_BOT_TOKEN || '').trim();
  const vtlogChannelId = String(process.env.DISCORD_VTLOG_CHANNEL_ID || '').trim();

  if (!token || token.includes('COLE_AQUI')) {
    console.warn('DISCORD_BOT_TOKEN não configurado. O site vai rodar, mas o bot não será iniciado.');
    return null;
  }
  if (!vtlogChannelId) {
    console.warn('DISCORD_VTLOG_CHANNEL_ID não configurado. O bot não saberá qual canal ler.');
    return null;
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
  });

  client.once('clientReady', () => {
    console.log(`Bot Discord conectado como ${client.user.tag}`);
    console.log(`Lendo entregas no canal: ${vtlogChannelId}`);
    sendChannelMessage(client, process.env.DISCORD_ALERT_CHANNEL_ID, `✅ Bot da Aliança online. Monitorando o canal VTLog: ${vtlogChannelId}`);
  });

  client.on('messageCreate', async (message) => {
    // Ignora somente mensagens do próprio bot, mas ACEITA mensagens de outros bots/webhooks,
    // porque o VTLog normalmente publica entregas como bot ou webhook no Discord.
    if (message.author?.id === client.user?.id) return;
    if (String(message.channelId).trim() !== vtlogChannelId) return;

    console.log(`Mensagem recebida no canal VTLog (${message.id}) de ${message.author?.tag || 'webhook'}${message.webhookId ? ' via webhook' : ''}.`);

    const text = extractMessageText(message);
    const parsed = parseVTLogMessage(text);
    const jobNumber = parsed?.jobNumber || extractJobNumber(text);
    const apiJob = jobNumber ? await fetchJobFromVTLog(jobNumber) : null;
    const parsedOrApi = apiJob ? jobToDelivery(apiJob, parsed || {}, text) : parsed;

    if (!parsedOrApi) {
      console.warn('Mensagem VTLog não interpretada. Prévia extraída:', text.slice(0, 1000));
      await sendDebugFailure(client, message, text);
      return;
    }

    const delivery = {
      ...parsedOrApi,
      discordMessageId: message.id,
      discordChannelId: message.channelId
    };

    try {
      const result = await importDelivery(delivery);
      const embed = new EmbedBuilder()
        .setTitle(result.duplicated ? 'Entrega já importada' : 'Entrega importada para o site')
        .setColor(0xcc0000)
        .addFields(
          { name: 'Motorista', value: delivery.driverName || '-', inline: true },
          { name: 'Rota', value: `${delivery.origin} → ${delivery.destination}`.slice(0, 1024), inline: false },
          { name: 'Caminhão', value: delivery.truck || '-', inline: true },
          { name: 'Carga', value: delivery.cargo || '-', inline: true },
          { name: 'KM', value: String(delivery.km || 0), inline: true },
          { name: 'Lucro', value: `${delivery.value || 0} ALI Coins`, inline: true }
        )
        .setTimestamp(new Date());
      await sendChannelMessage(client, process.env.DISCORD_ALERT_CHANNEL_ID, { embeds: [embed] });
    } catch (error) {
      console.error('Erro ao importar entrega:', error.message);
      await sendChannelMessage(client, process.env.DISCORD_ERROR_CHANNEL_ID, `❌ Erro ao importar entrega: ${error.message}`);
    }
  });

  client.login(token).catch((error) => {
    console.error('Não consegui conectar o bot Discord:', error.message);
  });

  return client;
}

if (require.main === module) {
  startBot();
}

module.exports = { startBot, parseVTLogMessage, extractMessageText, jobToDelivery, fetchJobFromVTLog };
