const Message = global.discord.message;
let $channel = Message.channel;
let words = Message.words;
let $pre = Message.prefix;


module.exports = function(){

  global.discord.log("DISCORD: Ran /commands/help/help.js");

  if(!words[1]){$channel.send("You're forgetting part of that Command!");}
    let $json = require("./help.json");
    let helpText;

    /* the echo and Echo commands need special cases, as they are case sensitve*/
    if(words[1] === "echo"){
      helpText = global.discord.functions.CustomEmbed("Command: "+$pre+"echo","Recreates your message as an Rich Embed.")[0].field("Usage",$pre+"Echo <any text> (color)")[1];
    }else if(words[1] === "Echo"){
      helpText = global.discord.functions.CustomEmbed("Command: "+$pre+"Echo","Recreates your message as an Rich Embed and deletes your original message.")[0].field("Usage",$pre+"Echo <any text> (color)")[1];
    }else if(words[1].toLowerCase() in $json){
      //helpText = $json[words[1].toLowerCase()]["desc"];
      helpText = global.discord.functions.CustomEmbed("Command: "+$pre+words[1].toLowerCase(),$json[words[1].toLowerCase()]["desc"])[0].field("Usage",$pre+$json[words[1].toLowerCase()]["format"])[1];
    }

  $channel.send(helpText);

}