const Discord = require("discord.js");  // discord library
const bot = new Discord.Client(); // create a client and name it bot

const fs = require("fs");
const Configs = require("./configuration.json");

const request = require("request"); // request used to get the periodic table

bot.login(fs.readFileSync("discord/token.txt","utf8").toString());  // log into discord account

var activity_value_swap = 0;

bot.on("ready", () => {
  global.discord.guilds = 0
  global.discord.online = true; // let the global know that the bot is online
  
  bot.guilds.cache.forEach(guild => {
    global.discord.guilds += 1;
  });

  console.log("Nutwork is online on DISCORD, running in "+global.discord.guilds+" servers\n\n");
  bot.user.setActivity(global.discord.guilds+" servers",{type: "WATCHING", url:"https://www.github.com/JesseBS2/The-Neural-Nutwork"});
  setInterval(function(){
    if(activity_value_swap === 0){ bot.user.setActivity("$commands",{type: "PLAYING", url:"https://www.github.com/JesseBS2/The-Neural-Nutwork"}); return activity_value_swap=1;}
    if(activity_value_swap === 1){ bot.user.setActivity(global.discord.guilds+" servers",{type: "WATCHING", url:"https://www.github.com/JesseBS2/The-Neural-Nutwork"}); return activity_value_swap=0; }
  },10000); // changes every 10 seconds

});



// Writes to the JSON file for discord servers
global.discord.functions.saveJSON = function(srcJSON){
  srcJSON = srcJSON || require("./configuration.json");
  fs.writeFile("./discord/configuration.json", JSON.stringify(srcJSON), (err) => {
    if(err) throw err;
  });
}



var _commands = require("./commands/commands.json"); // all of the bot's commands, seperated by category
global.discord.admins = ["596938492752166922"];

var Activity_Types = ["playing","watching","listening","streaming","custom"];


// These variables are used in this file only
var invitePermissions = "470019223";
var credits_desc = "Want to view the source code?: [Source Code](http://github.com/JesseBS2/The-Neural-Nutwork \"Github.com\")\n\nInvite the bot: [Invite Bot](https://discord.com/oauth2/authorize?client_id=661249786350927892&permissions="+invitePermissions+"&scope=bot \"Discord.com\")";
var credits_testers = ["Wyatt(wuse)", "Xavier", "Kevin(Zap)", "Ashley(Ash)", "Christopher(Noobsauce)", "Rajesh", "Xveno", "Asim", "Alan(Yoshi)", "Elio", "Ender(Eli)"];
var credits_sources = ["[Algebra.js](https://www.npmjs.com/package/algebra.js)","[Periodic Table of Elements](https://github.com/Bowserinator/Periodic-Table-JSON)","[Memes](https://imgur.com)","[Javascript Image Manipulation Program](https://www.npmjs.com/package/jimp)","[QR Codes](https://www.npmjs.com/package/qrcode)","[File System](https://www.npmjs.com/package/fs)"];
var creditsMessage = global.discord.functions.CustomEmbed("Credits",credits_desc)[0].field("Creator","<@"+global.discord.admins[0]+">")[0].field("External Sources", credits_sources)[0].field("Testers",credits_testers)[1];



bot.on("message", async recievedmessage => {

  global.discord.log = function(msg){
    console.log("\x1b[36m"+"DISCORD: "+recievedmessage.author.username+" "+msg,"\x1b[0m");
  }



  if(recievedmessage.channel.type !== "dm"){
    if(recievedmessage.guild.id in Configs === false || typeof Configs[recievedmessage.guild.id] !== "object" || Configs[recievedmessage.guild.id] === null){

      Configs[recievedmessage.guild.id] = {
        "name": recievedmessage.guild.name,
        "prefix": "$",
        "config": {
          "autorole": {
            "type": "disabled",
            "id": null
          },
          "automath": "disabled",
          "autoperiodic": "disabled",
          "nickname": "enabled",
          "qr-codes": "enabled",
          "embeds": "enabled"
        },
        "categories": {
          "other": "enabled",
          "fun": "enabled",
          "meme": "enabled"
        },
        "channels": {
          
        }
      }

      global.discord.functions.saveJSON();
      global.discord.debug("Assigned the basics to "+recievedmessage.guild.name);
    }

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

    if(words[0] === "$inv" || words[0] === "$invite"){
      return $channel.send(global.discord.functions.CustomEmbed("Invite","If you want to invite me into your server, click the link below or paste it into your browser!")[0].field("Invite","https://discord.com/oauth2/authorize?client_id=661249786350927892&permissions="+invitePermissions+"&scope=bot")[1]);
    }else if(words[0] === "$credits"){
      return $channel.send(creditsMessage);
    }else if(words[0].startsWith("√") || words[0].startsWith("$") && words[0].split("$")[1] in _commands["math"] || words[0] in _commands["math"]){
      if(words[0] in _commands["math"]){global.discord.message.command = words[0]}
      require("./commands/math/index.js")();
    }else if(words[0].startsWith("$") && words[0].split("$")[1] in _commands["ptoe"] || words[0] in _commands["ptoe"]){
      require("./commands/periodic/index.js")();
    }else if(words[0].startsWith("$") && words[0].split("$")[1] in _commands["help"] || words[0] in _commands["help"]){
      require("./commands/help/help.js")();
    }else if(words[0].startsWith("$") && words[0].split("$")[1] in _commands["other"] || words[0] in _commands["other"]){
      require("./commands/other/index.js")();
    }else if(words[0].startsWith("$") && words[0].split("$")[1] == "qr" || words[0] == "qr"){
      require("./commands/fun/index.js")(true);
    }else if(words[0].toLowerCase().startsWith("$") && words[0].toLowerCase().endsWith("$") && words[0].toLowerCase().split("$")[1] in require("./commands/react/memes.json") || recievedmessage.content.includes("\n") && recievedmessage.content.split("\n")[recievedmessage.content.split("\n").length-1].split(" ")[0].split("$")[1] in require("./commands/react/memes.json") ){
      if(recievedmessage.content.includes("\n") && recievedmessage.content.split("\n")[recievedmessage.content.split("\n").length-1].split(" ")[0].split("$")[1]){
        require("./commands/react/index.js")(true);
      }else{
        require("./commands/react/index.js")(false);
      }
    }else if(words[0].startsWith("$")){
      $channel.send("Sorry, this command is either only avaliable in servers; or doesn't exist.")    
    }


    return;
  }

  global.discord.message = {};
  global.discord.message.msg = recievedmessage; // the message and all it's functions 
  global.discord.message.message = recievedmessage.content; // the string
  global.discord.message.words = recievedmessage.content.split(" ");  // an array of each word
  global.discord.message.prefix = Configs[recievedmessage.guild.id].prefix || "$"; // the prefix for the server whom called it
  global.discord.message.channel = recievedmessage.channel; // the channel the message was sent
  global.discord.message.author = recievedmessage.author; // the person that sent the message
  global.discord.message.tag = recievedmessage.author.username.toString() + "#" + recievedmessage.author.discriminator.toString(); // the person that sent the message as USERNAME#0000
  global.discord.message.guild = recievedmessage.guild;
  global.discord.bot = {};
  global.discord.bot.me = recievedmessage.guild.me;
  global.discord.bot.user = bot.user;

  var $cmnd;

  if( $channel.id in Configs[recievedmessage.guild.id]["channels"]){}else{
    Configs[recievedmessage.guild.id]["channels"][$channel.id] = {}; // turns out I need this instead of it just being happy and adding it when it needs it...
  }

  if(words[0].startsWith("$") && words[0].length === 1){  // then word 0 is $ which means word 1 is the command
    $cmnd = recievedmessage.content.split(" ")[1];
    global.discord.message.words.shift();
  }else if(words[0].startsWith("$")){
    $cmnd = recievedmessage.content.split(" ")[0].split(Configs[recievedmessage.guild.id].prefix)[1]; // remove the prefix an then return the first word. So only the command.
  }

  let firstWord = recievedmessage.content.split(" ")[0];  // the above variable only works if the prefix is present. So aliases like "√" aren't useable

  // when the bot is pinged/mentioned
  if(recievedmessage.content.split(" ")[0] === "<@!"+bot.user.id+">"){  // if the first word is the mentioned bot
    if(!words[1]){
      return $channel.send("My prefix for this server is: `"+Configs[recievedmessage.guild.id]["prefix"]+"`");
    }
    $cmnd = recievedmessage.content.split(" ")[1];
    global.discord.message.words.shift();  // offset words by one, so all future uses of the words array are still right
  }



  global.discord.message.command = $cmnd;


  /* Commands for the admins(me) to use */
  if(global.discord.admins.includes(recievedmessage.author.id)){
    if(recievedmessage.content === "$&crash"){  // crash the bot
      console.log("Given a $&crash");
      bot.user.setStatus("dnd");  // just a quick visual for me.
      
      global.discord.functions.saveJSON(require("./configuration.json"));

      setTimeout(() => {  // a one second delay before shutting off.
        process.exit();
      },1000);

    }else if(recievedmessage.content.split(" ")[0] === "$&activity"){
      
      if(!words[1]){
        global.discord.debug("an admin "+recievedmessage.author.username+" reset the bot's activity");
        bot.user.setActivity(global.discord.guilds+" servers",{url: "github.com/JesseBS2", type:"WATCHING"});
        return $channel.send("Activity has been reset!");
      }else if(Activity_Types.includes(words[1].toLowerCase())){
        bot.user.setActivity(recievedmessage.content.split("$&activity "+words[1]+" ")[1],{type:words[1].toUpperCase(),url:"github.com/JesseBS2" });
        global.discord.debug("an admin "+recievedmessage.author.username+" set the bot's status to "+recievedmessage.content.split("$&activity ")[1]);
        return $channel.send("Activity has been changed!");
      }else if(words[1]){
        bot.user.setActivity(recievedmessage.content.split("$&activity ")[1],{type:4});
        global.discord.debug("an admin "+recievedmessage.author.username+" set the bot's status to "+recievedmessage.content.split("$&activity ")[1]);
        return $channel.send("Activity has been changed!");
      }

    }else if(recievedmessage.content.split(" ")[0] === "$&status"){  // change how the bot appears on discord; Online, Offline, Idle, or Do not Disturb
      if(words[1]){
        if(["online","idle","dnd","invisible"].includes(words[1]) === false){return $channel.send("That is not a valid status.");}
        bot.user.setStatus(recievedmessage.content.split("$&status ")[1]);
        global.discord.debug("an admin "+recievedmessage.author.username+" set the bot's availablity to "+recievedmessage.content.split("$&status ")[1]);
        return $channel.send("Status has been changed!");
      }else{
        bot.user.setStatus("online");
        return $channel.send("Status has been reset!");
      }
    
    }else if(recievedmessage.content.split(" ")[0] === "$&forget"){ // Use FS to completely clear `configuration.json`
      if(words[1] === "server"){
        fs.writeFile("configuration.json", JSON.stringify("{}"), err => {
          if(err) throw err;
        });
        global.discord.debug("an admin "+recievedmessage.author.username+" erased the bot's memories of servers");
      }
    // }else if(recievedmessage.content.split(" ")[0] === "$&type"){
    //   setTimeout(() => {
    //     recievedmessage.channel.stopTyping();
    //   },Number(words[1])*1000);
    //   recievedmessage.channel.startTyping();
    }
  }



  if($cmnd === "ping"){
    const pingedMessage = await $channel.send("Loading...");

    let latency = (Number(pingedMessage.createdTimestamp) - Number(recievedmessage.createdTimestamp)).toString()+"ms";
    let ping = (bot.ws.ping).toFixed(2).toString()+"ms";

    let FancyPongMessage = global.discord.functions.CustomEmbed(" ","")[0].useImage()[0].field("Bot's Ping:",ping)[0].field("Latency to Server: ",latency)[1];

    pingedMessage.edit("Pong!");
    pingedMessage.edit(FancyPongMessage);
    global.discord.debug("Latency & Ping to "+recievedmessage.guild.name+" "+latency+" & "+ping)

  }else if(words[0] === "$inv" || words[0] === "$invite" || words[0] === "$" && words[1] === "invite" || words[0] === "$" && words[1] === "inv"){  // the invite command has an exception because I am too lazy to modify commands.json and add it into a group

    return $channel.send(global.discord.functions.CustomEmbed("Invite","If you want to invite me into your server, click the link below or paste it into your browser!")[0].field("Invite","https://discord.com/oauth2/authorize?client_id=661249786350927892&permissions="+invitePermissions+"&scope=bot")[1]);
  }else if(words[0] === "$credits" || words[0] === "$" && words[1] === "credits"){
  
    return $channel.send(creditsMessage);
  
  }else if(words[0].toLowerCase().startsWith("$") && words[0].toLowerCase().endsWith("$") && words[0].toLowerCase().split("$")[1] in require("./commands/react/memes.json") || recievedmessage.content.includes("\n") && recievedmessage.content.split("\n")[recievedmessage.content.split("\n").length-1].split(" ")[0].split("$")[1] in require("./commands/react/memes.json") ){
    
    if(Configs[recievedmessage.guild.id]["categories"]["meme"] === "disabled"){return $channel.send("An admin has disabled these commands!");}
    if(recievedmessage.content.includes("\n") && recievedmessage.content.split("\n")[recievedmessage.content.split("\n").length-1].split(" ")[0].split("$")[1]){
      require("./commands/react/index.js")(true);
    }else{
      require("./commands/react/index.js")(false);
    }

  }else if($cmnd in _commands["help"]){
    require("./commands/help/help.js")();
  }else if($cmnd in _commands["math"] || firstWord.startsWith("√")){  // if the command is the math kind, special case for root symbol
    if(Configs[recievedmessage.guild.id]["categories"]["math"] === "disabled")return $channel.send("An admin has disabled these commands!");
    require("./commands/math/index.js")();
  }else if($cmnd in _commands["mod"]){
    // mod commands can not be disabled.
    require("./commands/mod/index.js")();  // the param is for instances where something like Client.fetch is needed
  }else if($cmnd in _commands["server"]){
    // server commands can not be disabled.
    require("./commands/server/index.js")();
  }else if($cmnd in _commands["other"]){
    if(Configs[recievedmessage.guild.id]["categories"]["other"] === "disabled")return $channel.send("An admin has disabled these commands!");
    require("./commands/other/index.js")(bot,Discord);
  }else if($cmnd in _commands["ptoe"]){
    if(Configs[recievedmessage.guild.id]["categories"]["ptoe"] === "disabled")return $channel.send("An admin has disabled these commands!");
    require("./commands/periodic/index.js")();
  }else if($cmnd in _commands["fun"]){
    if(Configs[recievedmessage.guild.id]["categories"]["fun"] === "disabled")return $channel.send("An admin has disabled these commands!");   
    require("./commands/fun/index.js")(false,Discord);
  }else if($cmnd in _commands["image"]){  // if the command is the math kind, special case for root symbol
    if(Configs[recievedmessage.guild.id]["categories"]["image"] === "disabled")return $channel.send("An admin has disabled these commands!");
    require("./commands/image/index.js")(Discord);
  }else{
    let words = recievedmessage.content.split(" ");
    let AllowedSymbols = ["+","-","*","/","÷","x","^","\\","(",")","[","]","{","}"];  // included the backslash because in discord, multiple asterisks will result in italicized words 
    let AllowedNumbers = ["0","1","2","3","4","5","6","7","8","9"];

    let math = "";
    let type = null
    let other = {
      value: null
    }

    let Characters = recievedmessage.content.split("");
    let including = {number:false,symbols:false};  // it has to be an equation
      
    for( let j = 0; j < Characters.length; j++ ){  // loop through all words
      let flag = false;
      if( AllowedSymbols.includes(Characters[j]) || AllowedNumbers.includes(Characters[j]) ){ // if it is allowed then allow it
        if(AllowedNumbers.includes(Characters[j])){including.number=true}
        if(AllowedSymbols.includes(Characters[j])){including.symbols=true}
        type = "math";
        math += Characters[j];
      }else{
        type = null;
        flag = true;  // the flag is used to break both loops
        break;
      }

      if(flag === true){  // if one word is wrong, they all should be. So don't run it.
        type = null;
        break;
      }
    }

    request({
      url: "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json",
      json: true
    }, function(error, response, body){

      if(!error && response.statusCode === 200){

        // for some reason request doesn't save variables after it's run
        // stupid request :(
        var PeriodicTable = body["elements"];
        for(let j = 0; j < PeriodicTable.length; j++){
          if(words[0].toLowerCase() === PeriodicTable[j]["name"].toLowerCase()){
            // type = "periodic";
            other.value = j;
            // //console.log(PeriodicTable[j])
            global.discord.log("Ran a PToE command in main.js");
            let element = global.discord.functions.CustomEmbed(PeriodicTable[other.value]["name"]+" - #"+other.value,"Symbol: "+PeriodicTable[other.value]["symbol"]+"\nAtomic Weight: "+PeriodicTable[other.value]["atomic_mass"])[0].field("Discovery","Discovered by "+PeriodicTable[other.value]["discovered_by"])[1];
            return $channel.send(element);
          }
        }

      }
    });

    if(type === null){return;}else if(type === "math" && Configs[recievedmessage.guild.id]["config"]["automath"] == "enabled" && including.number === true && including.symbols === true){
      
      global.discord.log("Ran a Math command in main.js")
      require("./commands/math/index.js")(math);  // evaluate
      return;

    }
  }

});

bot.on("guildMemberAdd", member => {
  if(member.guild.me.hasPermission("MANAGE_ROLES") === false && member.guild.me.hasPermission("ADMINISTRATOR") === false){return;}  // can't do it so nevermind
  if(Configs[member.guild.id]["config"]["autorole"]["type"] !== "disabled"){  // if autorole is set
    try{ var TestIfReal = member.guild.roles.get(Configs[member.guild.id]["config"]["autorole"]["id"]) }catch(err){if(err) return (Configs[member.guild.id]["config"]["autorole"]["id"] = "disabled");}  // disables autorole if the set role can't be found
    member.roles.add(Configs[member.guild.id]["config"]["autorole"]["id"]);
    return global.discord.debug("Gave "+member.id+" the auto-role "+Configs[member.guild.id]["config"]["autorole"]["id"]+" in server <#"+member.guild.id+">");
  }
});


bot.on("guildCreate", guild => {  // bot is added to a new server
  global.discord.log("\x1b[42m"+"Joined "+guild.name);
  Configs[guild.id] = {
    "name": guild.name,
    "prefix": "$",
    "config": {
      "autorole": {
        "type": "disabled",
        "id": null
      },
      "automath": "disabled",
      "autoperiodic": "disabled",
      "nickname": "enabled",
      "qr-codes": "enabled",
      "embeds": "enabled"
    },
    "categories": {
      "other": "enabled",
      "fun": "enabled",
      "meme": "enabled"
    },
    "channels": {
      
    }
  }
  
  global.discord.guilds++;
  bot.user.setActivity("$commands in "+global.discord.guilds+" servers",{type:1});
  global.discord.functions.saveJSON();
});


bot.on("guildDelete", guild => {  // bot is removed from server

  Configs[guild.id] = null; // clear that server's information.
  global.discord.functions.saveJSON(Configs);

});
