var Embed = global.discord.functions.CustomEmbed;
var SolveEquation = global.SolveEquation;

module.exports = function(Client){

  global.discord.log("Ran /commands/other/index.js");

  let Configs;
  
  let message = global.discord.message.msg;
  let msg = global.discord.message.message;
  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let $author = global.discord.message.author;
  let $member = global.discord.message.msg.member;
  let $pre = global.discord.message.prefix;
  let me = global.discord.bot.me;

  if($channel.type != "dm"){
    Configs = require("./../../configuration.json")[global.discord.message.msg.guild.id];
  }

  if($cmnd === "profile" || $cmnd === "self"){
    var username,disc,status,snow,pfp,account_age,accStatusColor;
    
    username = message.author.username;
    disc = message.author.discriminator;
    status = message.author.presence.status;
    snow = message.author.id;
    pfp = message.author.displayAvatarURL || message.author.defaultAvatarURL; // avatar or their default.
    account_age = message.author.createdAt.toString().split(" ")[1]+" "+message.author.createdAt.toString().split(" ")[2]+" "+message.author.createdAt.toString().split(" ")[3];
    accStatusColor = {"online": "#00ff00","idle":"#ffcc00","dnd":"#ff0000","offline":"#919191"};
    
    if($cmnd == "profile" && words[1] && words[1].startsWith("<@!") || $cmnd == "profile" && words[1] && words[1].length === 18 && words[1].replace(/[0-9]/gi,"") === ""){  // only works using profile because typing self then getting someone else is weird
      var otherUser = Client.users.get(words[1]); // by default try to get it based on numbers only
      if(words[1].startsWith("<@!"))otherUser = Client.users.get(words[1].split("<@!")[1].split(">")[0]); // if it didn't start with numbers then change it
      if(otherUser){
        username = otherUser.username;
        disc = otherUser.discriminator;
        status = otherUser.presence.status;
        snow = otherUser.id;
        pfp = otherUser.displayAvatarURL || otherUser.defaultAvatarURL;
        account_age = otherUser.createdAt.toString().split(" ")[1]+" "+otherUser.createdAt.toString().split(" ")[2]+" "+otherUser.createdAt.toString().split(" ")[3];
      }else{
        $channel.send("Something went wrong!\nI'm either not in a server with that user, or you did not provide a valid snowflake");
        return;
      }
    }

    let display = Embed(" ","Username: "+username+"\n"+"Discriminator: "+disc+"\n"+"Snowflake: "+snow+"\n"+"Status: "+status+"\n"+"User Since: "+account_age,accStatusColor[status])[0].useImage(pfp)[1];

    $channel.send(display);
    return;
  }

}