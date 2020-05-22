let Embed = global.discord.functions.CustomEmbed;

module.exports = function(){
  
  global.discord.log("Ran /commands/fun/index.js")


  let Configs = require("./../../configuration.json")[global.discord.message.msg.guild.id];
  let message = global.discord.message.msg;
  let msg = global.discord.message.message
  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let $author = global.discord.message.author;
  let $member = global.discord.message.msg.member;
  let $pre = global.discord.message.prefix;
  let $server = global.discord.message.guild;
  let CoinFlippingStreak = false; // used in flip and flips commands, so that flips doesn't show unless necessary.

  
  if($cmnd === "respect" || $cmnd == "F"){
    if(Configs["channels"][$channel.id]["activepoll"] === true){$channel.send("Can not do that right now"); return;}
    let thing = msg.split($cmnd+" ")[1] || "";  // everything after the command
    $channel.send("Press F to pay respects for \""+thing+"\"");

    let respecters = [];
    let count = 0;

    const isRespecting = msg => msg.content;
    let ReSPECt = $channel.createMessageCollector(isRespecting, {time: 15000});  // 15 second window

    Configs["channels"][$channel.id]["activepoll"] = true;

    ReSPECt.on("collect",recievedMSG => { // collection, A.K.A message getter
      if( respecters.includes(recievedMSG.author.toString()) ){  // if the sender's ID has already been sent
      }else{
        if(recievedMSG.content.toLowerCase() === "f" || recievedMSG.content.startsWith("F ") || recievedMSG.content.startsWith("f ")){ // is the first word in votes?
          respecters += recievedMSG.author.toString();
          count++;
          $channel.send("**"+recievedMSG.member.displayName+"** paid their respects");
          recievedMSG.delete();
        }
      }
    });


      ReSPECt.on("end",collection => {  // finish the 15s timer
        $channel.send( count +" people paid their respects for "+thing );
        Configs["channels"][$channel.id]["activepoll"] = false; // undo the lock
      });
    return;
    
  }else if($cmnd === "flip"){
    flipper();
    CoinFlippingStreak = true;
    return;
  }else if($cmnd === "random" || $cmnd === "rand"){
    let First = false, Second = false;  // false by default because ifs check for these
    if(words[1]) First = Number(words[1].replace(/\D/gi,""));
    if(words[2]) Second = Number(words[2].replace(/\D/gi,""));
    
    if(!First || First <= 1 && !Second){$channel.send(Math.random()); return;} // No first or first is too low; means 0-1
    if(First && !Second && First > 1){$channel.send(Math.round(Math.random()*First)); return;}  // only first is present and is greater than 1
    if(First && Second && Math.ceil(Second)-Math.floor(First) <= 1){$channel.send(Math.random()*(Math.ceil(Second) - Math.floor(First))+Math.floor(First)); return;}
    if(First && Second){$channel.send(Math.round(Math.random()*(Second-First)+First)); return;}
  
  }

  /// functions ///

  function flipper(send){
    let math = 0.5;
    let coin = Math.round(Math.random(0)*1);
    if(CoinFlippingStreak === false){
      if(coin === 0){
        $channel.send("> It landed on tails!\n> "+(math*100)+"%");
      }else if(coin === 1){
        $channel.send("> It landed on heads!\n> "+(math*100)+"%");
      }
    }

    const CheckForFlips = async newMsg => {
      if(newMsg.content.split(" ")[0].startsWith($pre+"flips")){
        return newMsg;
      }else if(newMsg.author === $author){
        CoinFlippingStreak = false;
        return false;
      }
    }


    let GetIt = $channel.createMessageCollector(CheckForFlips); 
    CoinFlippingStreak = true;

    GetIt.on("collect",async recievedMSG => { // collection, A.K.A message getter
      if(recievedMSG.author !== $author){ // only the original flipper can keep the streak
      }else if(recievedMSG.author == $author && CoinFlippingStreak === false){
        let quickNotif = await $channel.send("**Streak Broken**");
        setTimeout(() => {
          quickNotif.delete();
        },1800);
        math = 0.5;
        CoinFlippingStreak = false;
        GetIt.stop();
        return;
      }else{  
        let newCoin = Math.round(Math.random(0)*1);
        //global.discord.debug(newCoin);

        if(newCoin === coin && newCoin === 0){
          math = math*0.5;
          $channel.send("> It landed on tails!\n> "+(math*100)+"%");
          CoinFlippingStreak = true;
        }else if(newCoin === coin && newCoin === 1){
          math = math*0.5;
          $channel.send("> It landed on heads!\n> "+(math*100)+"%");
          CoinFlippingStreak = true;
        }else if(newCoin === 1){
          math = 0.5; // clear the streak
          $channel.send("**Streak Broken**\n> It landed on heads!\n> "+(math*100)+"%");
          // don't call because streak is over
          CoinFlippingStreak = false; // set to false because streak is over
          GetIt.stop();
        }else if(newCoin === 0){
          math = 0.5;
          $channel.send("**Streak Broken**\n> It landed on tails!\n> "+(math*100)+"%");
          CoinFlippingStreak = false;
          GetIt.stop();
        }
      }
        
    });

  }
}