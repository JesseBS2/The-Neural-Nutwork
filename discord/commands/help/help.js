module.exports = function(){

  const Message = global.discord.message;
  let $channel = Message.channel;
  let words = Message.words;
  let $pre = Message.prefix;
  let $cmnd = Message.command;
  let CustomEmbed = global.discord.functions.CustomEmbed;

  global.discord.log("DISCORD: Ran /commands/help/help.js");

  if($cmnd === "commands"){
    let $commands = require("./../commands.json");
    if(!words[1]){$channel.send(CustomEmbed("Commands: ","Separated by category")[0].field("🧮 Math Commands","x"+Object.keys($commands["math"]).length+" Commands")[0].field("🧪 PToE Commands","x"+Object.keys($commands["ptoe"]).length+" Commands")[0].field("🔐 Mod Commands","x"+Object.keys($commands["mod"]).length+" Commands")[0].field("😄 Fun Commands","x"+Object.keys($commands["fun"]).length+" Commands")[0].field("❔ Other Commands","x"+Object.keys($commands["other"]).length+" Commands")[0].useImage()[1]); return;}
    
    if(words[1].toLowerCase() in $commands){
      let group_arr = "";
      for(let ex = 0; ex < Object.values($commands[words[1].toLowerCase()]).length; ex++){
        let nextUp = $commands[words[1].toLowerCase()];
        if(Object.values(nextUp)[ex] == ""){}else{  // check if it's blank. If it's blank it should be an alt, which are not included in help.json
          // global.discord.debug(Object.values(nextUp)[ex]);
          group_arr += $pre+Object.keys($commands[words[1].toLowerCase()])[ex];
          group_arr += "\n";
        }
      }
      
      $channel.send(CustomEmbed(words[1].toLowerCase()+" commands",group_arr)[0].footer("$help <command>")[1]);
      return;
    }else if(words[1].toLowerCase() in $commands === false){
      $channel.send("Something went wrong!");
      $channel.send("That's not a valid group");
      return;
    }

    return;
  }else if($cmnd === "help"){
    if(!words[1]){$channel.send("You're forgetting part of that Command!");}
    if(words[1].startsWith("$")){words[1] = words[1].replace("$","");}
    let $json = require("./help.json");
    let helpText;

    /* the echo and Echo commands need special cases, as they are case sensitve*/
    if(words[1] === "echo"){
      helpText = CustomEmbed("Command: "+$pre+"echo","Recreates your message as an Rich Embed.",)[0].field("Usage",$pre+"Echo <any text> (color)")[0].footer("<required parameters> – (option commands)")[1];
    }else if(words[1] === "Echo"){
      helpText = CustomEmbed("Command: "+$pre+"Echo","Recreates your message as an Rich Embed and deletes your original message.")[0].field("Usage",$pre+"Echo <any text> (color)")[0].footer("<required parameters> – (option commands)")[1];
    }else if(words[1].toLowerCase() in $json){
      //helpText = $json[words[1].toLowerCase()]["desc"];
      helpText = CustomEmbed("Command: "+$pre+words[1].toLowerCase(),$json[words[1].toLowerCase()]["desc"])[0].field("Usage",$pre+$json[words[1].toLowerCase()]["format"])[0].field("Aliases",$json[words[1].toLowerCase()]["alias"].toString().replace(/\,/g,", "))[0].footer("<required parameters> – (option commands)")[1];
    }

    $channel.send(helpText);
  }

}

