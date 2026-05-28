require('dotenv').config();
const { startServer } = require('./server');
const { startBot } = require('./discordBot');

startServer();
setTimeout(() => startBot(), 800);
