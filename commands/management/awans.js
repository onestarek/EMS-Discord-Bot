const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const getHighestRole = require('../../utils').getHighestRole;
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('awans')
        .setDescription('[MANAGEMENT] Wystaw awans.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Osoba do Awansu')
                .setRequired(true))
        .addRoleOption(role => role
                .setName('stopien')
                .setDescription('Nowy Stopień')
                .setRequired(true)
            )
        .addStringOption(
                new SlashCommandStringOption()
                .setName('odznaka')
                .setDescription('Nowa Odznaka')
                .setRequired(true)
        )
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
            '1279774034715742323', // bot.awans 
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
            return interaction.editReply({ content: `Użytkownik ${user} nie jest członkiem tego serwera.`, ephemeral: true });
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
            await interaction.editReply({embeds: [embed2], ephemeral: true});
            return;

        }
        let oldRole2 = getHighestRole(member);
        try{
            await interaction.guild.members.cache.get(user.id).roles.remove(oldRole2);
            await interaction.guild.members.cache.get(user.id).roles.add(newrole.id);
            const embed3 = new EmbedBuilder()
            .setColor(newrole.color)
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
            .setDescription(`Pomyślnie awansowano ${user} na \`${newrole.name}\`.`)

            const powod = interaction.options.getString('powod') ?? 'Decyzja Zarządu';
            const odznaka = interaction.options.getString('odznaka');
            const nickname = member.displayName;
            const a = nickname.substring(nickname.indexOf("[")+1)
            const odznakast = a.slice(0,((nickname.indexOf("]")-nickname.length)))
            const name = nickname.substring(nickname.indexOf("]")+2);

            try{
                await member.setNickname(`[${odznaka}] ${name}`,`Awans`)
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
                await interaction.editReply({embeds: [embed5], ephemeral: true});
            }
            const embede = new EmbedBuilder()
            .setColor(`Green`)
            .setTitle('Awans!')
            .setThumbnail('https://imgur.com/35ScGn8.png')
            .addFields(
                { name: "Kto Wystawił:", value: `${interaction.member}`, inline: false },
                { name: "Kto Otrzymał:", value: `${interaction.options.getUser('user')}`, inline: true },
                { name: "Z stopnia:", value: `${oldRole2}`, inline: true },
                { name: "Na stopień:", value: `${interaction.options.getRole('stopien')}`, inline: true },
                { name: "Nowa Odznaka:", value: `${interaction.options.getString('odznaka')}`, inline: true },
                { name: "Powód:", value: `${powod}`, inline: false },
            )
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
            await interaction.client.channels.cache.get(`1279774419362910231`).send({
                content: `${interaction.options.getUser('user')}`,
                embeds: [embede] 
            });
            await interaction.editReply({embeds: [embed3], ephemeral: true});
            const nowystopien = interaction.options.getRole('stopien')
            const db = await dbConnect()
            db.query("INSERT INTO awanse (id, imie_nazwisko, stary_stopien, nowy_stopien, stara_odznaka, nowa_odznaka, powod, wystawiajacy, data) VALUES (?,?,?,?,?,?,?,?,?)",[user.id, name, oldRole2.name, nowystopien.name, odznakast, odznaka, powod, interaction.member.displayName, new Date()], (err,results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
                }
            })
            db.query(`UPDATE pracownicy SET data_awansu = NOW(), stopien = ?, odznaka = ? WHERE id = ?`, [nowystopien.name, odznaka, user.id], (err,results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
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