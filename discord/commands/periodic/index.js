const Embed = global.discord.functions.CustomEmbed;

module.exports = function(){
  global.discord.log("Ran /commands/periodic/index.js");

  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let table = require("./table.json");

  if($cmnd === "periodic" || $cmnd === "periodictable" || $cmnd === "pt"){
    if(!words[1]){$channel.send("Here is the Periodic Table of Elements: ",{files: ["https://i.imgur.com/1sdQUsd.jpg"]}); return;}

    let element = false;
    
    for(var elems = 0; elems < Object.keys(table).length; elems++){
      //global.discord.debug("Loop #"+elems);
      if(words[1].toLowerCase() == table[elems+1]["name"].toLowerCase() || words[1].toLowerCase() == table[elems+1]["abr"].toLowerCase() || words[1] === (elems+1).toString()){
        //global.discord.debug("YES IT IS")
        element = Embed(table[elems+1]["name"],"Symbol: "+table[elems+1]["abr"]+"\nAtomic Weight: "+table[elems+1]["weight"]+"\nElectrons per Shell: "+table[elems+1]["elec"])[1];
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