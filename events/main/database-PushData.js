const { Events, ActivityType, EmbedBuilder } = require('discord.js');
const getHighestRole = require('../../utils').getHighestRole;
const dbConnect = require('../../utils').dbConnect;

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
        const guild = client.guilds.cache.get('1271523973108203571');
        const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has('1279774025228222545'));

        const db = await dbConnect()
        
        membersWithRole.forEach((member) => {
            const oldRole2 = getHighestRole(member);
            const nickname = member.displayName;
            const name = nickname.substring(nickname.indexOf("]")+2);
            const a = nickname.substring(nickname.indexOf("[")+1)
            const odznaka = a.slice(0,((nickname.indexOf("]")-nickname.length)))
            const userData = {
                id: member.id,
                imienazwisko: name,
                odznaka: odznaka,
                stopien: oldRole2.name,
                discord_username: member.user.username,
                data_dolaczenia: member.joinedAt
            }
            const query = `
            INSERT INTO pracownicy (id, imie_nazwisko, odznaka, stopien, discord_username, data_dolaczenia)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                imie_nazwisko = VALUES(imie_nazwisko),
                odznaka = VALUES(odznaka),
                stopien = VALUES(stopien),
                discord_username = VALUES(discord_username),
                data_dolaczenia = VALUES(data_dolaczenia);
            `;
            db.query(query, [userData.id, userData.imienazwisko, userData.odznaka, userData.stopien, userData.discord_username, userData.data_dolaczenia], (err, results) => {
                if (err) {
                    console.error(err);
                }
            });
        })
        console.log("Database loaded successfully!")
        db.end()
    }
}

