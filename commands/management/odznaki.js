const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const getHighestRole = require('../../utils').getHighestRole;
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('odznaki')
        .setDescription('[Management] Sprawdź dostępne odznaki.'),
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const permslist = [
            '1279774029829374104', // all
            '1279774030777417770', // bot.management
            '1279774046594273333', // bot.odznaki 
        ];
        const userRoles = interaction.guild.members.cache.get(interaction.member.id).roles.cache;
        let oldRole;
        for (const role of userRoles.values()) {
            if (permslist.includes(role.id)) {
                oldRole = role;
                break;
            }
        }
        if (!oldRole) {
            const unauthorizedEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Nieautoryzowana próba użycia komendy')
            .setDescription(`Użytkownik ${interaction.user} próbował użyć komendy \`${interaction.commandName}\`, nie posiadając wymaganej roli.`)
            .setTimestamp();

            await interaction.client.channels.cache.get('1279781839325892679').send({ embeds: [unauthorizedEmbed] });
            return await interaction.editReply({ content: 'Nie masz uprawnień do używania tej komendy.', ephemeral: true });
        }
        const db = await dbConnect()
        let categorizedBadges = {};
        await new Promise((resolve, reject) => {
            db.query("SELECT * FROM pracownicy ORDER BY odznaka ASC", (err, results) => {
                if (err) {
                    console.error(err)
                    reject(err);
                } else {
                    const odznakaArray = results.map((row) => row.odznaka);
                    const baseArray = Array.from({ length: 301 }, (_, i) => i + 100);
                    const resultArray = baseArray.filter((x) => !odznakaArray.includes(x));

                    resultArray.forEach((badge) => {
                        if (badge >= 101 && badge <= 105) {
                            categorizedBadges["Management"] = categorizedBadges["Management"] || [];
                            categorizedBadges["Management"].push(badge);
                        } else if (badge >= 110 && badge <= 114) {
                            categorizedBadges["Associate Professor"] = categorizedBadges["Associate Professor"] || [];
                            categorizedBadges["Associate Professor"].push(badge);
                        } else if (badge >= 115 && badge <= 119) {
                            categorizedBadges["Senior Doctor"] = categorizedBadges["Senior Doctor"] || [];
                            categorizedBadges["Senior Doctor"].push(badge);
                        } else if (badge >= 120 && badge <= 124) {
                            categorizedBadges["Doctor"] = categorizedBadges["Doctor"] || [];
                            categorizedBadges["Doctor"].push(badge);
                        } else if (badge >= 125 && badge <= 129) {
                            categorizedBadges["Medical Specialist"] = categorizedBadges["Medical Specialist"] || [];
                            categorizedBadges["Medical Specialist"].push(badge);
                        } else if (badge >= 130 && badge <= 139) {
                            categorizedBadges["Senior Physician"] = categorizedBadges["Senior Physician"] || [];
                            categorizedBadges["Senior Physician"].push(badge);
                        } else if (badge >= 140 && badge <= 149) {
                            categorizedBadges["Physician"] = categorizedBadges["Physician"] || [];
                            categorizedBadges["Physician"].push(badge);
                        } else if (badge >= 150 && badge <= 159) {
                            categorizedBadges["Resident"] = categorizedBadges["Resident"] || [];
                            categorizedBadges["Resident"].push(badge);
                        } else if (badge >= 160 && badge <= 179) {
                            categorizedBadges["Advanced EMT"] = categorizedBadges["Advanced EMT"] || [];
                            categorizedBadges["Advanced EMT"].push(badge);
                        } else if (badge >= 180 && badge <= 199) {
                            categorizedBadges["EMT"] = categorizedBadges["EMT"] || [];
                            categorizedBadges["EMT"].push(badge);
                        } else if (badge >= 200 && badge <= 219) {
                            categorizedBadges["EMT Apprentice"] = categorizedBadges["EMT Apprentice"] || [];
                            categorizedBadges["EMT Apprentice"].push(badge);
                        } else if (badge >= 220 && badge <= 259) {
                            categorizedBadges["Trainee"] = categorizedBadges["Trainee"] || [];
                            categorizedBadges["Trainee"].push(badge);
                        }                        
                    });
                    resolve()
                    db.end()
                }
            });
        });
        const embed = new EmbedBuilder()
            .setTitle("Dostępne Odznaki")
            .setColor("Green");
        
        Object.keys(categorizedBadges).forEach((category) => {
            const badges = categorizedBadges[category].join(", ");
            embed.addFields({ name: category, value: badges, inline: false });
        });

        interaction.editReply({embeds:[embed],ephemeral: true});
    }
}