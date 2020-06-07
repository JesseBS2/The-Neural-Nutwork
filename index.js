/*
* NodeJS        12.16.1
* Discord.js    12.2.0
* Algebra.js    0.2.6
*/

const Discord = require("discord.js"); // discord library
const algebra = require("algebra.js");


global.discord = {};  // Global variables for discord

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
    
    var toReturn = algebra.parse(msg);
    if(toReturn.toString().includes("/")){
      return Number(toReturn.toString().split("/")[0]) / Number(toReturn.toString().split("/")[1]);
    }

    return toReturn;
  }catch(err){
    console.log("Given error while trying to solve a global.SolveEquation():  "+err)
    return false;
  }

}

global.discord = {  // global variables for discord bot
  online: false,
  functions: {
    CustomEmbed: function(title,description,color){
      if(title === "" || !title) title = " "
      if(description === "" || !description) description = " ";
      color = color || "#7289d9";
      
      let self = {};
      var embed = new Discord.MessageEmbed().setColor(color).setTitle(title).setDescription(description);
            
      self.useImage = function(img){  // thumbnail
        img = img || "https://i.imgur.com/MStPhME.png";
        embed = embed.setThumbnail(img);
        return [self,embed];
      }

      self.field = function(title2,text){
        embed = embed.addField(title2,text);
        return [self,embed];
      }

      self.setPicture = function(src){  // external file, url
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
    }
  },
  totalPolls: 0
}


// https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes


/* these log to the console, with the colors for the designated app */
global.discord.debug = function(msg){
  console.log("\x1b[36m"+"DISCORD "+"\x1b[33m"+"DEBUG: \x1b[36m"+msg,"\x1b[0m");  // logs to console with colors and stuff
}

/* these are the same as the global debugs, but without the DEBUG at the beginning */
global.discord.log = function(msg){
  console.log("\x1b[36m"+"DISCORD: "+msg,"\x1b[0m");
}


console.log("HH  HH  IIIIII\nHH  HH    II\nHHHHHH    II\nHH  HH    II\nHH  HH  IIIIII\n"); 


var $Discord = require("./discord/main.js"); // the discord file
