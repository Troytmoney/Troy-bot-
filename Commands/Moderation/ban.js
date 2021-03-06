const Discord = require('discord.js');
const Keyv = require('keyv');
const bns = new Keyv(process.env.bns);
const bannedUsers = new Keyv(process.env.bannedUsers);
const punishments = new Keyv(process.env.punishments);
const { deletionTimeout, reactionError, reactionSuccess, pinEmojiId } = require('../../config.json');
const { getRoleColor } = require('../../Utils/getRoleColor');
const { sendLog } = require('../../Utils/sendLog');

module.exports = {
  name: 'ban',
  description: `Restricts a user's access to the server.`,
  usage: 'ban @`user` `(days)` `(reason)`',
  requiredPerms: ['BAN_MEMBERS'],
  botRequiredPerms: ['BAN_MEMBERS'],
  async execute(message, args, prefix) {
    const member = message.mentions.members.first();
    const user = message.mentions.users.first();
    const author = message.author.username;
    const days = args[1];
    if (!member) {
      let msg = await message.channel.send(`Proper command usage: ${prefix}ban @[user] (days) (reason)`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    if (user.id == message.author.id) {
      let msg = await message.channel.send(`You can't ban youself, smarty pants!`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
      let msg = await message.channel.send('Your roles must be higher than the roles of the person you want to ban!');
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    if (!message.guild.member(member).bannable) {
      let msg = await message.channel.send(`Make sure that my role is higher than the roles of the person you want to ban!`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    let color = getRoleColor(message.guild);
    if (isNaN(days) || !days) {
      if (!member) {
        let msg = await message.channel.send(`Couldn't find ${args[0]}`);
        msg.delete({ timeout: deletionTimeout });
        return message.react(reactionError);
      }

      args.shift();
      let bans = await bns.get(`bans_${member.id}_${message.guild.id}`);
      if (!bans) bans = 1;
      else bans = bans + 1;

      const banEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`${message.client.emojis.cache.get(pinEmojiId).toString()} Ban Information`)
        .addFields(
          { name: `Defendant's name:`, value: `${member.user.tag}` },
          { name: `Issued by:`, value: `${author}` },
          { name: `Duration:`, value: `Permanent` }
        )
        .setFooter(`You can use ${prefix}unban ${member.user.username} to unban ${member.user.username} earlier or ${prefix}baninfo ${member.user.username} to view information about his ban.`)
        .setTimestamp();
      let msg = `${author} has permanently banned you from ${message.guild.name}.`;
      let BanInfo = {};
      BanInfo.userID = member.user.id;
      BanInfo.username = member.user.username;
      BanInfo.author = author;
      if (args.length > 0) {
        const reason = '`' + args.join(' ') + '`';
        banEmbed.addField('Reason', reason);
        msg += ` Reason: ${reason}.`;
        BanInfo.reason = '`' + reason + '`';
      }
      let bannedUsersArr = await bannedUsers.get(message.guild.id);
      if (!bannedUsersArr) bannedUsersArr = [];
      bannedUsersArr.push(BanInfo);
      await bannedUsers.set(message.guild.id, bannedUsersArr);
      await sendLog(message.guild, message.channel, banEmbed);
      if (!member.user.bot) await member.send(msg);
      await bns.set(`bans_${member.id}_${message.guild.id}`, bans);
      await message.guild.member(member).ban();
      message.react(reactionSuccess);
    }

    if (!isNaN(days)) {
      if (!member) {
        let msg = await message.channel.send(`Couldn't find ${args[0]}`);
        msg.delete({ timeout: deletionTimeout });
        return message.react(reactionError);
      }

      if (days <= 0) {
        let msg = await message.channel.send('Days must be a positive number.');
        msg.delete({ timeout: deletionTimeout });
        return message.react(reactionError);
      }

      args.shift();
      args.shift();
      let bans = await bns.get(`bans_${member.id}_${message.guild.id}`);
      if (!bans) bans = 1;
      else bans = bans + 1;

      const banEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(`${message.client.emojis.cache.get(pinEmojiId).toString()} Ban Information`)
        .addFields(
          { name: `Defendant's name:`, value: `${member}` },
          { name: `Issued by:`, value: `${author}` },
          { name: `Duration:`, value: `${days} days` }
        )
        .setFooter(`You can use ${prefix}unban ${member.user.username} to unban ${member.user.username} earlier than ${days} days or ${prefix}baninfo ${member.user.username} to view information about his ban.`)
        .setTimestamp();
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      let BanInfo = {};
      BanInfo.userID = member.user.id;
      BanInfo.username = member.user.username;
      BanInfo.unbanDate = Date.now() + days * millisecondsPerDay;
      BanInfo.author = author;
      let msg = `${author} has permanently banned you from ${message.guild.name}. Duration: ${days} days.`;
      if (args.length > 0) {
        const reason = '`' + args.join(' ') + '`';
        banEmbed.addField('Reason', reason);
        msg += ` Reason: ${reason}`;
        BanInfo.reason = reason;
      }
      let bannedUsersArr = await bannedUsers.get(message.guild.id);
      let guilds = await punishments.get('guilds');
      if (!guilds.includes(message.guild.id)) guilds.push(message.guild.id);
      if (!bannedUsersArr) bannedUsersArr = [];
      bannedUsersArr.push(BanInfo);
      await bannedUsers.set(message.guild.id, bannedUsersArr);
      await punishments.set('guilds', guilds);
      await sendLog(message.guild, message.channel, banEmbed);
      if (!member.user.bot) await member.send(msg);
      await bns.set(`bans_${member.id}_${message.guild.id}`, bans);
      await message.guild.member(member).ban();
      message.react(reactionSuccess);
    }
  }
}