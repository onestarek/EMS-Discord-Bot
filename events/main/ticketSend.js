const { Events, Collection, ModalBuilder, TextInputBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, TextInputStyle, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logDirectory = '/share/daf/avocadoems/logs';
const dbConnect = require('../../utils').dbConnect;

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction,client) {
        if(interaction.isButton()&&interaction.customId=='ticketBtn2'){
            let customIDban = 0;
            const db = await dbConnect();
            await new Promise((resolve, reject) => {
                db.query('SELECT MAX(ticketban) AS maxId FROM tickety', (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err);
                    }
                    const maxId = results[0].maxId || 0; // Używamy 0, jeśli tabela jest pusta
                    customIDban = maxId + 1;
                    resolve()
                });
            })

            const channel = await interaction.guild.channels.create({        
                name: `ban-${customIDban}`,
                topic: `${interaction.member.id}`,
                type: ChannelType.GuildText,
                parent: '1286174282296070246',
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: '1279774024074788985',
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    }
                ],
            })
            db.query('UPDATE tickety SET ticketban = ? WHERE ticketban = ?', [customIDban,customIDban-1], (err) => {
                if (err) throw err;
            })
            db.end()
            const embed = new EmbedBuilder()
                .setTitle('Poczekaj')
                .setTimestamp()
                .setColor('#82b0fa')
                // .setFooter({text: `Ticket utworzono`})
                .setDescription(`${interaction.user.displayName} opisz sprawę w jakiej otworzyłeś tego Ticket'a i poczekaj na odpowiedź kogoś z Administracji.`)
            const zamknijbtn = new ButtonBuilder()
                .setCustomId(`zamknijsprawe2`)
                .setLabel('Zamknij Ticket')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger)
                    
            const row2 = new ActionRowBuilder()
                .addComponents(zamknijbtn)
            await channel.send({embeds: [embed], components:[row2], content:`${interaction.member}`})
            await channel.permissionOverwrites.create(interaction.channel.topic, {
                ViewChannel: true,
                SendMessages: true,
            })
        }
        if(interaction.isButton()&&interaction.customId==`zamknijsprawe2`){
            if(!interaction.member.roles.cache.has('1279774024074788985')) return await interaction.reply({content:"Nie możesz tego zrobić!",ephemeral:true})
            interaction.message.delete();
            const channel = interaction.guild.channels.cache.get(interaction.channel.id)
            channel.permissionOverwrites.create(interaction.channel.topic, {
                ViewChannel: false,
                SendMessages: false,
            })
            channel.setName(`closed-${interaction.channel.name.substring(interaction.channel.name.indexOf("-")+1)}`)
            const embed2 = new EmbedBuilder()
            .setTitle('Panel Sterowania Ticket\'em')
            .setTimestamp()
            .setColor('Red')
            const zamknijbtn2 = new ButtonBuilder()
                .setCustomId(`usunticket2`)
                .setLabel('Usuń Ticket')
                .setStyle(ButtonStyle.Danger)

            const row3 = new ActionRowBuilder()
                .addComponents(zamknijbtn2)
            await channel.send({embeds: [embed2], components:[row3], content:`${interaction.member}`})
        }
        if(interaction.isButton()&&interaction.customId==`usunticket2`){
            setTimeout(async () => {
                await interaction.channel.delete();
            }, 5000);
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            let logContent2 = `Log zamknięcia ticketu: ${interaction.channel.name}\nOsoba zamykająca: ${interaction.user.tag}\n\nWiadomości:\n`;
            messages.reverse().forEach(msg => {
                logContent2 += `${msg.author.tag}: ${msg.content} (at ${msg.createdAt.toISOString()})\n`;
            });

            const fileName2 = `${interaction.channel.name}-${Date.now()}.txt`;
            const filePath2 = path.join(logDirectory, fileName2);
            fs.writeFileSync(filePath2, logContent2);
            const closeEmbed2 = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Log Zamknięcia Ticketa')
            .setDescription(`**Ticket:** ${interaction.channel.name}\n**Osoba Zamykająca:** <@${interaction.user.id}>`)
            .setTimestamp();
            const logChannel2 = interaction.client.channels.cache.get('1286174588056637490');
            logChannel2.send({embeds:[closeEmbed2],files:[filePath2]})
        }
        if(interaction.isButton()&&interaction.customId=='ticketBtn'){
            let customID = 0;
            const db = await dbConnect();
            await new Promise((resolve, reject) => {
                db.query('SELECT MAX(ticketzarzad) AS maxId FROM tickety', (err, results) => {
                    if (err) {
                        console.error(err)
                        reject(err);
                    }
                    const maxId = results[0].maxId || 0; // Używamy 0, jeśli tabela jest pusta
                    customID = maxId + 1;
                    resolve()
                });
            })

            const channel = await interaction.guild.channels.create({        
                name: `sprawa-${customID}`,
                topic: `${interaction.member.id}`,
                type: ChannelType.GuildText,
                parent: '1279774202924240958',
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: '1279773953207963794',
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    }
                ],
            })
            db.query('UPDATE tickety SET ticketzarzad = ? WHERE ticketzarzad = ?', [customID,customID-1], (err) => {
                if (err) throw err;
            })
            db.end()
            const embed = new EmbedBuilder()
                .setTitle('Poczekaj')
                .setTimestamp()
                .setColor('#82b0fa')
                // .setFooter({text: `Ticket utworzono`})
                .setDescription(`${interaction.user.displayName} opisz sprawę w jakiej otworzyłeś tego Ticket'a i poczekaj na odpowiedź kogoś z zarządu.`)
            const zamknijbtn = new ButtonBuilder()
                .setCustomId(`zamknijsprawe`)
                .setLabel('Zamknij Ticket')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger)
                    
            const row2 = new ActionRowBuilder()
                .addComponents(zamknijbtn)
            await channel.send({embeds: [embed], components:[row2], content:`${interaction.member}`})
            await channel.permissionOverwrites.create(interaction.member, {
                ViewChannel: true,
                SendMessages: true,
            })
        }
        if(interaction.isButton()&&interaction.customId==`zamknijsprawe`){
            if(!interaction.member.roles.cache.has('1279773953207963794')) return await interaction.reply({content:"Nie możesz tego zrobić!",ephemeral:true})
            interaction.message.delete();
            const channel = interaction.guild.channels.cache.get(interaction.channel.id)
            channel.permissionOverwrites.create(interaction.channel.topic, {
                ViewChannel: false,
                SendMessages: false,
            })
            channel.setName(`closed-${interaction.channel.name.substring(interaction.channel.name.indexOf("-")+1)}`)
            const embed = new EmbedBuilder()
            .setTitle('Panel Sterowania Ticket\'em')
            .setTimestamp()
            .setColor('Red')
            const zamknijbtn = new ButtonBuilder()
                .setCustomId(`usunticket`)
                .setLabel('Usuń Ticket')
                .setStyle(ButtonStyle.Danger)

            const row2 = new ActionRowBuilder()
                .addComponents(zamknijbtn)
            await channel.send({embeds: [embed], components:[row2], content:`${interaction.member}`})
        }
        if(interaction.isButton()&&interaction.customId==`usunticket`){
            setTimeout(async () => {
                await interaction.channel.delete();
            }, 5000);
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            let logContent = `Log zamknięcia ticketu: ${interaction.channel.name}\nOsoba zamykająca: ${interaction.user.tag}\n\nWiadomości:\n`;
            messages.reverse().forEach(msg => {
                logContent += `${msg.author.tag}: ${msg.content} (at ${msg.createdAt.toISOString()})\n`;
            });

            const fileName = `${interaction.channel.name}-${Date.now()}.txt`;
            const filePath = path.join(logDirectory, fileName);
            fs.writeFileSync(filePath, logContent);
            const closeEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Log Zamknięcia Ticketa')
            .setDescription(`**Ticket:** ${interaction.channel.name}\n**Osoba Zamykająca:** <@${interaction.user.id}>`)
            .setTimestamp();
            const logChannel = interaction.client.channels.cache.get('1279774610581094446');
            logChannel.send({embeds:[closeEmbed],files:[filePath]})
        }
	},
};