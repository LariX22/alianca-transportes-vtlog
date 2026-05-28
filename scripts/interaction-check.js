const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'public', 'js', 'app.js'), 'utf8');

const checks = [
  ['abas do painel existem no HTML', html.includes('data-tab="garage"') && html.includes('id="panelTabs"')],
  ['handler de abas do painel existe no JS', js.includes('function showPanelTab') && js.includes('target.dataset.tab')],
  ['botão Consultar Postos existe no HTML', html.includes('id="openStations"')],
  ['modal de postos existe no JS', js.includes('function showStationsModal') && js.includes("target.id === 'openStations'")],
  ['menu cria Meu Painel dentro da navegação', js.includes("nav.querySelector('[data-auth-action=\"panel\"]')") && js.includes("nav.insertBefore(panelButton, authButton)")],
  ['compra da loja abre confirmação', js.includes('function confirmProductPurchase') && js.includes('data-confirm-buy')],
  ['comboio exige login', js.includes('function joinConvoy') && js.includes('Login necessário')],
  ['recrutamento multi-etapas funciona', js.includes('function updateRecruitStep') && js.includes('data-recruit-next')]
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error('Interaction check FAILED:');
  failed.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}
console.log('Interaction check OK: handlers principais encontrados.');
