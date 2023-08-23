require('dotenv').config()
// Discord token
const token = process.env.DISCORD_TOKEN

// Notion API keys
const NOTION_KEY=process.env.NOTION_KEY
const NOTION_DATABASE_ID=process.env.NOTION_DATABASE_ID

// Notion client
var {Client} =require("@notionhq/client");
const notion = new Client({ auth: NOTION_KEY })

// Function to write to Notion
async function addItem(text) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        title: { 
          title:[
            {
              "text": {
                "content": text
              }}]}},})
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body) }}


// Import the discord.js module
var { Client, Intents, MessageEmbed } = require('discord.js');
// Create an instance of a Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

// Ready event
client.on('ready', () => {
  console.log('I am ready!');

});


// Bot algorithm
client.on('messageReactionAdd', (reaction, user) => {
   if (user.bot) return;
   console.log('reaction');
   if(reaction.emoji.name === "✍️") {
if (reaction.message.member.roles.cache.some(role => role.name === 'Admin')) {
   let embed = new MessageEmbed()
   .setTitle('Content added to Notion')
   .setDescription(reaction.message.content)
   .setAuthor({name: reaction.message.author.tag, iconURL: reaction.message.author.displayAvatarURL()} )
   addItem(reaction.message.content)
   reaction.message.channel.send({embeds: [embed]}).catch(console.error)
   return;}}});

// Log our bot in
client.login(token);
