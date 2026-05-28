/* =========================================================
   Aliança Transportes LTDA - Sistema Web Multi-Arquivos
   HTML + CSS + JavaScript puros, dados mockados e localStorage
   ========================================================= */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const storageKeys = {
  auth: 'alianca_auth_driver_id',
  balance: 'alianca_balance',
  garage: 'alianca_garage',
  transactions: 'alianca_transactions',
  market: 'alianca_market_ads',
  photo: 'alianca_profile_photo',
  redeemed: 'alianca_redeemed_codes',
  deliveries: 'alianca_extra_deliveries'
};

const asset = (name) => `assets/${name}`;
const galleryImages = [
  asset('hero-road.jpg'), asset('fleet-sunset.jpg'), asset('fleet-grain.jpg'), asset('fleet-neon.jpg'),
  asset('car-transport.jpg'), asset('bus-terminal.jpg'), asset('products.jpg'), asset('logo.png')
];

const state = {
  currentView: 'empresa',
  currentTab: 'overview',
  galleryIndex: 0,
  recruitmentStep: 0,
  selectedProduct: null,
  recruitmentOpen: true,
  convoysJoined: new Set(),
  discordDeliveries: [],
  discordStatus: null,
  discordError: '',
  vtlogDeliveries: [],
  vtlogStatus: null,
  vtlogError: '',
  vtlogSyncing: false
};

const discordExampleMessage = `Euro Truck Simulator 2 • Job #2263100
Drive time: 01:24:59 with average speed: 47 Km/h
Drive Time limited from 01:38:35 to 01:15:54
:safety_vest: Driver
LarissaR27
:clipboard: Status
Delivered
:trophy: Board
Arcade
:map: Source
Conselheiro Lafaiete
:checkered_flag: Destination
Pirai
:alarm_clock: Drive Time
01:15:54
:truck: Truck
Mercedes-Benz Ls-1938
:package: Cargo
Vasilhames Vazios
:man_lifting_weights: Weight
14424 KG
:left_right_arrow: Distance
1265 KM
:fuelpump: Fuel
227 L
:globe_with_meridians: Fuel Economy
18.0 L/100KM
:anger: Truck Damage
36.4%
:anger: Trailers Damage
10.4%
:anger: Cargo Damage
0.0%
:inbox_tray: Income
ƒ 4943
:outbox_tray: Expense
ƒ 3448
:coin: Profit
ƒ 1495
VTLog.net • You drive, we log! • 76561198943363609•09/04/2026, 22:56`;

const data = {
  company: { foundedYear: 2021 },
  drivers: [
    { id: 'd1', name: 'Larissa Rodrigues', email: 'motorista@alianca.com', password: 'alianca2024', role: 'Sênior', joined: '2024-02-18', deliveries: 184, km: 98240, profit: 486500, weekly: { deliveries: 12, km: 6420, profit: 38200 }, garage: ['g1','g2'], career: 'Sênior' },
    { id: 'd2', name: 'Carlos Henrique', role: 'Lenda', joined: '2022-06-09', deliveries: 231, km: 130900, profit: 622400, weekly: { deliveries: 16, km: 8200, profit: 51400 }, garage: ['g3'], career: 'Lenda' },
    { id: 'd3', name: 'Mariana Costa', role: 'Pleno', joined: '2023-04-22', deliveries: 156, km: 76800, profit: 396800, weekly: { deliveries: 9, km: 4300, profit: 27600 }, garage: ['g4'], career: 'Pleno' },
    { id: 'd4', name: 'João Pedro Almeida', role: 'Sênior', joined: '2022-11-15', deliveries: 202, km: 112450, profit: 554100, weekly: { deliveries: 14, km: 7500, profit: 46300 }, garage: ['g5'], career: 'Sênior' },
    { id: 'd5', name: 'Fernanda Lima', role: 'Júnior', joined: '2025-01-07', deliveries: 88, km: 41400, profit: 204600, weekly: { deliveries: 7, km: 2900, profit: 17800 }, garage: ['g6'], career: 'Júnior' },
    { id: 'd6', name: 'Rafael Santos', role: 'Pleno', joined: '2023-08-03', deliveries: 142, km: 70110, profit: 340900, weekly: { deliveries: 10, km: 5100, profit: 30100 }, garage: ['g7'], career: 'Pleno' },
    { id: 'd7', name: 'Aline Barbosa', role: 'Sênior', joined: '2022-03-20', deliveries: 198, km: 105700, profit: 530200, weekly: { deliveries: 13, km: 6800, profit: 44900 }, garage: ['g8'], career: 'Sênior' },
    { id: 'd8', name: 'Bruno Martins', role: 'Júnior', joined: '2024-09-12', deliveries: 73, km: 33820, profit: 166900, weekly: { deliveries: 5, km: 2500, profit: 13200 }, garage: ['g9'], career: 'Júnior' },
    { id: 'd9', name: 'Patrícia Gomes', role: 'Pleno', joined: '2023-02-28', deliveries: 164, km: 81930, profit: 421700, weekly: { deliveries: 11, km: 5900, profit: 34100 }, garage: ['g10'], career: 'Pleno' },
    { id: 'd10', name: 'Victor Nascimento', role: 'Trainee', joined: '2025-11-04', deliveries: 41, km: 17400, profit: 84000, weekly: { deliveries: 4, km: 1800, profit: 9400 }, garage: ['g11'], career: 'Trainee' }
  ],
  bases: [
    { city: 'Belo Horizonte - MG', type: 'Matriz Nacional', status: 'Operando', staff: 34 },
    { city: 'São Paulo - SP', type: 'Filial Sudeste', status: 'Operando', staff: 26 },
    { city: 'Curitiba - PR', type: 'Base Sul', status: 'Operando', staff: 18 },
    { city: 'Recife - PE', type: 'Base Nordeste', status: 'Em expansão', staff: 11 }
  ],
  partners: [
    { name: 'Rota Brasil Virtual', type: 'Parceiro logístico', description: 'Apoio em eventos e rotas nacionais.' },
    { name: 'Garagem Prime', type: 'Oficina parceira', description: 'Manutenção e restauração de frota.' },
    { name: 'Central Comboios', type: 'Comunidade', description: 'Organização de comboios semanais.' }
  ],
  streamers: [
    { name: 'Canal Estradeiro BR', platform: 'YouTube', specialty: 'Lives de comboio e entregas longas.' },
    { name: 'Truck Live Sul', platform: 'Twitch', specialty: 'Cobertura de eventos internos.' },
    { name: 'Diário da Cabine', platform: 'YouTube', specialty: 'Tutoriais para novos motoristas.' }
  ],
  deliveries: [
    { id: 'e1', driverId: 'd1', origin: 'Belo Horizonte - MG', destination: 'Santos - SP', cargo: 'Autopeças', km: 586, value: 9200, date: '2026-05-23' },
    { id: 'e2', driverId: 'd2', origin: 'Goiânia - GO', destination: 'Salvador - BA', cargo: 'Alimentos', km: 1640, value: 28600, date: '2026-05-22' },
    { id: 'e3', driverId: 'd3', origin: 'Curitiba - PR', destination: 'Campinas - SP', cargo: 'Eletrônicos', km: 510, value: 8400, date: '2026-05-21' },
    { id: 'e4', driverId: 'd4', origin: 'Vitória - ES', destination: 'Rio de Janeiro - RJ', cargo: 'Bebidas', km: 520, value: 7900, date: '2026-05-20' },
    { id: 'e5', driverId: 'd5', origin: 'Recife - PE', destination: 'Fortaleza - CE', cargo: 'Têxteis', km: 800, value: 12300, date: '2026-05-19' },
    { id: 'e6', driverId: 'd6', origin: 'São Paulo - SP', destination: 'Porto Alegre - RS', cargo: 'Máquinas', km: 1110, value: 21800, date: '2026-05-18' },
    { id: 'e7', driverId: 'd7', origin: 'Cuiabá - MT', destination: 'Campo Grande - MS', cargo: 'Grãos', km: 700, value: 13500, date: '2026-05-17' },
    { id: 'e8', driverId: 'd8', origin: 'Joinville - SC', destination: 'Ribeirão Preto - SP', cargo: 'Medicamentos', km: 670, value: 11400, date: '2026-05-16' },
    { id: 'e9', driverId: 'd9', origin: 'Belém - PA', destination: 'São Luís - MA', cargo: 'Madeira legalizada', km: 580, value: 10400, date: '2026-05-15' },
    { id: 'e10', driverId: 'd10', origin: 'Brasília - DF', destination: 'Uberlândia - MG', cargo: 'Encomendas', km: 430, value: 6800, date: '2026-05-14' }
  ],
  history: [
    { driverId: 'd1', year: '2026', month: '05', deliveries: 48, km: 24400, profit: 128500 },
    { driverId: 'd2', year: '2026', month: '05', deliveries: 56, km: 30120, profit: 162800 },
    { driverId: 'd3', year: '2026', month: '05', deliveries: 39, km: 19800, profit: 102400 },
    { driverId: 'd4', year: '2026', month: '04', deliveries: 44, km: 22150, profit: 119000 },
    { driverId: 'd5', year: '2026', month: '04', deliveries: 25, km: 11800, profit: 58400 },
    { driverId: 'd6', year: '2026', month: '03', deliveries: 34, km: 17200, profit: 88900 },
    { driverId: 'd7', year: '2025', month: '12', deliveries: 52, km: 26600, profit: 141200 },
    { driverId: 'd8', year: '2025', month: '12', deliveries: 18, km: 8200, profit: 39700 },
    { driverId: 'd9', year: '2025', month: '11', deliveries: 41, km: 20500, profit: 110800 },
    { driverId: 'd10', year: '2025', month: '11', deliveries: 14, km: 6100, profit: 28600 }
  ],
  garageTemplates: [
    { id: 'g1', type: 'caminhao', name: 'Scania R 450 Aliança', km: 84200, condition: 76, image: asset('fleet-sunset.jpg') },
    { id: 'g2', type: 'reboque', name: 'Carreta Baú 3 Eixos', km: 52100, condition: 68, image: asset('car-transport.jpg') },
    { id: 'g3', type: 'caminhao', name: 'Volvo FH 540 Patriota', km: 135400, condition: 61, image: asset('fleet-neon.jpg') },
    { id: 'g4', type: 'caminhao', name: 'Mercedes Actros 2651', km: 67500, condition: 83, image: asset('fleet-grain.jpg') },
    { id: 'g5', type: 'caminhao', name: 'DAF XF 530 Estradeiro', km: 112000, condition: 49, image: asset('hero-road.jpg') },
    { id: 'g6', type: 'reboque', name: 'Sider Vermelho 28 Pallets', km: 33400, condition: 72, image: asset('products.jpg') },
    { id: 'g7', type: 'caminhao', name: 'Iveco S-Way 480', km: 90600, condition: 27, image: asset('fleet-sunset.jpg') },
    { id: 'g8', type: 'reboque', name: 'Graneleiro Aliança Sul', km: 122900, condition: 33, image: asset('fleet-grain.jpg') },
    { id: 'g9', type: 'caminhao', name: 'MAN TGX 29.480', km: 48700, condition: 58, image: asset('fleet-neon.jpg') },
    { id: 'g10', type: 'caminhao', name: 'Scania S 730 Blackline', km: 73400, condition: 88, image: asset('bus-terminal.jpg') },
    { id: 'g11', type: 'caminhao', name: 'Volvo VM 330 Urbano', km: 22100, condition: 92, image: asset('car-transport.jpg') }
  ],
  products: [
    { id: 'p1', category: 'caminhao', name: 'Scania R 450 Zero KM', description: 'Caminhão premium para rotas longas.', price: 125000, image: asset('fleet-sunset.jpg'), condition: 100, km: 0 },
    { id: 'p2', category: 'caminhao', name: 'Volvo FH 540 Executivo', description: 'Alta potência para cargas pesadas.', price: 148000, image: asset('fleet-neon.jpg'), condition: 100, km: 0 },
    { id: 'p3', category: 'reboque', name: 'Carreta Refrigerada', description: 'Ideal para cargas sensíveis.', price: 72000, image: asset('car-transport.jpg'), condition: 100, km: 0 },
    { id: 'p4', category: 'reboque', name: 'Graneleiro 9 Eixos', description: 'Alta capacidade para agronegócio.', price: 69000, image: asset('fleet-grain.jpg'), condition: 100, km: 0 },
    { id: 'p5', category: 'acessorio', name: 'Kit Farol Vermelho', description: 'Pacote visual para caminhão.', price: 8500, image: asset('products.jpg'), condition: 100, km: 0 },
    { id: 'p6', category: 'acessorio', name: 'Pacote Cabine Premium', description: 'Melhora a experiência da cabine.', price: 12000, image: asset('bus-terminal.jpg'), condition: 100, km: 0 }
  ],
  market: [
    { id: 'm1', seller: 'Carlos Henrique', category: 'caminhao', name: 'Volvo FH 540 usado', color: 'Preto', km: 98000, price: 82000, financing: 'sim', parcels: 12, date: '2026-05-18', image: asset('fleet-neon.jpg') },
    { id: 'm2', seller: 'Mariana Costa', category: 'reboque', name: 'Baú 3 Eixos', color: 'Branco', km: 54000, price: 41000, financing: 'sim', parcels: 9, date: '2026-05-17', image: asset('car-transport.jpg') },
    { id: 'm3', seller: 'João Pedro', category: 'acessorio', name: 'Kit aerodinâmico', color: 'Vermelho', km: 0, price: 6200, financing: 'nao', parcels: 1, date: '2026-05-14', image: asset('products.jpg') }
  ],
  fleet: [
    { plate: 'ALT-2026', model: 'Scania R 450', driverId: 'd1', condition: 76, image: asset('fleet-sunset.jpg') },
    { plate: 'ALC-5409', model: 'Volvo FH 540', driverId: 'd2', condition: 61, image: asset('fleet-neon.jpg') },
    { plate: 'ALM-2651', model: 'Mercedes Actros', driverId: 'd4', condition: 49, image: asset('hero-road.jpg') },
    { plate: 'ALI-0480', model: 'Iveco S-Way', driverId: 'd6', condition: 27, image: asset('fleet-sunset.jpg') },
    { plate: 'ALS-0730', model: 'Scania S 730', driverId: 'd9', condition: 88, image: asset('bus-terminal.jpg') },
    { plate: 'ALV-0330', model: 'Volvo VM 330', driverId: 'd10', condition: 92, image: asset('car-transport.jpg') }
  ],
  workshops: [
    { name: 'Oficina Matriz Aliança', city: 'Belo Horizonte - MG', specialty: 'Motor e câmbio', status: 'Disponível' },
    { name: 'Box Vermelho Sul', city: 'Curitiba - PR', specialty: 'Reboques e freios', status: 'Ocupada' },
    { name: 'Pátio Express Sudeste', city: 'São Paulo - SP', specialty: 'Elétrica e cabine', status: 'Disponível' },
    { name: 'Garagem Nordeste', city: 'Recife - PE', specialty: 'Pneus e suspensão', status: 'Disponível' }
  ],
  fuel: [
    { date: '2026-05-24', type: 'Individual', details: 'Scania R 450 - 620 litros', liters: 620, branch: 'Belo Horizonte' },
    { date: '2026-05-23', type: 'Reservatório', details: 'Abastecimento base Sul', liters: 8200, branch: 'Curitiba' },
    { date: '2026-05-22', type: 'Individual', details: 'Volvo FH 540 - 710 litros', liters: 710, branch: 'São Paulo' },
    { date: '2026-05-20', type: 'Reservatório', details: 'Reposição base Nordeste', liters: 5600, branch: 'Recife' }
  ],
  tanks: [
    { branch: 'Belo Horizonte', level: 82 },
    { branch: 'São Paulo', level: 63 },
    { branch: 'Curitiba', level: 18 },
    { branch: 'Recife', level: 42 }
  ],
  stations: [
    { name: 'Posto Rota Forte', city: 'Belo Horizonte - MG', diesel: 'S10', contract: 'Ativo' },
    { name: 'Rede Estrada Sul', city: 'Curitiba - PR', diesel: 'S500/S10', contract: 'Ativo' },
    { name: 'Truck Center Anchieta', city: 'São Paulo - SP', diesel: 'S10', contract: 'Ativo' },
    { name: 'Nordeste Diesel Prime', city: 'Recife - PE', diesel: 'S500', contract: 'Em revisão' }
  ],
  convoys: [
    { id: 'c1', title: 'Comboio Minas ao Porto', date: '2026-06-01', route: 'Belo Horizonte → Santos', time: '20:30', slots: 18 },
    { id: 'c2', title: 'Operação Sul Vermelho', date: '2026-06-08', route: 'Curitiba → Porto Alegre', time: '21:00', slots: 14 },
    { id: 'c3', title: 'Rota Nordeste Integrada', date: '2026-06-15', route: 'Recife → Fortaleza', time: '19:45', slots: 22 }
  ],
  events: [
    { name: 'Desafio 50 Entregas', description: 'Meta coletiva para fechar o mês com alta produção.', reward: 12000, deadline: '2026-06-05', progress: 74 },
    { name: 'Semana da Frota Conservada', description: 'Bônus para motoristas com veículos acima de 70%.', reward: 6500, deadline: '2026-06-02', progress: 58 },
    { name: 'Operação Portos', description: 'Rotas especiais para Santos, Itajaí e Rio Grande.', reward: 9000, deadline: '2026-06-12', progress: 41 }
  ],
  mural: [
    { title: 'Reunião geral da frota', date: '2026-05-28', body: 'Todos os motoristas devem acompanhar as novas regras de comboios e pontuação semanal.' },
    { title: 'Atualização do mercado interno', date: '2026-05-25', body: 'Novos limites de parcelamento foram adicionados ao mercado de usados.' },
    { title: 'Bônus de preenchimento NF-e', date: '2026-05-21', body: 'Entregas registradas em até 24h recebem bônus de 5% sobre o valor da viagem.' },
    { title: 'Base Curitiba em atenção', date: '2026-05-19', body: 'Reservatório abaixo do ideal. Rotas longas devem confirmar abastecimento antes da saída.' }
  ],
  faqs: [
    ['Como entro para a empresa?', 'Acesse Recrutamento, preencha as etapas e aguarde a análise da equipe virtual.'],
    ['ALI Coins valem dinheiro real?', 'Não. ALI Coins são moeda interna fictícia para imersão no servidor.'],
    ['Posso anunciar qualquer item?', 'Você pode anunciar itens presentes na sua garagem virtual.'],
    ['Como subo no ranking?', 'Realizando entregas, acumulando lucro, KM e participação em eventos.'],
    ['O que é NF-e fictícia?', 'É um registro simulado, sem valor legal, usado apenas para organização e imersão.'],
    ['Quando devo restaurar um veículo?', 'Quando a conservação estiver abaixo de 30%, a oficina libera o botão de restauração.'],
    ['Comboios exigem login?', 'Sim, para participar o sistema precisa identificar seu motorista.'],
    ['Como resgato recompensas?', 'No painel do motorista, use códigos como ALI2026, COMBOIO ou ESTRADA.']
  ]
};

function formatNumber(value) { return new Intl.NumberFormat('pt-BR').format(Number(value || 0)); }
function coins(value) { return `${formatNumber(value)} ALI Coins`; }
function money(value) { return `R$ ${formatNumber(Number(value || 0).toFixed(2)).replace(',00', '')}`; }
function dateBR(value) { return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR'); }
function initials(name) { return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase(); }
function byId(id, list = data.drivers) { return list.find(item => item.id === id); }
function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function currentDriver() { return byId(localStorage.getItem(storageKeys.auth)); }
function getBalance() {
  const driver = currentDriver();
  if (!driver) return 0;
  const saved = localStorage.getItem(storageKeys.balance);
  if (saved === null) {
    localStorage.setItem(storageKeys.balance, String(driver.profit));
    return driver.profit;
  }
  return Number(saved);
}
function setBalance(value) { localStorage.setItem(storageKeys.balance, String(Math.max(0, Number(value || 0)))); }
function getGarage() {
  const driver = currentDriver();
  const saved = readJSON(storageKeys.garage, null);
  if (saved && Array.isArray(saved)) return saved;
  const base = driver ? driver.garage.map(id => ({ ...byId(id, data.garageTemplates), ownedId: cryptoId() })) : [];
  writeJSON(storageKeys.garage, base);
  return base;
}
function setGarage(items) { writeJSON(storageKeys.garage, items); }
function getTransactions() {
  const saved = readJSON(storageKeys.transactions, null);
  if (saved) return saved;
  const initial = [
    { date: '2026-05-23', type: 'Bônus', description: 'Entrega registrada em até 24h', amount: 460 },
    { date: '2026-05-19', type: 'Compra', description: 'Kit Farol Vermelho', amount: -8500 },
    { date: '2026-05-16', type: 'Entrega', description: 'Belo Horizonte → Santos', amount: 9200 }
  ];
  writeJSON(storageKeys.transactions, initial);
  return initial;
}
function addTransaction(type, description, amount) {
  const transactions = getTransactions();
  transactions.unshift({ date: new Date().toISOString().slice(0, 10), type, description, amount });
  writeJSON(storageKeys.transactions, transactions);
}
function cryptoId() { return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`; }
function progressBar(value) { return `<div class="progress"><span style="width:${Math.max(0, Math.min(100, value))}%"></span></div>`; }
function avatar(name) { return `<span class="avatar" aria-hidden="true">${initials(name)}</span>`; }
function escapeHTML(value = '') { return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char])); }

function normalizeText(value = '') { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function findDriverIdByName(name = '') {
  const clean = normalizeText(name);
  const driver = data.drivers.find(item => normalizeText(item.name) === clean) || data.drivers.find(item => clean && normalizeText(item.name).includes(clean));
  return driver?.id || 'd1';
}
function discordAsDeliveries() {
  return (state.discordDeliveries || []).map(item => ({
    id: item.id,
    driverId: findDriverIdByName(item.driverName),
    origin: item.origin,
    destination: item.destination,
    cargo: item.cargo,
    km: Number(item.km || 0),
    value: Number(item.value || 0),
    date: item.date || new Date().toISOString().slice(0, 10),
    source: 'Discord/VTLog'
  }));
}
function vtlogApiAsDeliveries() {
  return (state.vtlogDeliveries || []).map(item => ({
    id: item.id,
    driverId: findDriverIdByName(item.driverName),
    origin: item.origin,
    destination: item.destination,
    cargo: item.cargo,
    km: Number(item.km || 0),
    value: Number(item.value || item.profit || 0),
    date: item.date || new Date().toISOString().slice(0, 10),
    source: 'VTLog API'
  }));
}
function allDeliveries() { return [...data.deliveries, ...readJSON(storageKeys.deliveries, []), ...discordAsDeliveries(), ...vtlogApiAsDeliveries()]; }
function fiscalNotes() {
  return allDeliveries().map((delivery, index) => {
    const driver = byId(delivery.driverId);
    const icms = Math.round(delivery.value * 0.12);
    const bonusFill = Math.round(delivery.value * 0.05);
    return { id: `nf${index + 1}`, number: `NFE-${String(2026000 + index + 1)}`, date: delivery.date, driverId: delivery.driverId, driverName: driver?.name || 'Motorista', value: delivery.value, icms, bonus: bonusFill, status: 'Emitida' };
  });
}

function showModal(html) {
  $('#modalContent').innerHTML = html;
  $('#modalBackdrop').classList.add('active');
  $('#modalBackdrop').setAttribute('aria-hidden', 'false');
}
function closeModal() {
  $('#modalBackdrop').classList.remove('active');
  $('#modalBackdrop').setAttribute('aria-hidden', 'true');
  $('#modalContent').innerHTML = '';
}
function alertModal(title, message) { showModal(`<h2 id="modalTitle">${title}</h2><p>${message}</p><div class="modal-actions"><button class="btn primary" type="button" data-close-modal>Entendi</button></div>`); }

function showStationsModal() {
  const rows = data.stations.map(station => `<article class="mini-card"><strong>${station.name}</strong><p>${station.city}</p><p>Diesel: ${station.diesel}</p><p>Contrato: ${station.contract}</p></article>`).join('');
  showModal(`<h2 id="modalTitle">Postos de Combustível</h2><p>Postos cadastrados para abastecimento da frota virtual.</p><div class="mini-card-list">${rows}</div><div class="modal-actions"><button class="btn primary" type="button" data-close-modal>Fechar</button></div>`);
}

function showPanelTab(tab) {
  state.currentTab = tab || 'overview';
  $$('#panelTabs [data-tab]').forEach(button => button.classList.toggle('active', button.dataset.tab === state.currentTab));
  $$('.tab-content').forEach(content => content.classList.toggle('active', content.id === `tab-${state.currentTab}`));
}

function switchView(view) {
  state.currentView = view;
  $$('.view').forEach(section => section.classList.toggle('active-view', section.id === view));
  $$('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  $('.main-nav')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (view === 'painel') renderPanel();
  if (view === 'discord') { refreshDiscordIntegration(); refreshVtlogApiIntegration(); }
}

function updateAuthMenu() {
  const driver = currentDriver();
  const nav = $('.main-nav');
  const authButton = nav?.querySelector('[data-auth-action="login"], [data-auth-action="logout"]');
  if (!authButton || !nav) return;
  if (driver) {
    authButton.textContent = 'Sair';
    authButton.dataset.authAction = 'logout';
    if (!nav.querySelector('[data-auth-action="panel"]')) {
      const panelButton = document.createElement('button');
      panelButton.type = 'button';
      panelButton.dataset.authAction = 'panel';
      panelButton.textContent = 'Meu Painel';
      nav.insertBefore(panelButton, authButton);
    }
  } else {
    authButton.textContent = 'Entrar';
    authButton.dataset.authAction = 'login';
    nav.querySelectorAll('[data-auth-action="panel"]').forEach(button => button.remove());
  }
}

function renderCompany() {
  const totals = {
    drivers: data.drivers.length,
    deliveries: allDeliveries().length + data.drivers.reduce((sum, driver) => sum + driver.deliveries, 0),
    profit: data.drivers.reduce((sum, driver) => sum + driver.profit, 0) + allDeliveries().reduce((sum, item) => sum + item.value, 0),
    years: new Date().getFullYear() - data.company.foundedYear
  };
  $('#companyStats').innerHTML = [
    ['Motoristas', totals.drivers],
    ['Fretes realizados', formatNumber(totals.deliveries)],
    ['Lucro total', coins(totals.profit)],
    ['Anos de história', totals.years]
  ].map(([label, value]) => `<article class="stat-card"><strong>${value}</strong><span>${label}</span></article>`).join('');
  $('#basesGrid').innerHTML = data.bases.map(base => `<article class="info-card"><span class="badge">${base.status}</span><h3>${base.city}</h3><p>${base.type}</p><p>${base.staff} colaboradores virtuais ativos.</p></article>`).join('');
  $('#partnersGrid').innerHTML = data.partners.map(partner => `<article class="mini-card"><strong>${partner.name}</strong><p>${partner.type}</p><p>${partner.description}</p></article>`).join('');
  $('#streamersGrid').innerHTML = data.streamers.map(streamer => `<article class="mini-card"><strong>${streamer.name}</strong><p>${streamer.platform}</p><p>${streamer.specialty}</p></article>`).join('');
}

function sortedDrivers() {
  const metric = $('#rankingSort')?.value || 'profit';
  return [...data.drivers].sort((a, b) => Number(b[metric]) - Number(a[metric]));
}
function renderCommunity() {
  $('#rankingBody').innerHTML = sortedDrivers().map((driver, index) => `<tr><td>${index + 1}</td><td>${avatar(driver.name)}</td><td><strong>${driver.name}</strong><br><small>${driver.role}</small></td><td>${formatNumber(driver.deliveries)}</td><td>${formatNumber(driver.km)} km</td><td>${coins(driver.profit)}</td><td><button class="btn primary" type="button" data-profile="${driver.id}">Ver</button></td></tr>`).join('');
  $('#hallGrid').innerHTML = [...data.drivers].sort((a, b) => b.profit - a.profit).slice(0, 4).map((driver, index) => `<article class="driver-card"><span class="badge">${index + 1}º Lugar</span><div class="profile-row">${avatar(driver.name)}<div><h3>${driver.name}</h3><p>${driver.role}</p></div></div><p>Conquista: ${index === 0 ? 'Maior lucro histórico' : index === 1 ? 'Recorde de KM' : index === 2 ? 'Excelência semanal' : 'Presença em comboios'}</p><p>Período: 2025/2026</p></article>`).join('');
  $('#weeklyBody').innerHTML = [...data.drivers].sort((a, b) => b.weekly.profit - a.weekly.profit).map(driver => `<tr><td>${avatar(driver.name)}</td><td>${driver.name}</td><td>${driver.weekly.deliveries}</td><td>${formatNumber(driver.weekly.km)} km</td><td>${coins(driver.weekly.profit)}</td></tr>`).join('');
  renderHistory();
  renderFeed();
}
function renderHistoryOptions() {
  const years = [...new Set(data.history.map(item => item.year))].sort().reverse();
  const months = [...new Set(data.history.map(item => item.month))].sort().reverse();
  $('#historyYear').innerHTML = years.map(year => `<option value="${year}">${year}</option>`).join('');
  $('#historyMonth').innerHTML = months.map(month => `<option value="${month}">${month}</option>`).join('');
}
function renderHistory() {
  const year = $('#historyYear')?.value || '2026';
  const month = $('#historyMonth')?.value || '05';
  const rows = data.history.filter(item => item.year === year && item.month === month);
  $('#historyBody').innerHTML = (rows.length ? rows : data.history.slice(0, 5)).map(item => `<tr><td>${byId(item.driverId)?.name || '-'}</td><td>${item.month}/${item.year}</td><td>${item.deliveries}</td><td>${formatNumber(item.km)} km</td><td>${coins(item.profit)}</td></tr>`).join('');
}
function renderFeed() {
  const mode = $('#feedSort')?.value || 'recent';
  const sorted = [...allDeliveries()].sort((a, b) => mode === 'profit' ? b.value - a.value : mode === 'km' ? b.km - a.km : new Date(b.date) - new Date(a.date));
  $('#feedGrid').innerHTML = sorted.map(delivery => { const driver = byId(delivery.driverId); return `<article class="info-card"><span class="badge">${dateBR(delivery.date)}</span><h3>${driver?.name || 'Motorista'}</h3><p class="feed-route">${delivery.origin} → ${delivery.destination}</p><p>Carga: ${delivery.cargo}</p><p>${formatNumber(delivery.km)} km • ${coins(delivery.value)}</p></article>`; }).join('');
}

function renderOperational() {
  const onlyLow = $('#lowFleetOnly')?.checked;
  const fleet = data.fleet.filter(item => !onlyLow || item.condition < 30);
  $('#fleetGrid').innerHTML = fleet.map(item => `<article class="fleet-card ${item.condition < 30 ? 'low-status' : ''}"><img src="${item.image}" alt="${item.model}"><span class="badge">${item.plate}</span><h3>${item.model}</h3><p>Motorista: ${byId(item.driverId)?.name || '-'}</p><p>Conservação: ${item.condition}%</p>${progressBar(item.condition)}</article>`).join('');
  $('#workshopsGrid').innerHTML = data.workshops.map(item => `<article class="info-card"><span class="badge ${item.status === 'Ocupada' ? 'muted' : ''}">${item.status}</span><h3>${item.name}</h3><p>${item.city}</p><p>Especialidade: ${item.specialty}</p></article>`).join('');
  $('#fuelBody').innerHTML = data.fuel.map(item => `<tr><td>${dateBR(item.date)}</td><td>${item.type}</td><td>${item.details}</td><td>${formatNumber(item.liters)} L</td><td>${item.branch}</td></tr>`).join('');
  $('#tanksGrid').innerHTML = data.tanks.map(tank => `<article class="info-card ${tank.level < 20 ? 'low-status' : ''}"><span class="badge">${tank.branch}</span><h3>${tank.level}%</h3><p>${tank.level < 20 ? 'Alerta: nível abaixo de 20%.' : 'Reservatório dentro do nível operacional.'}</p><div class="tank-bar"><span style="width:${tank.level}%"></span></div></article>`).join('');
  renderFiscal();
}
function renderFiscal() {
  const notes = fiscalNotes();
  const totalIcms = notes.reduce((sum, note) => sum + note.icms, 0);
  const totalBonus = notes.reduce((sum, note) => sum + note.bonus, 0);
  $('#fiscalStats').innerHTML = [
    ['Total de Notas Emitidas', notes.length],
    ['ICMS Pago total', money(totalIcms)],
    ['Bônus por preenchimento', money(totalBonus)],
    ['Bônus por agilidade', money(Math.round(totalBonus * 0.72))]
  ].map(([label, value]) => `<article class="stat-card"><strong>${value}</strong><span>${label}</span></article>`).join('');
  $('#fiscalBody').innerHTML = notes.map(note => `<tr><td>${note.number}</td><td>${dateBR(note.date)}</td><td>${note.driverName}</td><td>${money(note.value)}</td><td>${money(note.icms)}</td><td>${money(note.bonus)}</td><td>${note.status}</td></tr>`).join('');
}

function storeItems() {
  let items = [...data.products];
  const category = $('#storeCategory')?.value || 'all';
  const sort = $('#storeSort')?.value || 'az';
  if (category !== 'all') items = items.filter(item => item.category === category);
  if (sort === 'high') items.sort((a, b) => b.price - a.price);
  if (sort === 'low') items.sort((a, b) => a.price - b.price);
  if (sort === 'az') items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}
function renderStore() {
  $('#storeGrid').innerHTML = storeItems().map(item => `<article class="product-card"><img src="${item.image}" alt="${item.name}"><span class="badge">${item.category}</span><h3>${item.name}</h3><p>${item.description}</p><p><strong>${coins(item.price)}</strong></p><button class="btn primary full" type="button" data-buy="${item.id}">Comprar</button></article>`).join('');
  renderMarket();
  renderGarageSelect();
}
function allMarketAds() { return [...data.market, ...readJSON(storageKeys.market, [])]; }
function renderMarket() {
  const sort = $('#marketSort')?.value || 'recent';
  const ads = allMarketAds().sort((a, b) => sort === 'high' ? b.price - a.price : sort === 'low' ? a.price - b.price : new Date(b.date) - new Date(a.date));
  $('#marketGrid').innerHTML = ads.map(ad => `<article class="market-card"><img src="${ad.image || asset('products.jpg')}" alt="${ad.name}"><span class="badge">${ad.category}</span><h3>${ad.name}</h3><p>Vendedor: ${ad.seller}</p><p>Cor: ${ad.color} • KM: ${formatNumber(ad.km)}</p><p>Financiamento: ${ad.financing === 'sim' ? `até ${ad.parcels}x` : 'não disponível'}</p><p><strong>${coins(ad.price)}</strong></p><button class="btn ghost full" type="button" data-market-buy="${ad.id}">Comprar usado</button></article>`).join('');
}
function renderGarageSelect() {
  const select = $('#garageItemSelect');
  if (!select) return;
  const garage = currentDriver() ? getGarage() : [];
  select.innerHTML = garage.length ? garage.map(item => `<option value="${item.ownedId}">${item.name}</option>`).join('') : '<option value="">Faça login para carregar</option>';
}
function confirmProductPurchase(product) {
  const balance = getBalance();
  showModal(`<h2 id="modalTitle">Confirmar Compra</h2><p>Item: <strong>${product.name}</strong></p><p>Preço: <strong>${coins(product.price)}</strong></p><p>Seu saldo: <strong>${coins(balance)}</strong></p><div class="modal-actions"><button class="btn ghost" type="button" data-close-modal>Cancelar</button><button class="btn primary" type="button" data-confirm-buy="${product.id}">Confirmar</button></div>`);
}
function completePurchase(product) {
  if (!currentDriver()) return alertModal('Login necessário', 'Entre como motorista para comprar itens da loja.');
  const balance = getBalance();
  if (balance < product.price) return alertModal('Saldo insuficiente', `Você precisa de ${coins(product.price)} para comprar este item.`);
  setBalance(balance - product.price);
  const garage = getGarage();
  garage.push({ id: product.id, ownedId: cryptoId(), type: product.category, name: product.name, km: product.km, condition: product.condition, image: product.image });
  setGarage(garage);
  addTransaction('Compra', product.name, -product.price);
  closeModal();
  alertModal('Compra realizada', `${product.name} foi adicionado à sua garagem.`);
  renderAll();
}

function renderGallery() {
  $('#galleryGrid').innerHTML = galleryImages.map((image, index) => `<article class="gallery-item"><button type="button" data-gallery="${index}"><img src="${image}" alt="Galeria Aliança ${index + 1}"></button></article>`).join('');
}
function openGallery(index) {
  state.galleryIndex = index;
  showModal(`<h2 id="modalTitle">Galeria Aliança</h2><img src="${galleryImages[index]}" alt="Imagem da galeria" style="width:100%;border-radius:16px;border:1px solid var(--cor-borda);"><div class="modal-actions"><button class="btn ghost" type="button" data-gallery-prev>Anterior</button><button class="btn ghost" type="button" data-gallery-next>Próximo</button><button class="btn primary" type="button" data-close-modal>Fechar</button></div>`);
}

function renderConvoys() {
  $('#convoysGrid').innerHTML = data.convoys.map(convoy => `<article class="info-card"><span class="badge">${dateBR(convoy.date)} • ${convoy.time}</span><h3>${convoy.title}</h3><p>${convoy.route}</p><p>Vagas disponíveis: <strong>${convoy.slots}</strong></p><button class="btn primary full" type="button" data-join-convoy="${convoy.id}">Participar</button></article>`).join('');
  $('#eventsGrid').innerHTML = data.events.map(event => `<article class="info-card"><span class="badge">Prazo ${dateBR(event.deadline)}</span><h3>${event.name}</h3><p>${event.description}</p><p>Recompensa: <strong>${coins(event.reward)}</strong></p>${progressBar(event.progress)}<p>${event.progress}% concluído</p></article>`).join('');
}
function joinConvoy(id) {
  if (!currentDriver()) return alertModal('Login necessário', 'Entre como motorista para participar de um comboio.');
  const convoy = data.convoys.find(item => item.id === id);
  if (state.convoysJoined.has(id)) return alertModal('Participação registrada', 'Você já está inscrito neste comboio.');
  if (convoy.slots <= 0) return alertModal('Sem vagas', 'Este comboio não possui vagas disponíveis.');
  convoy.slots -= 1;
  state.convoysJoined.add(id);
  addTransaction('Bônus previsto', `Inscrição no comboio ${convoy.title}`, 0);
  renderConvoys();
  alertModal('Inscrição confirmada', `Você entrou no comboio ${convoy.title}.`);
}

function renderMural() {
  $('#muralGrid').innerHTML = data.mural.map(item => `<article class="info-card"><span class="badge">${dateBR(item.date)}</span><h3>${item.title}</h3><p>${item.body}</p></article>`).join('');
  $('#faqList').innerHTML = data.faqs.map(([question, answer]) => `<article class="accordion-item"><button type="button" data-accordion><span>${question}</span><strong>+</strong></button><p>${answer}</p></article>`).join('');
}


function renderDiscord() {
  const stats = $('#discordStats');
  const body = $('#discordDeliveriesBody');
  const apiStats = $('#vtlogApiStats');
  const apiBody = $('#vtlogApiDeliveriesBody');
  if (!stats || !body) return;

  const status = state.discordStatus || {};
  const rows = state.discordDeliveries || [];
  stats.innerHTML = [
    ['Bot configurado', status.botTokenConfigured ? 'Sim' : 'Pendente'],
    ['Canal VTLog', status.vtlogChannelId || 'Não definido'],
    ['Canal de alertas', status.alertChannelId || 'Não definido'],
    ['Importações Discord', rows.length]
  ].map(([label, value]) => `<article class="stat-card"><strong>${escapeHTML(value)}</strong><span>${label}</span></article>`).join('');

  if (state.discordError) {
    body.innerHTML = `<tr><td colspan="8"><strong class="danger-text">${escapeHTML(state.discordError)}</strong></td></tr>`;
  } else if (!rows.length) {
    body.innerHTML = '<tr><td colspan="8">Nenhuma entrega importada pelo Discord ainda. Ligue o bot e cole uma mensagem no canal VTLog.</td></tr>';
  } else {
    body.innerHTML = rows.map(item => `<tr><td>${dateBR(item.date)}</td><td>${escapeHTML(item.driverName)}</td><td>${escapeHTML(item.origin)} → ${escapeHTML(item.destination)}</td><td>${escapeHTML(item.truck || '-')}</td><td>${escapeHTML(item.cargo)}</td><td>${formatNumber(item.km)} km</td><td>${coins(item.value)}</td><td>${escapeHTML(item.status)}</td></tr>`).join('');
  }

  if (!apiStats || !apiBody) return;
  const vtlogStatus = state.vtlogStatus || {};
  const summary = vtlogStatus.summary || {};
  const apiRows = state.vtlogDeliveries || [];
  const webhook = vtlogStatus.webhook || {};
  apiStats.innerHTML = [
    ['Modo', vtlogStatus.mode === 'personal' ? 'Perfil pessoal' : 'Empresa/VTC'],
    ['Steam ID', vtlogStatus.steamId || 'Não definido'],
    ['Token API', vtlogStatus.tokenConfigured ? 'Configurado' : (vtlogStatus.mode === 'personal' ? 'Não necessário' : 'Pendente')],
    ['VTC ID', vtlogStatus.vtcId || (vtlogStatus.mode === 'personal' ? 'Não usado' : 'Não definido')],
    ['Webhook', webhook.enabled ? 'Ativo' : 'Inativo'],
    ['Jobs via Webhook', webhook.deliveriesCount ?? 0],
    ['Última sync', vtlogStatus.lastSyncAt ? new Date(vtlogStatus.lastSyncAt).toLocaleString('pt-BR') : 'Nunca'],
    ['Jobs API', summary.jobs ?? apiRows.length ?? 0],
    ['Motoristas', summary.members ?? 0],
    ['Frota', summary.trucks ?? 0],
    ['Lucro API', coins(summary.profit || 0)],
    ['KM API', `${formatNumber(summary.distance || 0)} km`]
  ].map(([label, value]) => `<article class="stat-card"><strong>${escapeHTML(value)}</strong><span>${label}</span></article>`).join('');

  if (state.vtlogSyncing) {
    apiBody.innerHTML = '<tr><td colspan="10">Sincronizando com a API do VTLog...</td></tr>';
  } else if (state.vtlogError) {
    apiBody.innerHTML = `<tr><td colspan="10"><strong class="danger-text">${escapeHTML(state.vtlogError)}</strong></td></tr>`;
  } else if (!apiRows.length) {
    apiBody.innerHTML = '<tr><td colspan="10">Nenhum job da API importado ainda. Para teste pessoal, configure VTLOG_MODE=personal e VTLOG_STEAM_ID no .env e clique em “Sincronizar VTLog API”</td></tr>';
  } else {
    apiBody.innerHTML = apiRows.map(item => `<tr><td>${escapeHTML(item.jobId || '-')}</td><td>${dateBR(item.date)}</td><td>${escapeHTML(item.driverName)}</td><td>${escapeHTML(item.origin)} → ${escapeHTML(item.destination)}</td><td>${escapeHTML(item.truck || '-')}</td><td>${escapeHTML(item.cargo)}</td><td>${formatNumber(item.km)} km</td><td>${coins(item.profit || item.value || 0)}</td><td>${escapeHTML(item.board || '-')}</td><td>${escapeHTML(item.status)}</td></tr>`).join('');
  }
}

async function refreshDiscordIntegration() {
  try {
    const [statusResponse, deliveriesResponse] = await Promise.all([
      fetch('/api/discord/status'),
      fetch('/api/discord/entregas')
    ]);
    if (!statusResponse.ok || !deliveriesResponse.ok) throw new Error('Não consegui acessar a API Discord/VTLog do site.');
    state.discordStatus = await statusResponse.json();
    const deliveriesPayload = await deliveriesResponse.json();
    state.discordDeliveries = Array.isArray(deliveriesPayload.deliveries) ? deliveriesPayload.deliveries : [];
    state.discordError = '';
  } catch (error) {
    state.discordError = 'A integração Discord ainda não está disponível. Rode o projeto com npm run dev ou confira o servidor local.';
    state.discordDeliveries = [];
  }
  renderDiscord();
  renderCompany();
  renderCommunity();
  renderOperational();
}

async function refreshVtlogApiIntegration() {
  try {
    const [statusResponse, deliveriesResponse] = await Promise.all([
      fetch('/api/vtlog/status'),
      fetch('/api/vtlog/entregas')
    ]);
    if (!statusResponse.ok || !deliveriesResponse.ok) throw new Error('Não consegui acessar a API VTLog do site.');
    state.vtlogStatus = await statusResponse.json();
    const deliveriesPayload = await deliveriesResponse.json();
    state.vtlogDeliveries = Array.isArray(deliveriesPayload.deliveries) ? deliveriesPayload.deliveries : [];
    state.vtlogError = deliveriesPayload.error || state.vtlogStatus.error || '';
  } catch (error) {
    state.vtlogError = 'A integração direta com a API VTLog ainda não está disponível. Para teste pessoal, confira VTLOG_MODE=personal e VTLOG_STEAM_ID no .env. Para empresa, confira VTLOG_API_TOKEN e VTLOG_VTC_ID.';
    state.vtlogDeliveries = [];
  }
  renderDiscord();
  renderCompany();
  renderCommunity();
  renderOperational();
}

async function syncVtlogApi() {
  state.vtlogSyncing = true;
  state.vtlogError = '';
  renderDiscord();
  try {
    const response = await fetch('/api/vtlog/sincronizar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit: 25 }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.error || 'Falha ao sincronizar com a API VTLog.');
    state.vtlogDeliveries = Array.isArray(payload.deliveries) ? payload.deliveries : [];
    await refreshVtlogApiIntegration();
    alertModal('VTLog sincronizado', `Foram carregados ${state.vtlogDeliveries.length} jobs da API do VTLog.`);
  } catch (error) {
    state.vtlogError = error.message || 'Falha ao sincronizar VTLog API.';
    await refreshVtlogApiIntegration();
    alertModal('Erro na API VTLog', state.vtlogError);
  } finally {
    state.vtlogSyncing = false;
    renderDiscord();
  }
}

function copyDiscordExample() {
  navigator.clipboard?.writeText(discordExampleMessage).then(
    () => alertModal('Mensagem copiada', 'Cole essa mensagem no canal VTLog do seu Discord para testar a importação.'),
    () => showModal(`<h2 id="modalTitle">Mensagem de teste</h2><pre class="copy-box">${escapeHTML(discordExampleMessage)}</pre><div class="modal-actions"><button class="btn primary" type="button" data-close-modal>Fechar</button></div>`)
  );
}

function renderRecruitment() {
  const area = $('#recruitmentArea');
  if (!state.recruitmentOpen) {
    area.innerHTML = `<article class="panel-card"><span class="badge">Fechado</span><h2>Recrutamento temporariamente fechado</h2><p>Previsão de reabertura: 15/06/2026.</p></article>`;
    return;
  }
  area.innerHTML = `<form class="form-panel" id="recruitForm"><span class="badge">Aberto</span><h2>Formulário de Recrutamento</h2><div class="step-indicator"><span class="active"></span><span></span><span></span></div><div class="recruit-step active"><label>Nome completo<input name="name" required placeholder="Seu nome"></label><label>Idade<input type="number" name="age" min="13" required value="18"></label></div><div class="recruit-step"><label>Experiência<textarea name="experience" rows="4" required placeholder="Conte sua experiência em transporte virtual"></textarea></label><label>Veículo principal<input name="vehicle" required placeholder="Ex: Scania R"></label></div><div class="recruit-step"><label>Motivação<textarea name="motivation" rows="4" required placeholder="Por que você quer entrar na Aliança?"></textarea></label></div><div class="modal-actions"><button class="btn ghost hidden" type="button" data-recruit-prev>Voltar</button><button class="btn primary" type="button" data-recruit-next>Próximo</button><button class="btn primary hidden" type="submit" data-recruit-submit>Enviar candidatura</button></div></form>`;
  updateRecruitStep(0);
}
function updateRecruitStep(direction) {
  const form = $('#recruitForm');
  if (!form) return;
  state.recruitmentStep = Math.max(0, Math.min(2, state.recruitmentStep + direction));
  $$('.recruit-step', form).forEach((step, index) => step.classList.toggle('active', index === state.recruitmentStep));
  $$('.step-indicator span', form).forEach((step, index) => step.classList.toggle('active', index <= state.recruitmentStep));
  $('[data-recruit-prev]', form).classList.toggle('hidden', state.recruitmentStep === 0);
  $('[data-recruit-next]', form).classList.toggle('hidden', state.recruitmentStep === 2);
  $('[data-recruit-submit]', form).classList.toggle('hidden', state.recruitmentStep !== 2);
}

function loginModal() {
  showModal(`<h2 id="modalTitle">Entrar no Painel</h2><p>Usuário de teste: <strong>motorista@alianca.com</strong> • Senha: <strong>alianca2024</strong></p><form class="login-form" id="loginForm"><label>Email<input name="email" type="email" required value="motorista@alianca.com"></label><label>Senha<input name="password" type="password" required value="alianca2024"></label><div class="error" id="loginError"></div><button class="btn primary full" type="submit">Entrar</button></form>`);
}
function logout() {
  localStorage.removeItem(storageKeys.auth);
  [storageKeys.balance, storageKeys.garage, storageKeys.transactions, storageKeys.photo].forEach(key => localStorage.removeItem(key));
  updateAuthMenu();
  renderAll();
  alertModal('Sessão encerrada', 'Você saiu do painel do motorista.');
}
function handleLogin(email, password) {
  const driver = data.drivers.find(item => item.email === email && item.password === password);
  if (!driver) return false;
  localStorage.setItem(storageKeys.auth, driver.id);
  getBalance();
  getGarage();
  updateAuthMenu();
  closeModal();
  switchView('painel');
  renderAll();
  return true;
}

function renderPanel() {
  const driver = currentDriver();
  $('#panelGreeting').textContent = driver ? `Olá, ${driver.name}. Este é seu painel individual da Aliança.` : 'Faça login para acessar sua conta.';
  $('#panelGate').innerHTML = driver ? '' : `<article class="panel-card"><h2>Acesso restrito</h2><p>Entre com o usuário de teste para acessar garagem, carreira, finanças e NF-e.</p><button class="btn primary" type="button" data-auth-action="login">Entrar no painel</button></article>`;
  $('#driverPanel').classList.toggle('hidden', !driver);
  if (!driver) return;
  renderOverview(driver);
  renderPanelGarage();
  renderCareer(driver);
  renderFinance();
  renderDriverTax(driver);
  renderWorkshop();
  showPanelTab(state.currentTab);
}
function renderOverview(driver) {
  const photo = localStorage.getItem(storageKeys.photo) || asset('logo.png');
  const rankPosition = [...data.drivers].sort((a, b) => b.profit - a.profit).findIndex(item => item.id === driver.id) + 1;
  $('#tab-overview').innerHTML = `<div class="profile-summary"><article class="profile-photo-card"><img class="profile-photo" src="${photo}" alt="Foto do motorista"><label>Minha Foto de Perfil<input type="file" id="photoInput" accept="image/*"></label><button class="btn primary full" type="button" id="savePhoto">Salvar Foto</button></article><div><div class="dashboard-grid"><article class="stat-card"><strong>${coins(getBalance())}</strong><span>Saldo atual</span></article><article class="stat-card"><strong>${rankPosition}º</strong><span>Posição no ranking</span></article><article class="stat-card"><strong>${driver.weekly.deliveries} entregas</strong><span>Semana atual</span></article></div><form class="form-panel" id="rewardForm"><h3>Resgatar Código de Recompensa</h3><label>Código<input name="code" placeholder="ALI2026"></label><button class="btn primary" type="submit">Resgatar código</button><p id="rewardFeedback"></p></form><button class="btn ghost" type="button" data-profile="${driver.id}">Ver meu perfil público</button></div></div>`;
}
function renderPanelGarage() {
  const garage = getGarage();
  $('#tab-garage').innerHTML = `<div class="section-title"><span>Minha Garagem</span><h2>Veículos e reboques próprios</h2></div><div class="garage-grid">${garage.map(item => `<article class="garage-card ${item.condition < 30 ? 'low-status' : ''}"><img src="${item.image}" alt="${item.name}"><span class="badge">${item.type}</span><h3>${item.name}</h3><p>${formatNumber(item.km)} km • Conservação ${item.condition}%</p>${progressBar(item.condition)}</article>`).join('')}</div>`;
  renderGarageSelect();
}
function renderCareer(driver) {
  const roles = ['Trainee', 'Júnior', 'Pleno', 'Sênior', 'Lenda'];
  const activeIndex = roles.indexOf(driver.career);
  const weeks = [driver.weekly.profit, 28200, 31400, 39600, 25400, 47200];
  $('#tab-career').innerHTML = `<div class="section-title"><span>Carreira e Desempenho</span><h2>Trilha de carreira</h2></div><div class="career-line">${roles.map((role, index) => `<div class="career-step ${index <= activeIndex ? 'active' : ''}"><strong>${role}</strong></div>`).join('')}</div><h3>Gráfico de desempenho semanal</h3><div class="bar-chart">${weeks.map((value, index) => `<div class="chart-row"><span>Sem ${index + 1}</span><div class="bar"><span style="width:${Math.min(100, value / 520)}%"></span></div><span>${coins(value)}</span></div>`).join('')}</div>`;
}
function renderFinance() {
  $('#tab-finance').innerHTML = `<div class="section-title"><span>Mercado e Finanças</span><h2>Histórico de transações</h2></div><div class="transaction-list">${getTransactions().map(item => `<article class="transaction-card"><span class="badge">${dateBR(item.date)}</span><h3>${item.type}</h3><p>${item.description}</p><p><strong>${item.amount >= 0 ? '+' : ''}${coins(item.amount)}</strong></p></article>`).join('')}</div>`;
}
function renderDriverTax(driver) {
  const notes = fiscalNotes().filter(note => note.driverId === driver.id);
  $('#tab-tax').innerHTML = `<div class="section-title"><span>Histórico Fiscal (NF-e)</span><h2>Notas do motorista</h2><p>Documentos fictícios, sem valor legal, apenas para imersão.</p></div><div class="table-wrap"><table><thead><tr><th>Número</th><th>Data</th><th>Valor</th><th>ICMS</th><th>Status</th></tr></thead><tbody>${notes.map(note => `<tr><td>${note.number}</td><td>${dateBR(note.date)}</td><td>${money(note.value)}</td><td>${money(note.icms)}</td><td>${note.status}</td></tr>`).join('') || '<tr><td colspan="5">Nenhuma nota emitida ainda.</td></tr>'}</tbody></table></div>`;
}
function renderWorkshop() {
  const garage = getGarage();
  $('#tab-workshop').innerHTML = `<div class="section-title"><span>Oficina de Restauração</span><h2>Restauração de veículos</h2><p>Veículos abaixo de 30% podem ser restaurados mediante pagamento em ALI Coins.</p></div><div class="garage-grid">${garage.map(item => { const cost = Math.round((100 - item.condition) * 450); return `<article class="garage-card ${item.condition < 30 ? 'low-status' : ''}"><img src="${item.image}" alt="${item.name}"><h3>${item.name}</h3><p>Conservação atual: ${item.condition}%</p>${progressBar(item.condition)}<p>Custo: ${coins(cost)}</p><button class="btn primary full" type="button" data-restore="${item.ownedId}" ${item.condition >= 30 ? 'disabled' : ''}>Restaurar</button></article>`; }).join('')}</div>`;
}
function restoreVehicle(ownedId) {
  const garage = getGarage();
  const item = garage.find(vehicle => vehicle.ownedId === ownedId);
  if (!item) return;
  const cost = Math.round((100 - item.condition) * 450);
  if (getBalance() < cost) return alertModal('Saldo insuficiente', `Você precisa de ${coins(cost)} para restaurar este veículo.`);
  setBalance(getBalance() - cost);
  item.condition = 100;
  addTransaction('Restauração', item.name, -cost);
  setGarage(garage);
  renderAll();
  alertModal('Veículo restaurado', `${item.name} foi restaurado para 100%.`);
}
function redeemCode(code) {
  const codes = { ALI2026: 5000, COMBOIO: 2500, ESTRADA: 1200 };
  const feedback = $('#rewardFeedback');
  const clean = code.trim().toUpperCase();
  const redeemed = readJSON(storageKeys.redeemed, []);
  if (!codes[clean]) { feedback.className = 'error'; feedback.textContent = 'Código inválido.'; return; }
  if (redeemed.includes(clean)) { feedback.className = 'error'; feedback.textContent = 'Este código já foi resgatado.'; return; }
  setBalance(getBalance() + codes[clean]);
  redeemed.push(clean);
  writeJSON(storageKeys.redeemed, redeemed);
  addTransaction('Resgate', `Código ${clean}`, codes[clean]);
  feedback.className = 'success';
  feedback.textContent = `Resgate realizado: +${coins(codes[clean])}.`;
  renderPanel();
}

function showProfile(driverId) {
  const driver = byId(driverId);
  if (!driver) return;
  const rankPosition = [...data.drivers].sort((a, b) => b.profit - a.profit).findIndex(item => item.id === driver.id) + 1;
  const garage = driver.id === currentDriver()?.id ? getGarage() : driver.garage.map(id => byId(id, data.garageTemplates));
  showModal(`<h2 id="modalTitle">Perfil Público</h2><div class="profile-row">${avatar(driver.name)}<div><h3>${driver.name}</h3><p>${driver.role} • Desde ${dateBR(driver.joined)}</p></div></div><div class="dashboard-grid"><article class="stat-card"><strong>${rankPosition}º</strong><span>Ranking</span></article><article class="stat-card"><strong>${coins(driver.id === currentDriver()?.id ? getBalance() : driver.profit)}</strong><span>Saldo total</span></article><article class="stat-card"><strong>${formatNumber(driver.km)} km</strong><span>KM total</span></article></div><p>Total de entregas: <strong>${driver.deliveries}</strong></p><p>Garagem: ${garage.map(item => item?.name).filter(Boolean).join(', ')}</p><p>Trilha de carreira: Trainee → Júnior → Pleno → Sênior → Lenda</p><div class="modal-actions"><button class="btn primary" type="button" data-close-modal>Fechar</button></div>`);
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, [data-gallery]');
    if (!target) return;
    if (target.dataset.view) switchView(target.dataset.view);
    if (target.dataset.authAction === 'login') loginModal();
    if (target.dataset.authAction === 'logout') logout();
    if (target.dataset.authAction === 'panel') { currentDriver() ? switchView('painel') : loginModal(); }
    if (target.dataset.closeModal !== undefined || target.id === 'modalClose') closeModal();
    if (target.dataset.tab) showPanelTab(target.dataset.tab);
    if (target.id === 'openStations') showStationsModal();
    if (target.id === 'refreshDiscord') refreshDiscordIntegration();
    if (target.id === 'refreshVtlogApi') refreshVtlogApiIntegration();
    if (target.id === 'syncVtlogApi') syncVtlogApi();
    if (target.id === 'copyDiscordExample') copyDiscordExample();
    if (target.dataset.profile) showProfile(target.dataset.profile);
    if (target.dataset.buy) { if (!currentDriver()) return alertModal('Login necessário', 'Entre como motorista para comprar.'); confirmProductPurchase(data.products.find(item => item.id === target.dataset.buy)); }
    if (target.dataset.confirmBuy) completePurchase(data.products.find(item => item.id === target.dataset.confirmBuy));
    if (target.dataset.marketBuy) alertModal('Compra no mercado', 'Pedido registrado. Em um sistema real, o vendedor receberia a proposta.');
    if (target.dataset.gallery) openGallery(Number(target.dataset.gallery));
    if (target.dataset.galleryPrev !== undefined) openGallery((state.galleryIndex - 1 + galleryImages.length) % galleryImages.length);
    if (target.dataset.galleryNext !== undefined) openGallery((state.galleryIndex + 1) % galleryImages.length);
    if (target.dataset.joinConvoy) joinConvoy(target.dataset.joinConvoy);
    if (target.dataset.restore) restoreVehicle(target.dataset.restore);
    if (target.dataset.accordion !== undefined) target.closest('.accordion-item').classList.toggle('open');
    if (target.dataset.recruitNext !== undefined) updateRecruitStep(1);
    if (target.dataset.recruitPrev !== undefined) updateRecruitStep(-1);
    if (target.classList.contains('menu-toggle')) { const nav = $('.main-nav'); nav.classList.toggle('open'); target.setAttribute('aria-expanded', nav.classList.contains('open')); }
  });

  document.addEventListener('submit', (event) => {
    if (event.target.id === 'loginForm') {
      event.preventDefault();
      const fd = new FormData(event.target);
      if (!handleLogin(fd.get('email'), fd.get('password'))) $('#loginError').textContent = 'Credenciais inválidas.';
    }
    if (event.target.id === 'deliveryForm') {
      event.preventDefault();
      const driver = currentDriver();
      if (!driver) return alertModal('Login necessário', 'Entre como motorista para registrar entregas.');
      const fd = new FormData(event.target);
      const value = Number(fd.get('value'));
      const km = Number(fd.get('km'));
      const delivery = { id: cryptoId(), driverId: driver.id, origin: fd.get('origin'), destination: fd.get('destination'), cargo: fd.get('cargo'), km, value, date: new Date().toISOString().slice(0, 10) };
      const deliveries = readJSON(storageKeys.deliveries, []);
      deliveries.unshift(delivery);
      writeJSON(storageKeys.deliveries, deliveries);
      setBalance(getBalance() + value + Math.round(value * 0.05));
      addTransaction('Entrega', `${delivery.origin} → ${delivery.destination}`, value);
      addTransaction('Bônus NF-e', 'Preenchimento em até 24h', Math.round(value * 0.05));
      renderAll();
      alertModal('Entrega registrada', 'Entrega, saldo e NF-e fictícia foram atualizados.');
      event.target.reset();
    }
    if (event.target.id === 'marketForm') {
      event.preventDefault();
      if (!currentDriver()) return alertModal('Login necessário', 'Entre para anunciar itens no mercado.');
      const fd = new FormData(event.target);
      const garage = getGarage();
      const item = garage.find(vehicle => vehicle.ownedId === fd.get('garageItem'));
      if (!item) return alertModal('Garagem vazia', 'Nenhum item válido selecionado para anúncio.');
      const ads = readJSON(storageKeys.market, []);
      ads.unshift({ id: cryptoId(), seller: currentDriver().name, category: fd.get('category'), name: item.name, color: fd.get('color'), km: Number(fd.get('km')), price: Number(fd.get('price')), financing: fd.get('financing'), parcels: Number(fd.get('parcels')), image: fd.get('image') || item.image, date: new Date().toISOString().slice(0, 10) });
      writeJSON(storageKeys.market, ads);
      renderMarket();
      alertModal('Anúncio publicado', 'Seu item foi anunciado no mercado de usados.');
      event.target.reset();
    }
    if (event.target.id === 'rewardForm') {
      event.preventDefault();
      redeemCode(new FormData(event.target).get('code'));
    }
    if (event.target.id === 'recruitForm') {
      event.preventDefault();
      alertModal('Candidatura enviada', 'Sua candidatura fictícia foi registrada para análise da diretoria.');
      state.recruitmentStep = 0;
      renderRecruitment();
    }
  });

  document.addEventListener('change', (event) => {
    if (['rankingSort', 'feedSort'].includes(event.target.id)) renderCommunity();
    if (['historyYear', 'historyMonth'].includes(event.target.id)) renderHistory();
    if (['lowFleetOnly'].includes(event.target.id)) renderOperational();
    if (['storeCategory', 'storeSort'].includes(event.target.id)) renderStore();
    if (['marketSort'].includes(event.target.id)) renderMarket();
  });

  document.addEventListener('click', (event) => {
    if (event.target.id === 'savePhoto') {
      const input = $('#photoInput');
      const file = input?.files?.[0];
      if (!file) return alertModal('Foto não selecionada', 'Escolha uma imagem antes de salvar.');
      const reader = new FileReader();
      reader.onload = () => { localStorage.setItem(storageKeys.photo, reader.result); renderPanel(); alertModal('Foto salva', 'Sua foto de perfil foi atualizada.'); };
      reader.readAsDataURL(file);
    }
  });

  $('#modalBackdrop').addEventListener('click', (event) => { if (event.target.id === 'modalBackdrop') closeModal(); });
  $('#printWeekly')?.addEventListener('click', () => window.print());
}

function renderAll() {
  updateAuthMenu();
  renderCompany();
  renderCommunity();
  renderOperational();
  renderStore();
  renderGallery();
  renderConvoys();
  renderMural();
  renderDiscord();
  renderRecruitment();
  renderPanel();
}

function init() {
  renderHistoryOptions();
  bindEvents();
  updateRecruitStep(0);
  renderAll();
  refreshDiscordIntegration();
  refreshVtlogApiIntegration();
}

document.addEventListener('DOMContentLoaded', init);
