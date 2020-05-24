var Embed = global.discord.functions.CustomEmbed;
var SolveEquation = global.SolveEquation;

module.exports = function(Client){

  global.discord.log("Ran /commands/other/index.js");

  let Configs;
  
  let message = global.discord.message.msg;
  let msg = global.discord.message.message;
  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let $author = global.discord.message.author;
  let $member = global.discord.message.msg.member;
  let $server = global.discord.message.guild;
  let $pre = global.discord.message.prefix;
  let me = global.discord.bot.me;

  if($channel.type != "dm"){
    Configs = require("./../../configuration.json")[global.discord.message.msg.guild.id];
  }

  if($cmnd === "profile" || $cmnd === "self"){
    var username,disc,status,snow,pfp,account_age,accStatusColor;
    
    username = message.author.username;
    disc = message.author.discriminator;
    status = message.author.presence.status;
    snow = message.author.id;
    pfp = message.author.displayAvatarURL || message.author.defaultAvatarURL; // avatar or their default.
    account_age = message.author.createdAt.toString().split(" ")[1]+" "+message.author.createdAt.toString().split(" ")[2]+" "+message.author.createdAt.toString().split(" ")[3];
    accStatusColor = {"online": "#00ff00","idle":"#ffcc00","dnd":"#ff0000","offline":"#919191"};
    
    if($cmnd == "profile" && words[1] && words[1].startsWith("<@!") || $cmnd == "profile" && words[1] && words[1].length === 18 && words[1].replace(/[0-9]/gi,"") === ""){  // only works using profile because typing self then getting someone else is weird
      var otherUser = Client.users.cache.get(words[1]); // by default try to get it based on numbers only
      if(words[1].startsWith("<@!"))otherUser = Client.users.cache.get(words[1].split("<@!")[1].split(">")[0]); // if it didn't start with numbers then change it
      if(otherUser){
        username = otherUser.username;
        disc = otherUser.discriminator;
        status = otherUser.presence.status;
        snow = otherUser.id;
        pfp = otherUser.displayAvatarURL() || otherUser.defaultAvatarURL();
        account_age = otherUser.createdAt.toString().split(" ")[1]+" "+otherUser.createdAt.toString().split(" ")[2]+" "+otherUser.createdAt.toString().split(" ")[3];
      }else{
        return $channel.send("Something went wrong!\nI'm either not in a server with that user, or you did not provide a valid snowflake");
      }
    }

    let display = Embed(" ","Username: "+username+"\n"+"Discriminator: "+disc+"\n"+"Snowflake: "+snow+"\n"+"Status: "+status+"\n"+"User Since: "+account_age,accStatusColor[status])[0].useImage(pfp)[1];

    return $channel.send(display);
  
  }else if($cmnd === "poll"){
    if($member.hasPermission("MANAGE_MESSAGES") === false){ // check if user is allowed to do that. Why is it the MANAGE_MESSAGES permission? ...I do NOT know.
      return $channel.send("You do not have the necessary permissions for that!");
    }

    if(Configs["channels"][$channel.id]["activepoll"] === true) return $channel.send("There is already a poll in this channel!");
      if(!words[1]) return $channel.send("You're forgetting part of that Command!");
      var PollHeaders = ["Vote-y McVoterson","It's time to settle this...","I want a fair trial, gentlemen.","August 18th, 1920","I love democracy"]; // add some variatey      
      let selectedHeader = PollHeaders[Math.round(Math.random()*PollHeaders.length)];

      let voteFor = "";
      var Votes = {};
      var Voters = [];
      let options = msg.replace(/\, /g,",").split($pre+"poll ")[1].split(",");  // separate by commas instead
      
      if(!options[1]) return $channel.send("You need at least two things to vote for!");
      if(options[5]) return $channel.send("You can only have up to 5 things to vote for!");

      Configs["channels"][$channel.id]["activepoll"] = true;  // so that another poll can not be made in the same channel

      for(let n = 0; n < options.length; n++){
        if(n === options.length-1 && words[words.length-1].replace(/\D/g,"") === words[words.length-1] && !words[words.length-1].endsWith(",") ){
          let crazySplit = options[n].split(" "+options[n].split(" ")[options[n].split(" ").length-1])[0];
          
          Votes[crazySplit.toLowerCase()] = 0; 
          voteFor += crazySplit+"\n";

          break;
        }else if(n === 0 && options[0].startsWith("\"") && options[0].endsWith("\"")){
          selectedHeader = options[0].split("\"")[1];
          
          continue;
        }
        Votes[options[n].toLowerCase()] = 0; // lowercase only makes it easier.
        voteFor += options[n]+"\n";
      }
      
      $channel.send( Embed(selectedHeader,voteFor)[0].field("How to vote?","Use "+$pre+"vote <thing you want to vote for>")[1]); // annoucement! announcement!

      const isAVote = newMsg => newMsg.content.startsWith($pre+"vote"); // what to look for when getting commands
      
      let countdownTimer = 30000; // 30 seconds to vote
      //global.discord.debug(words[words.length-1])
      if(words[words.length-1].replace(/\D/g,"") === words[words.length-1] && !words[words.length-1].endsWith(",") ) countdownTimer = Number(words[words.length-1])*1000; // if remove all letters is still itself and the last word wasn't anticipating another variable then it's probably a number & a timer. Multiply by 1000 to convert to seconds
      //global.discord.debug(countdownTimer)

      let GetIt = $channel.createMessageCollector(isAVote, {time: countdownTimer});
      global.discord.debug(`Created poll #${global.discord.totalPolls} in ${message.guild.name} | with a ${countdownTimer/1000} second timer`);

     //global.discord.debug("Options: \n"+JSON.stringify(Votes) )

      GetIt.on("collect",async recievedMSG => { // collection, A.K.A message getter
        if( Voters.includes(recievedMSG.author.toString()) ){  // if the sender's ID has already been sent
          let StopThisMans = await $channel.send("You already voted for this Poll!");
          setTimeout(() => {
            StopThisMans.delete();
          },2000);
        }else{
          if(recievedMSG.content.split($pre+"vote ")[1].toLowerCase() in Votes){ // is everything but the command in votes?
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
          let oof = await $channel.send("**Poll timed out.** No one voted.");
          global.discord.totalPolls++;
          setTimeout(() => {
            oof.delete();
          },6969);
          return;
        }
        let Entries = Object.entries(Votes);
        let toReturn = "";
        Entries.forEach(e => {
          toReturn += e[0]+": "+(e[1]/Voters.length)*100+"%\n";
        });
        return $channel.send( Embed("Final Results for the Poll:", toReturn)[0].footer(Voters.length+" people voted")[1] ); // if I were able to sort an array of arrays based on one of the values in that sub-array I would... but I can't so no
        global.discord.totalPolls++;
        Configs["channels"][$channel.id]["activepoll"] = false; // allows for more polls!
      });

    return;
  
  }else if($cmnd === "nickname" || $cmnd === "nick"){
    if(!message.mentions.members.first() && $member.hasPermission("CHANGE_NICKNAME") === false || message.mentions.members.first() && $member.hasPermission("MANAGE_NICKNAME") === false){
      return $channel.send("You do not have the necessary permissions for that!");
    }else if(me.hasPermission("MANAGE_NICKNAMES") === false){
      return $channel.send("I do not have the necessary permissions for that.\nI need the `MANAGE_NICKNAMES` permission");
    }

    var toChangeNick = message.mentions.members.first() || message.member;
    var newNick = "";

    for(let j = 1; j < words.length; j++){
      if(words[1] === $cmnd){j++}
      if(words[j].startsWith("<@!") && words[j].endsWith(">") && words[j].length === 22){}else{
        newNick += words[j];
        if(j < words.length){newNick+=" ";}
      }
    }

    
    //global.discord.debug(toChangeNick);
    toChangeNick.setNickname( newNick )
      .then(e => {
        global.discord.debug(e);
        return $channel.send("**Sucessfully nicknamed!**");
      })
      .catch(err => {
        if(err != "DiscordAPIError: Missing Permissions") throw e;
        return $channel.send("I can not change the nickname of this user!");
      });
    

    return;
  }

}