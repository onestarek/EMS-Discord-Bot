const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const cfx_api = require('cfx-api');
const logi = '1279781839325892679';
const getHighestRole = require("../../utils").getHighestRole;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('[SAMS] Sprawdź swój profil.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Osoba którą chcesz sprawdzić.')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const requiredRoleId = '1279774025228222545';

        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            const unauthorizedEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Nieautoryzowana próba użycia komendy')
                .setDescription(`Użytkownik ${interaction.user} próbował użyć komendy \`${interaction.commandName}\`, nie posiadając wymaganej roli.`)
                .setTimestamp();

            await interaction.client.channels.cache.get('1279781839325892679').send({ embeds: [unauthorizedEmbed] });
            return await interaction.reply({ content: 'Nie masz uprawnień do używania tej komendy.', ephemeral: true });
        }

        const member = interaction.options.getUser('user');

        if(member){
            const permslist = [
                '1279774029829374104', // all
                '1279774030777417770', // bot.management
                '1279774045058895956', // bot.profil
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
            const user = await interaction.guild.members.fetch(member.id);
            let oldRole2 = getHighestRole(user)
            let awansstring = '';
            let datadolaczeniastring = '';
            const db = await dbConnect();
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM pracownicy WHERE id = ?', [user.id], (err,results) => {
                    if(err){
                        console.error(err)
                        reject(err)
                    } else {
                        if(results.length === 0){
                            awansstring = '-/-'
                            datadolaczeniastring = '-/-'
                            resolve()
                        } else {
                            awansstring = results[0].data_awansu?.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })?? '-/-';
                            datadolaczeniastring = results[0].data_dolaczenia?.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })?? '-/-';
                            resolve()
                        }
                    }
    
                })
            })
            if (awansstring === null){
                awansstring = datadolaczeniastring;
            }
    
            const nickname = user.displayName;
            const odznakast = nickname.substring(nickname.indexOf("[")+1).slice(0,((nickname.indexOf("]")-nickname.length)))
            let playerurlopstatus = 'Nie';
            if(user.roles.cache.has('1279774019733815371')) playerurlopstatus = 'Tak';
            const embeduno = new EmbedBuilder()
            .setColor("Red")
            .setTitle(`Profil ${user.displayName}`)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {name: "Stopień", value: `${oldRole2.name}`, inline:true},
                {name: "Odznaka", value: `${odznakast}`, inline:true},
                {name: "Data Dołączenia", value: `${datadolaczeniastring}`, inline:true},
                {name: "Ostatni Awans", value: `${awansstring}`, inline:true},
                {name: "Na urlopie?", value: `${playerurlopstatus}`, inline:true},
            )
            let degrad = '';
            let nagana = '';
            let minus = '';
            let ostrzezenie = '';
            let awans = '';
            let pochwala = '';
            let plus = '';
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM degradacje WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            degrad = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2, '0')}/${zakonczenieDate.getFullYear()}`
                            degrad=`Degradacja z dnia ${formattedDate}, ze stopnia ${results[0].stary_stopien} na ${results[0].nowy_stopien}. Powód: "${results[0].powod}", wystawiona przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM awanse WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            awans = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2, '0')}/${zakonczenieDate.getFullYear()}`
                            awans=`Awans z dnia ${formattedDate}, ze stopnia ${results[0].stary_stopien} na ${results[0].nowy_stopien}. Powód: "${results[0].powod}", wystawiony przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM nagany WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            nagana = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2, '0')}/${zakonczenieDate.getFullYear()}`
                            let ktora = 'Druga';
                            if(results[0].ktora_nagana === '1/2'){
                                ktora = 'Pierwsza'
                            }
                            nagana=`${ktora} nagana z dnia ${formattedDate}. Powód: "${results[0].powod}", wystawiona przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM pochwaly WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            pochwala = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2, '0')}/${zakonczenieDate.getFullYear()}`
                            let ktora = 'Druga';
                            if(results[0].ktora_pochwala === '1/2'){
                                ktora = 'Pierwsza'
                            }
                            pochwala=`${ktora} Pochwała z dnia ${formattedDate}. Powód: "${results[0].powod}", wystawiona przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM minusy WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            minus = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2, '0')}/${zakonczenieDate.getFullYear()}`
                            let ktora = '';
                            if(results[0].ktory_minus === '1/5'){
                                ktora = 'Pierwszy'
                            }
                            if(results[0].ktory_minus === '2/5'){
                                ktora = 'Drugi'
                            }
                            if(results[0].ktory_minus === '3/5'){
                                ktora = 'Trzeci'
                            }
                            if(results[0].ktory_minus === '4/5'){
                                ktora = 'Czwarty'
                            }
                            if(results[0].ktory_minus === '5/5'){
                                ktora = 'Piąty'
                            }
                            minus=`${ktora} Minus z dnia ${formattedDate}. Powód: "${results[0].powod}", wystawiony przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM plusy WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            plus = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2, '0')}/${zakonczenieDate.getFullYear()}`
                            let ktora = '';
                            if(results[0].ktory_plus === '1/5'){
                                ktora = 'Pierwszy'
                            }
                            if(results[0].ktory_plus === '2/5'){
                                ktora = 'Drugi'
                            }
                            if(results[0].ktory_plus === '3/5'){
                                ktora = 'Trzeci'
                            }
                            if(results[0].ktory_plus === '4/5'){
                                ktora = 'Czwarty'
                            }
                            if(results[0].ktory_plus === '5/5'){
                                ktora = 'Piąty'
                            }
                            plus=`${ktora} Plus z dnia ${formattedDate}. Powód: "${results[0].powod}", wystawiony przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM ostrzezenia WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            ostrzezenie = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2, '0')}/${zakonczenieDate.getFullYear()}`
                            let ktora = '';
                            if(results[0].ktore_ostrzezenie === 1){
                                ktora = 'Pierwsze'
                            }
                            if(results[0].ktore_ostrzezenie === 2){
                                ktora = 'Drugie'
                            }
                            ostrzezenie=`${ktora} Ostrzezenie z dnia ${formattedDate}. Powód: "${results[0].powod}", wystawione przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            db.end();
            const embeddos = new EmbedBuilder()
            .setTitle(`Wykroczenia ${user.displayName}`)
            .addFields(
                {name:"Ostatnia Degradacja", value:`${degrad}`},
                {name:"Ostatnia Nagana", value:`${nagana}`},
                {name:"Ostatni Minus", value:`${minus}`},
                {name:"Ostatnie Ostrzezenie", value:`${ostrzezenie}`},
            )
            .setColor('Red')
            const embedtres = new EmbedBuilder()
            .setTitle(`Nagrody ${user.displayName}`)
            .addFields(
                {name:"Ostatni Awans", value:`${awans}`},
                {name:"Ostatnia Pochwała", value:`${pochwala}`},
                {name:"Ostatni Plus", value:`${plus}`},
            )
            .setColor('Green')
            await interaction.editReply({embeds:[embeduno,embeddos,embedtres],ephemeral:true})
        } else {
            const user = await interaction.guild.members.fetch(interaction.member.id);
            let oldRole2 = getHighestRole(user)
            let awansstring = '';
            let datadolaczeniastring = '';
            const db = await dbConnect();
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM pracownicy WHERE id = ?', [user.id], (err,results) => {
                    if(err){
                        console.error(err)
                        reject(err)
                    } else {
                        if(results.length === 0){
                            awansstring = '-/-'
                            datadolaczeniastring = '-/-'
                            resolve()
                        } else {
                            awansstring = results[0].data_awansu?.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })?? '-/-';
                            datadolaczeniastring = results[0].data_dolaczenia?.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year:    'numeric' })?? '-/-';
                            resolve()
                        }
                    }

                })
            })
            if (awansstring === null){
                awansstring = datadolaczeniastring;
            }

            const nickname = user.displayName;
            const odznakast = nickname.substring(nickname.indexOf("[")+1).slice(0,((nickname.indexOf("]")-nickname.length)))
            let playerurlopstatus = 'Nie';
            if(user.roles.cache.has('1279774019733815371')) playerurlopstatus = 'Tak';
            const embeduno = new EmbedBuilder()
            .setColor("Red")
            .setTitle(`Profil ${user.displayName}`)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {name: "Stopień", value: `${oldRole2.name}`, inline:true},
                {name: "Odznaka", value: `${odznakast}`, inline:true},
                {name: "Data Dołączenia", value: `${datadolaczeniastring}`, inline:true},
                {name: "Ostatni Awans", value: `${awansstring}`, inline:true},
                {name: "Na urlopie?", value: `${playerurlopstatus}`, inline:true},
            )
            let degrad = '';
            let nagana = '';
            let minus = '';
            let ostrzezenie = '';
            let awans = '';
            let pochwala = '';
            let plus = '';
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM degradacje WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            degrad = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2,   '0')}/${zakonczenieDate.getFullYear()}`
                            degrad=`Degradacja z dnia ${formattedDate}, ze stopnia ${results[0].stary_stopien} na ${results[0].nowy_stopien}. Powód: "${results [0].powod}", wystawiona przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM awanse WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            awans = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2,   '0')}/${zakonczenieDate.getFullYear()}`
                            awans=`Awans z dnia ${formattedDate}, ze stopnia ${results[0].stary_stopien} na ${results[0].nowy_stopien}. Powód: "${results[0].   powod}", wystawiony przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM nagany WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            nagana = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2,   '0')}/${zakonczenieDate.getFullYear()}`
                            let ktora = 'Druga';
                            if(results[0].ktora_nagana === '1/2'){
                                ktora = 'Pierwsza'
                            }
                            nagana=`${ktora} nagana z dnia ${formattedDate}. Powód: "${results[0].powod}", wystawiona przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM pochwaly WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            pochwala = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2,   '0')}/${zakonczenieDate.getFullYear()}`
                            let ktora = 'Druga';
                            if(results[0].ktora_pochwala === '1/2'){
                                ktora = 'Pierwsza'
                            }
                            pochwala=`${ktora} Pochwała z dnia ${formattedDate}. Powód: "${results[0].powod}", wystawiona przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM minusy WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            minus = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2,   '0')}/${zakonczenieDate.getFullYear()}`
                            let ktora = '';
                            if(results[0].ktory_minus === '1/5'){
                                ktora = 'Pierwszy'
                            }
                            if(results[0].ktory_minus === '2/5'){
                                ktora = 'Drugi'
                            }
                            if(results[0].ktory_minus === '3/5'){
                                ktora = 'Trzeci'
                            }
                            if(results[0].ktory_minus === '4/5'){
                                ktora = 'Czwarty'
                            }
                            if(results[0].ktory_minus === '5/5'){
                                ktora = 'Piąty'
                            }
                            minus=`${ktora} Minus z dnia ${formattedDate}. Powód: "${results[0].powod}", wystawiony przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM plusy WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            plus = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2,   '0')}/${zakonczenieDate.getFullYear()}`
                            let ktora = '';
                            if(results[0].ktory_plus === '1/5'){
                                ktora = 'Pierwszy'
                            }
                            if(results[0].ktory_plus === '2/5'){
                                ktora = 'Drugi'
                            }
                            if(results[0].ktory_plus === '3/5'){
                                ktora = 'Trzeci'
                            }
                            if(results[0].ktory_plus === '4/5'){
                                ktora = 'Czwarty'
                            }
                            if(results[0].ktory_plus === '5/5'){
                                ktora = 'Piąty'
                            }
                            plus=`${ktora} Plus z dnia ${formattedDate}. Powód: "${results[0].powod}", wystawiony przez: ${results[0].wystawiajacy}`
                            resolve()
                        }
                    }
                })
            })
            await new Promise((resolve, reject) => {
                db.query('SELECT * FROM ostrzezenia WHERE id =? ORDER BY id DESC LIMIT 1', [user.id], (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        if (results.length === 0) {
                            ostrzezenie = 'Brak.'
                            resolve()
                        } else {
                            const zakonczenieDate = results[0].data;
                            const formattedDate = `${String(zakonczenieDate.getDate()).padStart(2, '0')}/${String(zakonczenieDate.getMonth() + 1).padStart(2,   '0')}/${zakonczenieDate.getFullYear()}`
                            let ktora = '';
                            if(results[0].ktore_ostrzezenie === 1){
                                ktora = 'Pierwsze'
                            }
                            if(results[0].ktore_ostrzezenie === 2){
                                ktora = 'Drugie'
                            }
                            ostrzezenie=`${ktora} Ostrzezenie z dnia ${formattedDate}. Powód: "${results[0].powod}", wystawione przez: ${results[0].wystawiajacy}   `
                            resolve()
                        }
                    }
                })
            })
            const embeddos = new EmbedBuilder()
            .setTitle(`Wykroczenia ${user.displayName}`)
            .addFields(
                {name:"Ostatnia Degradacja", value:`${degrad}`},
                {name:"Ostatnia Nagana", value:`${nagana}`},
                {name:"Ostatni Minus", value:`${minus}`},
                {name:"Ostatnie Ostrzezenie", value:`${ostrzezenie}`},
            )
            .setColor('Red')
            const embedtres = new EmbedBuilder()
            .setTitle(`Nagrody ${user.displayName}`)
            .addFields(
                {name:"Ostatni Awans", value:`${awans}`},
                {name:"Ostatnia Pochwała", value:`${pochwala}`},
                {name:"Ostatni Plus", value:`${plus}`},
            )
            .setColor('Green')
            db.end()
            await interaction.editReply({embeds:[embeduno,embeddos,embedtres],ephemeral:true})
        }
    },
};