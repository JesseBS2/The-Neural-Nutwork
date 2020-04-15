var Embed = global.discord.functions.CustomEmbed;
var SolveEquation = global.SolveEquation;


module.exports = function(){

  global.discord.log("DISCORD: Ran /commands/other/index.js");

  let Configs;
  
  let message = global.discord.message.msg;
  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let $author = global.discord.message.author;
  let $member = global.discord.message.msg.member;
  let $pre = global.discord.message.prefix;

  if($channel.type != "dm"){
    let Configs = require("./../../configuration.json")[global.discord.message.msg.guild.id];
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
    var echoed = Embed("",global.discord.message.message.split($pre+"echo ")[1])[0].useTimestamp()[1];  // split the users message by the prefix on the server, followed by the command and a space. everything after it.
    $channel.send( echoed );
    return;

  }else if($cmnd === "Echo"){ // capital E cuts the message and makes the embed
    var echoed = Embed(global.discord.message.tag+" says...",global.discord.message.message.split($pre+"Echo ")[1])[0].useTimestamp()[1];
    global.discord.message.msg.delete();
    $channel.send( echoed );
    return;

  }else if($cmnd === "random" || $cmnd === "rand"){
    let First = false, Second = false;  // false by default because ifs check for these
    if(words[1]) First = Number(words[1].replace(/\D/gi,""));
    if(words[2]) Second = Number(words[2].replace(/\D/gi,""));
    
    if(!First || First <= 1 && !Second){$channel.send(Math.random()); return;} // No first or first is too low; means 0-1
    if(First && !Second && First > 1){$channel.send(Math.round(Math.random()*First)); return;}  // only first is present and is greater than 1
    if(First && Second && Math.ceil(Second)-Math.floor(First) <= 1){$channel.send(Math.random()*(Math.ceil(Second) - Math.floor(First))+Math.floor(First)); return;}
    if(First && Second){$channel.send(Math.round(Math.random()*(Second-First)+First)); return;}
  }

}