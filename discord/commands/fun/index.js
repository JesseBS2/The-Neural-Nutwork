module.exports = function(){

  global.discord.log("Ran /commands/fun/index.js")

  let $cmnd = global.discord.message.command;
  let $channel = global.discord.message.channel;
  let msg = global.discord.message.message;
  let Configs = require("./../../configuration.json")[global.discord.message.msg.guild.id];
  
  
  if($cmnd === "respect" || $cmnd == "F"){
    if(Configs["channels"][$channel.id]["activepoll"] === true){$channel.send("Can not do that right now"); return;}
    let thing = msg.split($cmnd+" ")[1] || "";  // everything after the command
    $channel.send("Press F to pay respects for \""+thing+"\"");

    let respecters = [];

    const isAVote = msg => msg.content;
    let ReSPECt = $channel.createMessageCollector(isAVote, {time: 15000});  // 15 second window

    Configs["channels"][$channel.id]["activepoll"] = true;

    ReSPECt.on("collect",recievedMSG => { // collection, A.K.A message getter
      if( respecters.includes(recievedMSG.author) ){  // if the sender's ID has already been sent
      }else{
        if(recievedMSG == "F" || recievedMSG.content.startsWith("F ") || recievedMSG.content.startsWith("f ")){ // is the first word in votes?
          respecters += recievedMSG.author;
          $channel.send("**"+recievedMSG.member.displayName+"** paid their respects");
          recievedMSG.delete();
        }
      }
    });


      ReSPECt.on("end",collection => {  // finish the 15s timer
        $channel.send( respecters.length +" people paid their respects for "+thing );
        Configs["channels"][$channel.id]["activepoll"] = false; // undo the lock
      });

  }
}