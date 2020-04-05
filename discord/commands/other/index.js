var Embed = global.discord.functions.CustomEmbed;
var SolveEquation = global.SolveEquation;


module.exports = function(){

  global.discord.debug("DISCORD: Ran /commands/other/index.js");

  let Configs = require("./../../configuration.json")[global.discord.message.msg.guild.id];
  let message = global.discord.message.msg;
  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let $author = global.discord.message.author;
  let $member = global.discord.message.msg.member;
  let $pre = global.discord.message.prefix;


  if($cmnd === "config"){ // a server's custom settings
    // configurable settings: prefix, automath, autorole, embeds, echoes

    if(words[1] === "prefix"){
      if(!words[2]){$channel.send("The prefix for Nutwork commands is currently "+Configs["prefix"]);return;}
      if(words[2].length > 3){$channel.send("A prefix can not be longer than 3 characters");return;}
      else{
        //global.writeJSON("./../../configuration.json",JSON.stringify(message.guild.id["prefix"] = ""));
        Configs["prefix"] = words[2];
        $channel.send( Embed("New Prefix","The Nutwork has a new prefix for commands, "+words[2])[0].field("New Usage","Use the new prefix in place of the old one, example:\n"+words[2]+"echo Hello World")[1] );
      }
    }else if(words[1] === "automath"){
      if(!words[2]){$channel.send("Automathically doing math is currently "+Configs["config"]["automath"])}
    }

  }else if($cmnd === "snowflake"){
    try{
      $author.send("Your account's snowflake is:\n"+$author.id.toString());
    }catch(err){
      $channel.send("I can't seem to DM you?");
      console.log(err);
    }
    return;

  }else if($cmnd === "echo"){ // lowercase e copies the message and makes the embed
    var echoed = Embed("eWF5IGJhc2U2NCBpcyBmdW4hIQ==",global.discord.message.message.split($pre+"echo ")[1])[1];  // split the users message by the prefix on the server, followed by the command and a space. everything after it.
    $channel.send( echoed );
    return;

  }else if($cmnd === "Echo"){ // capital E cuts the message and makes the embed
    var echoed = Embed(global.discord.message.tag+" says...",global.discord.message.message.split($pre+"Echo ")[1])[1];
    global.discord.message.msg.delete();
    $channel.send( echoed );
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
  }

}