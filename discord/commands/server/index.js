var Embed = global.discord.functions.CustomEmbed;
var SolveEquation = global.SolveEquation;

module.exports = async function(){

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

  if($cmnd === "server"){
    var insights = {
      name: $server.name,
      description: $server.description || "No description is set for this server",
      owner: $server.owner,
      region: $server.region,
      members: $server.memberCount,
      boosts: $server.premiumSubscriptionCount,
      roles: $server.roles.length,
      emojis: $server.roles.length,
      channels: $server.channels.length,
      system: $server.systemChannel,
      mfa: $server.mfaLevel
    }
  
    //console.log($server.roles.size)
    if(words[1] && words[1] in insights){
      return $channel.send( Embed(" ",insights[words[1]])[1] );
    }
    return $channel.send( Embed(insights.name,insights.description)[0].field("Data",`Owner: ${insights.owner}\nMembers: ${insights.members}\nBoosting: ${insights.boosts}\nSystem Channel: ${insights.system}`)[0].useImage($server.iconURL)[0].footer("Your server's data is not stored by The Neural Nutwork")[0].useTimestamp()[1] );
  }else if($cmnd === "create"){
    if(!words[1]){
      return $channel.send("You're forgetting part of that command!");
    }else if(words[1] === "channel"){
      if($member.hasPermission("MANAGE_CHANNELS") === false){
        return $channel.send("You do not have the necessary permissions for that");
      }else if(bot.hasPermission("MANAGE_CHANNELS") === false){
        return $channel.send("I do not have the necessary permissions for that.\nI need the `Manage Channels` permission");
      }
      
      
      let name = words[2] || "nameless"; 
      let type = "text";
      let category = $channel.parent.id;
      if(!words[1]) return;
      if(words[3] && words[3] === "voice") type = words[3];
      if(words[4])category = $server.channels.get(words[4]).id;

      $server.channels.create(name,{type: type, reason: "Channel created by "+$author.tag}) // reason, so you know who did it
        .then(channelToMove => {
          channelToMove.setParent(category);
        });
      
      global.discord.log("Created a channel '"+name+"' in server "+$server.name);
      return $channel.send("I've created the channel!");
    }else if(words[1] === "category"){
      if($member.hasPermission("MANAGE_CHANNELS") === false){
        return $channel.send("You do not have the necessary permissions for that");
      }else if(bot.hasPermission("MANAGE_CHANNELS") === false){
        return $channel.send("I do not have the necessary permissions for that.\nI need the `Manage Channels` permission");
      }


      let name = words[2] || "nameless";

      $server.channels.create(name,{type: "category", reason: "Category created by "+$author.tag}); // same as create channel but the channel type is a category :O
      global.discord.log("Created a category '"+name+"' in server ' "+$server.name+" '");
      return $channel.send("I've created the category!");
    
    }else if(words[1] === "role"){
      if($member.hasPermission("MANAGE_ROLES") === false){
        return $channel.send("You do not have the necessary permissions for that");
      }else if(bot.hasPermission("MANAGE_ROLES") === false){
        return $channel.send("I do not have the necessary permissions for that.\nI need the `Manage Roles` permission");
      }
      

      let name = words[2] || "nameless-role";
      let color = null;
      if(words[3] && words[3].startsWith("#") && words[3].length === 7)color = words[3];

      $server.roles.create({data: {name: name, color: color}, reason: "Role created by "+$author.tag}).then(newRole => {
        global.discord.log("Created a role '"+name+"' in server ' "+$server.name+" '");
        return $channel.send("I've created the role!\n<@"+newRole+">");
      }).catch((err) => {
        $channel.send("Something went wrong!\nI couldn't create the role");
        if(err) throw err;
      });
      
    }else if(words[1] === "webhook"){
      // if(!words[2]) return $channel.send("You're forgetting the name parameter!");

      // $channel.createWebhook(words[2], {
      //   avatar: "https://i.imgur.com/zfusTWU.png",
      //   reason: "Webhook created with The Nutwork by "+$author.tag
      // }).then(webhook => {
      //   $channel.send("I've created the webhook!");
      //   global.discord.debug("Created webhook \n"+webhook);
      // }).catch(e => {
      //   if(e) throw e;
      // });
      return;
    }
  }else if($cmnd === "delete"){
    let mention, type="unknown thing";
    if(!words[1]) return $channel.send("You're forgetting the name parameter!");
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
          global.discord.log("Deleted a " +type+ " '"+mention.name+"' in server '"+$server.name+"'");
          return $channel.send("I've deleted the "+type);
        })
        .catch(function(){
          if(type === "role") return $channel.send("I can not delete roles higher than my own");
          if(type === "channel") return $channel.send("I can't seem to delete that channel");
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
          global.discord.log("Deleted a "+type+" '"+mention.name+"' in server '"+$server.name+"'");
          return $channel.send("I've deleted the "+type);
        })
        .catch(function(){
          if(type === "role") return $channel.send("I can not delete roles higher than my own");
          if(type === "channel") return $channel.send("I can't seem to delete that channel");
          if(type === "category") return $channel.send("I can't seem to delete that category");
        });
    }
  }
}