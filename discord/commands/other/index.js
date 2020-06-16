var Embed = global.discord.functions.CustomEmbed;
var SolveEquation = global.SolveEquation;

module.exports = function(Client,Discord){
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

  if($cmnd === "profile"){
    var username,disc,status,snow,pfp,account_age,accStatusColor,activity="",custom="";

    try{
      if(words[1] && words[1].startsWith("<@!") || $cmnd == "profile" && words[1] && words[1].length === 18 && words[1].replace(/[0-9]/gi,"") === ""){  // only works using profile because typing self then getting someone else is weird
        var GetUserAcc = Client.users.cache.get(words[1]); // by default try to get it based on numbers only
        if(words[1].startsWith("<@!"))GetUserAcc = Client.users.cache.get(words[1].split("<@!")[1].split(">")[0]); // if it didn't start with numbers then change it
      }else{
        GetUserAcc = message.author;
      }
    }catch(e){
      return $channel.send("Something went wrong!\nI'm either not in a server with that user, or you did not provide a valid snowflake");
    }

    //console.log(GetUserAcc.presence)

    // Look all these beautiful settings!! :D
    username = GetUserAcc.username;
    disc = GetUserAcc.discriminator;
    status = GetUserAcc.presence.status;
    snow = GetUserAcc.id;
    pfp = GetUserAcc.displayAvatarURL() || GetUserAcc.defaultAvatarURL();
    account_age = GetUserAcc.createdAt.toString().split(" ")[1]+" "+GetUserAcc.createdAt.toString().split(" ")[2]+" "+GetUserAcc.createdAt.toString().split(" ")[3];
    accStatusColor = {"online": "#00ff00","idle":"#ffcc00","dnd":"#ff0000","offline":"#919191"};
    if(GetUserAcc.presence.activities.length == 1){ 
      //global.discord.debug("Didn't Loop");
      if(GetUserAcc.presence.activities[0].type != null && GetUserAcc.presence.activities[0].name != null && GetUserAcc.presence.activities[0].type != "CUSTOM_STATUS"){
        activity = "\n**"+GetUserAcc.presence.activities[0].type.charAt(0).toUpperCase() + GetUserAcc.presence.activities[0].type.slice(1).toLowerCase()+"**: "+GetUserAcc.presence.activities[0].name.toString();
      }else if(GetUserAcc.presence.activities[0].state != null && GetUserAcc.presence.activities[0].type == "CUSTOM_STATUS"){
        custom = "\n**Custom Status**: "+GetUserAcc.presence.activities[0].state;
      }
    }else if(GetUserAcc.presence.activities.length > 1){
      //global.discord.debug("Did Loop");
      var LOOP = GetUserAcc.presence.activities;
      for(let e in LOOP){
        if(GetUserAcc.presence.activities[e].type != null && GetUserAcc.presence.activities[e].name != null && GetUserAcc.presence.activities[e].type != "CUSTOM_STATUS"){
          activity += "\n**"+GetUserAcc.presence.activities[e].type.charAt(0).toUpperCase()+GetUserAcc.presence.activities[e].type.slice(1).toLowerCase()+"**: "+GetUserAcc.presence.activities[e].name.toString();
        }else if(GetUserAcc.presence.activities[e].state != null && GetUserAcc.presence.activities[e].type == "CUSTOM_STATUS"){
          custom = "\n**Custom Status**: "+GetUserAcc.presence.activities[e].state;
        }
      }
    }

    var display = Embed(" ","**Username**: "+username+"\n**Discriminator**: "+disc+"\n**Snowflake**: "+snow+"\n**Status**: "+status+activity+custom+"\n**User Since**: "+account_age,accStatusColor[GetUserAcc.presence.status])[0].useImage(pfp)/*[0].footer("Using discord for "+Object.keys(GetUserAcc.presence.clientStatus)[0])*/[1];

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
          if(recievedMSG.content.split($pre+"vote ")[1].toLowerCase() in Votes){  // is it voteable?
            Votes[recievedMSG.content.split($pre+"vote ")[1].toLowerCase()] += 1;  // lowercase
            $channel.send("Vote added!");
            Voters.push(recievedMSG.author.toString()); // add them to an array so they can't vote again
          }else if(Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase()) != NaN && Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase())%1 == 0){  // is it a number
            if(Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase()) > options.length){
              return $channel.send(`That is ${Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase())-options.length} higher than the max!`);
            }else if(Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase()) <= 0){
              return $channel.send("That is too low!");
            }else{
              let findTheThing = Object.keys(Votes)[Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase())-1];
              Votes[ findTheThing ] += 1;  // lowercase
              $channel.send("Vote added!");
              Voters.push(recievedMSG.author.toString()); // add them to an array so they can't vote again
            }
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
    if(Configs["config"]["nickname"] === "disabled" && $member.hasPermission("MANAGE_NICKNAMES") === false){
      return $channel.send("An admin has disabled these commands!");
    }

    if(!message.mentions.members.first() && $member.hasPermission("CHANGE_NICKNAME") === false || message.mentions.members.first() && $member.hasPermission("MANAGE_NICKNAMES") === false){
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
  }else if($cmnd === "embed"){

    var titles = [];
    var descriptions = [];
    var color = "#7289d9";
    var footer = "";

    let ReturnEmbed = new Discord.MessageEmbed(); // find it easier to do this than to use my custom function(for this particular command)

    let splitTitle = msg.split("[");
    let splitDescription = msg.split("{");

    if(splitTitle.length < 0) return $channel.send("Please add at least one title");
    if(splitDescription.length < 0) return $channel.send("Please add at least one description"); 


    for(var x = 1; x < splitTitle.length; x++){
      titles[x-1] = splitTitle[x].split("]")[0];
      descriptions[x-1] = "*Empty Field*";
    }
    for(var x = 1; x < splitDescription.length; x++){
      descriptions[x-1] = splitDescription[x].split("}")[0];
    }
    
    if(msg.indexOf("(") !== -1) footer = msg.split("(")[msg.split("(").length-1].split(")")[0];
    if(msg.indexOf("#") !== -1 && msg.split("#")[1].split(" ")[0].length === 6)color = "#"+msg.split("#")[1].slice(-6);

    ReturnEmbed.setTitle(titles[0]).setDescription(descriptions[0]);

    for(let e = 1; e < titles.length; e++){
      ReturnEmbed.addField(titles[e],descriptions[e]);
    }
    
    ReturnEmbed.setColor(color);
    ReturnEmbed.setFooter(footer);
    return $channel.send(ReturnEmbed);
  }
  
}