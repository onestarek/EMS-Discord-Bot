const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aktywneurlopy')
        .setDescription('[MANAGEMENT] Sprawdź medyka.'),
    async execute(interaction) {
        await interaction.deferReply();
        const permslist = [
            '1279774029829374104', // all
            '1279774030777417770', // bot.management
            '1279774043767312458', // bot.aktywneurlopy
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

            await interaction.client.channels.cache.get(logi).send({ embeds: [unauthorizedEmbed] });
            return await interaction.editReply({ content: 'Nie masz uprawnień do używania tej komendy.', ephemeral: true });
        }

        const guild = interaction.guild;
        const members = await guild.members.fetch();

        const filteredMembers = [];

        members.forEach(async member => {
            if (member.roles.cache.has('1279774019733815371')) {
                let rankIndex = rankList.findIndex(rank => member.roles.cache.has(rank));
                if (rankIndex === -1) {
                    rankIndex = Infinity;
                }

                filteredMembers.push({
                    member,
                    rankIndex,
                });
            }
        });

        filteredMembers.sort((a, b) => a.rankIndex - b.rankIndex);
        let listString = '';
        for (let i = 0; i < filteredMembers.length; i++) {
            const { member, rankIndex } = filteredMembers[i];
            const roleID = rankList[rankIndex];
            const role = guild.roles.cache.get(roleID);
            const roleName = role ? role.name : 'Unknown Role';
            const db = await dbConnect()
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM urlopy WHERE id = ? AND status = 'trwa'`, [member.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        const zakonczenieDate = results[0].zakonczenie;
                        const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2, '0')}/${zakonczenieDate.getFullYear()}`;
                        listString += `${i + 1}. **${member.nickname || member.user.displayName}** - ${roleName}\n(Data Zakończenia: ${formattedDate})\n\n`;
                        resolve();
                    }
                });
                db.end()
            });
        }
        
        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`Lista Pracowników Na Urlopie`)
            .setThumbnail('https://imgur.com/35ScGn8.png')
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            });
        
        if (listString.length == 0) {
            embed.setDescription('Nie ma żadnych pracowników na urlopie w tym momencie.');
        } else {
            embed.setDescription(listString);
        }
        
        await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};