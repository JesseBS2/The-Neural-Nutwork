var Embed = global.discord.functions.CustomEmbed;


module.exports = function(){

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
      $channel.send("You do not have the necessary permissions for that");
      return;
    }else if(me.hasPermission("MANAGE_MESSAGES") === false){
      $channel.send("I do not have the necessary permissions for that");
      return;
    }
    if(!words[1]){$channel.send("You're missing part of that command!"); return;}

    try{ 
      let amount = Number(words[1]);
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
      $channel.send("You do not have the necessary permissions for that");
      return;
    }else if(me.hasPermission("KICK_MEMBERS") === false){
      $channel.send("I do not have the necessary permissions for that");
      return;
    }

    let toKick = global.discord.message.msg.mentions.members.first();
    if(toKick === global.discord.bot.user.id){
      $channel.send("I'll get you! And your little dog too!");
      $guild.leave();
    }
    try{
      toKick.kick();
      $channel.send("Kicked "+toKick+" from the server!");
    }catch(err){
      global.discord.log(err);
      $channel.send("This user can not be kicked!");
    }

  }else if($cmnd === "ban"){
    if($author.hasPermission("BAN_MEMBERS") === false){
      $channel.send("You do not have the necessary permissions for that");
      return;
    }else if(me.hasPermission("BAN_MEMBERS") === false){
      $channel.send("I do not have the necessary permissions for that");
      return;
    }
    var toBan = global.discord.message.msg.mentions.users.first();
       
    var time = Number(words[2]) || 7; //custom days or 1 week
    var desc = global.discord.message.msg.content.split(words[0]+" "+words[1]+" "+words[2]+" ")[1] || "Reason not specified.";


    if(time > 7){
      $channel.send("A player can't be banned for more than a week.");
      return;
    }

    try{   
      if(!toBan || toBan == undefined){
        $channel.send("There is no member in this server with that tag.");
        return;
      }else{
        global.discord.message.msg.guild.ban(toBan,{
          days: time,
          reason: desc
        });
        $channel.send("Successfully banned "+toBan);
      }

    }catch(err){
      global.discord.log(err);
      $channel.send("This user can not be banned!");
    }

  }else if($cmnd === "unban"){
    if($author.hasPermission("BAN_MEMBERS") === false){
      $channel.send("You do not have the necessary permissions for that");
      return;
    }else if(me.hasPermission("BAN_MEMBERS") === false){
      $channel.send("I do not have the necessary permissions for that");
      return;
    }

    if(!words[1]){$channel.send("You're forgetting part of that command!");return;}
    
    let unbanned = true; 
    $message.guild.fetchBans().then(bans => { // get active bans for the server
      bans.forEach(user => {  // loop through bans
        if(words[1] === user.username+"#"+user.tag || words[1].replace("<@!","").replace(">","") === user.id){  // if mentioned or just typed a username
          $message.guild.unban(user);
          unbanned = true;
          global.discord.debug("Unbanned "+user.username+"#"+user.tag);
          user.send("You have been unbanned from "+$message.guild.name);  // message unbanned user
        }
      });
    if(unbanned === false){
      $channel.send("I could not find an active ban for that user");
    }else{
      $channel.send("User has been unbanned");
    }
    });
  

  }else if($cmnd === "config"){ // for modifiying ../../configuration.json > guild.id > configs
    if($author.hasPermission("ADMINISTRATOR") === false){
      $channel.send("Only people with the administrator permission can use this command.");
      return;
    }

    if(!words[1]){
      let displayconfigures = Embed("Configurable Settings","Settings that can be changed for this server by the admins.\n"+global.discord.message.prefix+"config <setting> <set>")[0].field("Autorole - "+Configs["config"]["autorole"]["type"],"Assigns a role to new users when they join.\n(mentioned role/disable)")[0].field("Automath - "+Configs["config"]["automath"],"Do simple math without the need of a command.\n(enable/disable)")[0].field("echo - "+Configs["config"]["echos"],"Mimic what a member said, in a flashy way.\n(enable/disable)")[0].field("Fun - "+Configs["categories"]["fun"],"Just fun-to-use commands.\n(enable/disable)")[1];
      $channel.send(displayconfigures);
      return;
    }

    if(words[1] == "prefix" && words[2] && words[2].length >= 1){
      if($author.hasPermission("ADMINISTRATOR") === false){$channel.send("You do not have the necessary permissions for that!"); return;}
      if(words[2].length > 3){$channel.send("A prefix can not be longer than 3 characters."); return;}
      if(words[2].toLowerCase() === global.discord.message.prefix){
        $channel.send("That prefix is the same as the old prefix!");
        return;
      }else{
        Configs["prefix"] = words[2].toLowerCase();
        global.discord.functions.saveJSON();
        $channel.send(Embed("A new prefix has been set!","An admin, "+$author.displayName+" set the server prefix to: "+Configs["prefix"])[0].field("How to use it?","Use the new prefix just like the old one! ex:\n"+Configs["prefix"]+"snowflake")[1]);
        return;
      }
    }
    
    let categories = Configs["categories"];
    let configurations = Configs["config"];

    if(words[1].toLowerCase() in categories){
      if(!words[2]){return;}  // embed with a display of the options

      if(words[2] == "enable"){
        try{
          categories[words[1]] = "enabled"; // enable
          $channel.send(words[1]+" is now enabled");  // annouce
          global.discord.log(words[1]+" commands on server <#"+global.discord.message.msg.guild.id+"> are now enabled");  // log
        }catch(err){
          $channel.send("Something went wrong!");
          global.discord.debug("Failed to enable "+words[1]+" commands server <#"+global.discord.message.msg.guild.id+">\n"+err); // the thing attempted to change, along with server ID and error
        }
      }else if(words[2] == "disable"){
        try{
          categories[words[1]] = "disabled";
          $channel.send(words[1]+" is now disabled");
          global.discord.log(words[1]+" commands on server <#"+global.discord.message.msg.guild.id+"> are now disabled");
        }catch(err){
          $channel.send("Something went wrong!");
          global.discord.debug("Failed to disable "+words[1]+" commands on server <#"+global.discord.message.msg.guild.id+">\n"+err);
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
          $channel.send("autorole is now disabled");
        }catch(err){
          $channel.send("Something went wrong!");
          global.discord.debug("Failed to set autorole to disabled on server <#"+global.discord.message.msg.guild.id+">\n"+err);
        }
      }else if(words[2].startsWith("<@&")){
        try{
          configurations["autorole"]["type"] = words[2];
          configurations["autorole"]["id"] = global.discord.message.msg.mentions.roles.first().id; // get the role mentioned(will return snowflake)
          $channel.send("Set automatic role to: "+words[2]);
          global.discord.log("Autorole on server <#"+global.discord.message.msg.guild.id+"> is now "+words[2]);
        }catch(err){
          $channel.send("Something went wrong!");
          global.discord.debug("Failed to assign "+words[2]+" as automatic role in server <#"+global.discord.message.msg.guild.id+">\n"+err);
        }
      }

      global.discord.functions.saveJSON();
      return;

    }else if(words[1].toLowerCase() in configurations){ // all cases where the value is either 'enabled' or 'disabled'
      if(!words[2]){$channel.send(words[1]+" is currently: "+configurations[words[1]]); return;}


      if(words[2] == "enable"){
        try{
          configurations[words[1]] = "enabled"; // enable
          $channel.send(words[1]+" is now enabled");  // annouce
          global.discord.log(words[1]+" on server <#"+global.discord.message.msg.guild.id+"> is now enabled");  // log
        }catch(err){
          $channel.send("Something went wrong!");
          global.discord.debug("Failed to set "+words[1]+" to enabled on server <#"+global.discord.message.msg.guild.id+">\n"+err); // the thing attempted to change, along with server ID and error
        }
      }else if(words[2] == "disable"){
        try{
          configurations[words[1]] = "disabled";
          $channel.send(words[1]+" is now disabled");
          global.discord.log(words[1]+" on server <#"+global.discord.message.msg.guild.id+"> is now disabled");
        }catch(err){
          $channel.send("Something went wrong!");
          global.discord.debug("Failed to set "+words[1]+" to disabled on server <#"+global.discord.message.msg.guild.id+">\n"+err);
        }
      }

      global.discord.functions.saveJSON();
      return;
    }
  }
}