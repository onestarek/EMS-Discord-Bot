const { Events, ActivityType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member){
        const welchannel = await member.guild.channels.cache.get('1279782285557895169');
        await welchannel.fetch();

        const embed = new EmbedBuilder()
        .setTitle('Użytkownik opuścił serwer')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true })) // Set the user's avatar as the thumbnail
        .setDescription(`${member.user.displayName} opuścił discorda.`)
        .setColor('#8f1414')
        .setTimestamp()
        
        welchannel.send({
            embeds: [embed]
        })
    }
}