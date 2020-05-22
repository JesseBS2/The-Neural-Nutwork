var Embed = global.discord.functions.CustomEmbed;
var SolveEquation = global.SolveEquation;

module.exports = function(){

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
      global.discord.log("Created a channel '"+name+"' in server "+$server.name);
    }else if(words[1] === "category"){
      let name = words[2] || "nameless";

      $server.createChannel(name,{type: "category", reason: "Category created by "+$author.tag}); // same as create channel but the channel type is a category :O
      $channel.send("I've created the category!");
      global.discord.log("Created a category '"+name+"' in server ' "+$server.name+" '");
    
    }else if(words[1] === "role"){
      let name = words[2] || "nameless-role";

      $server.createRole({name: name, reason: "Role created by "+$author.tag});
      $channel.send("I've created the role!");
      global.discord.log("Created a role '"+name+"' in server ' "+$server.name+" '");
    
    }else if(words[1] === "webhook"){
      if(!words[2]){ $channel.send("You're forgetting the name parameter!"); return;}

      $channel.createWebhook(words[2], {
        avatar: "https://i.imgur.com/zfusTWU.png",
        reason: "Webhook created with The Nutwork by "+$author.tag
      }).then(webhook => {
        $channel.send("I've created the webhook!");
        global.discord.debug("Created webhook \n"+webhook);
      }).catch(e => {
        if(e) throw e;
      });

    }else{
      return;
    }

  }else if($cmnd === "delete"){
    let mention, type="unknown thing";
    if(words[1].startsWith("<")){
      mention = message.mentions.channels.first() || message.mentions.roles.first();
      if(mention.type === "text" || mention.type === "voice"){  // voice and texts are channels
        type = "channel";
      }else if(mention.type === "category"){  // categories are actually channels with category type
        type = "category";
      }else if(mention.type === undefined){ // roles don't have a type
        type = "role";
      }

      mention.delete()
        .then(function(){
          $channel.send("I've deleted the "+type);
          global.discord.log("Deleted a " +type+ " '"+mention.name+"' in server '"+$server.name+"'");
        })
        .catch(function(){
          if(type === "role"){ $channel.send("I can not delete roles higher than my own"); return;}
          if(type === "channel"){ $channel.send("I can't seem to delete that channel"); return;}
        });

    }else if(words[1].length == 18 && words[1].replace(/\D/gi,"") === words[1]){ // if all letters removed is the same as itself, then it's all numbers(and probably an ID)
      mention = $server.channels.get(words[1]) || $server.roles.get(words[1]);
      if(mention.type === "text" || mention.type === "voice"){
        type = "channel";
      }else if(mention.type === "category"){
        type = "category";
      }else if(mention.type === undefined){
        type = "role";
      }

      mention.delete()
        .then(function(){
          $channel.send("I've deleted the "+type);
          global.discord.log("Deleted a "+type+" '"+mention.name+"' in server '"+$server.name+"'");
        })
        .catch(function(){
          if(type === "role"){ $channel.send("I can not delete roles higher than my own"); return;}
          if(type === "channel"){ $channel.send("I can't seem to delete that channel"); return;}
          if(type === "category"){ $channel.send("I can't seem to delete that category"); return;}
        });
    }
  }
}