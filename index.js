/*
* NodeJS 10.16.0
* Discord.js 11.5.1
*/

const Discord = require("discord.js"); // discord library
const algebra = require("algebra.js");

/* Why do some people have a problem with global variables? They seem useful */
global.discord = {};  // Global variables for discord
global.twitch = {}; // Global variables for twitch

// SolveEquation was originally in global.discord but I realize it will also be in twitch bot
global.SolveEquation = function(msg){

  try{
    return algebra.parse(msg);
  }catch(err){
    console.log("Given error while trying to solve a global.SolveEquation():  "+err)
    return false;
  }

}

global.discord = {  // global variables for discord bot
  online: false,
  functions: {
    CustomEmbed: function(title,description,color){
      if(title === "eWF5IGJhc2U2NCBpcyBmdW4hIQ=="){title = ""}
      color = color || "#00ABFF";
      let self = {};
      const embed = new Discord.RichEmbed().setColor(color).setTitle(title).setDescription(description).setTimestamp();
            
      self.useImage = function(img){
        img = img || "https://i.imgur.com/zfusTWU.png";
        return [self,embed.setThumbnail(img)];
      }
      self.field = function(title2,text){
        return [self,embed.addField(title2,text)];
      }

      return [self,embed];
    },
    DisabledEmbed: function(title,description){
      var self = {};
      var msg; 
      title = title || "<title></title>";
      description = description || "<body></body>";
      if(title === "eWF5IGJhc2U2NCBpcyBmdW4hIQ=="){ // just in case it's necessary
        msg = description;
      }else{
        msg = "**"+title+"**\n"+description;
      }

      self.useImage = function(blank_param){ // simply exists so that if embeds are disabled then it doesn't crash de bot
        return [self,self]; //returns it no matter what.
      }

      self.field = function(title2,text){
        msg += "\n**"+title2+"**\n"+text
        return [self,msg];
      }

        return [self,msg];
    }
  }
}
  
global.twitch = { // global variables for twitch bot
  online: false
}

/* these log to the console, with the colors for the designated app */
global.discord.debug = function(msg){
  console.log("\x1b[36m"+"DISCORD "+"\x1b[33m"+"DEBUG: \x1b[36m"+msg,"\x1b[0m");  // logs to console with colors and stuff
}

global.twitch.debug = function(msg){
  console.log("\x1b[35m"+"TWITCH "+"\x1b[33m"+"DEBUG: \x1b[35m"+msg,"\x1b[0m");  // logs to console with twitch's color
}

/* these are the same as the global debugs, but without the DEBUG at the beginning */
global.discord.log = function(msg){
  console.log("\x1b[36m"+"DISCORD: "+msg,"\x1b[0m");
}

global.twitch.log = function(msg){
  console.log("\x1b[35m"+"TWITCH: "+msg,"\x1b[0m");
}


console.log("HH  HH  IIIIII\nHH  HH    II\nHHHHHH    II\nHH  HH    II\nHH  HH  IIIIII\n");  // :)

/*  When logging to the console from a Discord File, put "DISCORD:" at the front */
let $Discord = require("./discord/main.js"); // the discord file
