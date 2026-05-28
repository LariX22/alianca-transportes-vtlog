const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'public/js/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');

const requiredHtml = [
  'A Empresa', 'Comunidade', 'Operacional', 'Loja', 'Galeria', 'Próximo Comboio', 'Mural da Empresa', 'Recrutamento', 'Painel do Motorista',
  'rankingBody', 'storeGrid', 'garageItemSelect', 'fiscalBody', 'driverPanel', 'recruitmentArea'
];
const requiredJs = [
  'motorista@alianca.com', 'alianca2024', 'localStorage', 'ALI Coins', 'renderPanel', 'renderStore', 'renderOperational', 'renderCommunity', 'renderRecruitment', 'fiscalNotes'
];
const requiredCss = ['--cor-primaria: #CC0000', '--cor-fundo: #0A0A0A', '--cor-texto: #FFFFFF', 'font-family: \'Oswald\'', 'font-family: \'Roboto\''];

for (const token of requiredHtml) {
  if (!html.includes(token)) throw new Error(`HTML não contém: ${token}`);
}
for (const token of requiredJs) {
  if (!js.includes(token)) throw new Error(`JS não contém: ${token}`);
}
for (const token of requiredCss) {
  if (!css.includes(token)) throw new Error(`CSS não contém: ${token}`);
}

const driverMatches = js.match(/name: '[^']+'/g) || [];
if (driverMatches.length < 10) throw new Error('Dados mockados insuficientes de motoristas.');

console.log('Smoke test OK: estrutura, módulos, login, localStorage e dados mockados encontrados.');
