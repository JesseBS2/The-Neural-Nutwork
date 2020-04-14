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
    if($member.hasPermission("MANAGE_CHANNELS") === false){ // check if user is allowed to do that. Why is it the MANAGE_CHANNELS permission? I do NOT know.
      $channel.send("You do not have the necessary permissions for that!");
      return;
    }

    if(Configs["channels"][$channel.id]["activepoll"] === true){$channel.send("There is already a poll in this channel!"); return;}
      if(!words[1]){$channel.send("You're forgetting part of that Command!"); return;}
      if(!words[2]){$channel.send("You need at least two things to vote for!"); return;}
      if(words[6]){$channel.send("You can only have up to 5 things to vote for!"); return;}
      let voteFor = "";
      let Votes = {};
      let Voters = [];

      Configs["channels"][$channel.id]["activepoll"] = true;  // so that another poll can not be made in the same channel

      for(let n = 1; n < words.length; n++){
        Votes[words[n].toLowerCase()] = 0; // lowercase only... makes it easier.
        voteFor += words[n]+"\n";
      }

      $channel.send( Embed("Hey Everyone! There's a new poll!",voteFor)[0].field("How to vote?","Use "+$pre+"vote <thing you want to vote for>")[1]); // annoucement! announcement!

      const isAVote = newMsg => newMsg.content.startsWith($pre+"vote"); // what to look for when getting commands
      let GetIt = $channel.createMessageCollector(isAVote, {time: 30000});  // 30 seconds to vote

      GetIt.on("collect",recievedMSG => { // collection, A.K.A message getter
        if( Voters.includes(recievedMSG.author) ){  // if the sender's ID has already been sent
          $channel.send("You already voted for this Poll!");
        }else{
          if(recievedMSG.content.split(" ")[1].toLowerCase() in Votes){ // is the first word in votes?
            Votes[recievedMSG.content.split(" ")[1].toLowerCase()] += 1;  // lowercase
            $channel.send("Vote Added!");
            Voters += recievedMSG.author; // add them to an array so they can't vote again
          }else{
            $channel.send("'"+recievedMSG.content.split(" ")[1]+"' is not an option!"); // if you try to vote for failure when it's not someting you can vote for... heh.
          }
        }
      });


      GetIt.on("end",collection => {  // the collection(message getter) finishes it's 30s timer
        $channel.send( Embed("Final Results for the Poll:", Object.entries(Votes))[1] ); // if I were able to sort an array of arrays based on one of the values in that sub-array I would... but I can't so no
        Configs["channels"][$channel.id]["activepoll"] = false; // allows for more polls!
      });

    return;
  
  }else if($cmnd === "flip"){
    
    //let streak = false;
    flipper();
    
  }

  function flipper(send){
    let isStreak = false;
    let math = 0.5;
    let coin = Math.round(Math.random()*1);
    if(isStreak === false){
      if(coin === 0){
        $channel.send("> It landed on tails!\n> "+(math*100)+"%");
      }else if(coin === 1){
        $channel.send("> It landed on heads!\n> "+(math*100)+"%");
      }
    }

      const isAVote = newMsg => newMsg.content.split(" ")[0].startsWith($pre+"flips");
      let GetIt = $channel.createMessageCollector(isAVote); 
      isStreak = true;
      
      GetIt.on("collect",recievedMSG => { // collection, A.K.A message getter
        if( recievedMSG.author !== $author ){}else{  // only the original flipper can keep the streak
          if(recievedMSG.content.split(" ")[0] !== $pre+"flips"){
            GetIt.stop();
          }
          let newCoin = Math.round(Math.random()*1);
          if(newCoin === coin && newCoin === 0){
            math = math*0.5;
            $channel.send("> It landed on tails!\n> "+(math*100)+"%");
            isStreak = true;
          }else if(newCoin === coin && newCoin === 1){
            math = math*0.5;
            $channel.send("> It landed on heads!\n> "+(math*100)+"%");
            isStreak = true;
          }else if(newCoin === 1){
            math = 0.5; // clear the streak
            $channel.send("**Streak Broken**\n> It landed on heads!\n> "+(math*100)+"%");
            // don't call because streak is over
            isStreak = false; // set to false because streak is over
            GetIt.stop();
          }else if(newCoin === 0){
            math = 0.5;
            $channel.send("**Streak Broken**\n> It landed on tails!\n> "+(math*100)+"%");
            isStreak = false;
            GetIt.stop();
          }
        }
        
      });


      //GetIt.on("end",collection => {isStreak = false;}); // set streak to be false again
  }
}