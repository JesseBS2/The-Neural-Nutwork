var Embed = global.discord.functions.CustomEmbed;
var SolveEquation = global.SolveEquation;


module.exports = function(){

  global.discord.debug("DISCORD: Ran /commands/other/index.js");

  let Configs = require("./../../configuration.json")[global.discord.message.msg.guild.id];
  let message = global.discord.message.msg;
  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let $author = global.discord.message.author;
  let $pre = global.discord.message.prefix;


  if($cmnd === "config"){ // a server's custom settings
    // configurable settings: prefix, automath, autorole, embeds, echoes

    if(words[1] === "prefix"){
      if(!words[2]){$channel.send("The prefix for Nutwork commands is currently: "+Configs["prefix"]);return;}
      if(words[2].length > 3){$channel.send("A prefix can not be longer than 3 characters");return;}
      else{
        //global.writeJSON("./../../configuration.json",JSON.stringify(message.guild.id["prefix"] = ""));
        Configs["prefix"] = words[2];
        $channel.send( Embed("New Prefix","The Nutwork has a new prefix for commands, "+words[2])[0].field("New Usage","Use the new prefix in place of the old one, example:\n"+words[2]+"echo Hello World")[1] );
      }
    }

  }else if($cmnd === "snowflake"){
    try{
      $author.send("Your account's snowflake is:\n"+$author.id.toString());
    }catch(err){
      $channel.send("I can't seem to DM you?");
      console.log(err);
    }
    return;

  }else if($cmnd === "echo"){ // lowercase e copies the message and makes the embed
    var echoed = Embed("eWF5IGJhc2U2NCBpcyBmdW4hIQ==",global.discord.message.message.split($pre+"echo ")[1])[1];  // split the users message by the prefix on the server, followed by the command and a space. everything after it.
    $channel.send( echoed );
    return;

  }else if($cmnd === "Echo"){ // capital E cuts the message and makes the embed
    var echoed = Embed(global.discord.message.tag+" says...",global.discord.message.message.split($pre+"Echo ")[1])[1];
    global.discord.message.msg.delete();
    $channel.send( echoed );
    return;

  }

}