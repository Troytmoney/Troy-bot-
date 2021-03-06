const Keyv = require('keyv');
const leaveChannels = new Keyv(process.env.leaveChannels);
const leaveMessages = new Keyv(process.env.leaveMessages);
const toggleLeaveMsg = new Keyv(process.env.toggleLeaveMsg);
const { deletionTimeout, reactionError, reactionSuccess } = require('../../config.json');
const { sendLog } = require('../../Utils/sendLog');

module.exports = {
  name: 'leavemessage',
  description: `Sets a custom good bye message for those leaving the server.`,
  usage: 'leavemessage `message`',
  requiredPerms: ['MANAGE_GUILD'],
  async execute(message, args, prefix) {
    if (!args[0]) {
      let msg = await message.channel.send(`Proper command usage: ${prefix}leavemessage [message]. Use [user] to be replaced with a username.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    const msg = args.join(' ');
    const leaveChName = await leaveChannels.get(`leavechannel_${message.guild.id}`);
    const leaveChannel = await message.guild.channels.cache.find((ch) => ch.name === `${leaveChName}`);
    if (!leaveChannel) {
      let msg = await message.channel.send(`You need to set a channel for leave messages to be sent in. Use ${prefix}setleavechannel to setup one.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    await leaveMessages.set(`leavemessage_${message.guild.id}`, msg);
    await toggleLeaveMsg.set(`toggleleavemsg_${message.guild.id}`, 1);
    await sendLog(message.guild, message.channel, `Leave message successfully changed to ${'`' + msg + '`'}`);
    message.react(reactionSuccess);
  }
}