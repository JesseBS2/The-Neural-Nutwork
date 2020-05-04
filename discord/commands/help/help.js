module.exports = async function(){

  const Message = global.discord.message;
  var $channel = Message.channel;
  var words = Message.words;
  var $pre = Message.prefix;
  var $cmnd = Message.command;
  const CustomEmbed = global.discord.functions.CustomEmbed;

  global.discord.log("DISCORD: Ran /commands/help/help.js");

  if($cmnd === "commands"){
    let $commands = require("./../commands.json");
    let reactions = require("./../react/memes.json");
    if(!words[1]){$channel.send(CustomEmbed("Commands: ","Separated by category")[0].field("🧮 Math Commands","x"+Object.keys($commands["math"]).length+" Commands")[0].field("🧪 PToE Commands","x"+Object.keys($commands["ptoe"]).length+" Commands")[0].field("🔐 Mod Commands","x"+Object.keys($commands["mod"]).length+" Commands")[0].field(":smile: Fun Commands","x"+Object.keys($commands["fun"]).length+" Commands")[0].field(":ok_hand: Meme Commands","x"+Object.keys(reactions).length+" Commands")[0].field(":grey_question: Other Commands","x"+Object.keys($commands["other"]).length+" Commands")[0].field(":control_knobs: Server Commands","x"+Object.keys($commands["server"]).length+" Commands")[0].useImage()[1]); return;}
    
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
      
      $channel.send(CustomEmbed(words[1].toLowerCase()+" commands",group_arr)[0].footer($pre+"help <command>")[1]);
      return;
    
    }else if(words[1].toLowerCase() === "meme"){  // exception, as memes is not included in commands.json
      let memes_list = "";
      for(let ex = 0; ex < Object.keys(reactions).length; ex++){  // stolen from the above code
        let nextUp = reactions;
        if(Object.values(nextUp)[ex] == ""){}else{
          memes_list += Object.keys(reactions)[ex];
          memes_list += ", ";
          if(ex % 3 === 0) memes_list += "\n";
        }
      }

      $channel.send(CustomEmbed("meme commands",memes_list)[0].footer("$<command>$")[1]);
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
    var $json = require("./help.json");
    let helpText;

    /* the echo and Echo commands need special cases, as they are case sensitve*/
    if(words[1] === "echo"){
      helpText = CustomEmbed("Command: "+$pre+"echo","Recreates your message as an Rich Embed.",)[0].field("Usage",$pre+"Echo <any text> (color)")[0].footer("<required parameters> – (optional parameters)")[1];
    }else if(words[1] === "Echo"){
      helpText = CustomEmbed("Command: "+$pre+"Echo","Recreates your message as an Rich Embed and deletes your original message.")[0].field("Usage",$pre+"Echo <any text> (color)")[0].footer("<required parameters> – (optional parameters)")[1];
    }else if(words[1].toLowerCase() in $json){
      //helpText = $json[words[1].toLowerCase()]["desc"];
      helpText = CustomEmbed("Command: "+$pre+words[1].toLowerCase(),$json[words[1].toLowerCase()]["desc"])[0].field("Usage",$pre+$json[words[1].toLowerCase()]["format"])[0].field("Aliases",$json[words[1].toLowerCase()]["alias"].toString().replace(/\,/g,", "))[0].footer("<required parameters> – (optional parameters)")[1];
      $channel.send(helpText);  // this wasn't here before so there wasn't any output.
    }else{
      let e = await $channel.send("That's not a command I recognize!\n(Note: if it's an alias for another command I can't display that)\n(Note: My programmer is stupid and doesn't think ahead)");
      setTimeout(() => {
        e.edit("That's not a command I recognize!\n(Note: if it's an alias for another command I can't display that)");
      },1500);
    }
  }

}

