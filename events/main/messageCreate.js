const { Events, ActivityType, EmbedBuilder } = require('discord.js');
// const { db } = require('../dbConnect.js');
module.exports = {
	name: Events.MessageCreate,
	once: true,
	async execute(message) {
		const content = message.content;
		if(message.channel.id === '1279774517853687849'){
			message.react('✅')
			message.react('❌')
		}
    }
}