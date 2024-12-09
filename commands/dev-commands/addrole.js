const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('[Management] Dodawanie roli użytkownikowi')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Osoba, której ma zostać dodana rola')
                .setRequired(true))
        .addRoleOption(option =>
            option
                .setName('rola')
                .setDescription('Rola do dodania')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('powod')
                .setDescription('Wypisz powód')
                .setRequired(false)),
    async execute(interaction) {
        const logi = '1279781839325892679';
        const requiredRoleId = '1279774029829374104';

        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            const unauthorizedEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Nieautoryzowana próba użycia komendy')
                .setDescription(`Użytkownik ${interaction.user} próbował użyć komendy \`${interaction.commandName}\`, nie posiadając wymaganej roli.`)
                .setTimestamp();

            await interaction.client.channels.cache.get(logi).send({ embeds: [unauthorizedEmbed] });
            return await interaction.reply({ content: 'Nie masz uprawnień do używania tej komendy.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const role = interaction.options.getRole('rola');
        const powod = interaction.options.getString('powod') ?? 'Brak podanego powodu';

        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.roles.add(role);

            const roleAddedEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Rola Dodana')
                .setDescription(`**Użytkownikowi:** <@${user.id}>\n**Dodano Rolę:** <@&${role.id}>\n**Powód:** ${powod}`)
                .setTimestamp();

            await interaction.reply({ embeds: [roleAddedEmbed] ,ephemeral: true });

            const logEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Log Dodawania Roli')
                .setDescription(`**Użytkownikowi:** <@${user.id}>\n**Dodano Rolę:** <@&${role.id}>\n**Przez:** <@${interaction.user.id}>\n**Powód:** ${powod}`)
                .setTimestamp();

            // await interaction.client.channels.cache.get(logi).send({ embeds: [logEmbed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Błąd przy dodawaniu roli')
                .setDescription(`Wystąpił błąd podczas próby dodania roli użytkownikowi ${user.tag}.`)
                .setTimestamp();

            await interaction.client.channels.cache.get(logi).send({ embeds: [errorEmbed] });

            if (!interaction.replied) {
                await interaction.reply({ content: 'Wystąpił błąd podczas próby dodania roli użytkownikowi.', ephemeral: true });
            } else {
                await interaction.followUp({ content: 'Wystąpił dodatkowy błąd.', ephemeral: true });
            }
        }
    },
};
