const assert = require('assert');
const { parseVTLogMessage, extractMessageText } = require('../src/discordBot');

const sample = `Euro Truck Simulator 2 • Job #2263100
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

const parsed = parseVTLogMessage(sample);
assert(parsed, 'Parser deve retornar uma entrega');
assert.strictEqual(parsed.driverName, 'LarissaR27');
assert.strictEqual(parsed.status, 'Entregue');
assert.strictEqual(parsed.board, 'Arcade');
assert.strictEqual(parsed.origin, 'Conselheiro Lafaiete');
assert.strictEqual(parsed.destination, 'Pirai');
assert.strictEqual(parsed.truck, 'Mercedes-Benz Ls-1938');
assert.strictEqual(parsed.cargo, 'Vasilhames Vazios');
assert.strictEqual(parsed.km, 1265);
assert.strictEqual(parsed.fuelLiters, 227);
assert.strictEqual(parsed.value, 1495);
assert.strictEqual(parsed.income, 4943);
assert.strictEqual(parsed.expense, 3448);
assert.strictEqual(parsed.date, '2026-04-09');
assert.strictEqual(parsed.jobNumber, '2263100');
assert.strictEqual(parsed.steamId, '76561198943363609');


const forwardedMessageMock = {
  content: '',
  cleanContent: '',
  embeds: [],
  attachments: new Map(),
  messageSnapshots: new Map([
    ['snapshot_1', {
      message: {
        content: '',
        embeds: [{
          title: 'Euro Truck Simulator 2 • Job #2348776',
          description: 'Drive time: 01:25:57 with average speed: 54 Km/h\nDrive Time limited from 01:29:31 to 01:28:12\nUnverified mods detected',
          fields: [
            { name: '👷 Driver', value: 'LarissaR27' },
            { name: '📋 Status', value: 'Cancelled' },
            { name: '🏆 Board', value: 'Realistic' },
            { name: '🗺️ Source', value: 'Votuporanga' },
            { name: '🏁 Destination', value: 'Santo A. da Barra' },
            { name: '⏰ Drive Time', value: '01:28:12' },
            { name: '🚚 Truck', value: 'Scania Série 5 Streamline' },
            { name: '📦 Cargo', value: 'Fluido de Freio' },
            { name: '🏋️ Weight', value: '5316 KG' },
            { name: '↔️ Distance', value: '1470 KM' },
            { name: '⛽ Fuel', value: '373 L' },
            { name: '🌐 Fuel Economy', value: '25.4 L/100KM' },
            { name: '🛠️ Truck Damage', value: '13.0%' },
            { name: '🛠️ Trailers Damage', value: '2.8%' },
            { name: '🛠️ Cargo Damage', value: '0.0%' },
            { name: '📥 Income', value: 'ƒ 0' },
            { name: '📤 Expense', value: 'ƒ 1193' },
            { name: '🪙 Profit', value: 'ƒ -1193' }
          ],
          footer: { text: 'VTLog.net • You drive, we log! • 76561198943363609 • 21/05/2026, 22:36' }
        }],
        attachments: []
      }
    }]
  ])
};

const forwardedText = extractMessageText(forwardedMessageMock);
const parsedForwarded = parseVTLogMessage(forwardedText);
assert(parsedForwarded, 'Parser deve interpretar mensagem encaminhada com snapshot');
assert.strictEqual(parsedForwarded.driverName, 'LarissaR27');
assert.strictEqual(parsedForwarded.status, 'Cancelada');
assert.strictEqual(parsedForwarded.origin, 'Votuporanga');
assert.strictEqual(parsedForwarded.destination, 'Santo A. da Barra');
assert.strictEqual(parsedForwarded.truck, 'Scania Série 5 Streamline');
assert.strictEqual(parsedForwarded.cargo, 'Fluido de Freio');
assert.strictEqual(parsedForwarded.km, 1470);
assert.strictEqual(parsedForwarded.value, -1193);
assert.strictEqual(parsedForwarded.jobNumber, '2348776');
assert.strictEqual(parsedForwarded.steamId, '76561198943363609');

console.log('Parser VTLog real passou.');
