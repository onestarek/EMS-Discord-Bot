const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const cfx_api = require('cfx-api')
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('[SAMS] Sprawdź Status FiveM.'),
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

        try{
            const status = await cfx_api.fetchStatus();
            const components = await status.fetchComponents();
            let ComponentsActive = ""
            if(Object.keys(components)) {
                for(let c of components) {
                    ComponentsActive += `**${c.name}:** \`${c.status.replace("operational", "Sprawne ✅").replace("partial_outage","Problemy ⚠️").replace("major_outage","Awaria 🛑").replace("under_maintenance","Podczas Przerwy Technicznej⏰")}\`\n`
                }
            }
            let embedcfx = new EmbedBuilder()
            .setTitle('Status Cfx.re')
            .setDescription(`${status.everythingOk ? "**Wszystkie Systemy Cfx.re są sprawne**" : "**Występują problemy**"}\n\n${ComponentsActive}\n`)
            .setColor('#ff9999')    
            .setFooter({ text: interaction.user.username})
            .setTimestamp()
            await interaction.editReply({ embeds: [embedcfx] });
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
            await interaction.reply({embeds: [embed4], ephemeral: true});
        }

    },
};