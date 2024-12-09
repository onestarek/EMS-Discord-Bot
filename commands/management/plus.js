const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const getHighestRole = require('../../utils').getHighestRole;
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('plus')
        .setDescription('[Management] Wystaw plusa.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Osoba której chcesz dać plusa')
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
            '1279774037928575028', // bot.plus 
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
        const member = interaction.options.getUser('user');
        const user = await interaction.guild.members.fetch(member.id);
        if (!interaction.guild.members.cache.has(user.id)) {
            return interaction.editReply({ content: `Użytkownik ${user} nie jest członkiem tego serwera.`, ephemeral: true });
        }

        const powod = interaction.options.getString('powod') ?? 'Decyzja Wystawiającego';

        const nadanominusa = new EmbedBuilder()
            .setColor('Random')
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
            .setDescription(`Pomyślnie nadano plusa ${user}.`)
        
        const plus1 = '1279773983008624725';
        const plus2 = '1279773984325369908';
        const plus3 = '1279773985306837024';
        const plus4 = '1279773986477314191';
        const plus5 = '1279773987949514782';
        const userRoles2 = interaction.guild.members.cache.get(user.id).roles.cache;
        let liczba = 0;
        const plus = new EmbedBuilder()
            .setColor(`Green`)
            .setTitle('Ktoś Otrzymał Plusa')
            .setThumbnail('https://imgur.com/35ScGn8.png')
            .addFields(
                { name: "Kto Wystawił:", value: `${interaction.member}`, inline: false },
                { name: "Kto Otrzymał:", value: `${interaction.options.getUser('user')}`, inline: true },
            )
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
        if (!userRoles2.has(plus1) && !userRoles2.has(plus2) && !userRoles2.has(plus3) && !userRoles2.has(plus4) && !userRoles2.has(plus5)){
            await interaction.guild.members.cache.get(user.id).roles.add(plus1);
            liczba = 1;
            plus.addFields(
                { name: "Który to plus:", value: `${liczba}/5`, inline: true},
                { name: "Powód:", value: `${powod}`, inline: true },
            )
            interaction.client.channels.cache.get(`1279774435225767999`).send({
                content: `${interaction.options.getUser('user')}`,
                embeds: [plus] 
            });
            interaction.editReply({embeds:[nadanominusa],ephemeral:true})
        }
        if (userRoles2.has(plus1) && !userRoles2.has(plus2) && !userRoles2.has(plus3) && !userRoles2.has(plus4) && !userRoles2.has(plus5)){
            await interaction.guild.members.cache.get(user.id).roles.add(plus2);
            await interaction.guild.members.cache.get(user.id).roles.remove(plus1);
            liczba = 2;
            plus.addFields(
                { name: "Który to plus:", value: `${liczba}/5`, inline: true},
                { name: "Powód:", value: `${powod}`, inline: true },
            )
            interaction.client.channels.cache.get(`1279774435225767999`).send({
                content: `${interaction.options.getUser('user')}`,
                embeds: [plus] 
            });
            interaction.editReply({embeds:[nadanominusa],ephemeral:true})
        }
        if (!userRoles2.has(plus1) && userRoles2.has(plus2) && !userRoles2.has(plus3) && !userRoles2.has(plus4) && !userRoles2.has(plus5)){
            await interaction.guild.members.cache.get(user.id).roles.add(plus3);
            await interaction.guild.members.cache.get(user.id).roles.remove(plus2);
            liczba = 3;
            plus.addFields(
                { name: "Który to plus:", value: `${liczba}/5`, inline: true},
                { name: "Powód:", value: `${powod}`, inline: true },
            )
            interaction.client.channels.cache.get(`1279774435225767999`).send({
                content: `${interaction.options.getUser('user')}`,
                embeds: [plus] 
            });
            interaction.editReply({embeds:[nadanominusa],ephemeral:true})
        }
        if (!userRoles2.has(plus1) && !userRoles2.has(plus2) && userRoles2.has(plus3) && !userRoles2.has(plus4) && !userRoles2.has(plus5)){
            await interaction.guild.members.cache.get(user.id).roles.add(plus4);
            await interaction.guild.members.cache.get(user.id).roles.remove(plus3);
            liczba = 4;
            plus.addFields(
                { name: "Który to plus:", value: `${liczba}/5`, inline: true},
                { name: "Powód:", value: `${powod}`, inline: true },
            )
            interaction.client.channels.cache.get(`1279774435225767999`).send({
                content: `${interaction.options.getUser('user')}`,
                embeds: [plus] 
            });
            interaction.editReply({embeds:[nadanominusa],ephemeral:true})
        }
        if (!userRoles2.has(plus1) && !userRoles2.has(plus2) && !userRoles2.has(plus3) && userRoles2.has(plus4) && !userRoles2.has(plus5)){
            await interaction.guild.members.cache.get(user.id).roles.add(plus5);
            await interaction.guild.members.cache.get(user.id).roles.remove(plus4);
            liczba = 5;
            plus.addFields(
                { name: "Który to plus:", value: `${liczba}/5`, inline: true},
                { name: "Powód:", value: `${powod}`, inline: true },
            )
            interaction.client.channels.cache.get(`1279774435225767999`).send({
                content: `${interaction.options.getUser('user')}`,
                embeds: [plus] 
            });
            interaction.editReply({embeds:[nadanominusa],ephemeral:true})
        }
        if (!userRoles2.has(plus1) && !userRoles2.has(plus2) && !userRoles2.has(plus3) && !userRoles2.has(plus4) && userRoles2.has(plus5)){
            const minus3er = new EmbedBuilder()
                .setColor(`Red`)
                .setTitle('Błąd!')
                .setThumbnail('https://imgur.com/35ScGn8.png')
                .setDescription(`${interaction.options.getUser('user')} posiada już 5 plusów!\nNie mogę mu nadać następnego.`)
            await interaction.editReply({embeds: [minus3er], ephemeral: true});
        }
        let oldRole2 = getHighestRole(user)
        const nickname = user.displayName;
        const a = nickname.substring(nickname.indexOf("[")+1)
        const odznakast = a.slice(0,((nickname.indexOf("]")-nickname.length)))
        const name = nickname.substring(nickname.indexOf("]")+2);
        db.query("INSERT INTO plusy (id, imie_nazwisko, stopien, odznaka, powod, ktory_plus, wystawiajacy, data) VALUES (?,?,?,?,?,?,?,?)",[user.id, name, oldRole2.name, odznakast, powod, `${liczba}/5`, interaction.member.displayName, new Date()], (err,results) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }
        })
    },
};