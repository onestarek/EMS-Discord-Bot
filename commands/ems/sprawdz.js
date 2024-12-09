const { SlashCommandBuilder, EmbedBuilder, SlashCommandStringOption, client } = require('discord.js');
const cfx_api = require('cfx-api');
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sprawdz')
        .setDescription('[SAMS] Sprawdza gracza')
        .addNumberOption(option =>
            option.setName('id')
                .setDescription('ID Osoby')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(2000)),
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
        const cfx = await cfx_api.fetchServer('5g5elz')
        if (cfx == undefined) return;
        const PlayerOnline = []
        const getID = interaction.options.getNumber("id");
        for (var player in cfx.players){
            if(cfx.players[player].id == getID){
                const name = cfx.players[player].name;
                const id = cfx.players[player].id;
                const ping = cfx.players[player].ping;
                const identifiers = cfx.players[player].identifiers

                PlayerOnline.push({
                    name,
                    id,
                    ping,
                    identifiers,
                })
            }
        }
        if (PlayerOnline.length == 0){
            return await interaction.editReply({content:"Brak Gracza o takim ID!"});
        }

        const { name, id, ping, identifiers } = PlayerOnline[0]
        const embed = new EmbedBuilder()
        const discordid = identifiers.find(identifier => identifier.startsWith('discord:'))
        const steamhex = identifiers.find(identifier => identifier.startsWith('steam:'))
        const license = identifiers.find(identifier => identifier.startsWith('license:'))
        const license2 = identifiers.find(identifier => identifier.startsWith('license2:'))
        let playerDiscordId = 0;
        if (discordid) {
            playerDiscordId = discordid.replace('discord:','');
            const member = await interaction.client.users.fetch(playerDiscordId);
            embed.setTitle('Sprawdzanie Gracza')
            .setThumbnail(member.avatarURL())
            .setColor('#3434eb')
            .addFields(
                { name: 'Nick', value: `${name} (<@${playerDiscordId}>)`, inline: false },
                { name: 'ID', value: `${id}`, inline: true },
                { name: 'Ping', value: `${ping}ms`, inline: true },
                { name: 'Steam Hex', value: `${steamhex}`, inline: false},
                { name: 'Discord ID', value: `${playerDiscordId}`, inline: false},
                { name: 'Licencja', value: `${license}`, inline: false},
                { name: 'Licencja 2', value: `${license2}`, inline: false},
            )
        } else {
            embed.setTitle('Sprawdzanie Gracza')
            .setColor('#3434eb')
            .addFields(
                { name: 'Nick', value: `${name}`, inline: false },
                { name: 'ID', value: `${id}`, inline: true },
                { name: 'Ping', value: `${ping}ms`, inline: true },
                { name: 'Steam Hex', value: `${steamhex}`, inline: false},
                { name: 'Licencja', value: `${license}`, inline: false},
                { name: 'Licencja 2', value: `${license2}`, inline: false},
            )
        }
        
        await interaction.editReply({embeds:[embed],ephemeral: true});
        
    },
};
