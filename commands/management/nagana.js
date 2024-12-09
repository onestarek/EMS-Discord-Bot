const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const getHighestRole = require('../../utils').getHighestRole;
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nagana')
        .setDescription('[Management] Wystaw nagane.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Osoba której chcesz dać nagane')
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
            '1279774041032359966', // bot.nagana 
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
            .setDescription(`Pomyślnie nadano nagane ${user}.`)
        
        const plus1 = '1279773997227315316';
        const plus2 = '1279773998477082705';
        const userRoles2 = interaction.guild.members.cache.get(user.id).roles.cache;
        let liczba = 0;
        const plus = new EmbedBuilder()
            .setColor(`DarkRed`)
            .setTitle('Ktoś Otrzymał Nagane')
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
        if (!userRoles2.has(plus1) && !userRoles2.has(plus2)){
            await interaction.guild.members.cache.get(user.id).roles.add(plus1);
            liczba = 1;
            plus.addFields(
                { name: "Która to nagana:", value: `${liczba}/2`, inline: true},
                { name: "Powód:", value: `${powod}`, inline: true },
            )
            interaction.client.channels.cache.get(`1279774457917079586`).send({
                content: `${interaction.options.getUser('user')}`,
                embeds: [plus] 
            });
            interaction.editReply({embeds:[nadanominusa],ephemeral:true})
        }
        if (userRoles2.has(plus1) && !userRoles2.has(plus2)){
            await interaction.guild.members.cache.get(user.id).roles.add(plus2);
            await interaction.guild.members.cache.get(user.id).roles.remove(plus1);
            liczba = 2;
            plus.addFields(
                { name: "Która to nagana:", value: `${liczba}/2`, inline: true},
                { name: "Powód:", value: `${powod}`, inline: true },
            )
            interaction.client.channels.cache.get(`1279774457917079586`).send({
                content: `${interaction.options.getUser('user')}`,
                embeds: [plus] 
            });
            interaction.editReply({embeds:[nadanominusa],ephemeral:true})
        }
        if (!userRoles2.has(plus1) && userRoles2.has(plus2)){
            const minus3er = new EmbedBuilder()
                .setColor(`Red`)
                .setTitle('Błąd!')
                .setThumbnail('https://imgur.com/35ScGn8.png')
                .setDescription(`${interaction.options.getUser('user')} posiada już 2 nagany!\nNie mogę mu nadać następnej.`)
            await interaction.editReply({embeds: [minus3er], ephemeral: true});
        }
    
        let oldRole2 = getHighestRole(user);

        const nickname = user.displayName;
        const a = nickname.substring(nickname.indexOf("[")+1)
        const odznakast = a.slice(0,((nickname.indexOf("]")-nickname.length)))
        const name = nickname.substring(nickname.indexOf("]")+2);
        const db = await dbConnect();
        db.query("INSERT INTO nagany (id, imie_nazwisko, stopien, odznaka, powod, ktora_nagana, wystawiajacy, data) VALUES (?,?,?,?,?,?,?,?)",[user.id, name, oldRole2.name, odznakast, powod, `${liczba}/2`, interaction.member.displayName, new Date()], (err,results) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }
        })
        db.close();
    },
};