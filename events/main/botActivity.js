const { Events, ActivityType, EmbedBuilder } = require('discord.js');
const lista = require('../../utils').listarang2;
module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
        client.user.setStatus('online'); //idle, dnd
        let activityIndex = 0;
        const activities = lista.map(roleId => {
            const guild = client.guilds.cache.get('1271523973108203571');
            const role = guild.roles.cache.get(roleId);
            if (!role) return null;
            if (!role.members) return null;
            return `${role.name}: ${role.members.size}`;
        }).filter(Boolean);
        const a = ['❤','🧡','💛','💚','💙','💜','🤍']
        setInterval(async () => {
            const activityText = activities[activityIndex];
            const randomHeart = a[Math.floor(Math.random() * a.length)];
            client.user.setActivity(`${randomHeart} Ilość ${activityText}`, { type: ActivityType.Watching });
            activityIndex = (activityIndex + 1) % activities.length;
        }, 10000);
    }
}