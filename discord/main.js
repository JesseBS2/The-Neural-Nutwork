const Discord = require("discord.js");  // discord client
const bot = new Discord.Client(); // bot

const Configs = require("./configuration.json");
const Periodic = require("./commands/periodic/table.json");

var DiscordBot_SecretToken = "NjYxMjQ5Nzg2MzUwOTI3ODky.Xgoq5A.wXl8wyauDNjUoinAK1SyN69snrk"; // login token assigned


bot.on("ready", () => {
  global.discord.guilds = 0
  global.discord.online = true; // let the global know that the bot is online
  
  bot.guilds.forEach(guild => {
    global.discord.guilds += 1;

    Configs[guild.id] = {
      "name": guild.name,
      "prefix": "$",
      "config": {
        "autorole": {
          "type": "disabled",
          "id": null
        },
        "automath": "enabled",
        "autoperiodic": "enabled",
        "echos": "enabled",
        "embeds": "enabled",
        "leveling": "enabled"
      },
      "categories": {
        "math": "enabled",
        "mod": "enabled",
        "other": "enabled",
        "periodic-table": "enabled",
        "fun": "enabled"
      },
      "channels": {
        
      }
    }

  });

  console.log("Nutwork is online on DISCORD, running in "+global.discord.guilds+" servers");

  bot.user.setActivity("$help | "+global.discord.guilds+" servers");
});


const _commands = require("./commands/commands.json"); // all of the bot's commands, seperated by category


bot.on("message", recievedmessage => {
  global.discord.message = null;

  if(recievedmessage.author === bot.user || recievedmessage.author.bot){return;}  // check if message sender is self or a bot

  global.discord.message = {};
  global.discord.message.msg = recievedmessage; // the message and all it's functions 
  global.discord.message.message = recievedmessage.content; // the string
  global.discord.message.words = recievedmessage.content.split(" ");  // an array of each message
  global.discord.message.prefix = Configs[recievedmessage.guild.id].prefix; // the prefix for the server whom called it
  global.discord.message.channel = recievedmessage.channel; // the channel the message was sent
  global.discord.message.author = recievedmessage.author; // the person that sent the message
  global.discord.message.tag = recievedmessage.author.username.toString() + "#" + recievedmessage.author.discriminator.toString(); // the person that sent the message as USERNAME#0000
  global.discord.bot = {};
  global.discord.bot.me = recievedmessage.guild.me;

  let $channel = recievedmessage.channel; // before this wasn't defined and it was so ugly
  let serverID = recievedmessage.guild.id;

  if( $channel.id in Configs[serverID]["channels"]){}else{
    Configs[serverID]["channels"][$channel.id] = {}; // turns out I need this instead of it just being happy and adding it when it needs it...
  }

  let $cmnd = recievedmessage.content.split(" ")[0].split(Configs[serverID].prefix)[1]; // remove the prefix an then return the first word. So only the command.
  let firstWord = recievedmessage.content.split(" ")[0];  // the above variable only works if the prefix is present. So aliases like "√" aren't useable

  global.discord.message.command = $cmnd;

  if($cmnd === "help"){
    require("./commands/help/help.js")();
  }else if($cmnd in _commands["math"] || firstWord.startsWith("√")){  // if the command is the math kind, special case for root symbol
    if(Configs[serverID]["categories"]["math"] === "disabled"){$channel.send("An admin has disabled these commands!"); return;}
    require("./commands/math/index.js")();
  }else if($cmnd in _commands["mod"]){
    // mod commands can not be disabled.
    require("./commands/mod/index.js")();
  }else if($cmnd in _commands["other"]){
    if(Configs[serverID]["categories"]["other"] === "disabled"){$channel.send("An admin has disabled these commands!"); return;}
    require("./commands/other/index.js")();
  }else if($cmnd in _commands["periodic"]){
    if(Configs[serverID]["categories"]["periodic-table"] === "disabled"){$channel.send("An admin has disabled these commands!"); return;}
    require("./commands/periodic/index.js")();
  }else if($cmnd in _commands["fun"]){
    if(Configs[serverID]["categories"]["fun"] === "disabled"){$channel.send("An admin has disabled these commands!"); return;}    
    require("./commands/fun/index.js")();
  }else{
   
    let words = global.discord.message.words;
    let AllowedSymbols = ["0","1","2","3","4","5","6","7","8","9","+","-","*","/","÷","x","^"];
    
    let math = "";
    let type = null
    let other = {
      value: null
    }

    for( let j = 0; j < words.length; j++ ){  // loop through all words
      let flag = false;
      if(words[j].length > 1){  // incases of 4+4
        for(let x  = 0; x < words[j].length; x++){  // loop through the length of the selected word that is longer than 1
          if(AllowedSymbols.includes(words[j][x])){ // if it is allowed then allow it
            type = "math";
            math += words[j][x];
          }else{
            type = null;
            flag = true;  // the flag is used to break both loops
            break;
          }
        }

        if(flag === true){  // if one word is wrong, they all should be. So don't run it.
          type = null;
          break;
        }
      }else if( AllowedSymbols.includes(words[j])  ){ // detects a(let's say...) 5 in "5 + 6"
        type = "math";
        math += words[j];
      }else{
        type = null;
        break;
      }
    }

    for( let j = 1; j < Object.keys(Periodic).length+1; j++ ){
      if(words[0].toLowerCase() === Periodic[j]["name"].toLowerCase() ){
        type = "periodic";
        other.value = j;
      }
    }

    if(type === null){return;}else if(type === "math" && Configs[serverID]["automath"] == "enabled"){

      math = math.replace(/÷/gi, "/").replace(/x/gi,"*").replace(/{/gi,"(").replace(/\[/gi,"(").replace(/]/gi,")").replace(/}/gi,")").replace(" ",""); // replace all the incorrect items'
      require("./commands/math/index.js")(math);  // evaluate

    }else if(type === "periodic" && Configs[serverID]["autoperiodic"] == "enabled"){

      global.discord.log("Ran a PToE in main.js");
      let element = global.discord.functions.CustomEmbed(Periodic[other.value]["name"]+" - #"+other.value,"Symbol: "+Periodic[other.value]["abr"]+"\nAtomic Weight: "+Periodic[other.value]["weight"])[0].field("Discovery",Periodic[other.value]["disc"]+" by "+Periodic[other.value]["by"])[1];
      $channel.send(element);
      return;
    }

  }

});

bot.on("guildMemberAdd", member => {
  if(member.guild.me.hasPermission("MANAGE_ROLES") === false && member.guild.me.hasPermission("ADMINISTRATOR") === false){return;}  // can't do it so nevermind
  if(Configs[member.guild.id]["config"]["autorole"]["type"] !== "disabled"){  // if autorole is set and the bot can assign roles
    member.addRole(Configs[member.guild.id]["config"]["autorole"]["id"]);
    global.discord.debug("Gave "+member.id+" the auto-role "+Configs[member.guild.id]["config"]["autorole"]["id"]+" in server <#"+member.guild.id+">")
  }
});

bot.on("guildCreate", guild => {  // bot is added to a new server

  Configs[guild.id] = {
    "name": guild.name,
    "prefix": "$",
    "config": {
      "autorole": {
        "type": "disabled",
        "id": null
      },
      "automath": "enabled",
      "autoperiodic": "enabled",
      "echos": "enabled",
      "embeds": "enabled",
      "leveling": "enabled"
    },
    "categories": {
      "math": "enabled",
      "mod": "enabled",
      "other": "enabled",
      "periodic-table": "enabled",
      "fun": "enabled"
    },
    "channels": {
      
    }
  }

});

bot.on("guildDelete", guild => {  // bot is removed from server

  Configs[guild.id] = null; // clear that server's information.

});


bot.login(DiscordBot_SecretToken);