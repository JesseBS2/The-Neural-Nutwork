var request = require("request");
const Embed = global.discord.functions.CustomEmbed;

module.exports = function(){
  global.discord.log("Ran /commands/periodic/index.js");

  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  var table;

  if($cmnd === "periodic" || $cmnd === "periodictable" || $cmnd === "pt"){
    if(!words[1])return $channel.send("Here is the Periodic Table of Elements: ",{files: ["https://i.imgur.com/rzoOEEY.jpg"]});
    
    let element = false;

    // the github is updated, I wouldn't know when It needs to be updated. So pulling from the github would be smarter(auto updates :o)
    request({
      url: "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json",
      json: true
    }, function(error, response, body){

      if(!error && response.statusCode === 200){
        table = body["elements"];


        if(!isNaN(Number(words[1]))){ // check if it can be translated to a number properly, if not, look for the name/symbol
          elems = Number(words[1]);
          if(elems > table.length) return $channel.send("Too large! The periodic table stops at "+table.length-1);
          if(elems < 1) return $channel.send("Too small! The periodic table starts at 1");
          element = Embed(table[elems-1]["name"]+" - #"+elems,"Symbol: "+table[elems-1]["symbol"]+"\nAtomic Weight: "+table[elems-1]["atomic_mass"])[0].field("Discovery","Discovered by "+table[elems-1]["discovered_by"])[1];
        }else{
          for(var elems = 0; elems < table.length; elems++){
            //global.discord.debug("Loop #"+elems);
            if(words[1].toLowerCase() == table[elems]["name"].toLowerCase() || words[1].toLowerCase() == table[elems]["symbol"].toLowerCase()){
              element = Embed(table[elems-1]["name"]+" - #"+elems,"Symbol: "+table[elems-1]["symbol"]+"\nAtomic Weight: "+table[elems-1]["atomic_mass"])[0].field("Discovery","Discovered by "+table[elems-1]["discovered_by"])[1];
              break;
            }
          }
        }

        // sends the element
        if(element === false){
          return $channel.send("I can't seem to find that element");
        }else{
          return $channel.send(element);
        }

      }
    });
  }
}