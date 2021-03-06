const Keyv = require('keyv');
const disabledcmds = new Keyv(process.env.disabledcmds);
const { deletionTimeout, reactionError, reactionSuccess } = require('../../config.json');
const { sendLog } = require('../../Utils/sendLog');

module.exports = {
  name: 'enablecmd',
  description: 'Enables a command from the server.',
  usage: 'enable `command`',
  requiredPerms: ['MANAGE_GUILD'],
  async execute(message, args, prefix) {
    if (!args[0]) {
      let msg = await message.channel.send(`Proper command usage: ${prefix}enablecmd [command]`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    let disabledCommands = await disabledcmds.get(message.guild.id);
    if (!disabledCommands.includes(args[0])) {
      let msg = await message.channel.send(`${'`' + args[0] + '`'} is not disabled.`);
      msg.delete({ timeout: deletionTimeout });
      return message.react(reactionError);
    }

    disabledCommands.splice(disabledCommands.indexOf(args[0]), 1);
    await disabledcmds.set(message.guild.id, disabledCommands);
    await sendLog(message.guild, message.channel, `${'`' + args[0] + '`'} has been enabled.`);
    message.react(reactionSuccess);
  }
}