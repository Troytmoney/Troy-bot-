const moment = require('moment');
const Keyv = require('keyv');
const nts = new Keyv(process.env.notes);
const { deletionTimeout } = require('../../config.json');

module.exports = {
  name: 'addnote',
  description: `Adds an admin note on someone's account. All staff members will be able to view this note.`,
  usage: 'addnote @`user`/`userID` `note`',
  requiredPerms: ['KICK_MEMBERS'],
  async execute(message, args, prefix) {
    if (!args[1]) {
      let msg = await message.channel.send(`Proper command usage: ${prefix}addnote @[user]/[userID] [note]`);
      return msg.delete({ timeout: deletionTimeout });
    }

    let member = {};
    if (isNaN(args[0])) member = message.mentions.members.first();
    else member = await message.guild.members.fetch(args[0]).catch(async (err) => {
      let msg = await message.channel.send(`Couldn't find ${args[0]}`);
      return message.delete({ timeout: deletionTimeout });
    });
    if (!member) {
      let msg = await message.channel.send(`Couldn't find ${args[0]}`);
      return message.delete({ timeout: deletionTimeout });
    }

    args.shift();
    let notes = await nts.get(`notes_${member.id}_${message.guild.id}`);
    if (!notes) notes = [];
    const note = '```' + `${args.join(' ')}` + '```' + `Added by ${message.author.username} on ${moment(message.createdTimestamp).format('LL')}, at ${moment(message.createdTimestamp).format('LT')} GMT\n`;
    notes.push(note);
    await nts.set(`notes_${member.id}_${message.guild.id}`, notes);
    await message.author.send(`Note successfully added on ${member.user.username}'s account`);
    message.delete();
  }
}