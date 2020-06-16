var $commands = require("./../commands.json");
var CustomEmbed = global.discord.functions.CustomEmbed;

// $commands["math"]["algebra"] = $commands["math"]["math"];
// $commands["math"]["eval"] = $commands["math"]["evaluate"];
// $commands["math"]["simp"] = $commands["math"]["simplify"];
// $commands["other"]["nick"] = $commands["other"]["nickname"];
// $commands["ptoe"]["periodictable"] = $commands["ptoe"]["periodic"];
// $commands["ptoe"]["pt"] = $commands["ptoe"]["periodic"];
// $commands["fun"]["F"] = $commands["fun"]["respect"];
// $commands["fun"]["rand"] = $commands["fun"]["random"];
// $commands["mod"]["purge"] = $commands["mod"]["clear"];
// $commands["image"]["image-data"] = $commands["image"]["image"];
// $commands["image"]["data"] = $commands["image"]["image"];
// $commands["image"]["pixel"] = $commands["image"]["pixelate"];


module.exports = function(){

  const Message = global.discord.message;
  var $channel = Message.channel;
  var words = Message.words;
  var $pre = Message.prefix;
  var $cmnd = Message.command;

  global.discord.log("Ran /commands/help/help.js");

  if($cmnd === "commands"){
    let reactions = require("./../react/memes.json");
    if(!words[1]) return $channel.send(CustomEmbed("Commands: ","Separated by category")[0].field(":abacus: Math Commands","x"+Object.keys($commands["math"]).length+" Commands")[0].field(":test_tube: PToE Commands","x"+Object.keys($commands["ptoe"]).length+" Commands")[0].field(":lock: Mod Commands","x"+Object.keys($commands["mod"]).length+" Commands")[0].field(":smile: Fun Commands","x"+Object.keys($commands["fun"]).length+" Commands")[0].field(":frame_photo: Image Commands","x"+Object.keys($commands["image"]).length+" Commands")[0].field(":ok_hand: Meme Commands","x"+Object.keys(reactions).length+" Commands")[0].field(":grey_question: Other Commands","x"+Object.keys($commands["other"]).length+" Commands")[0].field(":control_knobs: Server Commands","x"+Object.keys($commands["server"]).length+" Commands")[0].field("Credits","Use "+$pre+"credits")[0].useImage()[0].footer("$commands <category>")[1]);
    
    if(words[1].toLowerCase() in $commands){
      let group_arr = "";
      for(let ex = 0; ex < Object.values($commands[words[1].toLowerCase()]).length; ex++){
        let nextUp = $commands[words[1].toLowerCase()];
        if(typeof Object.values(nextUp)[ex] != "object"){}else{  
          // global.discord.debug(Object.values(nextUp)[ex]);
          group_arr += $pre+Object.keys($commands[words[1].toLowerCase()])[ex];
          group_arr += "\n";
        }
      }
      
      return $channel.send(CustomEmbed(words[1].charAt(0).toUpperCase()+words[1].slice(1).toLowerCase()+" commands",group_arr)[0].footer($pre+"help <command>")[1]);
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

      return $channel.send(CustomEmbed("Meme commands",memes_list)[0].footer("$<command>$")[1]);
    

    }else if(words[1].toLowerCase() in $commands === false){
      return $channel.send("Something went wrong!\nThat's not a valid group");
    }

    return;
  }else if($cmnd === "help"){
    if(!words[1]) return $channel.send(CustomEmbed("Help Command","This command provides a description and format for each command")[1]);
    if(words[1].startsWith("$")){words[1] = words[1].replace("$","");}

    var helpText;
    var x;

    if(words[1] in (x = $commands["help"])){
      helpText = x[words[1].toLowerCase()];
    }else if(words[1] in (x = $commands["fun"])){
      helpText = x[words[1].toLowerCase()];
    }else if(words[1] in (x = $commands["other"])){
      helpText = x[words[1].toLowerCase()];
    }else if(words[1] in (x = $commands["math"])){
      helpText = x[words[1].toLowerCase()];
    }else if(words[1] in (x = $commands["ptoe"])){
      helpText = x[words[1].toLowerCase()];
    }else if(words[1] in (x = $commands["mod"])){
      helpText = x[words[1].toLowerCase()];
    }else if(words[1] in (x = $commands["help"])){
      helpText = x[words[1].toLowerCase()];
    }else if(words[1] in (x = $commands["image"])){
      helpText = x[words[1].toLowerCase()];
    }else if(words[1] in (x = $commands["server"])){
      helpText = x[words[1].toLowerCase()];
    }

    if(typeof helpText != "object") helpText = x[helpText];

    return $channel.send(CustomEmbed($pre+words[1],helpText["desc"])[0].field("Usage",helpText["format"])[0].field("Aliases",helpText["alias"])[1]) || $channel.send("That's not a command I recognize! Are you sure you typed it right?\n*note: meme commands don't have a help command*");
  }

}
