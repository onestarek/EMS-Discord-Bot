const { Events, ActivityType, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const { getHighestRole } = require("../../utils").getHighestRole;

module.exports = {
    name: Events.ClientReady,
	once: true,
	async execute(client) {
        const embede = new EmbedBuilder()
        .setTitle('Ktoś wrócił z Zawieszenia')
        .setTimestamp()
        const today = new Date().toISOString().split('T')[0];
        const guild = await client.guilds.cache.get('1271523973108203571');
        const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has('1279774021440766157'));
        const db = await dbConnect()
        
        membersWithRole.forEach((member) => {
            let color = member.displayHexColor;
            if (color == '#000000') color = member.hoistRole.hexColor;
            db.query('SELECT * FROM zawieszenia WHERE zakoczenie = ? AND status = \'Trwa\'',[today], async (err,results) => {
                if (err) throw err;
                if(results.length==0){
                    console.log('brrr')
                    db.destroy()
                    return;
                }
                await results.forEach(async (row) => {
                    if(row.id === member.id){
                        await member.roles.remove('1279774021440766157')
                        await member.roles.add('1279774020656431147')
                        const db = await dbConnect()
                        
                        db.query('UPDATE zawieszenia SET status = \'Zakończony\' WHERE id = ? AND status = \'Trwa\'', [member.id], async (err) => {
                            if (err) throw err;
                            embede.setColor(color)
                            .setDescription(`${member} wrócił z Zawieszenia!`)
                            await client.channels.cache.get('1279774465005195264').send({embeds:[embede],content:`<@${member.id}>`})
                            db.end()
                        })
                    }
                })
            })
        })
    }
}