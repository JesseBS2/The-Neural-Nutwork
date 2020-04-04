var Embed = global.discord.functions.CustomEmbed;


module.exports = function(){

  global.discord.debug("DISCORD: Ran /commands/mod/index.js");

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

  }else if($cmnd === "ban"){

  }
}