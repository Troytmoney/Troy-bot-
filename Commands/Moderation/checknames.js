const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const Keyv = require('keyv');
const names = new Keyv(process.env.names);
const { deletionTimeout, reactionError, reactionSuccess } = require('../../config.json');
const { getRoleColor } = require('../../Utils/getRoleColor');

module.exports = {
  name: 'checknames',
  description: `Check a member's previous nicknames.`,
  usage: 'checknames @`member`',
  requiredPerms: ['KICK_MEMBERS'],
  async execute(message, args, prefix) {
    const member = message.mentions.members.first();
    if (!args[0]) {
      let msg = await message.channel.send(`Proper command usage: ${prefix}checknames @[member]`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    if (!member) {
      let msg = await message.channel.send(`Couldn't find ${args[0]}`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    const namesArr = await names.get(`${member.user.id}_${message.guild.id}`);
    if (!namesArr) {
      let msg = await message.channel.send(`There aren't any name changes logged from ${member}`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    let content = '';
    namesArr.forEach((name) => content += `${'`' + name.newName + '`'} - ${moment(name.date).format('D.M.Y')}, at ${moment(name.date).format('LT')} GMT\n`);
    let color = getRoleColor(message.guild);
    const nameChangesEmbed = new MessageEmbed()
      .setColor(color)
      .setTitle(`${member.user.tag}'s nicknames`)
      .setDescription(content)
      .setTimestamp();
    await message.channel.send(nameChangesEmbed);
    message.react(reactionSuccess);
  }
}