//Set up the Discord bot:
const { Client, MessageEmbed } = require('discord.js');
const client = new Client();

client.on('ready', () => {
  console.log('Discord bot ready!');
});

client.login(DISCORD_TOKEN);

//Create a helper function to send messages to Discord:
function sendToDiscord(data) {
    const channel = client.channels.cache.get('YOUR_DISCORD_CHANNEL_ID'); 
    const embed = new MessageEmbed()
        .setTitle('New Task Submitted!')
        .setDescription(data.description)
        .addField('Type', data.type)
        .addField('Attachment URL', data.attachmentUrl)
        .addField('Remaining Time', data.remainingTime)
        .addField('Bounty', data.bounty)
        .addField('Number of Responses', data.numResponses);

    channel.send({ embeds: [embed] });
}

//Add the sendToDiscord function call in your POST route:
router.post("/HIP", async (ctx) => {
  let data = ctx.request.body;

  try {
    const collection = database.collection("tasks");
    await collection.insertOne(data);
    ctx.body = "Data received successfully!";

    // Send the data to Discord
    sendToDiscord(data);

  } catch (error) {
    ctx.status = 500;
    ctx.body = "Error writing data to MongoDB";
  }
});
