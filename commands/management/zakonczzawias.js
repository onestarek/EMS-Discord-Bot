const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const getHighestRole = require("../../utils").getHighestRole;
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zakonczzawias')
        .setDescription('[Management] Zakończ Zawias.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Osoba której zdejmiesz zawias')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const permslist = [
            '1279774029829374104', // all
            '1279774030777417770', // bot.management
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
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);
        try{
            await interaction.guild.members.cache.get(member.id).roles.remove('1279774021440766157');
            await interaction.guild.members.cache.get(member.id).roles.add('1279774020656431147');
            const embed3 = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
            .setDescription(`Pomyślnie usunięto urlop.`)

            await interaction.editReply({embeds: [embed3], ephemeral: true});
            let color = member.displayHexColor;
            if (color == '#000000') color = member.hoistRole.hexColor;
            const embede = new EmbedBuilder()
            .setColor(color)
            .setTitle('Ktoś wrócił z Zawieszenia')
            .setDescription(`${member} wrócił z Zawieszenia!`)
            .setTimestamp()
        
            interaction.client.channels.cache.get(`1279774465005195264`).send({
                content: `${member}`,
                embeds: [embede] 
            });
            const db = await dbConnect()
            db.query('UPDATE zawieszenia SET status = \'Zakończony\' WHERE id = ? AND status = \'Trwa\'', [member.id], async (err) => {
                if (err) throw err;
                db.end();
            });
        } catch (error) {
            console.log(error);
            const embed4 = new EmbedBuilder()
            .setColor('#ff0000')
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
            .setDescription(
                `Wystąpił błąd!`
            )
            await interaction.editReply({embeds: [embed4], ephemeral: true});
        }

    },
};