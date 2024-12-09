const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const getHighestRole = require('../../utils').getHighestRole;
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zwolnij')
        .setDescription('[Management] Wystaw zwolnienie.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Osoba do Zwolnienia')
                .setRequired(true))
        .addStringOption(
                new SlashCommandStringOption()
                .setName('powod')
                .setDescription('Wypisz Powód')
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const permslist = [
            '1279774029829374104', // all
            '1279774030777417770', // bot.management
            '1279774036829933672', // bot.zwolnienie 
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
        const user = interaction.options.getUser('user');
        if (!interaction.guild.members.cache.has(user.id)) {
            return interaction.editReply({ content: `Użytkownik ${user} nie jest członkiem tego serwera.`, ephemeral: true });
        }
        const member = await interaction.guild.members.fetch(user.id);
        const oldRole2 = getHighestRole(member);
        try{
            const embed3 = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
            .setDescription(`Pomyślnie zwolniono ${user}.`)

            await interaction.editReply({embeds: [embed3], ephemeral: true});
            const powod = interaction.options.getString('powod') ?? 'Decyzja Zarządu';

            const embede = new EmbedBuilder()
            .setColor('DarkRed')
            .setTitle('Ktoś został Zwolniony')
            .setThumbnail('https://imgur.com/35ScGn8.png')
            .addFields(
                { name: "Kto Wystawił:", value: `${interaction.member}`, inline: false },
                { name: "Kto Otrzymał:", value: `${member.displayName}`, inline: true },
                { name: "Stopień:", value: `${oldRole2}`, inline: true },
                { name: "Powód:", value: `${powod}`, inline: false },
            )
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            // .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
            await interaction.client.channels.cache.get(`1279774478666170431`).send({
                content: `${interaction.options.getUser('user')}`,
                embeds: [embede] 
                });

            const lotaembed = new EmbedBuilder()
            .setColor('DarkRed')
            .setTitle('Zostałeś Zwolniony!')            
            .addFields(
                { name: "Wystawiający:", value: `${interaction.member}`, inline: false },
                { name: "Powód:", value: `${powod}`, inline: true },
            )
            .setTimestamp()

            await member.send({
                embeds: [lotaembed]
            }).catch(error => {
                return;
            })
            const nickname = member.displayName;
            const name = nickname.substring(nickname.indexOf("]")+2);
            const a = nickname.substring(nickname.indexOf("[")+1)
            const odznaka = a.slice(0,((nickname.indexOf("]")-nickname.length)))
            const db = await dbConnect();
            db.query("INSERT INTO byli_pracownicy (id, odznaka, imie_nazwisko, stopien, data_odejscia, typ_odejscia, powod_odejscia) VALUES (?,?,?,?,?,?,?)",[member.id, odznaka, name, oldRole2.name, new Date(), "Zwolnienie", powod], (err,results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
                }
            })
            db.query("INSERT INTO zwolnienia (id, odznaka, imie_nazwisko, stopien, powod, wystawiajacy, data) VALUES (?,?,?,?,?,?,?)",[member.id, odznaka, name, oldRole2.name, powod,  interaction.member.displayName, new Date()], (err,results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
                }
            })
            db.query(`DELETE FROM pracownicy WHERE id = ?`, [member.id], (err, results) => {
                if (err) {
                    console.error('Error deleting row:', err);
                    return;
                }
            });
            db.end()
            setTimeout(() => {
                member.ban({deleteMessageSeconds: 0, reason: 'Zwolnienie'})
            }, 1000);
        } catch (error) {
            console.log(error);
            const embed4 = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            // .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
            .setDescription(
                `Wystąpił błąd!`
            )
            await interaction.editReply({embeds: [embed4], ephemeral: true});
        }

    },
};