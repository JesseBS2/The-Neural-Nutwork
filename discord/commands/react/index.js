const Embed = global.discord.functions.CustomEmbed;
module.exports = function(IsFullMeme){

  var bot = global.discord.bot.me;

  global.discord.log("Ran /commands/react/index.js");
  IsFullMeme = IsFullMeme || false;

  var words = global.discord.message.message.split(" "), memes = require("./memes.json"), $channel = global.discord.message.channel, author = global.discord.message.author, image;
  
  if(IsFullMeme === false){
    image = global.discord.message.command.split("$")[0];
  }else if(IsFullMeme === true){
    image = global.discord.message.message.split("\n")[global.discord.message.message.split("\n").length-1].split("$")[1];
  }

  if(image in memes){
    if(bot.hasPermission("EMBED_LINKS") === false){
      return $channel.send("I do not have the necessary permissions for that.\nI need the `Embed Links` permission");
    }

    var MemeToShow = memes[image];
    if(typeof MemeToShow === "object"){ // if it's an array
      let arr = memes[ image ]; // get the arr
      let math = Math.floor(Math.random()*memes[image].length);
      //global.discord.debug( arr[math] );
      MemeToShow = arr[math];
    }

    if(IsFullMeme === true){
      let lines = global.discord.message.message.split("\n");
      
      // The super annoying complex line in the first function needs an explanation
      //  first it takes the message and splits it by the last line, so that only the lines before the last one are retrevied
      //  then it returns everything before that

      global.discord.message.msg.delete();
      return $channel.send( Embed("",global.discord.message.message.split(lines[lines.length-1])[0])[0].setPicture(MemeToShow)[0].footer(global.discord.message.tag)[1] );
    }

    return $channel.send({files: [ MemeToShow ]});
  }

}