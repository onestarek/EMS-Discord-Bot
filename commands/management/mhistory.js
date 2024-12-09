const { SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const dbConnect = require('../../utils').dbConnect;
const rankList = require('../../utils').listarang;
const getHighestRole = require('../../utils').getHighestRole;
const logi = '1279781839325892679';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mhistory')
        .setDescription('[Management] Sprawdź medyka.')        
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Osoba którą chcesz sprawdzić.')
                .setRequired(true))
        .addStringOption(option =>
		    option.setName('kategoria')
			    .setDescription('Którą Kategorię chcesz sprawdzić?')
			    .setRequired(true)
			    .addChoices(
			    	{ name: 'Plusy', value: 'm_plusy' },
			    	{ name: 'Pochwały', value: 'm_pochwaly' },
			    	{ name: 'Awanse', value: 'm_awanse' },
			    	{ name: 'Minusy', value: 'm_minusy' },
			    	{ name: 'Nagany', value: 'm_nagany' },
			    	{ name: 'Ostrzezenia', value: 'm_ostrzezenia' },
                    { name: 'Degradacje', value: 'm_degradacje' },
			        { name: 'Urlopy', value: 'm_urlopy' },
                    { name: "Wszystko", value: 'm_all'}
			    )),
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true});
        const db = await dbConnect();
        const permslist = [
            '1279774029829374104', // all
            '1279774030777417770', // bot.management
            '1279774033378017302', // bot.mhistory 
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
        const kategoria = interaction.options.getString('kategoria')
        let color = user.displayHexColor;
        if (color == '#000000') color = user.hoistRole.hexColor;
        const embed = new EmbedBuilder()
        .setColor(color)
        if (kategoria === "m_plusy") {
            let string = '';
            embed.setTitle(`Historia Plusów ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM plusy WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            console.log(`${user.displayName} nie otrzymał jeszcze plusa.`);
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) otrzymał dnia ${formattedDate} plusa od ${row.wystawiajacy} z powodem "${row.powod}" [${row.ktory_plus}]`;
                            });
                            const finalString = strings.join('\n\n');
                            string = finalString;
                            resolve();
                        }
                    }
                });
                db.end()
            });
            embed.setDescription(string);
            await interaction.editReply({embeds:[embed]});
        }
        if(kategoria === "m_pochwaly"){
            let string = '';
            embed.setTitle(`Historia Pochwał ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM pochwaly WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            console.log(`${user.displayName} nie otrzymał jeszcze pochwały.`);
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) otrzymał dnia ${formattedDate} pochwałe od ${row.wystawiajacy} z powodem "${row.powod}" [${row.ktora_pochwala}]`;
                            });
                            const finalString = strings.join('\n\n');
                            string = finalString;
                            resolve();
                        }
                    }
                });
                db.end();
            });
            embed.setDescription(string);
            await interaction.editReply({embeds:[embed]});
        }
        if(kategoria === "m_awanse"){
            let string = '';
            embed.setTitle(`Historia Awansów ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM awanse WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            console.log(`${user.displayName} nie otrzymał jeszcze awansu.`);
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.stara_odznaka}] ${row.imie_nazwisko} (${row.stary_stopien}) otrzymał dnia ${formattedDate} awans od ${row.wystawiajacy} na stopień ${row.nowy_stopien} z powodem "${row.powod}", otrzymując numer odznaki [${row.nowa_odznaka}]`;
                            });
                            const finalString = strings.join('\n\n');
                            string = finalString;
                            resolve();
                        }
                    }
                });
                db.end();
            });
            embed.setDescription(string);
            await interaction.editReply({embeds:[embed]});
        }
        if(kategoria === "m_minusy"){
            let string = '';
            embed.setTitle(`Historia Minusów ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM minusy WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            console.log(`${user.displayName} nie otrzymał jeszcze minusa.`);
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) otrzymał dnia ${formattedDate} minusa od ${row.wystawiajacy} z powodem "${row.powod}" [${row.ktory_minus}]`;
                            });
                            const finalString = strings.join('\n\n');
                            string = finalString;
                            resolve();
                        }
                    }
                });
                db.end();
            });
            embed.setDescription(string);
            await interaction.editReply({embeds:[embed]});
        }
        if(kategoria === "m_nagany"){
            let string = '';
            embed.setTitle(`Historia Nagan ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM nagany WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            console.log(`${user.displayName} nie otrzymał jeszcze nagany.`);
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) otrzymał dnia ${formattedDate} nagane od ${row.wystawiajacy} z powodem "${row.powod}" [${row.ktora_nagana}]`;
                            });
                            const finalString = strings.join('\n\n');
                            string = finalString;
                            resolve();
                        }
                    }
                });
                db.end();
            });
            embed.setDescription(string);
            await interaction.editReply({embeds:[embed]});
        }
        if(kategoria === "m_ostrzezenia"){
            let string = '';
            embed.setTitle(`Historia Ostrzeżeń ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM ostrzezenia WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            console.log(`${user.displayName} nie otrzymał jeszcze ostrzeżenia.`);
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) otrzymał dnia ${formattedDate} ostrzeżenie od ${row.wystawiajacy} z powodem "${row.powod}" [${row.ktore_ostrzezenie}]`;
                            });
                            const finalString = strings.join('\n\n');
                            string = finalString;
                            resolve();
                        }
                    }
                });
                db.end();
            });
            embed.setDescription(string);
            await interaction.editReply({embeds:[embed]});
        }
        if(kategoria === "m_degradacje"){
            let string = '';
            embed.setTitle(`Historia Degradacji ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM degradacje WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            console.log(`${user.displayName} nie otrzymał jeszcze degradacji.`);
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.stara_odznaka}] ${row.imie_nazwisko} (${row.stary_stopien}) otrzymał dnia ${formattedDate} degradacje od ${row.wystawiajacy} na stopień ${row.nowy_stopien} z powodem "${row.powod}", otrzymując numer odznaki [${row.nowa_odznaka}]`;
                            });
                            const finalString = strings.join('\n\n');
                            string = finalString;
                            resolve();
                        }
                    }
                });
                db.end();
            });
            embed.setDescription(string);
            await interaction.editReply({embeds:[embed]});
        }
        if(kategoria === "m_urlopy"){
            let string = '';
            embed.setTitle(`Historia Urlopów ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM urlopy WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            console.log(`${user.displayName} nie wypisał jeszcze urlopu.`);
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date1 = new Date(row.rozpoczecie);
                                const date2 = new Date(row.zakonczenie);
                                const formattedDate1 = `${String(date1.getDate()).padStart(2, '0')}/${String(date1.getMonth() + 1).padStart(2, '0')}/${date1.getFullYear()}`;
                                const formattedDate2 = `${String(date2.getDate()).padStart(2, '0')}/${String(date2.getMonth() + 1).padStart(2, '0')}/${date2.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) wypisał dnia ${formattedDate1} urlop do ${formattedDate2} z powodu "${row.powod}" [${row.status}]`;
                            });
                            const finalString = strings.join('\n\n');
                            string = finalString;
                            resolve();
                        }
                    }
                });
                db.end();
            });
            embed.setDescription(string);
            await interaction.editReply({embeds:[embed]});
        }
        if(kategoria === "m_all"){
            const urlopy = new EmbedBuilder()
                .setColor(color)
            const degradacje = new EmbedBuilder()
                .setColor(color)
            const ostrzezenia = new EmbedBuilder()
                .setColor(color)
            const nagany = new EmbedBuilder()
                .setColor(color)
            const minusy = new EmbedBuilder()
                .setColor(color)
            const awanse = new EmbedBuilder()
                .setColor(color)
            const pochwaly = new EmbedBuilder()
                .setColor(color)
            const plusy = new EmbedBuilder()
                .setColor(color)

            let urlopstring = '';
            urlopy.setTitle(`Historia Urlopów ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM urlopy WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            urlopstring = `${user.displayName} nie wypisał jeszcze urlopu.`;
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date1 = new Date(row.rozpoczecie);
                                const date2 = new Date(row.zakonczenie);
                                const formattedDate1 = `${String(date1.getDate()).padStart(2, '0')}/${String(date1.getMonth() + 1).padStart(2, '0')}/${date1.getFullYear()}`;
                                const formattedDate2 = `${String(date2.getDate()).padStart(2, '0')}/${String(date2.getMonth() + 1).padStart(2, '0')}/${date2.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} wypisał dnia ${formattedDate1} urlop do ${formattedDate2} z powodu "${row.powod}" [${row.status}]`;
                            });
                            const finalString = strings.join('\n\n');
                            urlopstring = finalString;
                            resolve();
                        }
                    }
                });
            });
            urlopy.setDescription(urlopstring);

            let degradacjestring = '';
            degradacje.setTitle(`Historia Degradacji ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM degradacje WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            degradacjestring = `${user.displayName} nie otrzymał jeszcze degradacji.`;
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.stara_odznaka}] ${row.imie_nazwisko} (${row.stary_stopien}) otrzymał dnia ${formattedDate} degradacje od ${row.wystawiajacy} na stopień ${row.nowy_stopien} z powodem "${row.powod}", otrzymując numer odznaki [${row.nowa_odznaka}]`;
                            });
                            const finalString = strings.join('\n\n');
                            degradacjestring = finalString;
                            resolve();
                        }
                    }
                });
            });
            degradacje.setDescription(degradacjestring);

            let ostrzezeniastring = '';
            ostrzezenia.setTitle(`Historia Ostrzeżeń ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM ostrzezenia WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            ostrzezeniastring = `${user.displayName} nie otrzymał jeszcze ostrzeżenia.`;
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) otrzymał dnia ${formattedDate} ostrzeżenie od ${row.wystawiajacy} z powodem "${row.powod}" [${row.ktore_ostrzezenie}]`;
                            });
                            const finalString = strings.join('\n\n');
                            ostrzezeniastring = finalString;
                            resolve();
                        }
                    }
                });
            });
            ostrzezenia.setDescription(ostrzezeniastring);
            
            let naganystring = '';
            nagany.setTitle(`Historia Nagan ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM nagany WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            naganystring = `${user.displayName} nie otrzymał jeszcze nagany.`;
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) otrzymał dnia ${formattedDate} nagane od ${row.wystawiajacy} z powodem "${row.powod}" [${row.ktora_nagana}]`;
                            });
                            const finalString = strings.join('\n\n');
                            naganystring = finalString;
                            resolve();
                        }
                    }
                });
            });
            nagany.setDescription(naganystring);

            let minusystring = '';
            minusy.setTitle(`Historia Minusów ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM minusy WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            minusystring = `${user.displayName} nie otrzymał jeszcze minusa.`;
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) otrzymał dnia ${formattedDate} minusa od ${row.wystawiajacy} z powodem "${row.powod}" [${row.ktory_minus}]`;
                            });
                            const finalString = strings.join('\n\n');
                            minusystring = finalString;
                            resolve();
                        }
                    }
                });
            });
            minusy.setDescription(minusystring);

            let awansestring = '';
            awanse.setTitle(`Historia Awansów ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM awanse WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            awansestring = `${user.displayName} nie otrzymał jeszcze awansu.`;
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.stara_odznaka}] ${row.imie_nazwisko} (${row.stary_stopien}) otrzymał dnia ${formattedDate} awans od ${row.wystawiajacy} na stopień ${row.nowy_stopien} z powodem "${row.powod}", otrzymując numer odznaki [${row.nowa_odznaka}]`;
                            });
                            const finalString = strings.join('\n\n');
                            awansestring = finalString;
                            resolve();
                        }
                    }
                });
            });
            awanse.setDescription(awansestring);

            
            let pochwalystring = '';
            pochwaly.setTitle(`Historia Pochwał ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM pochwaly WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            pochwalystring=`${user.displayName} nie otrzymał jeszcze pochwały.`;
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) otrzymał dnia ${formattedDate} pochwałe od ${row.wystawiajacy} z powodem "${row.powod}" [${row.ktora_pochwala}]`;
                            });
                            const finalString = strings.join('\n\n');
                            pochwalystring = finalString;
                            resolve();
                        }
                    }
                });
            });
            pochwaly.setDescription(pochwalystring);

            let plusystring = '';
            plusy.setTitle(`Historia Plusów ${user.displayName}`)
            await new Promise((resolve, reject) => {
                db.query(`SELECT * FROM plusy WHERE id = ?`, [user.id], (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                    } else {
                        if (results.length === 0) {
                            plusystring=`${user.displayName} nie otrzymał jeszcze plusa.`;
                            resolve();
                        } else {
                            const strings = results.map((row) => {
                                const date = new Date(row.data);
                                const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                                return `[${row.odznaka}] ${row.imie_nazwisko} (${row.stopien}) otrzymał dnia ${formattedDate} plusa od ${row.wystawiajacy} z powodem "${row.powod}" [${row.ktory_plus}]`;
                            });
                            const finalString = strings.join('\n\n');
                            plusystring = finalString;
                            resolve();
                        }
                    }
                });
                db.end();
            });
            plusy.setDescription(plusystring);

            await interaction.editReply({embeds:[plusy,pochwaly,awanse,minusy,nagany,ostrzezenia,degradacje,urlopy],ephemeral:true});
            db.end();
        }

    },
};