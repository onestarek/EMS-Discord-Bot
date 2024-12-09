const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const {logi} = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('[Dev] Przygotowanie Ticket\'ów.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setTitle('Otwórz Ticket')
        .setDescription('Poprzez klinknięcie przycisku poniżej, utworzysz ticket do Zarządu.')
        .setColor('Blue')
        const ticketBtn = new ButtonBuilder()
            .setCustomId('ticketBtn')
            .setLabel('Otwórz Ticket')
            .setEmoji('📩')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(ticketBtn)

        await interaction.channel.send({embeds:[embed],components:[row]});
        const embed2 = new EmbedBuilder()
        .setTitle('Otwórz Ticket')
        .setDescription('Poprzez klinknięcie przycisku poniżej, utworzysz ticket do Administracji.')
        .setColor('Red')
        const ticketBtn2 = new ButtonBuilder()
            .setCustomId('ticketBtn2')
            .setLabel('Otwórz Ticket')
            .setEmoji('📩')
            .setStyle(ButtonStyle.Secondary);

        const row2 = new ActionRowBuilder()
            .addComponents(ticketBtn2)

        await interaction.channel.send({embeds:[embed2],components:[row2]});
    }
}
