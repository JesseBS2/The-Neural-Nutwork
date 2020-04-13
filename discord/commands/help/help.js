module.exports = function(){

  const Message = global.discord.message;
  let $channel = Message.channel;
  let words = Message.words;
  let $pre = Message.prefix;
  let CustomEmbed = global.discord.functions.CustomEmbed;

  global.discord.log("DISCORD: Ran /commands/help/help.js");

  if(!words[1]){$channel.send("You're forgetting part of that Command!");}
    let $json = require("./help.json");
    let helpText;

    /* the echo and Echo commands need special cases, as they are case sensitve*/
    if(words[1] === "echo"){
      helpText = CustomEmbed("Command: "+$pre+"echo","Recreates your message as an Rich Embed.",{timestamp:false, footer:"<required parameters> – (option commands)"})[0].field("Usage",$pre+"Echo <any text> (color)")[1];
    }else if(words[1] === "Echo"){
      helpText = CustomEmbed("Command: "+$pre+"Echo","Recreates your message as an Rich Embed and deletes your original message.",{timestamp:false, footer:"<required parameters> – (option commands)"})[0].field("Usage",$pre+"Echo <any text> (color)")[1];
    }else if(words[1].toLowerCase() in $json){
      //helpText = $json[words[1].toLowerCase()]["desc"];
      helpText = CustomEmbed("Command: "+$pre+words[1].toLowerCase(),$json[words[1].toLowerCase()]["desc"],{timestamp:false, footer:"<required parameters> – (option commands)"})[0].field("Usage",$pre+$json[words[1].toLowerCase()]["format"])[1];
    }

  $channel.send(helpText);

}