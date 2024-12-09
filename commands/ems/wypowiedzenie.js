const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const getHighestRole = require("../../utils").getHighestRole;
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wypowiedzenie')
        .setDescription('[EMS] Wypisz Wypowiedzenie.')
        .addStringOption(
                new SlashCommandStringOption()
                .setName('powod')
                .setDescription('Wypisz Powód')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const permslist = [
            '1279774029829374104', // all
            '1279774030777417770', // bot.management
            '1279774025228222545', // pracownik
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
        
        const member = await interaction.guild.members.fetch(interaction.member.id)
        let oldRole2 = getHighestRole(member);
        const powod = interaction.options.getString('powod');
        const embed3 = new EmbedBuilder()
        .setColor('Random')
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
        .setTimestamp()
        .setDescription(`Pomyślnie złożono wypowiedzenie.`)

        await interaction.editReply({embeds: [embed3], ephemeral: true});

        const embede = new EmbedBuilder()
        .setColor('DarkRed')
        .setTitle('Ktoś Złożył Wypowiedzenie')
        .setThumbnail('https://imgur.com/35ScGn8.png')
        .addFields(
            { name: "Kto:", value: `${interaction.member.displayName}`, inline: true },
            { name: "Stopień:", value: `${oldRole2}`, inline: true },
            { name: "Powód:", value: `${powod}`, inline: false },
        )
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp()
        
        interaction.client.channels.cache.get(`1279774409292382302`).send({
            embeds: [embede] 
        });
        const nickname = interaction.member.displayName;
        const name = nickname.substring(nickname.indexOf("]")+2);
        const a = nickname.substring(nickname.indexOf("[")+1)
        const odznaka = a.slice(0,((nickname.indexOf("]")-nickname.length)))
        const db = await dbConnect();
        db.query("INSERT INTO byli_pracownicy (id, odznaka, imie_nazwisko, stopien, data_odejscia, typ_odejscia, powod_odejscia) VALUES (?,?,?,?,?,?,?)",[interaction.member.id, odznaka, name, oldRole2.name, new Date(), "Wypowiedzenie", powod], (err,results) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }
        })
        db.query(`DELETE FROM pracownicy WHERE id = ?`, [interaction.member.id], (err, results) => {
            if (err) {
                console.error('Error deleting row:', err);
                return;
            }
        });
        db.end();
        setTimeout(() => {
            member.kick('Wypowiedzenie').catch(err => {
                console.error(err);
            });
        }, 1000);
    },
};