const fs = require('fs');
const path = require('path');
const css = fs.readFileSync(path.join(__dirname, '..', 'public/css/style.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'public/index.html'), 'utf8');

const requiredVars = [
  '--cor-primaria: #CC0000',
  '--cor-primaria-escura: #990000',
  '--cor-primaria-clara: #FF3333',
  '--cor-fundo: #0A0A0A',
  '--cor-fundo-card: #141414',
  '--cor-fundo-alt: #1A1A1A',
  '--cor-texto: #FFFFFF',
  '--cor-texto-muted: #AAAAAA',
  '--cor-borda: #2A2A2A',
  '--cor-borda-vermelho: #CC0000'
];
for (const variable of requiredVars) {
  if (!css.includes(variable)) throw new Error(`Variável obrigatória ausente: ${variable}`);
}
if (!html.includes('Oswald') || !html.includes('Roboto')) throw new Error('Fontes Oswald/Roboto não configuradas no HTML.');
console.log('Style test OK: paleta e tipografia obrigatórias encontradas.');
