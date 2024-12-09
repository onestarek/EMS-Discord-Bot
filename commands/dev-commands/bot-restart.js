const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { logi } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('[Dev] Restartowanie Bota'),
    async execute(interaction, client) {

        if (!interaction.member.roles.cache.has('1279774029829374104')) {
            const unauthorizedEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Nieautoryzowana próba użycia komendy restart')
                .setDescription(`Użytkownik ${interaction.user.tag} próbował użyć komendy ${interaction.commandName}, nie będąc właścicielem bota.`)
                .setTimestamp();

            const logChannel = interaction.client.channels.cache.get('1279781839325892679');
            if (logChannel) {
                logChannel.send({ embeds: [unauthorizedEmbed] });
            }

            if (!interaction.replied) {
                return interaction.reply({ content: 'Nie masz uprawnień do używania tej komendy.', ephemeral: true });
            }
            return;
        }

        try {
            if (interaction.replied) {
                return;
            }

            await interaction.reply('Bot zostanie teraz wyłączony.');

            const logEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Bot Zrestartowany')
                .setDescription(`Bot został zrestartowany przez <@${interaction.user.id}>.`)
                .setTimestamp();

            const logChannel = interaction.client.channels.cache.get(logi);
            if (logChannel) {
                logChannel.send({ embeds: [logEmbed] });
            }
            setTimeout(()=>(
                interaction.client.destroy(),
                process.exit(0)
            ),500)
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Wystąpił błąd podczas próby wyłączenia bota.', ephemeral: true });
            }
        }
    },
};
