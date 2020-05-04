var Embed = global.discord.functions.CustomEmbed;
var SolveEquation = global.SolveEquation;

module.exports = function(Client){

  global.discord.log("Ran /commands/server/index.js");
  
  var message = global.discord.message.msg;
  var msg = global.discord.message.message;
  var words = global.discord.message.words;
  var $channel = global.discord.message.channel;
  var $cmnd = global.discord.message.command;
  var $author = global.discord.message.author;
  var $member = global.discord.message.msg.member;
  var $pre = global.discord.message.prefix;
  var bot = global.discord.bot.me;
  var $server = global.discord.message.guild;

  var Configs = require("./../../configuration.json")[$server.id];

  if($member.hasPermission("MANAGE_CHANNELS") === false){
    $channel.send("You do not have the necessary permissions for that");
    return;
  }else if(bot.hasPermission("MANAGE_CHANNELS") === false){
    $channel.send("I do not have the necessary permissions for that");
    $channel.send("I need the `Manage Channels` permission");
    return;
  }

  if($cmnd === "create"){
    if(!words[1]){
      $channel.send("You're forgetting part of that command!");
      return;
    }else if(words[1] === "channel"){
      let name = words[2] || "nameless"; 
      let type = "text";
      let category = $channel.parent.id;
      if(words[3] && words[3] === "voice") type = words[3];
      if(words[4])category = $server.channels.get(words[4]).id;

      $server.createChannel(name,{type: type, reason: "Channel created by "+$author.tag}) // reason, so you know who did it
        .then(channelToMove => {
          channelToMove.setParent(category);
        });
      
      $channel.send("I've created the channel!");
      global.discord.log("Created a channel '"+words[2]+"' in server "+$server.name);
    }else if(words[1] === "category"){
      let name = words[2] || "nameless";

      $server.createChannel(name,{type: "category", reason: "Category created by "+$author.tag}); // same as create channel but the channel type is a category :O
      $channel.send("I've created the category!");
      global.discord.log("Created a category '"+words[2]+"' in server ' "+$server.name+" '");
    }

  }else if($cmnd === "delete"){
    let mention;
    if(words[1].startsWith("<")){
      mention = message.mentions.channels.first();
      mention.delete()
        .then(function(){
          $channel.send("Channel was deleted!");
          global.discord.log("Deleted a channel '"+mention.name+"' in server ' "+$server.name+" '");
        })
        .catch(function(){
          $channel.send("That is not a channel");
        });

    }else if(words[1].length == 18 && words[1].replace(/\D/gi,"") === words[1]){ // if all letters removed is the same as itself, then it's all numbers(and probably an ID)
      mention = $server.channels.get(words[1]);
      mention.delete()
        .then(function(){
          $channel.send("Channel was deleted!");
          global.discord.log("Deleted a channel '"+mention.name+"' in server ' "+$server.name+" '");
        })
        .catch(function(){
          $channel.send("That is not a channel");
        });
    }
  }
}