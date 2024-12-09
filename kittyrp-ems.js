const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();
const dbConnect = require('./utils').dbConnect;

const client = new Client({ 
intents: [
	GatewayIntentBits.AutoModerationConfiguration,
	GatewayIntentBits.AutoModerationExecution,
	GatewayIntentBits.DirectMessageReactions,
	GatewayIntentBits.DirectMessageTyping,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.GuildBans,
	GatewayIntentBits.GuildEmojisAndStickers,
	GatewayIntentBits.GuildIntegrations,
	GatewayIntentBits.GuildInvites,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.GuildMessageTyping,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildModeration,
	GatewayIntentBits.GuildPresences,
	GatewayIntentBits.GuildScheduledEvents,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildWebhooks,
	GatewayIntentBits.Guilds,
	GatewayIntentBits.MessageContent
],
partials: [
	Partials.Channel
] });
client.commands = new Collection();
client.cooldowns = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(eventsPath)
for(const foldere of eventFolders){
	const eventPath = path.join(eventsPath, foldere);
	const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));
	for (const filev of eventFiles){
		const filePath = path.join(eventPath, filev);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}
dbConnect().then(() => {
	client.login(process.env.TOKEN);
}).catch((error) => {
	console.error('Error connecting to database:', error);
})