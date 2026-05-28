# Aliança Transportes LTDA — Plataforma com VTLog API + Discord

Sistema web da Aliança Transportes LTDA com site institucional, painel do motorista, ranking, loja, garagem, NF-e fictícia, frota, combustível, mural, recrutamento e integrações externas.

## Integrações disponíveis

### 1. VTLog API direta — recomendado
A integração principal agora usa a API oficial do VTLog:

- `GET /v2/vtc/{vtc_id}`
- `GET /v2/vtc/{vtc_id}/jobs`
- `GET /v2/vtc/{vtc_id}/members`
- `GET /v2/vtc/{vtc_id}/stats`
- `GET /v2/vtc/{vtc_id}/trucks`
- `GET /v2/vtc/{vtc_id}/garages`
- `GET /v2/vtc/{vtc_id}/jobs/ongoing`

Os dados são salvos localmente em:

```txt
data/vtlog-api-cache.json
```

### 2. Discord/VTLog — fallback
O bot Discord continua funcionando como apoio para ler mensagens de entrega enviadas em um canal.

## Como configurar

Abra o arquivo `.env` na raiz do projeto e preencha:

```env
VTLOG_API_URL=https://api.vtlog.net
VTLOG_API_TOKEN=SEU_TOKEN_DA_API_VTLOG
VTLOG_VTC_ID=ID_NUMERICO_DA_SUA_VTC
VTLOG_GAME=ETS2
VTLOG_JOBS_LIMIT=25
```

Para Discord, preencha também:

```env
DISCORD_BOT_TOKEN=SEU_TOKEN_DO_BOT
DISCORD_VTLOG_CHANNEL_ID=1509152627500384327
DISCORD_ALERT_CHANNEL_ID=1509152695427006484
DISCORD_REPORT_CHANNEL_ID=1509152810879553588
DISCORD_ERROR_CHANNEL_ID=1509152844232658994
```

Nunca publique o `.env` no GitHub.

## Como rodar

```bash
npm install
npm run dev
```

Abra:

```txt
http://localhost:3000
```

Entre na página:

```txt
Discord/VTLog
```

Clique em:

```txt
Sincronizar VTLog API
```

## Testes rápidos

```bash
npm run check:all
```

## Rotas locais úteis

```txt
GET  /api/vtlog/status
GET  /api/vtlog/entregas
GET  /api/vtlog/data
POST /api/vtlog/sincronizar
GET  /api/discord/status
GET  /api/discord/entregas
```

## Segurança

- `VTLOG_API_TOKEN` e `DISCORD_BOT_TOKEN` são segredos.
- Não envie esses tokens para ninguém.
- Não coloque `.env` em repositório público.
- A sincronização da API V2 respeita limite de requisições por minuto; evite clicar várias vezes seguidas em sincronizar.

## Observação importante sobre VTLog no Discord

O bot da Aliança só consegue ler mensagens que chegam em canais de servidor onde ele foi adicionado e onde ele tem permissão de leitura. Ele não consegue ler mensagens diretas/DMs entre a sua conta e o bot oficial do VTLog.

Nesta versão, quando uma mensagem do VTLog aparecer em um canal monitorado e contiver `Job #...`, o bot tenta consultar automaticamente `https://api.vtlog.net/v2/jobs/{job_id}` para completar os dados da entrega. Se o VTLog estiver aparecendo apenas na sua DM, use a sincronização por API pessoal com `VTLOG_MODE=personal` e `VTLOG_STEAM_ID`.

## 3. VTLog Job Webhook — envio direto para o site

Esta versão também aceita o VTLog enviando jobs direto para o servidor do site.

Endpoint local:

```txt
POST http://localhost:3000/api/vtlog/webhook/job
```

Endpoint publicado, quando o projeto estiver no Render ou outro host:

```txt
POST https://SEU-DOMINIO/api/vtlog/webhook/job
```

Rotas úteis:

```txt
GET  /api/vtlog/webhook/status
GET  /api/vtlog/webhook/entregas
POST /api/vtlog/webhook/job
POST /api/vtlog/webhook/test
```

Para teste local, rode:

```bash
npm run dev
```

Em outro terminal, teste o webhook:

```bash
curl -X POST http://localhost:3000/api/vtlog/webhook/test
```

Depois abra:

```txt
http://localhost:3000/api/vtlog/webhook/entregas
```

Se aparecer uma entrega, o endpoint está funcionando.

### Testar webhook local com ngrok

O VTLog não consegue chamar `localhost` diretamente. Para teste local com webhook real, use uma URL pública temporária:

```bash
ngrok http 3000
```

Use a URL HTTPS gerada pelo ngrok no VTLog:

```txt
https://SEU-NGROK.ngrok-free.app/api/vtlog/webhook/job
```

### Segurança do webhook

Você pode configurar um segredo no `.env`:

```env
VTLOG_WEBHOOK_SECRET=troque-por-um-segredo-forte
```

Se configurar o segredo, o VTLog precisa enviar esse valor no header:

```txt
x-vtlog-webhook-secret: troque-por-um-segredo-forte
```

Para testes locais, você pode deixar `VTLOG_WEBHOOK_SECRET=` vazio.
