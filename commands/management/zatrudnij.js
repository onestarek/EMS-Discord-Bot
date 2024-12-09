const { SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const getHighestRole = require('../../utils').getHighestRole;
const logi = '1279781839325892679';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('zatrudnij')
		.setDescription('[Management] Zatrudnij')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Osoba do zatrudnienia')
                .setRequired(true))
        .addRoleOption(role => role
                .setName('stopien')
                .setDescription('Stopień')
                .setRequired(true)
            )
        .addStringOption(
                new SlashCommandStringOption()
                .setName('odznaka')
                .setDescription('Odznaka')
                .setRequired(true)
        )
        .addStringOption(
                new SlashCommandStringOption()
                .setName('dane')
                .setDescription('Imię Nazwisko')
                .setRequired(true)
        ),  
	async execute(interaction, client) {
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
        const newrole = interaction.options.getRole('stopien');
        if (!interaction.guild.members.cache.has(user.id)) {
            return interaction.reply({ content: `Użytkownik ${user} nie jest członkiem tego serwera.`, ephemeral: true });
        }
        const member = await interaction.guild.members.fetch(user.id);

        if (member.roles.cache.has(newrole.id)) {
        
            const embed2 = new EmbedBuilder()
            .setColor("#ff0000")
            .setDescription(`${user} już posiada ten stopień! (\`${newrole.name}\`)`)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({text: `Uruchomione przez: ${interaction.user.tag}`})
            .setTimestamp()
            await interaction.reply({embeds: [embed2], ephemeral: true});
            return;

        }     

        try{
            await interaction.guild.members.cache.get(user.id).roles.add(newrole.id);
            await interaction.guild.members.cache.get(user.id).roles.add('1279774025228222545');
            const embed3 = new EmbedBuilder()
            .setColor(newrole.color)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
            .setDescription(`Pomyślnie zatrudniono ${user} na \`${newrole.name}\`.`)

            await interaction.editReply({embeds: [embed3], ephemeral: true});

            const odznaka = interaction.options.getString('odznaka');
            const name = interaction.options.getString('dane');

            try{
                await member.setNickname(`[${odznaka}] ${name}`,`Zatrudnienie`)
            } catch(error){
                console.log(error);
                const embed5 = new EmbedBuilder()
                .setColor('#ff0000')
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                })
                .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
                .setTimestamp()
                .setDescription(
                    `Nie można zmienić nazwy ${user} `
                )
                await interaction.reply({embeds: [embed5], ephemeral: true});
            }
            
			const query = `
			INSERT INTO pracownicy (id, imie_nazwisko, odznaka, stopien, discord_username, data_dolaczenia)
			VALUES (?, ?, ?, ?, ?,?)
			ON DUPLICATE KEY UPDATE
				imie_nazwisko = VALUES(imie_nazwisko),
				odznaka = VALUES(odznaka),
				stopien = VALUES(stopien),
				discord_username = VALUES(discord_username),
                data_dolaczenia = VALUES(data_dolaczenia);
			`;
            const db = await dbConnect();
			db.query(query, [member.id, name, odznaka, newrole.name, member.user.username, new Date()], (err, results) => {
				if (err) {
					console.error(err);
				}
			});
            db.end()
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
                `Nie można dodać roli \`${newrole.name}\` `
            )
            await interaction.editReply({embeds: [embed4], ephemeral: true});
        }
    },
};