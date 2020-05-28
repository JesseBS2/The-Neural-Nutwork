var Embed = global.discord.functions.CustomEmbed;

module.exports = async function(){

  global.discord.log("Ran /commands/mod/index.js");

  let $message = global.discord.message.msg;
  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let $author = global.discord.message.msg.member;  // used for checking permissions
  let $guild = global.discord.message.guild;
  let me = global.discord.bot.me;
  let Configs = require("./../../configuration.json")[global.discord.message.msg.guild.id];

  if($cmnd === "clear"){
    if($author.hasPermission("MANAGE_MESSAGES") === false){
      return $channel.send("You do not have the necessary permissions for that");
    }else if(me.hasPermission("MANAGE_MESSAGES") === false){
      return $channel.send("I do not have the necessary permissions for that.\nI need the `Manage Messages` permission");
    }
    if(!words[1]) return $channel.send("You're forgetting part of that command!");

    try{ 
      var amount = Number(words[1]) + 1;
      if(amount >= 100){
        for(let x = 0; x < amount; x++){  // loops!
          if(x%10 === 0){$channel.bulkDelete(10); // if it can be evenly divided by ten then remove that much
          }else if(x%5 === 0){$channel.bulkDelete(5); // if it can be evenly divided by five then remove *that* much
          }else if(x%2 === 0){$channel.bulkDelete(2); // if it can be evenly divided by two... you guessed it: Take a nap..... Sike! remove that much.
          }else{$channel.bulkDelete(1);}  // otherwise just remove one this time.
        }
      }else{
        $channel.bulkDelete(amount);
      }

      global.discord.log("Erased "+amount+" messages from "+$channel.name+" in "+global.discord.message.msg.guild);
    }catch(err){
      throw err;
    }
    
  }else if($cmnd === "kick"){
    if($author.hasPermission("KICK_MEMBERS") === false){
      return $channel.send("You do not have the necessary permissions for that");
     }else if(me.hasPermission("KICK_MEMBERS") === false){
      return $channel.send("I do not have the necessary permissions for that.\nI need the `Kick Members` permission");
    }

    let toKick = global.discord.message.msg.mentions.members.first();
    if(toKick.id === global.discord.bot.user.id){
      // DeathMessages ordered like so: Goodbyes, Movie References, Video Game References
      let DeathMessages = ["Kicked *myself* from the server!","Okay. Peace! :wave:","Kicking me? Aww okay, bye :(","'*The Nutwork* has left the *server*'", "You can't fire me! I quit!","I'll get you! And your little dog too!","Hasta la vista baby", "Advancement Made: The End?","Bravo six, Going dark.","Killed by "+$author.tag+"\nYou placed 4th"]

      $channel.send( DeathMessages[Math.round(Math.random()*DeathMessages.length-1)] );  // sends a random goobye into the server
      $guild.leave();
      return;
    }else if(!toKick.id){
      return $channel.send("I can't find this user.. are they in the server?");
    }
    
    toKick.kick()
      .then(() => {
        return $channel.send("Kicked "+toKick.displayName+" from the server!");
      })
      .catch(err => {
        global.discord.log(err);
        return $channel.send("I can not kick this user!");
      });

  }else if($cmnd === "ban"){
    if($author.hasPermission("BAN_MEMBERS") === false){
      return $channel.send("You do not have the necessary permissions for that");
    }else if(me.hasPermission("BAN_MEMBERS") === false){
      return $channel.send("I do not have the necessary permissions for that.\nI need the `Ban Members` permission");
    }
    var toBan = global.discord.message.msg.mentions.users.first();
       
    var time = Number(words[2]) || 7; //custom days or 1 week
    var desc = global.discord.message.msg.content.split(words[0]+" "+words[1]+" "+words[2]+" ")[1] || "Reason not specified.";


    if(time > 7){
      return $channel.send("A player can't be banned for more than a week.");
    }

    
    if(!toBan || toBan == undefined){
      return $channel.send("There is no member in this server with that tag.");
    }else{
      global.discord.message.msg.guild.members.ban(toBan,{
        days: time,
        reason: desc
      }).then(e => {
        return $channel.send("Successfully banned "+toBan);
      }).catch(err => {
        global.discord.log(err);
        return $channel.send("This user can not be banned!");
      });
    }

  // }else if($cmnd === "mute"){
  //   if($author.hasPermission("MUTE_MEMBERS") === false){
  //     return $channel.send("You do not have the necessary permissions for that");
  //   }else if(me.hasPermission("MANAGE_ROLES") === false){
  //     return $channel.send("I do not have the necessary permissions for that.\nI need the `Mute Members` permission");
  //   }

  //   if(!words[1]) return $channel.send("You're forgetting part of that command!");
  //   if(!$message.mentions.members.first()) return $channel.send("You need to mention someone!");

  //   if(!$guild.roles.cache.find(role => role.name == "Muted")){  // if there isn't already a "mute role" then make one
  //     $guild.roles.create({data: {name: "Muted", permissions: ["READ_MESSAGE_HISTORY","VIEW_CHANNEL","CONNECT"]}, reason: "A role that prevents members from speaking"});
  //   }

  //   $message.mentions.members.first().roles.add($guild.roles.cache.find(role => role.name == "Muted").id);
  
  }else if($cmnd === "unban"){
    if($author.hasPermission("BAN_MEMBERS") === false){
      return $channel.send("You do not have the necessary permissions for that");
    }else if(me.hasPermission("BAN_MEMBERS") === false){
      return $channel.send("I do not have the necessary permissions for that.\nI need the `Ban Members` permission");
    }

    if(!words[1]) return $channel.send("You're forgetting part of that command!");
    
    $message.guild.fetchBans().then(bans => { // get active bans for the server
      bans.forEach(banneduser => {  // loop through bans
        global.discord.debug(banneduser.user.tag);
        global.discord.debug(banneduser.user.id)
        if(words[1] == banneduser.user.tag || $message.mentions.members.first().id === banneduser.user.id){  // if mentioned or just typed a username
          $message.guild.members.unban(banneduser.user.id);
          global.discord.debug("Unbanned "+banneduser.user.tag);
          banneduser.user.send("You have been unbanned from "+$message.guild.name);  // message unbanned user
          return $channel.send("User has been unbanned");
        }
      });
    });

    return $channel.send("I could not find an active ban for this user");

  }else if($cmnd === "config"){ // for modifiying ../../configuration.json > guild.id > configs
    if($author.hasPermission("ADMINISTRATOR") === false){
      return $channel.send("Only people with the administrator permission can use this command");
    }

    if(!words[1]){
      let displayconfigures = Embed("Configurable Settings","Settings that can be changed for this server by the admins.\n"+global.discord.message.prefix+"config <setting> <set>")[0].field("Autorole - "+Configs["config"]["autorole"]["type"],"Assigns a role to new users when they join.\n(mentioned role/disable)")[0].field("Nickname - "+Configs["config"]["nickname"],"Allow people to change their own or other people's nicknames.\n(enable/disable)")[0].field("Automath - "+Configs["config"]["automath"],"Do simple math without the need of a command.\n(enable/disable)")[0].field("Autoperiodic - "+Configs["config"]["autoperiodic"],"The bot shows an element without the need of a command.\n(enable/disable)")[0].field("Fun - "+Configs["categories"]["fun"],"Just fun-to-use commands.\n(enable/disable)")[0].field("Meme - "+Configs["categories"]["meme"],"Allows you to create memes or send meme pictures into a channel. \n(enable/disable)")[0].useImage($guild.iconURL)[1];
      return $channel.send(displayconfigures);
    }

    if(words[1] == "prefix" && words[2] && words[2].length >= 1){
      if($author.hasPermission("ADMINISTRATOR") === false){$channel.send("You do not have the necessary permissions for that!"); return;}
      if(words[2].length > 3){$channel.send("A prefix can not be longer than 3 characters."); return;}
      if(words[2].toLowerCase() === global.discord.message.prefix){
        return $channel.send("That prefix is the same as the old prefix!");
      }else{
        Configs["prefix"] = words[2].toLowerCase();
        global.discord.functions.saveJSON();
        return $channel.send(Embed("A new prefix has been set!","An admin, "+$author.displayName+" set the server prefix to: "+Configs["prefix"])[0].field("How to use it?","Use the new prefix just like the old one! ex:\n"+Configs["prefix"]+"snowflake")[1]);
      }
    }
    
    let categories = Configs["categories"];
    let configurations = Configs["config"];

    if(words[1].toLowerCase() in categories){
      if(!words[2]){return;}  // embed with a display of the options

      if(words[2] == "enable"){
        try{
          categories[words[1]] = "enabled"; // enable
          global.discord.log(words[1]+" commands on server <#"+global.discord.message.msg.guild.id+"> are now enabled");  // log
          return $channel.send("`"+words[1]+"` is now enabled");  // annouce
        }catch(err){
          global.discord.debug("Failed to enable "+words[1]+" commands server <#"+global.discord.message.msg.guild.id+">\n"+err); // the thing attempted to change, along with server ID and error
          return $channel.send("Something went wrong!");
        }
      }else if(words[2] == "disable"){
        try{
          categories[words[1]] = "disabled";
          global.discord.log(words[1]+" commands on server <#"+global.discord.message.msg.guild.id+"> are now disabled");
          return $channel.send("`"+words[1]+"` is now disabled");
        }catch(err){
          global.discord.debug("Failed to disable "+words[1]+" commands on server <#"+global.discord.message.msg.guild.id+">\n"+err);
          return $channel.send("Something went wrong!");
        }
      }

      global.discord.functions.saveJSON();
      return;

    }else if(words[1] === "autorole"){  // special case for auto role, as it has more than two states
      if(me.hasPermission("MANAGE_ROLES") === false){
        $channel.send("I do not have the necessary permissions for that");
        return;        
      }
      if(!words[2]){$channel.send("automatic role is currently: "+configurations["autorole"]["type"]); return;}  // in case of lack of setting
      
      if(words[2] === "disable"){
        try{
          configurations["autorole"]["type"] = "disabled";
          configurations["autorole"]["id"] = null;
          return $channel.send("`autorole` is now disabled");
        }catch(err){
          global.discord.debug("Failed to set autorole to disabled on server <#"+global.discord.message.msg.guild.id+">\n"+err);
          return $channel.send("Something went wrong!");
        }
      }else if(words[2].startsWith("<@&")){
        try{
          configurations["autorole"]["type"] = words[2];
          configurations["autorole"]["id"] = global.discord.message.msg.mentions.roles.first().id; // get the role mentioned(will return snowflake)
          global.discord.log("Autorole on server <#"+global.discord.message.msg.guild.id+"> is now "+words[2]);
          return $channel.send("Set automatic role to: "+words[2]);
        }catch(err){
          global.discord.debug("Failed to assign "+words[2]+" as automatic role in server <#"+global.discord.message.msg.guild.id+">\n"+err);
          return $channel.send("Something went wrong!");
        }
      }

      global.discord.functions.saveJSON();
      return;

    }else if(words[1].toLowerCase() in configurations){ // all cases where the value is either 'enabled' or 'disabled'
      if(!words[2])return $channel.send(words[1]+" is currently: "+configurations[words[1]]);


      if(words[2] == "enable"){
        try{
          configurations[words[1]] = "enabled";
          global.discord.log(words[1]+" on server <#"+global.discord.message.msg.guild.id+"> is now enabled");
          return $channel.send(words[1]+" is now enabled");
        }catch(err){
          global.discord.debug("Failed to set "+words[1]+" to enabled on server <#"+global.discord.message.msg.guild.id+">\n"+err); // the thing attempted to change, along with server ID and error
          return $channel.send("Something went wrong!");
        }
      }else if(words[2] == "disable"){
        try{
          configurations[words[1]] = "disabled";
          global.discord.log(words[1]+" on server <#"+global.discord.message.msg.guild.id+"> is now disabled");
          return $channel.send(words[1]+" is now disabled");
        }catch(err){
          global.discord.debug("Failed to set "+words[1]+" to disabled on server <#"+global.discord.message.msg.guild.id+">\n"+err);
          return $channel.send("Something went wrong!");
        }
      }

      global.discord.functions.saveJSON();
      return;
    }


  }else if($cmnd === "addrole" || $cmnd === "ar"){
    if($author.hasPermission("MANAGE_ROLES") === false){
      return $channel.send("You do not have the necessary permissions for that");
    }else if(me.hasPermission("MANAGE_ROLES") === false){
      return $channel.send("I do not have the necessary permissions for that.\nI need the `Manage Roles` permission to do that");
    }

    let member, mentioendRole;
    if($message.mentions.members.first()){ member = $message.mentions.members.first(); }else{ return $channel.send("You didn't mention a member!");}  // if a member is mentioned, get them
    if($message.mentions.roles){ mentioendRole = $message.mentions.roles; }else{ return $channel.send("You didn't mention a role!");}  // if a role is mentioned, get it
    
    let failFlag = false;

   mentioendRole.forEach(currentRole => {
      //global.discord.debug(currentRole);
      member.roles.add(currentRole).catch(e => {
        if(e === "DiscordAPIError: Unknown Role"){
          failFlag = true;
        }else if(e){
          throw e;
        }
      });
    });

    if(failFlag === true){
      return $channel.send("I couldn't assign one or more of the roles");
    }else{
      return $channel.send("I've assigned the roles");
    }
  
  }else if($cmnd === "takerole" || $cmnd === "tr"){
    if($author.hasPermission("MANAGE_ROLES") === false){
      return $channel.send("You do not have the necessary permissions for that");
    }else if(me.hasPermission("MANAGE_ROLES") === false){
      return $channel.send("I do not have the necessary permissions for that.\nI need the `Manage Roles` permission");
    }

    let member, mentioendRole;
    if($message.mentions.members.first()){ member = $message.mentions.members.first(); }else{ return $channel.send("You didn't mention a member!");}  // if a member is mentioned, get them
    if($message.mentions.roles){ mentioendRole = $message.mentions.roles; }else{ return $channel.send("You didn't mention a role!");}  // if a role is mentioned, get it
    
    let failFlag = false;

    mentioendRole.forEach(currentRole => {
      member.roles.remove(currentRole).catch(e => {
        // couldn't apply the current role
        if(e) failFlag = true;
      })
    
    });

    if(failFlag === true){
      return $channel.send("I couldn't take one or more of the roles from that member");
    }else{
      return $channel.send("Roles were removed from the member");
    }
  }
}