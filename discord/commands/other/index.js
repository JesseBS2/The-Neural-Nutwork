var Embed = global.discord.functions.CustomEmbed;
var SolveEquation = global.SolveEquation;

module.exports = function(){

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

  if($cmnd === "snowflake"){
    try{
      $author.send("Your account's snowflake is:\n"+$author.id.toString());
    }catch(err){
      $channel.send("I can't seem to DM you?");
      console.log(err);
    }
    return;

  }else if($cmnd === "echo"){ // lowercase e copies the message and makes the embed
    var echoed = Embed("",global.discord.message.message.split($pre+"echo ")[1],"#212121")[0].useTimestamp()[1];  // split the users message by the prefix on the server, followed by the command and a space. everything after it.
    $channel.send( echoed );
    return;

  }else if($cmnd === "Echo"){ // capital E cuts the message and makes the embed
    var echoed = Embed(global.discord.message.tag+" says...",global.discord.message.message.split($pre+"Echo ")[1],"#212121")[0].useTimestamp()[1];
    message.delete();
    $channel.send( echoed );
    return;

  }else if($cmnd === "profile" || $cmnd === "self"){
    var username,disc,status,snow,pfp,account_age,accStatusColor;
    
    username = message.author.username;
    disc = message.author.discriminator;
    status = message.author.presence.status;
    snow = message.author.id;
    pfp = message.author.displayAvatarURL || message.author.defaultAvatarURL; // avatar or their default.
    account_age = message.author.createdAt.toString().split(" ")[1]+" "+message.author.createdAt.toString().split(" ")[2]+" "+message.author.createdAt.toString().split(" ")[3];
    accStatusColor = {"online": "#00ff00","idle":"#ffcc00","dnd":"#ff0000","offline":"#919191"};
    
    let display = Embed(" ","Username: "+username+"\n"+"Discriminator: "+disc+"\n"+"Snowflake: "+snow+"\n"+"Status: "+status+"\n"+"User Since: "+account_age,accStatusColor[status])[0].useImage(pfp)[1];

    $channel.send(display);
    return;
  }

}