const Embed = global.discord.functions.CustomEmbed;

module.exports = function(){
  global.discord.log("Ran /commands/periodic/index.js");

  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let table = require("./table.json");

  if($cmnd === "periodic" || $cmnd === "periodictable" || $cmnd === "pt"){
    if(!words[1]){$channel.send("Here is the Periodic Table of Elements: ",{files: ["https://i.imgur.com/rzoOEEY.jpg"]}); return;}

    let element = false;
    
    for(var elems = 1; elems < Object.keys(table).length+1; elems++){
      //global.discord.debug("Loop #"+elems);
      if(words[1].toLowerCase() == table[elems]["name"].toLowerCase() || words[1].toLowerCase() == table[elems]["abr"].toLowerCase() || words[1] === (elems).toString()){
        //global.discord.debug("YES IT IS")
        element = Embed(table[elems]["name"]+" - #"+elems,"Symbol: "+table[elems]["abr"]+"\nAtomic Weight: "+table[elems]["weight"])[0].field("Discovery",table[elems]["disc"]+" by "+table[elems]["by"])[1];
        break;
      }
    }

    if(element === false){
      $channel.send("I can't seem to find that element");
      return;
    }else{
      $channel.send(element);
      return;
    }
  }

}