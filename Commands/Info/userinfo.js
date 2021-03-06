const Discord = require('discord.js');
const moment = require('moment');
const { deletionTimeout } = require('../../config.json');
const { getRoleColor } = require('../../Utils/getRoleColor');

module.exports = {
  name: 'userinfo',
  description: `Displays information about a user's account account.`,
  usage: 'userinfo `(user(s))`',
  execute(message, args) {
    let color = getRoleColor(message.guild);
    if (!message.mentions.members.first()) {
      const roles = '```' + message.member.roles.cache.map((role) => role.name).join(`, `) + '```';
      const perms = '```' + message.member.permissions.toArray().join(`\n`) + '```';
      let badges = '```' + message.author.flags.toArray().join(', ') + '```';
      if(badges === '``````') badges = '```None```';
      const userInfoEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle('User Information')
        .addFields(
          { name: 'Username:', value: `${message.author.tag}` },
          { name: 'User ID:', value: `${message.author.id}` },
          { name: 'Account Since:', value: `${moment(message.author.createdTimestamp).format('LT')} ${moment(message.author.createdTimestamp).format('LL')} (${moment(message.author.createdTimestamp).fromNow()})` },
          { name: 'Badges:', value: `${badges}` },
          { name: 'Joined At:', value: `${moment(message.member.joinedTimestamp).format('LT')} ${moment(message.member.joinedTimestamp).format('LL')} (${moment(message.member.joinedTimestamp).fromNow()})` },
          { name: 'Roles', value: `${roles}` },
          { name: 'Permissions', value: `${perms}` }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      message.channel.send(userInfoEmbed);
    } else {
      message.mentions.members.forEach(async (member) => {
        let err = 0;
        if (!member) {
          err = 1;
          let msg = await message.channel.send(`Couldn't find ${member}`);
          return msg.delete({ timeout: deletionTimeout });
        }
        if (err == 0) {
          const roles = '```' + member.roles.cache.map((role) => role.name).join(`, `) + '```';
          const perms = '```' + member.permissions.toArray().join(`\n`) + '```';
          let badges = '```' + member.user.flags.toArray().join(', ') + '```';
          if(badges === '``````') badges = '```None```';
          const userInfoEmbed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(`${member.user.username}'s User Information`)
            .addFields(
              { name: 'Username: ', value: `${member.user.tag}` },
              { name: 'User ID: ', value: `${member.user.id}` },
              { name: 'Account Since:', value: `${moment(member.user.createdTimestamp).format('LT')} ${moment(member.user.createdTimestamp).format('LL')} (${moment(member.user.createdTimestamp).fromNow()})` },
              { name: 'Badges', value: `${badges}` },
              { name: 'Joined At:', value: `${moment(member.joinedTimestamp).format('LT')} ${moment(member.joinedTimestamp).format('LL')} (${moment(member.joinedTimestamp).fromNow()})` },
              { name: 'Roles:', value: `${roles}` },
              { name: 'Permissions', value: `${perms}` }
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();
          message.channel.send(userInfoEmbed);
        }
      });
    }
  }
}