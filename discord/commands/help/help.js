module.exports = function(){

  const Message = global.discord.message;
  var $channel = Message.channel;
  var words = Message.words;
  var $pre = Message.prefix;
  var $cmnd = Message.command;
  const CustomEmbed = global.discord.functions.CustomEmbed;
  var $commands = require("./../commands.json");

  global.discord.log("DISCORD: Ran /commands/help/help.js");

  if($cmnd === "commands"){
    //let $commands = require("./../commands.json");
    let reactions = require("./../react/memes.json");
    if(!words[1]) return $channel.send(CustomEmbed("Commands: ","Separated by category")[0].field("🧮 Math Commands","x"+Object.keys($commands["math"]).length+" Commands")[0].field("🧪 PToE Commands","x"+Object.keys($commands["ptoe"]).length+" Commands")[0].field("🔐 Mod Commands","x"+Object.keys($commands["mod"]).length+" Commands")[0].field(":smile: Fun Commands","x"+Object.keys($commands["fun"]).length+" Commands")[0].field(":ok_hand: Meme Commands","x"+Object.keys(reactions).length+" Commands")[0].field(":grey_question: Other Commands","x"+Object.keys($commands["other"]).length+" Commands")[0].field(":control_knobs: Server Commands","x"+Object.keys($commands["server"]).length+" Commands")[0].useImage()[1]);
    
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
      
      return $channel.send(CustomEmbed(words[1].toLowerCase()+" commands",group_arr)[0].footer($pre+"help <command>")[1]);
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

      return $channel.send(CustomEmbed("meme commands",memes_list)[0].footer("$<command>$")[1]);
    

    }else if(words[1].toLowerCase() in $commands === false){
      return $channel.send("Something went wrong!\nThat's not a valid group");
    }

    return;
  }else if($cmnd === "help"){
    if(!words[1]) return $channel.send("You're forgetting part of that Command!");
    if(words[1].startsWith("$")){words[1] = words[1].replace("$","");}
    //var $commands = require("./../commands.json");
    
    // Alias Command = Not the Alias 
    // Instead of copying and pasting, meaning I'd have to change each one each time;
    // just assign the blank aliases here,
    // Might change this to a loop later, loop through each category and each command
    // then anytime there is an empty string, just paste the previous one
    $commands["math"]["algebra"] = $commands["math"]["math"];
    $commands["math"]["eval"] = $commands["math"]["evaluate"];
    $commands["math"]["simp"] = $commands["math"]["simplify"];
    $commands["other"]["nick"] = $commands["other"]["nickname"];
    $commands["other"]["ar"] = $commands["other"]["addrole"];
    $commands["other"]["tr"] = $commands["other"]["takerole"];
    $commands["ptoe"]["periodictable"] = $commands["ptoe"]["periodic"];
    $commands["ptoe"]["pt"] = $commands["ptoe"]["periodic"];
    $commands["fun"]["F"] = $commands["fun"]["respect"];
    $commands["fun"]["rand"] = $commands["fun"]["random"];
    
    var helpText;
    var x;

    /* The echo and Echo commands need special cases, cause they are case sensitve*/
    if(words[1] === "echo"){
      helpText = CustomEmbed("Command: "+$pre+"echo","Recreates your message as an Rich Embed.",)[0].field("Usage",$pre+"Echo <any text> (color)")[0].footer("<required parameters> – (optional parameters)")[1];
    }else if(words[1] === "Echo"){
      helpText = CustomEmbed("Command: "+$pre+"Echo","Recreates your message as an Rich Embed and deletes your original message.")[0].field("Usage",$pre+"Echo <any text> (color)")[0].footer("<required parameters> – (optional parameters)")[1];
    }else if(words[1].toLowerCase() in (x = $commands["math"]) || words[1].toLowerCase() in (x = $commands["ptoe"]) || words[1].toLowerCase() in (x = $commands["mod"]) || words[1].toLowerCase() in (x = $commands["fun"]) || words[1].toLowerCase() in (x = $commands["other"]) || words[1].toLowerCase() in (x = $commands["server"])){
      let GOTTENCOMMAND = x[words[1].toLowerCase()]
      
      helpText = CustomEmbed("Command: "+$pre+words[1].toLowerCase(),GOTTENCOMMAND["desc"])[0].field("Usage",$pre+GOTTENCOMMAND["format"])[0].field("Aliases",GOTTENCOMMAND["alias"].toString().replace(/\,/g,", "))[0].footer("<required parameters> – (optional parameters)")[1];
      return $channel.send(helpText);  // this wasn't here before so there wasn't any output.
    }else{
      return $channel.send("That's not a command I recognize! Are you sure you typed it right?\n*note: meme commands don't have a help command*");
    }
  }

}

