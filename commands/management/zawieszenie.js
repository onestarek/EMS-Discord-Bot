const { SlashCommandBuilder, SlashCommandStringOption } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const getHighestRole = require('../../utils').getHighestRole;
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zawieszenie')
        .setDescription('[Management] Wystaw Zawieszenie.')        
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Osoba do Zawieszenia')
                .setRequired(true))
        .addStringOption(
            new SlashCommandStringOption()
            .setName('start')
            .setDescription('Data Startu')
            .setRequired(true)
        )    
        .addStringOption(
            new SlashCommandStringOption()
            .setName('koniec')
            .setDescription('Data Końca')
            .setRequired(true)
        )    
        .addStringOption(
            new SlashCommandStringOption()
            .setName('powod')
            .setDescription('Wypisz Powód')
            .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const permslist = [
            '1279774029829374104', // all
            '1279774030777417770', // bot.management
            '1279774042798297111', // bot.zwolnienie 
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

            await interaction.client.channels.cache.get(logi).send({ embeds: [unauthorizedEmbed] });
            return await interaction.editReply({ content: 'Nie masz uprawnień do używania tej komendy.', ephemeral: true });
        }
        const user = interaction.options.getUser('user');
        if (!interaction.guild.members.cache.has(user.id)) {
            return interaction.editReply({ content: `Użytkownik ${user} nie jest członkiem tego serwera.`, ephemeral: true });
        }
        const member = await interaction.guild.members.fetch(user.id);
        const oldRole2 = getHighestRole(member);
        function convertDateFormat(date) {
            const [day, month, year] = date.split('/').map(str => {
                const num = Number(str);
                return isNaN(num) ? null : num;
            });

            if (!day || !month || !year) {
                throw new Error('Invalid date format');
            }

            return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
        const startDateString = interaction.options.getString('start');
        const endDateString = interaction.options.getString('koniec');

        if (!startDateString || !endDateString) {
            throw new Error('Missing date values');
        }

        let urlopstart;
        let urlopend;
        try {
            urlopstart = new Date(convertDateFormat(startDateString));
            urlopend = new Date(convertDateFormat(endDateString));
        } catch (error) {
            const debil = new EmbedBuilder()
            .setColor('#ff0000')
            // .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
            .setTimestamp()
            .setDescription(
                `**Niepoprawny format daty!**\nWpisz date w formacie DD/MM/YYYY!`
            )
            return interaction.editReply({embeds: [debil], ephemeral: true})
        }
        let startDay = urlopstart.getDate();
        startDay = startDay < 10 ? '0' + startDay : startDay;
        let startMonth = urlopstart.getMonth() + 1;
        startMonth = startMonth < 10 ? '0' + startMonth : startMonth;
        let startYear = urlopstart.getFullYear();

        let endDay = urlopend.getDate();
        endDay = endDay < 10 ? '0' + endDay : endDay;
        let endMonth = urlopend.getMonth() + 1;
        endMonth = endMonth < 10 ? '0' + endMonth : endMonth;
        let endYear = urlopend.getFullYear();

        let datastartu = startDay+"/"+startMonth+"/"+startYear;
        let datakonca = endDay+"/"+endMonth+"/"+endYear;
        await interaction.guild.members.cache.get(interaction.member.id).roles.add('1279774021440766157');
        await interaction.guild.members.cache.get(interaction.member.id).roles.remove('1279774020656431147');
        const embed3 = new EmbedBuilder()
        .setColor('Random')
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
        .setTimestamp()
        .setDescription(`Pomyślnie wypisano zawieszenie.`)

        await interaction.editReply({embeds: [embed3], ephemeral: true});
        const powod = interaction.options.getString('powod');
        let color = interaction.member.displayHexColor;
        if (color == '#000000') color = interaction.member.hoistRole.hexColor;
        const embede = new EmbedBuilder()
        .setColor(color)
        .setTitle('Ktoś został Zawieszony')
        .setThumbnail('https://imgur.com/35ScGn8.png')
        .addFields(
            { name: "Kto Wystawił:", value: `${interaction.member}`, inline: false },
            { name: "Kto Otrzymał:", value: `${member}`, inline: true },
            { name: "Stopień:", value: `${oldRole2}`, inline: true },
            { name: "Od Kiedy:", value: `${datastartu}`, inline: false },
            { name: "Do Kiedy:", value: `${datakonca}`, inline: true },
            { name: "Powód:", value: `${powod}`, inline: false },
        )
        .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        // .setFooter({ text: `Uruchomione przez: ${interaction.user.tag}` })
        .setTimestamp()
    
        interaction.client.channels.cache.get(`1279774465005195264`).send({
            content: `${interaction.options.getUser('user')}`,
            embeds: [embede] 
        });
        const nickname = member.displayName;
        const name = nickname.substring(nickname.indexOf("]")+2);
        const a = nickname.substring(nickname.indexOf("[")+1)
        const odznaka = a.slice(0,((nickname.indexOf("]")-nickname.length)))
        const db = await dbConnect();
        db.query("INSERT INTO zawieszenia (id, imie_nazwisko, stopien, odznaka, powod, rozpoczecie, zakoczenie, wystawiajacy, data) VALUES (?,?,?,?,?,?,?,?,?)",[member.id, name, oldRole2.name,odznaka,powod,urlopstart,urlopend,interaction.member.displayName, new Date()], (err,results) => {
            if (err) {
                console.error('Error executing query:', err);
                return;
            }
        })
        db.end();
    }
}
