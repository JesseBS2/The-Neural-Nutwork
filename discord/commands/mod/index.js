var Embed = global.discord.functions.CustomEmbed;


module.exports = function(){

  global.discord.log("DISCORD: Ran /commands/mod/index.js");

  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let $author = global.discord.message.msg.member;
  let me = global.discord.bot.me;

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
    try{
      toKick.kick();
      $channel.send("Kicked "+toKick+" from the server!");
    }catch(err){
      global.discord.log(err);
      $channel.send("This user can not be kicked!");
    }

  }else if($cmnd === "ban"){
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

  }
}