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
    
  }else if($cmnd === "poll"){
    if($member.hasPermission("MANAGE_MESSAGES") === false){ // check if user is allowed to do that. Why is it the MANAGE_MESSAGES permission? ...I do NOT know.
      $channel.send("You do not have the necessary permissions for that!");
      return;
    }

    if(Configs["channels"][$channel.id]["activepoll"] === true){$channel.send("There is already a poll in this channel!"); return;}
      if(!words[1]){$channel.send("You're forgetting part of that Command!"); return;}
      let voteFor = "";
      let Votes = {};
      let Voters = [];
      let options = msg.replace(/\, /g,",").split($pre+"poll ")[1].split(",");  // separate by commas instead
      
      if(!options[1]){$channel.send("You need at least two things to vote for!"); return;}
      if(options[5]){$channel.send("You can only have up to 5 things to vote for!"); return;}

      Configs["channels"][$channel.id]["activepoll"] = true;  // so that another poll can not be made in the same channel

      for(let n = 0; n < options.length; n++){
        Votes[options[n].toLowerCase()] = 0; // lowercase only... makes it easier.
        voteFor += options[n]+"\n";
      }
      let PollHeaders = ["Hey Everyone! There's a new poll!","Vote-y McVoterson","Would you like to vote?","It's time to settle this...","I want a fair trial gentlemen.","August 18th, 1920","I love democracy"]; // add some variatey
      $channel.send( Embed(PollHeaders[Math.round(Math.random()*PollHeaders.length)],voteFor)[0].field("How to vote?","Use "+$pre+"vote <thing you want to vote for>")[1]); // annoucement! announcement!

      const isAVote = newMsg => newMsg.content.startsWith($pre+"vote"); // what to look for when getting commands
      let GetIt = $channel.createMessageCollector(isAVote, {time: 30000});  // 30 seconds to vote
      global.discord.debug(`Created poll #${global.discord.totalPolls} in ${message.guild.name}`);

      GetIt.on("collect",recievedMSG => { // collection, A.K.A message getter
        if( Voters.includes(recievedMSG.author.toString()) ){  // if the sender's ID has already been sent
          $channel.send("You already voted for this Poll!");
        }else{
          if(recievedMSG.content.split($pre+"vote ")[1].toLowerCase() in Votes){ // is the first word in votes?
            Votes[recievedMSG.content.split($pre+"vote ")[1].toLowerCase()] += 1;  // lowercase
            $channel.send("Vote Added!");
            Voters.push(recievedMSG.author.toString()); // add them to an array so they can't vote again
          }else{
            $channel.send("'"+recievedMSG.content.split($pre+"vote ")[1]+"' is not an option!"); // if you try to vote for failure when it's not someting you can vote for... heh.
          }
        }
      });

      GetIt.on("end",async collection => {  // the collection(message getter) finishes it's 30s timer
        if(Voters.length <= 0){
          global.discord.debug("Poll #"+global.discord.totalPolls+" Timed out");
          Configs["channels"][$channel.id]["activepoll"] = false; // allows for more polls!
          let oof = await $channel.send("**Poll timed out. No one voted.**");
          global.discord.totalPolls++;
          setTimeout(() => {
            oof.delete();
          },1500);
          return;
        }
        let Entries = Object.entries(Votes);
        let toReturn = "";
        Entries.forEach(e => {
          toReturn += e[0]+": "+(e[1]/Voters.length)*100+"%\n";
        });
        $channel.send( Embed("Final Results for the Poll:", toReturn)[0].footer(Voters.length+" people voted")[1] ); // if I were able to sort an array of arrays based on one of the values in that sub-array I would... but I can't so no
        global.discord.totalPolls++;
        Configs["channels"][$channel.id]["activepoll"] = false; // allows for more polls!
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

  //

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