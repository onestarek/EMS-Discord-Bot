const { Events, ActivityType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const welchannel = member.guild.channels.cache.get('1279782253735710772');
            if (!welchannel) {
                console.error('Cannot find the welcome channel.');
                return;
            }
            
            const totalMembers = member.guild.memberCount;

            const embed = new EmbedBuilder()
                .setTitle('Witaj w EMS!')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`Cześć ${member.user}!\nJesteś już ${totalMembers} pracownikiem!`)
                .setColor('#5d90e8')
                .setAuthor({
                    name: 'Społeczność EMS',
                    iconURL: member.guild.iconURL({ dynamic: true })
                })
                .setFooter({
                    text: `${member.user.tag}`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            const sentMessage = await welchannel.send({
                content: `${member.user}`,
                embeds: [embed]
            });

            // Dodaj reakcje do embeda
            await sentMessage.react('👋');
        } catch (error) {
            console.error('Error while executing GuildMemberAdd event:', error);
        }
    }
}
