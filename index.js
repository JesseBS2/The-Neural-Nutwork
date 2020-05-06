/*
* NodeJS 12.16.1
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
    // For some reason I never thought to have the .replace inside the function
    // so in a lot of places, there will still be .replace commands before or in a SolveEquation();
    msg = msg.replace(/\\/g,"")  // remove back slashes(which help ignore \* \*)
      .replace(/x/g,"*")
      .replace(/\*\*/g,"^")
      .replace(/÷/gi, "/")
      .replace(/\[/g,"(") // the following four are commonly used in math, but algebra.js doesn't accept them.
      .replace(/\]/g,")")
      .replace(/\{/g,"(")
      .replace(/\}/g,")") 
      .replace(/ /g,"");  // make it one message
    
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
      if(title === ""){title = " "}
      let self = {};
      color = color || "#7289d9"
      var embed = new Discord.RichEmbed().setColor(color).setTitle(title).setDescription(description);
            
      self.useImage = function(img){
        img = img || "https://i.imgur.com/zfusTWU.png";
        embed = embed.setThumbnail(img);
        return [self,embed];
      }

      self.field = function(title2,text){
        embed = embed.addField(title2,text);
        return [self,embed];
      }

      self.setPicture = function(src){
        embed = embed.setImage(src);
        return [self,embed];
      }

      self.footer = function(message){
        embed = embed.setFooter(message);
        return [self,embed];
      }

      self.useTimestamp = function(){
        embed = embed.setTimestamp();
        return [self,embed];
      }

      return [self,embed];
    },
    
    DisabledEmbed: function(title,description){
      var self = {};
      var msg; 
      title = title || "<title></title>";
      description = description || "<body></body>";
      if(title === " "){ // just in case it's necessary
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
  },
  totalPolls: 0
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
var $Discord = require("./discord/main.js"); // the discord file
