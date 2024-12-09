const cron = require('node-cron')
const { Events, ActivityType, EmbedBuilder } = require('discord.js');
module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

    const onembed = new EmbedBuilder()
      .setTitle('Bot uruchomiony')
      .setDescription('Bot został ponownie uruchomiony.')
      .setColor('Green')
      .setTimestamp()
    client.channels.cache.get('1279781803070324908').send({embeds: [onembed]})
    cron.schedule('0 0 0 * * *', () => {
      client.destroy(),
      process.exit(0)
    });
  }
}