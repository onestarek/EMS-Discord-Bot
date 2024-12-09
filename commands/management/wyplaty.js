const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const logi = '1279781839325892679';
const getHighestRole = require('../../utils').getHighestRole;

const listarang = {
    '1279773949332291615':0, // Director
    '1279773950230138923':0, // Assistant
    '1279773951077384282':0, // Deputy
    '1279773952331485297':0, // Senior Registrar
    '1292071966035017809':0, // Sectional Head
    '1292071842961690636':0, // Associate Professor
    '1279773956705882183':0, // Senior Doctor
    '1279773957884477503':0, // Doctor
    '1292071720517369950':0, // Medical Specjalist
    '1279773958794907679':0, // Senior Physican
    '1279773959742820374':0, // Physican
    '1279773960891793489':0, // Resident
    '1279773961542176870':0, // Advanced EMT
    '1279773963802902598':0, // EMT
    '1279773964863799381':0, // EMT Apprentice
    '1279773966633930754':0, // Trainee
};
module.exports = {
    data: new SlashCommandBuilder()
        .setName('wyplaty')
        .setDescription('[Management] Wypłata.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('oblicz')
                .setDescription('Oblicz ile wychodzi wypłaty')
                .addUserOption(option => option.setName('user').setDescription('Wybierz medyka'))
                .addIntegerOption(option => option.setName('godziny').setDescription('Wpisz ile godzin'))
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('wyczysc')
                .setDescription('Wyczyść tabele od wypłat')
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sprawdz')
                .setDescription('Sprawdź ile Wypłaty masz do Odebrania')
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('odbierz')
                .setDescription('Wydana wypłata')
                .addUserOption(option => option.setName('user').setDescription('Wybierz medyka'))
            )
        .addSubcommand(subcommand =>
            subcommand
                .setName('lista')
                .setDescription('Zobacz liste wypłat')
            ),
        async execute(interaction){
            const subcommand = interaction.options.getSubcommand();
            let permsList = []
            if (subcommand === 'sprawdz') {
                permsList = [
                    '1279774025228222545', // Pracownik
                ];
            } else {         
                permsList = [
                    '1279774029829374104', // all
                    '1279774030777417770', // bot.management
                ];
            }
            await interaction.deferReply({ephemeral: true});
            const userRoles = interaction.guild.members.cache.get(interaction.member.id).roles.cache;
            let oldRole;
            for (const role of userRoles.values()) {
                if (permsList.includes(role.id)) {
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
            
            const db = await dbConnect()
            switch(subcommand){
                case 'oblicz':
                    const user = interaction.options.getUser('user');
                    const hours = interaction.options.getInteger('godziny');
                    const member = await interaction.guild.members.fetch(user.id);
                    const nickname = member.displayName;
                    if (!interaction.guild.members.cache.has(member.id)) {
                        return interaction.editReply({ content: `Użytkownik ${member} nie jest członkiem tego serwera.`, ephemeral: true });
                    }
                    let role = getHighestRole(member)
                    const wyplata = hours * listarang[`${role.id}`]
                    const embed = new EmbedBuilder()
                    .setTitle('Kalkukator Wypłat')
                    .setColor("Random")
                    .addFields([
                        {name:"Imie Nazwisko", value: `${nickname}`},
                        {name:"Stopień", value: `${role.name}`},
                        {name:"Ilość Godzin", value: `${hours}h`},
                        {name:"Należna Wypłata", value: `${wyplata}$`},
                    ]);
                    await interaction.editReply({ embeds: [embed] });
                    db.query('INSERT INTO wyplaty (ID, Stopien, ImieNazwisko, Godziny, Wyplata) VALUES (?,?,?,?,?)', [member.id,role.name,nickname,hours,`${wyplata}$`], (err,results) => {
                        if (err) throw err;
                        db.end()
                    })
                    break;
                case 'wyczysc':
                    db.query('TRUNCATE wyplaty', async (err,results) => {
                        if (err) throw err;
                        db.end()
                        const embed2 = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('Pomyślnie wyczyszczono Baze Danych')
                        await interaction.editReply({ embeds: [embed2] });
                    })
                    break;
                case 'sprawdz':
                    const member3 = await interaction.guild.members.fetch(interaction.member.id);
                    db.query(`SELECT * FROM wyplaty WHERE id = ?`, [member3.id], async (err, results) => {
                        if(err){
                            throw err;
                        }
                        if(results.length==0){
                            db.destroy()
                            interaction.editReply({content:`Brak wypłaty do odebrania.`})
                            return;
                        } else {
                            const wyplataembed = new EmbedBuilder()
                            .setTitle('Wypłata')
                            .setDescription('Twoja Wypłata za ' & results.row[0].Godziny & 'h wynosi: ' & results.row[0].Wyplata)
                            .setColor('GREEN')
                            interaction.editReply({embeds:[wyplataembed]})
                        }
                    })
                    break;
                case 'odbierz':
                    const user2 = interaction.options.getUser('user');
                    const member2 = await interaction.guild.members.fetch(user2.id);
                    if (!interaction.guild.members.cache.has(member2.id)) {
                        return interaction.editReply({ content: `Użytkownik ${member} nie jest członkiem tego serwera.`, ephemeral: true });
                    }
                    db.query(`SELECT * FROM wyplaty WHERE id = ?`, [member2.id], async (err, results) => {
                        if(err){
                            throw err;
                        }
                        if(results.length==0){
                            db.destroy()
                            interaction.editReply({content:`Brak wypłat dla ${member2} w bazie danych.`})
                            return;
                        } else {
                            db.query(`DELETE FROM wyplaty WHERE id = ?`, [member2.id], async (err, results) => {
                                if (err) {
                                    console.error('Error deleting row:', err);
                                    return;
                                }
                                db.end()
                                const embed3 = new EmbedBuilder()
                                    .setColor('Green')
                                    .setDescription(`Pomyślnie Wydano ${user2} wypłate.`)
                                await interaction.editReply({ embeds: [embed3] });
                            });
                        }
                    })
                    break;
                case 'lista':
                    let listString = ''
                    await new Promise((resolve, reject) => {
                        db.query('SELECT * FROM wyplaty', async (err,results) => {
                            if (err){
                                reject(err);
                                throw err
                            };
                            if(results.length==0){
                                db.destroy()
                                interaction.editReply({content:"Brak danych w Bazie Danych."})
                                return;
                            }

                            await results.forEach(async (row) => {
                                listString += `**${row.ImieNazwisko}** - ${row.Stopien}\nWypłaty: ${row.Wyplata} (${row.Godziny}h)\n\n`;
                            })
                            resolve()
                        })
                    });
                    const embed4 = new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle(`Lista Wypłat`)
                        .setThumbnail('https://imgur.com/35ScGn8.png')
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                        });
        
                    if (listString.length == 0) {
                        embed4.setDescription('Brak wypłat.');
                    } else {
                        embed4.setDescription(listString);
                    }
                    await interaction.editReply({embeds:[embed4], ephemeral: true });
                    break;
                default:
                    return interaction.editReply({ content: 'Nieprawidłowa akcja. Wpisz poprawną komende.', ephemeral: true });
            }
        }
}