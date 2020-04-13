const Discord = require("discord.js");  // discord library
const bot = new Discord.Client(); // create a client and name it bot

const fs = require("fs");
const Configs = require("./configuration.json");
const Periodic = require("./commands/periodic/table.json");

var DiscordBot_SecretToken = "NjYxMjQ5Nzg2MzUwOTI3ODky.Xgoq5A.wXl8wyauDNjUoinAK1SyN69snrk"; // login token assigned


bot.on("ready", () => {
  global.discord.guilds = 0
  global.discord.online = true; // let the global know that the bot is online
  
  bot.guilds.forEach(guild => {
    global.discord.guilds += 1;
  });

  console.log("Nutwork is online on DISCORD, running in "+global.discord.guilds+" servers");
  bot.user.setActivity("$help | "+global.discord.guilds+" servers");


  global.discord.functions.saveJSON = function(srcJSON){
    srcJSON = srcJSON || require("./configuration.json");
    fs.writeFile("./discord/configuration.json", JSON.stringify(srcJSON), (err) => {
      if(err) throw err;
    });
  }

});


const _commands = require("./commands/commands.json"); // all of the bot's commands, seperated by category
global.discord.adminVars = {
  catchXveno: {
    enabled: false,
    userId: ""
  }
}
global.discord.admins = ["596938492752166922"];


bot.on("message", async recievedmessage => {

  if(recievedmessage.channel.type !== "dm" && recievedmessage.guild.id in Configs === false){
    Configs[recievedmessage.guild.id] = {
      "name": recievedmessage.guild.name,
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

    global.discord.functions.saveJSON();
    global.discord.log("Assigned the basics to "+recievedmessage.guild.name);
  }

  global.discord.message = null;
  let words = recievedmessage.content.split(" ");
  let $channel = recievedmessage.channel; // before this wasn't defined and it was so ugly

  if(recievedmessage.author === bot.user || recievedmessage.author.bot){return;}  // check if message sender is self or a bot
  if(recievedmessage.channel.type == "dm"){  // dm's have some restrictions. Since I'm doing this late, I can't quite weave it in pretty

    global.discord.message = {};
    global.discord.message.msg = recievedmessage;
    global.discord.message.message = recievedmessage.content; 
    global.discord.message.words = recievedmessage.content.split(" ");  
    global.discord.message.prefix = "$"; // will always be a $, too much trouble to save each users preffered prefix
    global.discord.message.channel = recievedmessage.channel;
    global.discord.message.author = recievedmessage.author;
    global.discord.message.tag = recievedmessage.author.username.toString() + "#" + recievedmessage.author.discriminator.toString(); // the person that sent the message as USERNAME#0000
    global.discord.message.command = recievedmessage.content.split(" ")[0].split("$")[1];

    if(words[0] in require("./commands/help/help.json")){ // if it is a command, even though a prefix isn't present.
      global.discord.message.command = recievedmessage.content.split(" ")[0]; // override the way the command was made before.
    }

    global.discord.log("\x1b[42m"+"DM﹁");

    if(words[0] === "$inv" || words[0] === "$invite"){
      $channel.send(global.discord.functions.CustomEmbed("Invite","If you want to invite me into your server, click the link below or paste it into your browser!")[0].field("Invite","https://discordapp.com/api/oauth2/authorize?client_id=661249786350927892&permissions=8&scope=bot")[1]);
    }else if(words[0].startsWith("√") || words[0].startsWith("$") && words[0].split("$")[1] in _commands["math"] || words[0] in _commands["math"]){
      if(words[0] in _commands["math"]){global.discord.message.command = words[0]}
      require("./commands/math/index.js")();
    }else if(words[0].startsWith("$") && words[0].split("$")[1] in _commands["periodic"] || words[0] in _commands["periodic"]){
      require("./commands/periodic/index.js")();
    }else if(words[0].startsWith("$") && words[0].split("$")[1] in _commands["help"] || words[0] in _commands["help"]){
      require("./commands/help/index.js")();
    }else if(words[0].startsWith("$")){
      $channel.send("Sorry, this command is either only avaliable in servers; or doesn't exist.")
    }
    return;
  }

  global.discord.message = {};
  global.discord.message.msg = recievedmessage; // the message and all it's functions 
  global.discord.message.message = recievedmessage.content; // the string
  global.discord.message.words = recievedmessage.content.split(" ");  // an array of each word
  global.discord.message.prefix = Configs[recievedmessage.guild.id].prefix; // the prefix for the server whom called it
  global.discord.message.channel = recievedmessage.channel; // the channel the message was sent
  global.discord.message.author = recievedmessage.author; // the person that sent the message
  global.discord.message.tag = recievedmessage.author.username.toString() + "#" + recievedmessage.author.discriminator.toString(); // the person that sent the message as USERNAME#0000
  global.discord.message.guild = recievedmessage.guild;
  global.discord.bot = {};
  global.discord.bot.me = recievedmessage.guild.me;
  global.discord.bot.user = bot.user;


  if( $channel.id in Configs[recievedmessage.guild.id]["channels"]){}else{
    Configs[recievedmessage.guild.id]["channels"][$channel.id] = {}; // turns out I need this instead of it just being happy and adding it when it needs it...
  }

  let $cmnd = recievedmessage.content.split(" ")[0].split(Configs[recievedmessage.guild.id].prefix)[1]; // remove the prefix an then return the first word. So only the command.
  let firstWord = recievedmessage.content.split(" ")[0];  // the above variable only works if the prefix is present. So aliases like "√" aren't useable

  global.discord.message.command = $cmnd;
  
  if(global.discord.admins.includes(recievedmessage.author.id)){
    if(recievedmessage.content === "$&crash"){
      console.log("Given a $&crash");
      bot.user.setStatus("dnd");  // just a quick visual for me.
      let today = new Date();
      let a_weight = await bot.channels.get("698667928454955029").send("Generating Crash Report...");
      let report = global.discord.functions.CustomEmbed("Crash Report","A crash was requested by "+recievedmessage.author.username+"\nThe bot has crashed and the json has been saved.","#ff0000").field("Information","Time: "+today.getHours()+":"+today.getMinutes()+"."+today.getSeconds()+"\nDate: "+today.getDate()+" of "+today.getMonth()+", "+today.getFullYear()+"\nServer: "+recievedmessage.guild.name+"\nServer ID: "+recievedmessage.guild.id);
      bot.channels.get("698667928454955029").send(report);
      a_weight.delete();
      
      global.discord.functions.saveJSON(require("./configuration.json"));

      setTimeout(() => {  // a one second delay before shutting off.
        process.exit();
      },1000);

    }else if(words[0] === "$&tattletale"){
      if(!words[1]){$channel.send("Tattletale Potocol is: "+global.discord.adminVars.catchXveno.enabled); return;}

      if(words[1].startsWith("<@!") && words[1].endsWith(">") && words[1].startsWith("<@&") === false){  // <@& is a role, don't want that.
        global.discord.adminVars.catchXveno.enabled = true;
        global.discord.adminVars.catchXveno.userId = words[1].replace("<@!","").replace(">","");
        $channel.send("Tattletale Protocol is now on");
        global.discord.debug("Tattletale Protocol is now on");
      }else if(words[1] == "false"){
        global.discord.adminVars.catchXveno.enabled = false;
        global.discord.adminVars.catchXveno.userId = "";
        $channel.send("Tattletale Protocol is now off");
        global.discord.debug("Tattletale Protocol is now off");
      }
    }
  }




  if(recievedmessage.attachments.size > 0){
    if(recievedmessage.author.id === global.discord.adminVars.catchXveno.userId && global.discord.adminVars.catchXveno.enabled === true){
      $channel.send("Tattletale Protocol triggered!\n<@!"+recievedmessage.author.id+">");
      recievedmessage.attachments.forEach((img) => {
        //let recievedmessage.attachments.get(recievedmessage.attachments.firstKey()).proxyURL;
        $channel.send(img.proxyURL);
      });
      $channel.send("<@!"+recievedmessage.author.id+">"+" was selected for the tattletale protocol, so their attachment was duplicated in case of deletion.\n")
      global.discord.debug("Tattled on "+recievedmessage.author.id);
    }
  }




  // Commands!
  //  the only reason that the "ping" command is inside main.js and not in /commands/ is because it needs the Client,
  //  all other commands should be found inside /commands/<category>/index.js.
  //  the command is detected by splitting the commands up by category in a json file;
  //  then it checks the to see if the command is within any of those categorys,
  //  if not then see if it is an Algebraic Math Problem or an Element of the Periodic Table,
  //  if niether of those, ignore it.

  if($cmnd === "ping"){
    const pingedMessage = await $channel.send("Loading...");

    let latency = Number(pingedMessage.createdTimestamp) - Number(recievedmessage.createdTimestamp).toString()+"ms";
    let ping = Math.round(bot.ping).toString()+"ms";

    let FancyPongMessage = global.discord.functions.CustomEmbed("Pong!","")[0].useImage()[0].field("Bot's Ping:",ping)[0].field("Latency to Server: ",latency)[1];

    pingedMessage.edit(FancyPongMessage);

  }else if($cmnd in _commands["help"]){
    require("./commands/help/help.js")();
  }else if($cmnd in _commands["math"] || firstWord.startsWith("√")){  // if the command is the math kind, special case for root symbol
    if(Configs[recievedmessage.guild.id]["categories"]["math"] === "disabled"){$channel.send("An admin has disabled these commands!"); return;}
    require("./commands/math/index.js")();
  }else if($cmnd in _commands["mod"]){
    // mod commands can not be disabled.
    require("./commands/mod/index.js")();
  }else if($cmnd in _commands["other"]){
    if(Configs[recievedmessage.guild.id]["categories"]["other"] === "disabled"){$channel.send("An admin has disabled these commands!"); return;}
    require("./commands/other/index.js")();
  }else if($cmnd in _commands["periodic"]){
    if(Configs[recievedmessage.guild.id]["categories"]["periodic-table"] === "disabled"){$channel.send("An admin has disabled these commands!"); return;}
    require("./commands/periodic/index.js")();
  }else if($cmnd in _commands["fun"]){
    if(Configs[recievedmessage.guild.id]["categories"]["fun"] === "disabled"){$channel.send("An admin has disabled these commands!"); return;}    
    require("./commands/fun/index.js")();
  }else{
   
    let words = global.discord.message.words;
    let AllowedSymbols = ["0","1","2","3","4","5","6","7","8","9","+","-","*","/","÷","x","^","\\"];  // included the backslash because in discord, multiple asterisks will result in italicized words 
    
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

    if(type === null){return;}else if(type === "math" && Configs[recievedmessage.guild.id]["config"]["automath"] == "enabled"){

      require("./commands/math/index.js")(math);  // evaluate
    }else if(type === "periodic" && Configs[recievedmessage.guild.id]["config"]["autoperiodic"] == "enabled"){

      global.discord.log("Ran a PToE in main.js");
      let element = global.discord.functions.CustomEmbed(Periodic[other.value]["name"]+" - #"+other.value,"Symbol: "+Periodic[other.value]["abr"]+"\nAtomic Weight: "+Periodic[other.value]["weight"])[0].field("Discovery",Periodic[other.value]["disc"]+" by "+Periodic[other.value]["by"])[1];
      $channel.send(element);
      return;
    }

  }

});

bot.on("guildMemberAdd", member => {
  if(member.guild.me.hasPermission("MANAGE_ROLES") === false && member.guild.me.hasPermission("ADMINISTRATOR") === false){return;}  // can't do it so nevermind
  if(Configs[member.guild.id]["config"]["autorole"]["type"] !== "disabled"){  // if autorole is set
    member.addRole(Configs[member.guild.id]["config"]["autorole"]["id"]);
    global.discord.debug("Gave "+member.id+" the auto-role "+Configs[member.guild.id]["config"]["autorole"]["id"]+" in server <#"+member.guild.id+">");
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