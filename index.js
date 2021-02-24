const Discord = require("discord.js");  // discord library
const bot = new Discord.Client(); // create a client and name it bot

const Fs = require("fs"); // read and write to the file system
const Configs = require("./configuration.json");

const Request = require("request"); // request used to get the periodic table

const Algebra = require("algebra.js");  // does the math for us

const JIMP = require("jimp"); // modifies a user-given image in custom ways

const QRCode = require("qrcode"); // generates QR Codes from input right in a discord channel


bot.login(Fs.readFileSync("token.txt","utf8").toString());  // log into discord account


var BotLogo = "https://i.imgur.com/MStPhME.png";

var CACHED_GUILDS = {}
var activity_value_swap = 0;


bot.on("ready", () => {
  CACHED_GUILDS = 0
 
  bot.guilds.cache.forEach(guild => {
    CACHED_GUILDS += 1;
  });

  console.log("HH  HH  IIIIII\nHH  HH    II\nHHHHHH    II\nHH  HH    II\nHH  HH  IIIIII\n");
  console.log("The Nutwork is online, running in "+CACHED_GUILDS+" discord servers\n\n");
  bot.user.setActivity(CACHED_GUILDS+" servers",{type: "WATCHING", url:"https://www.github.com/JesseBS2/The-Neural-Nutwork"});
  setInterval(function(){
    if(activity_value_swap === 0){ bot.user.setActivity("$help",{type: "PLAYING", url:"https://www.github.com/JesseBS2/The-Neural-Nutwork"}); return activity_value_swap=1;}
    if(activity_value_swap === 1){ bot.user.setActivity(CACHED_GUILDS+" servers",{type: "WATCHING", url:"https://www.github.com/JesseBS2/The-Neural-Nutwork"}); return activity_value_swap=0; }
  },7000); // changes every 7 seconds
});


var _commands = require("./commands.json"); // all of the bot's commands, seperated by category
var Dev_IDs = ["596938492752166922"];
var Activity_Types = ["playing","watching","listening","streaming","custom"];

var invitePermissions = "470019223"; // These are the permissions the bot asks for when you're inviting it
var credits_desc = "Want to view the source code?: [Source Code](http://github.com/JesseBS2/The-Neural-Nutwork \"Github.com\")\n\nInvite the bot: [Invite Bot](https://discord.com/oauth2/authorize?client_id=661249786350927892&permissions="+invitePermissions+"&scope=bot \"Discord.com\")";
var credits_sources = ["[Algebra.js](https://www.npmjs.com/package/algebra.js)","[Periodic Table of Elements](https://github.com/Bowserinator/Periodic-Table-JSON)","[Javascript Image Manipulation Program](https://www.npmjs.com/package/jimp)","[QR Codes](https://www.npmjs.com/package/qrcode)","[File System](https://www.npmjs.com/package/fs)"];
var creditsMessage = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Credits").setDescription(credits_desc).setThumbnail(BotLogo).addField("Creator","<@"+Dev_IDs[0]+">").addField("External Sources", credits_sources);


// This is used for getting the accurate amount of commands to display in $commands
// Otherwise it would display aliases and that's a bad
let commands_for = {}

for(let loop = 0; loop < Object.keys(_commands).length; loop++){  // loop through command categories
  commands_for[Object.keys(_commands)[loop]] = 0;
  for(let innerloop = 0; innerloop < Object.values(Object.values(_commands)[loop]).length; innerloop++){  // commands in those categories
    if(typeof Object.values(Object.values(_commands)[loop])[innerloop] == "object"){
      commands_for[Object.keys(_commands)[loop]] += 1;
    }
  }
}






bot.on("message", async recievedmessage => {
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
          "automagic": "disabled",
          "nickname": "enabled",
          "qr-codes": "enabled",
          "embeds": "enabled"
        },
        "categories": {
          "other": "enabled",
          "fun": "enabled"
        },
        "channels": {
          
        }
      }

      SaveJSON();
    }

  }


  // variables
  var words = recievedmessage.content.split(" ");
  var $channel = recievedmessage.channel; // before this wasn't defined and it was so ugly
  var message = recievedmessage.content;
  var author = recievedmessage.author;
  var author_tag = recievedmessage.author.username.toString() + "#" + recievedmessage.author.discriminator.toString(); // the person that sent the message as USERNAME#0000
  var $cmnd = recievedmessage.content.split(" ")[0].split("$")[1];

  if(recievedmessage.author === bot.user || recievedmessage.author.bot){return;}  // check if message sender is self or a bot
  
  if(recievedmessage.channel.type == "dm"){return $channel.send("Please use The Nutwork in a server");}  // I need a way to run


  var $cmnd;
  var Guild = recievedmessage.guild;
  var self = recievedmessage.guild.me;
  var $pre = "$"
  var $member = recievedmessage.member;

  // when the bot is pinged/mentioned
  if(recievedmessage.content.split(" ")[0] === "<@!"+bot.user.id+">"){  // if the first word is the mentioned bot
    if(!words[1]){
      return $channel.send("My prefix for this server is: `"+Configs[recievedmessage.guild.id]["prefix"]+"`");
    }
    $cmnd = recievedmessage.content.split(" ")[1];
    words.shift();  // offset words by one, so all future uses of the words array are still right
  }


  if( $channel.id in Configs[recievedmessage.guild.id]["channels"]){}else{
    Configs[recievedmessage.guild.id]["channels"][$channel.id] = {}; // turns out I need this instead of it just being happy and adding it when it needs it...
    $pre = Configs[Guild.id]["prefix"];
  }

  if(!words[0].startsWith(Configs[Guild.id]["prefix"]) && !words[1] && Configs[recievedmessage.guild.id]["config"]["automagic"] == "enabled"){
    
    Request({
      url: "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json",
      json: true
    }, function(error, response, body){

      if(!error && response.statusCode === 200){
        var PeriodicTable = body["elements"];
        for(let j = 0; j < PeriodicTable.length; j++){
          if(words[0].toLowerCase() === PeriodicTable[j]["name"].toLowerCase()){
            console.log("Ran: Automagic - Server: "+Guild.name);
            let element = new Discord.MessageEmbed().setColor("#7289d9").setTitle(PeriodicTable[j]["name"]+" - #"+j).setDescription("Symbol: "+PeriodicTable[j]["symbol"]+"\nAtomic Weight: "+PeriodicTable[j]["atomic_mass"]).addField("Discovery","Discovered by "+PeriodicTable[j]["discovered_by"]);
            return $channel.send(element);
          }
        }

      }
    });

    words[0] = words[0].replace(/\\\*/g,"*");
    
    if(Algebra.parse(words[0]).constants[0].denom == 1){
      return $channel.send("> "+Algebra.parse(words[0]).constants[0].numer);
    }else{
      return $channel.send("> "+Algebra.parse(words[0]).constants[0].numer/Algebra.parse(words[0]).constants[0].denom);
    }

  }else if(!words[0].startsWith("$") && Configs[recievedmessage.guild.id]["config"]["automagic"] == "enabled"){
    let output = EnglishToMath(message);
    console.log(output)
    if(output == false)return;
    return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Automagic Math").setDescription("").addField("Input",output.input).addField("Interpretation",output.interpret).addField("Result",output.answer).setFooter("AI by JesseBS2, math processed by algebra.js"));
  
  }else if(words[0].startsWith(Configs[Guild.id]["prefix"]) && words[0].length === 1){  // then word 0 is $ which means word 1 is the command
    $cmnd = recievedmessage.content.split(" ")[1];
    words.shift();
  
  }else if(words[0].startsWith(Configs[Guild.id]["prefix"])){
    $cmnd = recievedmessage.content.split(" ")[0].split(Configs[recievedmessage.guild.id].prefix)[1]; // remove the prefix an then return the first word. So only the command.
  }

  let firstWord = recievedmessage.content.split(" ")[0];


  ////////////////////////////
  ////////////////////////////
  ////  Uncategorized Commands
  ////////////////////////////
  ////////////////////////////


  if($cmnd === "ping"){
    const pingedMessage = await $channel.send("Loading...");

    let latency = (Number(pingedMessage.createdTimestamp) - Number(recievedmessage.createdTimestamp)).toString()+"ms";
    let ping = (bot.ws.ping).toFixed(2).toString()+"ms";

    let FancyPongMessage = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Pong").setDescription("").addField("Bot's Ping:",ping).addField("Latency to Server:",latency);
    pingedMessage.edit(FancyPongMessage);
    console.log("Latency & Ping to "+recievedmessage.guild.name+" "+latency+" & "+ping)

  }else if($cmnd === "inv" || $cmnd === "invite"){ 
    return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Invite").setDescription("If you want to invite me into your server, click the link below or paste it into your browser!").addField("Invite","https://discord.com/oauth2/authorize?client_id=661249786350927892&permissions="+invitePermissions+"&scope=bot").setThumbnail(BotLogo));
  }else if($cmnd === "credits"){
    return $channel.send(creditsMessage);
  }else if($cmnd === "code-info"){
    return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Code info").setDescription("Storage Space: "+process.memoryUsage().rss/1000000+"MB\nServers In: "+CACHED_GUILDS+"\nCurrently running on: "+process.platform+"\nUptime: "+(Math.floor(process.uptime())/60/60).toFixed(3)+" hours"));
  }else if($cmnd in _commands["help"]){

    ////////////////////////////
    ////////////////////////////
    ////  A couple of help commands
    ////////////////////////////
    ////////////////////////////

    var $commands = require("./commands.json");
    let group_arr = "";
    
    if($cmnd === "commands" || $cmnd === "help"){
      if(!words[1]) return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Commands:").setDescription("Separated by category").addField(":abacus: Algebra Commands","x"+commands_for["algebra"]+" Commands").addField(":test_tube: PToE Commands","x"+commands_for["ptoe"]+" Commands").addField(":lock: Mod Commands","x"+commands_for["mod"]+" Commands").addField(":smile: Fun Commands","x"+commands_for["fun"]+" Commands").addField(":frame_photo: Image Commands","x"+commands_for["image"]+" Commands").addField(":grey_question: Other Commands","x"+commands_for["other"]+" Commands").addField(":control_knobs: Server Commands","x"+commands_for["server"]+" Commands").addField("No category","Ping: "+$pre+"ping\nCredits: "+$pre+"credits\nSettings:"+$pre+"settings").setFooter("$commands <category>").setThumbnail(BotLogo));
      
      if(words[1].toLowerCase() in $commands){
        for(let ex = 0; ex < Object.values($commands[words[1].toLowerCase()]).length; ex++){
          let nextUp = $commands[words[1].toLowerCase()];
          if(typeof Object.values(nextUp)[ex] != "object"){}else{  // skip commands that are just aliases
            group_arr += $pre+Object.keys($commands[words[1].toLowerCase()])[ex];
            group_arr += "\n";
          }
        }
        return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle(words[1].charAt(0).toUpperCase()+words[1].slice(1).toLowerCase()+" commands").setDescription(group_arr).setFooter($pre+"help <command>"));
      }

      if(words[1].startsWith("$")){words[1] = words[1].replace("$","");}

      var helpText;
      var x;

      if(words[1] in (x = $commands["help"])){
        helpText = x[words[1].toLowerCase()];
      }else if(words[1] in (x = $commands["fun"])){
        helpText = x[words[1].toLowerCase()];
      }else if(words[1] in (x = $commands["other"])){
        helpText = x[words[1].toLowerCase()];
      }else if(words[1] in (x = $commands["algebra"])){
        helpText = x[words[1].toLowerCase()];
      }else if(words[1] in (x = $commands["ptoe"])){
        helpText = x[words[1].toLowerCase()];
      }else if(words[1] in (x = $commands["mod"])){
        helpText = x[words[1].toLowerCase()];
      }else if(words[1] in (x = $commands["help"])){
        helpText = x[words[1].toLowerCase()];
      }else if(words[1] in (x = $commands["image"])){
        helpText = x[words[1].toLowerCase()];
      }else if(words[1] in (x = $commands["server"])){
        helpText = x[words[1].toLowerCase()];
      }

      if(typeof helpText != "object") helpText = x[helpText];

      try{
        return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle($pre+words[1]).setDescription(helpText["desc"]).addField("Usage",helpText["format"]).addField("Examples",helpText["examples"]).addField("Aliases",helpText["alias"])) || $channel.send("That's not a command I recognize! Are you sure you typed it right?");
      }catch(err){
        return $channel.send("Could not find that group or command!");
      }
    }
  }else if($cmnd in _commands["algebra"] || firstWord.startsWith("√")){  // if the command is the math kind, special case for root symbol
    if(Configs[recievedmessage.guild.id]["categories"]["math"] === "disabled")return $channel.send("An admin has disabled these commands!");

    ////////////////////////////
    ////////////////////////////
    ////  Math
    ////////////////////////////
    ////////////////////////////
    console.log("Ran: Math - Server: "+Guild.name)

    var FooterTitle = "Math processed by algebra.js";

    if($cmnd === "math"){
      if(!words[1]) return $channel.send("You're forgetting part of that command!");
      let toEquation = words[1]; // to be evaluated by algebra.js

      if(words.length > 1){
        for(let j = 2; j < words.length; j++){ //start at two because 0 is the command and 
          toEquation += " "+words[j]; 
        }
      }

      toEquation = toEquation.replace(/÷/g,"/").replace(/\{/g,"(").replace(/\[/g,"(").replace(/\]/g,")").replace(/}/g,")").replace(/ /g,"");
      let n = SolveEquation( toEquation );

      if(n === false){
        //return $channel.send( new Discord.MessageEmbed().setColor("#7289d9").setTitle("Too Large").setDescription("The provided equation was too large for the bot and produced 'infinity'.\nThe following website can calculate your problem for you:\n\nhttps://keisan.casio.com/calculator").setColor("#cc1100"));
        return $channel.send( new Discord.MessageEmbed().setColor("#cc1100").setTitle("Err").setDescription(""));
      }else{
        if(typeof n == "Object") n = n["constants"][0]["numer"];
        return $channel.send( new Discord.MessageEmbed().setColor("#7289d9").setTitle("Algebra").setDescription(toEquation.replace(/(\*)/g,"\*")).addField("Result",n.toString()).setFooter(FooterTitle) );
      }

    }else if($cmnd === "root"){ // special case for the symbol type
      if(!words[1]) return $channel.send("You're forgetting part of that command!");
      let num = Number(words[1]); // second word
      let index = Number(words[2]) || 2; // third word
      
      let randomNonsensicalVariable = ["th","st","nd","rd","th","th","th","th","th","th"];
      let theEndingToTheNumber = randomNonsensicalVariable[Number(index.toString().charAt(index.length))];

      try{
        return $channel.send( new Discord.MessageEmbed().setColor("#7289d9").setTitle("Root").setDescription("The "+index+""+theEndingToTheNumber+" root of "+num).addField("Result",Math.pow(num,1/index).toFixed(3)) ); // x to power of y, but it's divide first so it's actually root
      }catch(e){
        console.log(e);
        return $channel.send("Sorry, something went wrong!");
      }

    }else if($cmnd === "eval" || $cmnd === "evaluate"){
      if(!words[2]) return $channel.send("You're forgetting part of that command!");
      
      let obj = {}
      let n = words[1];
      let nameForEveryVariableOccurence = "";
      for(let i = 2; i < words.length; i++){
        let beforeEqual = words[i].split("=")[0];
        let afterEqual = Number(words[i].split("=")[1]);
        obj[beforeEqual] = Number(afterEqual); // [0] before equals sign. [1] after equals sign

        if(words.length-1 == i){ // check if current word is last word
          if(words.length-2 == 1){ // check if then third to last word is also the second
            nameForEveryVariableOccurence = beforeEqual+" is "+afterEqual;
          }else{
            nameForEveryVariableOccurence += " and "+beforeEqual+" is "+afterEqual;
          }
        }else{
          nameForEveryVariableOccurence += beforeEqual+" is "+afterEqual+", ";
        }
      }

      try{
        let expr = Algebra.parse(words[1]);
        let asEmbed = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Evaluate").setDescription("Evaluating "+words[1]+" when: "+nameForEveryVariableOccurence).addField("Result",expr.eval(obj)).setFooter(FooterTitle);

        return $channel.send(asEmbed);
      }catch(err){
        console.log(err);
        return $channel.send( new Discord.MessageEmbed().setColor("#cc1100").setTitle("Err").setDescription(""));
      }

    }else if($cmnd === "area"){
      if(!words[1]) return $channel.send("Area is the amount of 2D space that a shape takes up");
          
      if(words[1] == "square"){
        if(!words[2]) return $channel.send("You're forgetting the height parameter!");
        if(!words[3]) return $channel.send("You're forgetting the width parameter!");

        let math = Number(words[2]) * Number(words[3]);
        let x = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Area of a square").setDescription("Height: "+words[2]+" Width: "+words[3]).addField("Formula","Width * Height").addField("Result",math+"²");
        return $channel.send(x);

      }else if(words[1] == "triangle"){
        if(!words[3]) return $channel.send("You're forgetting the height parameter!");
        let math = Number(words[2]) * Number(words[3]);
        math = math/2;
        let x = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Area of a triangle").setDescription("Width: "+words[2]+" Height: "+words[3]).addField("Formula","(Width * Height) ÷ 2").addField("Result",math+"²");
        return $channel.send(x);

      }else if(words[1] == "circle"){
        if(!words[2]) return $channel.send("You're forgetting the radius parameter!");
        let r = Number(words[2])
        let math = 3.14159 * ( r**2 );
        
        let x = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Area of a square").setDescription("Radius: "+words[2]).addField("Formula","Pi * (Radius^2)").addField("Result",math+"²");
        return $channel.send(x)
      }else{
        return $channel.send(words[1]+" is not the name of 2D shape!");
      }

      return;
    }else if($cmnd === "volume"){
      if(!words[1]) return $channel.send("Volume is the amount of 3D space that an object takes up");
      /* Going to need: Cube, Pyramid, Sphere, Cylinder, Cone */
      if(words[1] == "cube" || words[1] == "cuboid"){
        if(!words[2]) return $channel.send("You're forgetting the height parameter!");
        if(!words[3]) return $channel.send("You're forgetting the width parameter!");
        if(!words[4]) return $channel.send("You're forgetting the depth parameter!");

        let math = Number(words[2]) * Number(words[3]) * Number(words[4]);
        let x = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Volume of a Cube").setDescription("Height: "+words[2]+" Width: "+words[3]+" Depth: "+words[4]).addField("Formula","Width * Height * Depth").addField("Result",math+"³");
        
        return $channel.send(x);
      }else if(words[1] == "pyramid" || words[1] == "tetrahedron"){
        if(!words[2]) return $channel.send("You're forgetting the height parameter!");
        if(!words[3]) return $channel.send("You're forgetting the width parameter!");
        if(!words[4]) return $channel.send("You're forgetting the depth parameter!");
        
        let math = Number(words[2]) * Number(words[3]) * Number(words[4]);
        math = math/3;
        let x = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Volume of a Tetrahedron").setDescription("Height: "+words[2]+" Width: "+words[3]+" Depth: "+words[4]).addField("Formula","(Width * Height * Depth) ÷ 3").addField("Result",math+"³");
        return $channel.send(x);

      }else if(words[1] == "cylinder"){
        if(!words[2]) return $channel.send("You're forgetting the radius parameter!");
        if(!words[3]) return $channel.send("You're forgetting the height parameter!");
        
        let math = ( 3.14159 * (Number(words[2])**2) ) * Number(words[3]);
        
        let x = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Volume of a Cylinder").setDescription("Radius: "+words[2]+" Height: "+words[3]).addField("Formula","[π * (Raidus^2) ] * Height").addField("Result",math+"³");
        return $channel.send(x);

      }else if(words[1] == "sphere"){
        if(!words[2]) return $channel.send("You're forgetting the radius!");
        
        let math = (4/3)*3.14159*(Number(words[2])**3);

        let x = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Volume of a Sphere").setDescription("Radius: "+words[2]).addField("Formula","(4/3) * π * (Raidus^3)").addField("Result",math+"³");
        return $channel.send(x);
      }



    }else if($cmnd === "convert"){ // 100cm --> 1m, 3ft --> 1yd, 1.5 --> 1(1/2)
      if(!words[1]) return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Conversions").setDescription("").addField("Length U.S. Customary","Mile = mi\nYard = yd\nFeet = ft\nInches = in\nCentimeters = cm").addField("Length Metric","Kilometer = km\nHectometer = hm\nDekameter = dkm\nMeter = m\nDecimeter = dm\nCentimeter = cm\nMillimeter = mm\nMicrometer = um").addField("Measurements U.S. Customary","Gallon = gal\nQuart = qt\nPint = pt\nCup = cup\nOunce = oz\nTablespoon = tbsp\nTeaspoon = tsp").addField("Measurements Metric","Kilogram = kg\nHectogram = hg\nDekagram = dkg\nGram = g\nDecimeter = dm\nCentigram = cg\nMilligram = mg\nMicrogram = ug"));
      
      let A = words[1].toLowerCase();
      let B = words[2].toLowerCase();
      let AL = A.replace(/[0-9]/g,"");  // A without all the numbers
      let AN = A.replace(/\D/g,""); // A without all the letters

      let metricDist = {
        // metric distance, based around meter
        um: 0.000001, //micrometer
        mm: 0.001, //millimeter
        cm: 0.01, //centimeter
        dm: 0.1, //decimeter
        m: 1, //meter
        dkm: 10, //dekameter
        hm: 100, //hectometer
        km: 1000, //kilometer
      }
      let metricMeas = {
        // metric measurements, based around gram
        ug: 0.000001, //microgram
        mg: 0.001, //milligram
        cg: 0.01, //centigram
        dg: 0.1, //decigram
        g: 1, //gram
        dkg: 10, //dekagram
        hg: 100, //hectogram
        kg: 1000 //kilogram
      }
      let usDist = {
        // U.S. Customary Distances, based around inches
        cm: 2.54,
        "in.": 1, // in quotes because `in` is already an operator also periods are a function-thingy in javascript
        ft: 12,
        yd: 36, 
        mi: 63360
      }
      let usMeas = {
        // U.S Customary Measurements, based around cups
        tsp: 1/48,
        tbsp: 0.0625,
        oz: 0.125,
        cup: 1,
        pt: 2,
        qt: 4,
        gal: 16
      }


      let conversion;

      if(AL in metricDist && B in metricDist && AL != B){
        conversion = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Convert "+A+" to "+B).setDescription("1"+AL+" is "+(metricDist[B]/metricDist[AL])+""+B).addField("Result", (AN * ( metricDist[AL] / metricDist[B] ) ).toString() + B);
      }else if(AL in usDist && B in usDist && AL != B){
        conversion = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Convert "+A+" to "+B).setDescription("1"+AL+" is "+(usDist[B]/usDist[AL])+""+B).addField("Result", (AN * ( usDist[AL] / usDist[B] ) ).toString() + B);
      }else if(AL in usDist && B in metricDist){
        let calc = AN * ( ( usDist[AL] * 2.54 / metricDist[B]) / 100);
        //calc = calc.toFixed(4); // shortens the decimals to 4 places
        conversion = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Convert "+A+" to "+B).setDescription("1"+AL+" is "+(calc/AN)+""+B).addField("Result", calc + B);
      }else if(AL in metricDist && B in usDist){
        let calc = AN * ( ( metricDist[AL] / 0.01 ) / 2.54 ) / usDist[B];
        conversion = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Convert "+A+" to "+B).setDescription("1"+AL+" is "+(calc/AN)+""+B).addField("Result", calc + B);
      
      }else if(AL in metricMeas && B in metricMeas && AL != B){
        let calc = (metricMeas[AL] / metricMeas[B]) * AN; // I'm jealous of the metirc system! It's so easy!
        conversion = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Convert "+A+" to "+B).setDescription("1"+AL+" is "+(calc/AN)+""+B).addField("Result", calc+B);
      }else if(AL in usMeas && B in usMeas && AL != B){
        let calc = ( usMeas[AL] / usMeas[B] ) * AN;
        conversion = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Convert "+A+" to "+B).setDescription("1"+AL+" is "+(calc/AN)+""+B).addField("Result", calc+B);
      
      }else{
        return $channel.send("Something went wrong!\nDid you spell the abbreviations right?");
      }

      return $channel.send(conversion);
    }else if($cmnd === "simplify" || $cmnd === "simp"){
      if(!words[1]) return $channel.send("You're forgetting part of that command!");

      let equation = message.split($pre+$cmnd+" ")[1];
      let pre_parse = message.split($pre+$cmnd+" ")[1].replace(/\\/g,"").replace(/\*\*/g,"^").replace(/÷/gi, "/").replace(/\[/g,"(").replace(/\]/g,")").replace(/\{/g,"(").replace(/\}/g,")").replace(/ /g,"");
      let SimpedEquation = Algebra.parse( pre_parse );  // Simplify the eqution... wait that means parsing is the same as simping
      return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Simplify").setDescription(equation.replace(/\*/g,"\*")).addField("Result",SolveEquation(SimpedEquation)).setFooter(FooterTitle));
    
    }else if($cmnd === "solve"){
      if(!words[2]) return $channel.send("You're forgetting part of that command!");
      let expr = Algebra.parse(words[1]);
      let x = expr.solveFor(words[2]);

      return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Solve for "+words[2]).setDescription("in "+words[1]).addField("Equals",words[2]+" = "+SolveEquation(x.toString())).setFooter(FooterTitle) );
    }else if($cmnd === "notate"){
      if(!words[1]) return $channel.send("You're forgetting part of that command!");

      return $channel.send(Number(SolveEquation(words[1])).toExponential(10));
    
    }else if($cmnd === "factorial"){
      if(!words[1]) return $channel.send("You're forgetting part of that command!");
      return $channel.send("> "+ factorialize( Number(words[1]) ) );

    }else if($cmnd === "group"){
      var groups = ["counting","whole","integer","real","complex"]
      if(!words[1]) return $channel.send("You're forgetting part of that command!");

      var TheNumber = Number(words[1]);

      if(TheNumber <= 0){
        return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Whole Number").setDescription("A whole number is any even or odd number, that has no decimal places."));
      }else if(Math.round(TheNumber) === TheNumber && TheNumber > 0){
        return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Counting Number").setDescription("A counting number is any even or odd number, greater than 0, that has no decimal places"));
      }else if(TheNumber.toString().includes(".") && Number(TheNumber.toString().split(".")[1]) != 0){
        return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Integer").setDescription("An integer is any number that has a finite amount of decimal places"));
      }else{
        // return $channel.send(TheNumber+"\nReal");
        return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Real or Complex").setDescription("It is at this point that I am un-able to identify the number you've selected.\nReal numbers can be rational or irrational.\nA rational number is any of the previous numbers.\nAn irrational number is a decimal number that has an infinite amount of decimal places.\nA complex number is a number that can be express using the equation `a+bi`, where `a` and `b` are Real numbers and `i` is an \"imaginary number\" or a number that doesn't exist, example:\n`x^2 = -1`"));
      }

    }else if($cmnd === "perimeter"){
      if(!words[1]) return $channel.send("Perimeter is the space around the outside of a 2D object");

      if(words[1] === "square"){
        if(!words[2]) return $channel.send("You're forgetting the width parameter!");
        if(!words[3]) return $channel.send("You're forgetting the height parameter!");
        
        let math = (Number(words[2]) *2) + (Number(words[3]) *2)
        
        return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Perimeter of a Square").setDescription("Width: "+words[2]+" Height: "+words[3]).addField("Formula","(Width \* 2) + (Height \* 2)").addField("Result",math));
        
      }else if(words[1] === "triangle"){
        if(!words[2]) return $channel.send("You're forgetting the base parameter!");
        if(!words[3]) return $channel.send("You're forgetting the height parameter!");
        
        let hypotenuse = Math.sqrt( ((Number(words[2])/2)**2) + ((Number(words[3])/2)**2) );
        let math = hypotenuse+hypotenuse+Number(words[2])
        
        return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Perimeter of a Triangle").setDescription("Base: "+words[2]+" Height: "+words[3]).addField("Formula","hypotenuse = √[(base/2)^2+(height/2)^2]\nhypotenuse + hypotenuse + base").addField("Result",math));
        
      }else if(words[1] === "circle"){
        if(!words[2]) return $channel.send("You're forgetting the radius parameter!");
        
        let math = 2*3.14159*Number(words[2]);
        
        return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("Circumference of a Circle").setDescription("Radius: "+words[2]).addField("Formula","2 \* Pi \* Radius").addField("Result",math)); 
      }

    }
  }else if($cmnd in _commands["mod"]){
    // mod commands can not be disabled.
    
    ////////////////////////////
    ////////////////////////////
    ////  For moderating your server
    ////////////////////////////
    ////////////////////////////
    console.log("Ran: Moderator - Server: "+Guild.name);

    var RlConfig = require("./configuration.json")[Guild.id];

    if($cmnd === "clear" || $cmnd === "purge"){
      if($member.hasPermission("MANAGE_MESSAGES") === false){
        return $channel.send("You do not have the necessary permissions for that");
      }else if(Guild.me.hasPermission("MANAGE_MESSAGES") === false){
        return $channel.send("I do not have the necessary permissions for that.\nI need the `Manage Messages` permission");
      }
      if(!words[1]) return $channel.send("You're forgetting part of that command!");

      try{ 
        var amount = Number(words[1]) + 1;
        if(amount > 501) return $channel.send("Sorry! I have a clear limit of 500");
        try{
          if(amount >= 100){
            for(let x = 0; x < amount; x++){  // loops!
              if(x%100 === 0){$channel.bulkDelete(100);
              }else if(x%25 === 0){$channel.bulkDelete(25);
              }else if(x%10 === 0){$channel.bulkDelete(10);
              }else if(x%5 === 0){$channel.bulkDelete(5); 
              }else if(x%2 === 0){$channel.bulkDelete(2); 
              }else{$channel.bulkDelete(1);}  // otherwise just remove one this time.
            }
          }else{
            $channel.bulkDelete(amount);
          }
        }catch(err){
          if(err){
            console.log("Stopped an attempt to delete too old of messages.");
            return $channel.send("Something went wrong!\nI can not delete messages older than 14 days!");
          }
        }

        console.log("Erased "+amount+" messages from "+$channel.name+" in "+recievedmessage.guild);
      }catch(err){
        throw err;
      }
      
    }else if($cmnd === "kick"){
      if($member.hasPermission("KICK_MEMBERS") === false){
        return $channel.send("You do not have the necessary permissions for that");
      }else if(Guild.me.hasPermission("KICK_MEMBERS") === false){
        return $channel.send("I do not have the necessary permissions for that.\nI need the `Kick Members` permission");
      }

      let toKick = recievedmessage.mentions.members.first();
      if(!toKick.id){
        return $channel.send("Something went wrong!\nDid you mention someone?\nAre you sure this person is in the server?"); 
      }else if(toKick.id === bot.user.id){
        // DeathMessages ordered like so: Goodbyes, Movie References, Video Game References
        let DeathMessages = ["Kicked *myself* from the server!","Okay. Peace! :wave:","Kicking me? Aww okay, bye :(","'*The Nutwork* has left the *server*'", "You can't fire me! I quit!","I'll get you! And your little dog too!","Hasta la vista baby", "Advancement Made: The End?","Bravo six, Going dark."]

        $channel.send( DeathMessages[Math.round(Math.random()*DeathMessages.length-1)] );  // sends a random goobye into the server
        Guild.leave();
        return;
      } 
      
      toKick.kick()
        .then(() => {
          return $channel.send("Kicked "+toKick.displayName+" from the server!");
        })
        .catch(err => {
          console.log(err);
          return $channel.send("I can not kick this user!");
        });

    }else if($cmnd === "ban"){
      if($member.hasPermission("BAN_MEMBERS") === false){
        return $channel.send("You do not have the necessary permissions for that");
      }else if(Guild.me.hasPermission("BAN_MEMBERS") === false){
        return $channel.send("I do not have the necessary permissions for that.\nI need the `Ban Members` permission");
      }
      var toBan = recievedmessage.mentions.users.first();
        
      var time = Number(words[2]) || 7; //custom days or 1 week
      var desc = recievedmessage.content.split(words[0]+" "+words[1]+" "+words[2]+" ")[1] || "Reason not specified.";


      if(time > 7){
        return $channel.send("A player can't be banned for more than a week.");
      }

      
      if(!toBan || toBan == undefined){
        return $channel.send("There is no member in this server with that tag.");
      }else{
        recievedmessage.guild.members.ban(toBan,{
          days: time,
          reason: desc
        }).then(e => {
          return $channel.send("**Successfully banned** "+toBan);
        }).catch(err => {
          console.error(err);
          return $channel.send("This user can not be banned!");
        });
      }

    }else if($cmnd === "mute"){
      if($member.hasPermission("MUTE_MEMBERS") === false){
        return $channel.send("You do not have the necessary permissions for that");
      }else if(Guild.me.hasPermission("MANAGE_ROLES") === false){
        return $channel.send("I do not have the necessary permissions for that.\nI need the `Mute Members` permission");
      }

      if(!words[1]) return $channel.send("You're forgetting part of that command!");
      if(!recievedmessage.mentions.members.first()) return $channel.send("You need to mention someone!");

      if(!Guild.roles.cache.find(role => role.name == "Muted")){  // if there isn't already a "mute" role then make one
        Guild.roles.create({data: {name: "Muted", permissions: ["READ_MESSAGE_HISTORY","VIEW_CHANNEL","CONNECT"]}, reason: "A role that prevents members from speaking"}).then(() => {
          Guild.channels.cache.forEach(editchannel => {
            editchannel.updateOverwrite(Guild.roles.cache.find(role => role.name == "Muted"), {SEND_MESSAGES: false, SPEAK: false, ADD_REACTIONS: false, STREAM: false});
          }); // loop through channels
        
          recievedmessage.mentions.members.forEach(member => {
            member.roles.add(Guild.roles.cache.find(role => role.name == "Muted").id).then(() => {
              $channel.send("**Successfully Muted** "+member);
              console.log("Muted "+member+" in "+Guild.name);
            }).catch(err => {
              console.error(err);
              $channel.send("Failed to mute "+member);
            });
          }); // loop through mentioned members
        });
      }

    if(Guild.roles.cache.find(role => role.name == "Muted")){
      recievedmessage.mentions.members.forEach(member => {  // loop through all mentioned users
        member.roles.add(Guild.roles.cache.find(role => role.name == "Muted").id).then(() => {
          $channel.send("**Successfully Muted** "+member);
          console.log("Muted "+member+" in "+Guild.name);
        }).catch(err => {
          console.error(err);
          $channel.send("Failed to mute "+member);
        });
      });
    }
    return;

    }else if($cmnd === "unban"){
      if($member.hasPermission("BAN_MEMBERS") === false){
        return $channel.send("You do not have the necessary permissions for that");
      }else if(Guild.me.hasPermission("BAN_MEMBERS") === false){
        return $channel.send("I do not have the necessary permissions for that.\nI need the `Ban Members` permission");
      }

      if(!words[1]) return $channel.send("You're forgetting part of that command!");
      
      message.guild.fetchBans().then(bans => { // get active bans for the server
        bans.forEach(banneduser => {  // loop through bans
          console.log(banneduser.user.tag);
          console.log(banneduser.user.id)
          if(words[1] == banneduser.user.tag || message.mentions.members.first().id === banneduser.user.id){  // if mentioned or just typed a username
            message.guild.members.unban(banneduser.user.id);
            console.log("Unbanned "+banneduser.user.tag);
            banneduser.user.send("You have been unbanned from "+message.guild.name);  // message unbanned user
            return $channel.send("User has been unbanned");
          }
        });
      });

      return $channel.send("I could not find an active ban for this user");

    }else if($cmnd === "settings"){
      if($member.hasPermission("ADMINISTRATOR") === false){
        return $channel.send("You do not have the necessary permissions for that!");
      }

      if(!words[1]){
        let displayconfigures = new Discord.MessageEmbed().setColor("#7289d9").setTitle("Configurable Settings").setDescription("Settings that can be changed for this server by the admins.\n"+$pre+"settings <setting> <set>").addField("Autorole - "+RlConfig["config"]["autorole"]["type"],"Assigns a role to new users when they join.\n(mentioned role/disable)").addField("Nickname - "+RlConfig["config"]["nickname"],"Allow people to change their own or other people's nicknames.\n(enable/disable)").addField("Embeds - "+RlConfig["config"]["embeds"],"Allow anyone to create an Rich Message Embed.\n(enable/disable)").addField("Automagic - "+RlConfig["config"]["automagic"],"Do math, word problems, & show periodic table elements without the need of a command.\n(enable/disable)").addField("QR-Codes - "+RlConfig["config"]["qr-codes"],"Allow users to convert text and links into scanable QR codes.\n(enable/disable)").addField("Fun - "+RlConfig["categories"]["fun"],"Just fun-to-use commands.\n(enable/disable)").setThumbnail(Guild.iconURL);
        return $channel.send(displayconfigures);
      }

      if(words[1] == "prefix" && words[2] && words[2].length >= 1){
        if($member.hasPermission("ADMINISTRATOR") === false){$channel.send("You do not have the necessary permissions for that!"); return;}
        if(words[2].length > 3){$channel.send("A prefix can not be longer than 3 characters."); return;}
        if(words[2].toLowerCase() === $pre){
          return $channel.send("That prefix is the same as the old prefix!");
        }else{
          RlConfig["prefix"] = words[2].toLowerCase();
          SaveJSON();
          return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle("A new prefix has been set!").setDescription("An admin, "+author.displayName+" set the server prefix to: "+RlConfig["prefix"]).addField("How to use it?","Use the new prefix just like the old one! ex:\n"+RlConfig["prefix"]+"snowflake"));
        }
      }
      
      let categories = RlConfig["categories"];
      let configurations = RlConfig["config"];

      if(words[1].toLowerCase() in categories){
        if(!words[2]){return;}  // embed with a display of the options

        if(words[2] == "enable"){
          try{
            categories[words[1]] = "enabled"; // enable
            console.log(words[1]+" commands on server <#"+Guild.id+"> are now enabled");  // log
            return $channel.send("`"+words[1]+"` is now enabled");  // annouce
          }catch(err){
            console.log("Failed to enable "+words[1]+" commands server <#"+Guild.id+">\n"+err); // the thing attempted to change, along with server ID and error
            return $channel.send("Something went wrong!");
          }
        }else if(words[2] == "disable"){
          try{
            categories[words[1]] = "disabled";
            console.log(words[1]+" commands on server <#"+Guild.id+"> are now disabled");
            return $channel.send("`"+words[1]+"` is now disabled");
          }catch(err){
            console.log("Failed to disable "+words[1]+" commands on server <#"+Guild.id+">\n"+err);
            return $channel.send("Something went wrong!");
          }
        }

        SaveJSON();
        return;

      }else if(words[1] === "autorole"){  // special case for auto role, as it has more than two states
        if(Guild.me.hasPermission("MANAGE_ROLES") === false){
          $channel.send("I do not have the necessary permissions for that");
          return;        
        }
        if(!words[2]){$channel.send("automatic role is currently: "+configurations["autorole"]["type"]); return;}  // in case of lack of setting
        
        if(words[2] === "disable"){
          try{
            configurations["autorole"]["type"] = "disabled";
            configurations["autorole"]["id"] = null;
            return $channel.send("`autorole` is now disabled");
          }catch(err){
            console.log("Failed to set autorole to disabled on server <#"+Guild.id+">\n"+err);
            return $channel.send("Something went wrong!");
          }
        }else if(words[2].startsWith("<@&")){
          try{
            configurations["autorole"]["type"] = words[2];
            configurations["autorole"]["id"] = recievedmessage.mentions.roles.first().id; // get the role mentioned(will return snowflake)
            console.log("Autorole on server <#"+Guild.id+"> is now "+words[2]);
            return $channel.send("Set automatic role to: "+words[2]);
          }catch(err){
            console.log("Failed to assign "+words[2]+" as automatic role in server <#"+Guild.id+">\n"+err);
            return $channel.send("Something went wrong!");
          }
        }

        SaveJSON();
        return;

      }else if(words[1].toLowerCase() in configurations){ // all cases where the value is either 'enabled' or 'disabled'
        if(!words[2])return $channel.send(words[1]+" is currently: "+configurations[words[1]]);


        if(words[2] == "enable"){
          try{
            configurations[words[1]] = "enabled";
            console.log(words[1]+" on server <#"+Guild.id+"> is now enabled");
            return $channel.send(words[1]+" is now enabled");
          }catch(err){
            console.log("Failed to set "+words[1]+" to enabled on server <#"+Guild.id+">\n"+err); // the thing attempted to change, along with server ID and error
            return $channel.send("Something went wrong!");
          }
        }else if(words[2] == "disable"){
          try{
            configurations[words[1]] = "disabled";
            console.log(words[1]+" on server <#"+Guild.id+"> is now disabled");
            return $channel.send(words[1]+" is now disabled");
          }catch(err){
            console.log("Failed to set "+words[1]+" to disabled on server <#"+Guild.id+">\n"+err);
            return $channel.send("Something went wrong!");
          }
        }

        SaveJSON();
        return;
      }
    }
    

  }else if($cmnd in _commands["server"]){
    // server commands can not be disabled.

    ////////////////////////////
    ////////////////////////////
    ////  Server Commands
    ////////////////////////////
    ////////////////////////////

    console.log("Ran: Server - Server: "+Guild.name);

    if($cmnd === "info"){
      var insights = {
        name: Guild.name,
        description: Guild.description || "No description is set for this server",
        owner: Guild.owner,
        region: Guild.region,
        members: Guild.memberCount,
        boosts: Guild.premiumSubscriptionCount,
        roles: Guild.roles.length,
        emojis: Guild.roles.length,
        channels: Guild.channels.length,
        system: Guild.systemChannel,
        mfa: Guild.mfaLevel // mafia level
      }
    
      //console.log(Guild.roles.size);
      if(words[1] && words[1] in insights){
        return $channel.send( new Discord.MessageEmbed().setColor("#7289d9").setTitle(" ").setDescription(insights[words[1]]) );
      }
      return $channel.send( new Discord.MessageEmbed().setColor("#7289d9").setTitle(insights.name).setDescription(insights.description).addField("Data",`Owner: ${insights.owner}\nMembers: ${insights.members}\nBoosts: ${insights.boosts}\nSystem Channel: ${insights.system}`).setImage(Guild.iconURL).setFooter("Your server's data is not stored by The Neural Nutwork").setTimestamp() );
    }else if($cmnd === "create"){
      if(!words[1]){
        return $channel.send("You're forgetting part of that command!");
      }else if(words[1] === "channel"){
        if($member.hasPermission("MANAGE_CHANNELS") === false){
          return $channel.send("You do not have the necessary permissions for that");
        }else if(Guild.me.hasPermission("MANAGE_CHANNELS") === false){
          return $channel.send("I do not have the necessary permissions for that.\nI need the `Manage Channels` permission");
        }
        
        
        let name = words[2] || "nameless"; 
        let type = "text";
        let category = $channel.parent.id;
        if(!words[1]) return;
        if(words[3] && words[3] === "voice") type = words[3];
        if(words[4])category = Guild.channels.get(words[4]).id;

        Guild.channels.create(name,{type: type, reason: "Channel created by "+author.tag}) // reason, so you know who did it
          .then(channelToMove => {
            channelToMove.setParent(category);
          });
        
        console.log("Created a channel '"+name+"' in server "+Guild.name);
        return $channel.send("I've created the channel!");
      }else if(words[1] === "category"){
        if($member.hasPermission("MANAGE_CHANNELS") === false){
          return $channel.send("You do not have the necessary permissions for that");
        }else if(Guild.me_me.hasPermission("MANAGE_CHANNELS") === false){
          return $channel.send("I do not have the necessary permissions for that.\nI need the `Manage Channels` permission");
        }


        let name = words[2] || "nameless";

        Guild.channels.create(name,{type: "category", reason: "Category created by "+author.tag}); // same as create channel but the channel type is a category :O
        console.log("Created a category '"+name+"' in server ' "+Guild.name+" '");
        return $channel.send("I've created the category!");
      
      }else if(words[1] === "role"){
        if($member.hasPermission("MANAGE_ROLES") === false){
          return $channel.send("You do not have the necessary permissions for that");
        }else if(Guild.me.hasPermission("MANAGE_ROLES") === false){
          return $channel.send("I do not have the necessary permissions for that.\nI need the `Manage Roles` permission");
        }
        

        let name = words[2] || "nameless-role";
        let color = null;
        if(words[3] && words[3].startsWith("#") && words[3].length === 7)color = words[3];

        Guild.roles.create({data: {name: name, color: color}, reason: "Role created by "+author.tag}).then(newRole => {
          console.log("Created a role '"+name+"' in server ' "+Guild.name+" '");
          return $channel.send("I've created the role!\n<@"+newRole+">");
        }).catch((err) => {
          $channel.send("Something went wrong!\nI couldn't create the role");
          if(err) throw err;
        });
        
      }
    }else if($cmnd === "delete"){
      let mention, type="unknown thing";
      if(!words[1]) return $channel.send("You're forgetting the name parameter!");
      if(words[1].startsWith("<")){
        mention = recievedmessage.mentions.channels.first() || recievedmessage.mentions.roles.first();
        if(mention.type === "text" || mention.type === "voice"){  // voice and texts are channels
          type = "channel";
        }else if(mention.type === "category"){  // categories are actually channels with category type
          type = "category";
        }else if(mention.type === undefined){ // roles don't have a type
          type = "role";
        }

        mention.delete()
          .then(function(){
            console.log("Deleted a " +type+ " '"+mention.name+"' in server '"+Guild.name+"'");
            return $channel.send("I've deleted the "+type);
          })
          .catch(function(){
            if(type === "role") return $channel.send("I can not delete roles higher than my own");
            if(type === "channel") return $channel.send("I can't seem to delete that channel");
          });

      }else if(words[1].length == 18 && words[1].replace(/\D/gi,"") === words[1]){ // if all letters removed is the same as itself, then it's all numbers(and probably an ID)
        mention = Guild.channels.get(words[1]) || Guild.roles.get(words[1]);
        if(mention.type === "text" || mention.type === "voice"){
          type = "channel";
        }else if(mention.type === "category"){
          type = "category";
        }else if(mention.type === undefined){
          type = "role";
        }

        mention.delete()
          .then(function(){
            console.log("Deleted a "+type+" '"+mention.name+"' in server '"+Guild.name+"'");
            return $channel.send("I've deleted the "+type);
          })
          .catch(function(){
            if(type === "role") return $channel.send("I can not delete roles higher than my own");
            if(type === "channel") return $channel.send("I can't seem to delete that channel");
            if(type === "category") return $channel.send("I can't seem to delete that category");
          });
      }
    }
  }else if($cmnd in _commands["other"]){

    ////////////////////////////
    ////////////////////////////
    ////  Other
    ////////////////////////////
    ////////////////////////////


    if(Configs[recievedmessage.guild.id]["categories"]["other"] === "disabled")return $channel.send("An admin has disabled these commands!");
    console.log("Ran: Other - Server: "+Guild.name)

    if($cmnd === "profile"){
      return $channel.send("> This command is broken right now");
      var username,disc,status,snow,pfp,account_age,accStatusColor,activity="",custom="";

      try{
        if(words[1] && words[1].startsWith("<@!") || $cmnd == "profile" && words[1] && words[1].length === 18 && words[1].replace(/[0-9]/gi,"") === ""){  // only works using profile because typing self then getting someone else is weird
          var GetUserAcc = bot.users.cache.get(words[1]); // by default try to get it based on numbers only
          if(words[1].startsWith("<@!"))GetUserAcc = bot.users.cache.get(words[1].split("<@!")[1].split(">")[0]); // if it didn't start with numbers then change it
        }else{
          GetUserAcc = bot.users.cache.get(author.id);
        }
      }catch(e){
        return $channel.send("Something went wrong!\nI'm either not in a server with that user, or you did not provide a valid snowflake");
      }


      // Look all these beautiful settings!! :D
      try{
        username = GetUserAcc.username;
        disc = GetUserAcc.discriminator;
        status = GetUserAcc.presence.status;
        snow = GetUserAcc.id;
        pfp = GetUserAcc.displayAvatarURL() || GetUserAcc.defaultAvatarURL();
        account_age = GetUserAcc.createdAt.toString().split(" ")[1]+" "+GetUserAcc.createdAt.toString().split(" ")[2]+" "+GetUserAcc.createdAt.toString().split(" ")[3];
        accStatusColor = {"online": "#00ff00","idle":"#ffcc00","dnd":"#ff0000","offline":"#919191"};


        if(GetUserAcc.presence.activities.length == 1){

          if(GetUserAcc.presence.activities[0].type != null && GetUserAcc.presence.activities[0].name != null && GetUserAcc.presence.activities[0].type != "CUSTOM_STATUS"){
            activity = "\n**"+GetUserAcc.presence.activities[0].type.charAt(0).toUpperCase() + GetUserAcc.presence.activities[0].type.slice(1).toLowerCase()+"**: "+GetUserAcc.presence.activities[0].name.toString();
          }else if(GetUserAcc.presence.activities[0].state != null && GetUserAcc.presence.activities[0].type == "CUSTOM_STATUS"){
            custom = "\n**Custom Status**: "+GetUserAcc.presence.activities[0].state;
          }
        }else if(GetUserAcc.presence.activities.length > 1){

          var LOOP = GetUserAcc.presence.activities;
          for(let e in LOOP){
            if(GetUserAcc.presence.activities[e].type != null && GetUserAcc.presence.activities[e].name != null && GetUserAcc.presence.activities[e].type != "CUSTOM_STATUS"){
              activity += "\n**"+GetUserAcc.presence.activities[e].type.charAt(0).toUpperCase()+GetUserAcc.presence.activities[e].type.slice(1).toLowerCase()+"**: "+GetUserAcc.presence.activities[e].name.toString();
            }else if(GetUserAcc.presence.activities[e].state != null && GetUserAcc.presence.activities[e].type == "CUSTOM_STATUS"){
              custom = "\n**Custom Status**: "+GetUserAcc.presence.activities[e].state;
            }
          }
        }

        var display = new Discord.MessageEmbed().setColor("#7289d9").setTitle(" ").setDescription("**Username**: "+username+"\n**Discriminator**: "+disc+"\n**Snowflake**: "+snow+"\n**Status**: "+status+activity+custom+"\n**User Since**: "+account_age).setColor(accStatusColor[GetUserAcc.presence.status]).setThumbnail(pfp).setFooter("Using discord for "+GetUserAcc.presence.clientStatus);

        return $channel.send(display);
      }catch(err){
        
        return $channel.send("Sorry! I couldn't find that user, I may not be in a server with them.")
      }
    
    }else if($cmnd === "poll"){
      if($member.hasPermission("MANAGE_MESSAGES") === false){ // check if user is allowed to do that. Why is it the MANAGE_MESSAGES permission? ...I do NOT know.
        return $channel.send("You do not have the necessary permissions for that!");
      }

      if(Configs[Guild.id]["channels"][$channel.id]["activepoll"] === true) return $channel.send("There is already a poll in this channel!");
        if(!words[1]) return $channel.send("You're forgetting part of that Command!");
        var PollHeaders = ["Vote-y McVoterson","It's time to settle this...","I want a fair trial, gentlemen.","August 18th, 1920","I love democracy"]; // add some variatey      
        let selectedHeader = PollHeaders[Math.round(Math.random()*PollHeaders.length)];

        let voteFor = "";
        var Votes = {};
        var Voters = [];
        let options = message.replace(/\, /g,",").split($pre+"poll ")[1].split(",");  // separate by commas instead
        
        if(!options[1]) return $channel.send("You need at least two things to vote for!");
        if(options[5]) return $channel.send("You can only have up to 5 things to vote for!");

        Configs[Guild.id]["channels"][$channel.id]["activepoll"] = true;  // so that another poll can not be made in the same channel

        for(let n = 0; n < options.length; n++){
          if(n === options.length-1 && words[words.length-1].replace(/\D/g,"") === words[words.length-1] && !words[words.length-1].endsWith(",") ){
            let crazySplit = options[n].split(" "+options[n].split(" ")[options[n].split(" ").length-1])[0];
            
            Votes[crazySplit.toLowerCase()] = 0; 
            voteFor += crazySplit+"\n";

            break;
          }else if(n === 0 && options[0].startsWith("\"") && options[0].endsWith("\"")){
            selectedHeader = options[0].split("\"")[1];
            
            continue;
          }
          Votes[options[n].toLowerCase()] = 0; // lowercase only makes it easier.
          voteFor += options[n]+"\n";
        }
        
        $channel.send( new Discord.MessageEmbed().setColor("#7289d9").setTitle(selectedHeader).setDescription(voteFor).addField("How to vote?","Use "+$pre+"vote <item or number>")); // annoucement! announcement!

        const isAVote = newMsg => newMsg.content.startsWith($pre+"vote"); // what to look for when getting commands
        
        let countdownTimer = 30000; // 30 seconds to vote

        if(words[words.length-1].replace(/\D/g,"") === words[words.length-1] && !words[words.length-1].endsWith(",") ) countdownTimer = Number(words[words.length-1])*1000; // if remove all letters is still itself and the last word wasn't anticipating another variable then it's probably a number & a timer. Multiply by 1000 to convert to seconds


        let GetIt = $channel.createMessageCollector(isAVote, {time: countdownTimer});


        GetIt.on("collect",async recievedMSG => { // collection, A.K.A message getter
        Configs[Guild.id]["channels"][$channel.id]["activepoll"] = false;
          if( Voters.includes(recievedMSG.author.toString()) ){  // if the sender's ID has already been sent
            let StopThisMans = await $channel.send("You already voted for this Poll!");
            setTimeout(() => {
              StopThisMans.delete();
            },2000);
          }else{
            if(recievedMSG.content.split($pre+"vote ")[1].toLowerCase() in Votes){  // is it voteable?
              Votes[recievedMSG.content.split($pre+"vote ")[1].toLowerCase()] += 1;  // lowercase
              $channel.send("Vote added!");
              Voters.push(recievedMSG.author.toString()); // add them to an array so they can't vote again
            }else if(Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase()) != NaN && Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase())%1 == 0){  // is it a number
              if(Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase()) > options.length){
                return $channel.send(`That is ${Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase())-options.length} higher than the max!`);
              }else if(Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase()) <= 0){
                return $channel.send("That is too low!");
              }else{
                let findTheThing = Object.keys(Votes)[Number(recievedMSG.content.split($pre+"vote ")[1].toLowerCase())-1];
                Votes[ findTheThing ] += 1;  // lowercase
                $channel.send("Vote added!");
                Voters.push(recievedMSG.author.toString()); // add them to an array so they can't vote again
              }
            }else{
              $channel.send("'"+recievedMSG.content.split($pre+"vote ")[1]+"' is not an option!"); // if you try to vote for failure when it's not someting you can vote for... heh.
            }
          }
        });

        GetIt.on("end",async collection => {  // the collection(message getter) finishes it's 30s timer
          if(Voters.length <= 0){
            Configs[Guild.id]["channels"][$channel.id]["activepoll"] = false; // allows for more polls!
            let oof = await $channel.send("**Poll timed out.** No one voted.");
            setTimeout(() => {
              oof.delete();
            },6969);
            return;
          }
          let Entries = Object.entries(Votes);
          let toReturn = "";
          Entries.forEach(e => {
            toReturn += e[0]+": "+(e[1]/Voters.length)*100+"%\n";
          });
          return $channel.send( new Discord.MessageEmbed().setColor("#7289d9").setTitle("Final Results for the Poll:").setDescription(toReturn).setFooter(Voters.length+" people voted") );
          Configs[Guild.id]["channels"][$channel.id]["activepoll"] = false; // allows for more polls!
        });

      return;
    
    }else if($cmnd === "nickname" || $cmnd === "nick"){
      if(Configs[recievedmessage.guild.id]["config"]["nickname"] === "disabled" && $member.hasPermission("MANAGE_NICKNAMES") === false){
        return $channel.send("An admin has disabled these commands!");
      }

      if(recievedmessage.mentions.members.first() && $member.hasPermission("CHANGE_NICKNAME") === false || recievedmessage.mentions.members.first() && $member.hasPermission("MANAGE_NICKNAMES") === false){
        return $channel.send("You do not have the necessary permissions for that!");
      }else if(Guild.me.hasPermission("MANAGE_NICKNAMES") === false){
        return $channel.send("I do not have the necessary permissions for that.\nI need the `MANAGE_NICKNAMES` permission");
      }


      var toChangeNick = recievedmessage.mentions.members.first() || recievedmessage.member;
      var newNick = "";

      for(let j = 1; j < words.length; j++){
        if(words[1] === $cmnd){j++}
        if(words[j].startsWith("<@!") && words[j].endsWith(">") && words[j].length === 22){}else{
          newNick += words[j];
          if(j < words.length){newNick+=" ";}
        }
      }

      
      toChangeNick.setNickname( newNick )
        .then(e => {
          return $channel.send("**Sucessfully nicknamed!**");
        })
        .catch(err => {
          if(err != "DiscordAPIError: Missing Permissions") throw e;
          return $channel.send("I can not change the nickname of this user!");
        });
      

      return;
    }else if($cmnd === "embed"){
      if(Configs["config"]["embeds"] == "disabled" && $member.hasPermission("ADMINISTRATOR") === false){return $channel.send("An Admin has disabled this command");}
      var titles = [];
      var descriptions = [];
      var color = "#7289d9";
      var footer = "";

      let ReturnEmbed = new Discord.MessageEmbed().setColor("#7289d9");

      let splitTitle = message.split("[");
      let splitDescription = message.split("{");

      if(splitTitle.length < 0) return $channel.send("Please add at least one title");
      if(splitDescription.length < 0) return $channel.send("Please add at least one description"); 


      for(var x = 1; x < splitTitle.length; x++){
        titles[x-1] = splitTitle[x].split("]")[0];
        descriptions[x-1] = "*Empty Field*";
      }
      for(var x = 1; x < splitDescription.length; x++){
        descriptions[x-1] = splitDescription[x].split("}")[0];
      }
      
      if(message.indexOf("(") !== -1) footer = message.split("(")[message.split("(").length-1].split(")")[0];
      if(message.indexOf("#") !== -1 && message.split("#")[1].split(" ")[0].length === 6)color = "#"+message.split("#")[1].slice(-6);

      ReturnEmbed.setTitle(titles[0]).setDescription(descriptions[0]);

      for(let e = 1; e < titles.length; e++){
        ReturnEmbed.addField(titles[e],descriptions[e]);
      }
      
      ReturnEmbed.setColor(color);
      ReturnEmbed.setFooter(footer);
      return $channel.send(ReturnEmbed);
    }
  }else if($cmnd in _commands["ptoe"]){

    ////////////////////////////
    ////////////////////////////
    ////  Periodic Table of Element commands
    ////////////////////////////
    ////////////////////////////
    console.log("Ran: Periodic - Server: "+Guild.name);

    if(Configs[recievedmessage.guild.id]["categories"]["ptoe"] === "disabled")return $channel.send("An admin has disabled these commands!");

      if($cmnd === "periodic" || $cmnd === "periodictable" || $cmnd === "pt"){
        if(!words[1])return $channel.send("Here is the Periodic Table of Elements: ",{files: ["https://i.imgur.com/rzoOEEY.jpg"]});
        
        let element = false;

        // the github is updated, I wouldn't know when it needs to be updated. So pulling from the github would be smarter(auto updates :o)
        Request({
          url: "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json",
          json: true
        }, function(error, response, body){

          if(!error && response.statusCode === 200){
            table = body["elements"];

            if(!isNaN(Number(words[1]))){ // check if it can be translated to a number properly, if not, look for the name/symbol
              elems = Number(words[1]);
              if(elems > table.length) return $channel.send("Too large! The periodic table stops at "+table.length-1);
              if(elems < 1) return $channel.send("Too small! The periodic table starts at 1");
              element = new Discord.MessageEmbed().setColor("#7289d9").setTitle(table[elems-1]["name"]+" - #"+elems).setDescription("Symbol: "+table[elems-1]["symbol"]+"\nAtomic Weight: "+table[elems-1]["atomic_mass"]).addField("Discovery","Discovered by "+table[elems-1]["discovered_by"]);
            }else{
              for(var elems = 0; elems < table.length; elems++){
                if(words[1].toLowerCase() == table[elems]["name"].toLowerCase() || words[1].toLowerCase() == table[elems]["symbol"].toLowerCase()){
                  element = new Discord.MessageEmbed().setColor("#7289d9").setTitle(table[elems]["name"]+" - #"+(elems+1)).setDescription("Symbol: "+table[elems]["symbol"]+"\nAtomic Weight: "+table[elems]["atomic_mass"]).addField("Discovery","Discovered by "+table[elems]["discovered_by"]);
                  break;
                }
              }
            }

            // sends the element
            if(element === false){
              return $channel.send("I can't seem to find that element");
            }else{
              return $channel.send(element);
            }

          }
        });
      }
    

  }else if($cmnd in _commands["fun"]){
    if(Configs[recievedmessage.guild.id]["categories"]["fun"] === "disabled")return $channel.send("An admin has disabled these commands!");   
    ////////////////////////////
    ////////////////////////////
    ////  Fun Commands for fun
    ////////////////////////////
    ////////////////////////////

    console.log("Ran: Fun - Server: "+Guild.name)

    var FooterTitle;

    if($cmnd === "respect" || $cmnd == "F"){
      Configs[Guild.id]["channels"][$channel.id] = {}
      if(Configs[Guild.id]["channels"][$channel.id]["activepoll"] === true){$channel.send("Can not do that right now"); return;}
      let thing = message.split($cmnd+" ")[1] || "";  // everything after the command
      $channel.send("Press F to pay respects for \""+thing+"\"");

      let respecters = [];
      let count = 0;

      const isRespecting = msg => msg.content;
      let ReSPECt = $channel.createMessageCollector(isRespecting, {time: 15000});  // 15 second window

      Configs[Guild.id]["channels"][$channel.id]["activepoll"] = true;

      ReSPECt.on("collect",recievedMSG => { // collection, A.K.A message getter
        if( respecters.includes(recievedMSG.author.toString()) ){  // if the sender's ID has already been sent
        }else{
          if(recievedMSG.content.toLowerCase() === "f" || recievedMSG.content.startsWith("F ") || recievedMSG.content.startsWith("f ")){ // is the first word in votes?
            respecters += recievedMSG.author.toString();
            count++;
            $channel.send("**"+recievedMSG.member.displayName+"** paid their respects");
            recievedMSG.delete();
          }
        }
      });


        ReSPECt.on("end",collection => {  // finish the 15s timer
          $channel.send( count +" people paid their respects for "+thing );
          Configs[Guild.id]["channels"][$channel.id]["activepoll"] = false; // undo the lock
        });
      return;
      
    }else if($cmnd === "flip"){
      let flipcoin = Math.round(Math.random()*1); // which would make more sense? random 0 or 1; or random 1-100
      if(flipcoin == 1){
        return $channel.send("It's Heads!");
      }else if(flipcoin == 0){
        return $channel.send("It's Tails!");
      }else{
        return $channel.send("It landed on.. it's side?");
      }
      return;
    }else if($cmnd === "random" || $cmnd === "rand"){
      let First = false, Second = false;  // false by default because ifs check for these
      if(words[1]) First = Number(words[1].replace(/\D/gi,""));
      if(words[2]) Second = Number(words[2].replace(/\D/gi,""));
      
      if(!First || First <= 1 && !Second){$channel.send(Math.random()); return;} // No first or first is too low; means 0-1
      if(First && !Second && First > 1){$channel.send(Math.round(Math.random()*First)); return;}  // only first is present and is greater than 1
      if(First && Second && Math.ceil(Second)-Math.floor(First) <= 1){$channel.send(Math.random()*(Math.ceil(Second) - Math.floor(First))+Math.floor(First)); return;}
      if(First && Second){$channel.send(Math.round(Math.random()*(Second-First)+First)); return;}
    
    }else if($cmnd == "qr"){
      if(Guild.me.hasPermission("ATTACH_FILES") === false){
        return $channel.send("I do not have the necessary permissions for that.\nI need the `Attach Files` permission");
      }
      FooterTitle = "QR Codes generated by qrcode";
      if(!words[1] && recievedmessage.attachments.size <= 0) return $channel.send("You're forgetting to add some text to convert to QR!");
      if(recievedmessage.attachments.size > 1) return $channel.send("You can only turn one image into a QR code");
      if(recievedmessage.attachments.size > 1) return $channel.send("You can not turn images into QR Codes");


      var toQR = "";
      for(var e=1; e < words.length; e++){
        if(e >= words.length-1){
          toQR += words[e];
        }else{
          toQR += words[e]+" ";
        }
      }

      if(toQR === `"We're no strangers to love."`) toQR = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
      
      QRCode.toFile("image/QRcode.png", toQR, {errorCorrectionLevel: "H"}, function(err){
        if(err) throw err;  
        
        var attachment = new Discord.MessageAttachment("./image/QRcode.png", "QRcode.png");
        var titles = ["Here's your QR Code!","Here you go!","[QR Code Generated]","","Quirky QRs!","Sponsored by Squares","Denso Wave, 1994",""];  // I want empty title to be more likely than just 1 in X, so I'd say ratio of 1 in 4
        let selectTitle = titles[Math.round(Math.random()*titles.length-1)];
        
        return $channel.send(new Discord.MessageEmbed().setColor("#7289d9").setTitle(selectTitle).setDescription("").attachFiles(attachment).setImage("attachment://QRcode.png").setFooter(FooterTitle));

      
      });

    }

  }else if($cmnd in _commands["image"]){  // if the command is the math kind, special case for root symbol
    if(Configs[recievedmessage.guild.id]["categories"]["image"] === "disabled")return $channel.send("An admin has disabled these commands!");

    ////////////////////////////
    ////////////////////////////
    ////  Image Commands
    ////////////////////////////
    ////////////////////////////
    console.log("Ran: Image - Server: "+Guild.name);


    var FooterTitle = "Image manipulation provided by jimp";

    if(Guild.me.hasPermission("ATTACH_FILES") === false){
      return $channel.send("I do not have the necessary permissions for that.\nI need the `Attach Files` permission");
    }

    if(recievedmessage.attachments.size <= 0) {
      return $channel.send("You need to attach an image!");
    }else if(recievedmessage.attachments.size > 1){
      return $channel.send("Don't attach more than one image!");
    }


    var fileType = Images().name.split(".")[Images().name.split(".").length-1]; // gets file type, such as png or jpeg
    if(fileType == "gif")return $channel.send("I can't accept gifs"); // literally, idk if it's cause of the site i'm using to program, or if JIMP just doesn't except gifs. But it doesn't work
    if($cmnd === "image-data" || $cmnd === "data"){
      
      return $channel.send(Embed("Image Data","Width: "+Images().width+"px\nHeight: "+Images().height+"px\nSize: "+Images().size+" bytes")[1]); // some stuff built into the discord API 
    
    }else if($cmnd === "grey" || $cmnd === "greyscale"){
      JIMP.read(Images().url).then(file => {
        file
          .greyscale()
          .write("image/image_manipulation."+fileType);   

        return $channel.send(ImageEmbed("Greyscaled colors"));
      }).catch(err => {
        if(err)throw err;
      });
      
    }else if($cmnd === "invert"){
      
      JIMP.read(Images().url).then(file => {
        file
          .invert()
          .write("image/image_manipulation."+fileType);

        return $channel.send(ImageEmbed("Inverted colors"));
      }).catch(err => {
        if(err)throw err;
      });

    }else if($cmnd === "contrast"){
      var intensity = Number(words[1]) || 50;
      if(intensity == "NaN" || intensity == NaN || typeof intensity == "NaN" || intensity.toString() == "NaN") return $channel.send("Please enter a valid number");
      if(intensity > 100)return $channel.send("Contrast can not be higher than 100");
      if(intensity < 0) return $channel.send("Contrast can not be lower than 0");

      intensity = (intensity-50)/100; // actual values are -1 to +1 so the math here is required

      JIMP.read(Images().url).then(file => {
        file
          .contrast(intensity)
          .write("image/image_manipulation."+fileType);

        return $channel.send(ImageEmbed("Contrasted colors"));
      }).catch(err => {
        if(err)throw err;
      });

    }else if($cmnd === "brightness" || $cmnd === "light"){
      var intensity = Number(words[1]) || 50;
      if(intensity == "NaN" || intensity == NaN || typeof intensity == "NaN" || intensity.toString() == "NaN") return $channel.send("Please enter a valid number");
      if(intensity > 100)return $channel.send("Brightness can not be higher than 100");
      if(intensity < 0) return $channel.send("Brightness can not be lower than 0");

      intensity = setToScale(intensity);

      JIMP.read(Images().url).then(file => {
        file
          .brightness(intensity)
          .write("image/image_manipulation."+fileType);

        return $channel.send(ImageEmbed("Changed Brightness"));
      }).catch(err => {
        if(err)throw err;
      });

    }else if($cmnd === "mirror"){
      let directions = [false,false];
      if(!words[1]) directions = [true,false]
      if(words[1] == "horizontal" || words[1] == "side" || words[2] == "horizontal" || words[2] == "side")directions[0] = true;
      if(words[1] == "vertical" || words[1] == "top" || words[2] == "vertical" || words[2] == "top")directions[1] = true;

      JIMP.read(Images().url).then(file => {
        file
          .flip(directions[0],directions[1])
          .write("image/image_manipulation."+fileType);

        return $channel.send(ImageEmbed("Flipped directions"));
      }).catch(err => {
        if(err)throw err;
      });
    
    }else if($cmnd === "crop"){
      if(!words[4]){return $channel.send("You're forgetting one of the 4 necessary values!");}
      var x = Number(words[1]);
      var y = Number(words[2]);
      var w = Number(words[3]);
      var h = Number(words[4]);
      
      JIMP.read(Images().url).then(file => {
        file
          .crop(x,y,w,h)
          .write("image/image_manipulation."+fileType);
        return $channel.send(ImageEmbed("Cropped image"));
      }).catch(err => {
        if(err)throw err;
      });

    }else if($cmnd === "rotate"){
      var degree = Number(words[1]);
      if(degree == "NaN" || degree == NaN || typeof degree == "NaN" || degree.toString() == "NaN") return $channel.send("Please enter a valid number");
      
      JIMP.read(Images().url).then(file => {
        file
          .rotate(degree)
          .write("image/image_manipulation."+fileType);

        return $channel.send(ImageEmbed("Rotated image"));
      }).catch(err => {
        if(err)throw err;
      });
    
    }else if($cmnd === "blur"){
      var intensity = Number(words[1]) || 5;
      if(intensity == "NaN" || intensity == NaN || typeof intensity == "NaN" || intensity.toString() == "NaN") return $channel.send("Please enter a valid number");
      if(intensity > 100)return $channel.send("Blur can not be higher than 100");
      if(intensity < 0) return $channel.send("Blur can not be lower than 0");

      JIMP.read(Images().url).then(file => {
        file
          .blur(intensity)
          .write("image/image_manipulation."+fileType);

        return $channel.send(ImageEmbed("Blurred image"));
      }).catch(err => {
        if(err)throw err;
      });

    }else if($cmnd === "pixelate" || $cmnd === "pixel"){
      var intensity = Number(words[1]) || 3;
      if(intensity == "NaN" || intensity == NaN || typeof intensity == "NaN" || intensity.toString() == "NaN") return $channel.send("Please enter a valid number");
      if(intensity > 200)return $channel.send("Brightness can not be higher than 200");
      if(intensity < 0) return $channel.send("Brightness can not be lower than 0");

      JIMP.read(Images().url).then(file => {
        file
          .pixelate(intensity,0,0,Images().width,Images().height)
          .write("image/image_manipulation."+fileType);

        return $channel.send(ImageEmbed("Pixelated image"));
      }).catch(err => {
        if(err)throw err;
      });
    
    }


    function Images(val){
      val = val || 0;
      var INFO = recievedmessage.attachments.array()[val];
      return INFO;
    }

    function ImageEmbed(desc){
      return new Discord.MessageEmbed().setColor("#7289d9").setTitle("Image Manipulation").setDescription(desc).attachFiles(new Discord.MessageAttachment("./image/image_manipulation."+fileType, "image_manipulation."+fileType)).setImage("attachment://image_manipulation."+fileType).setFooter(FooterTitle);
    }


  }
});

bot.on("guildMemberAdd", member => {
  if(member.guild.me.hasPermission("MANAGE_ROLES") === false && member.guild.me.hasPermission("ADMINISTRATOR") === false){return;}  // can't do it so nevermind
  if(Configs[member.guild.id]["config"]["autorole"]["type"] !== "disabled"){  // if autorole is set
    try{ var TestIfReal = member.guild.roles.get(Configs[member.guild.id]["config"]["autorole"]["id"]) }catch(err){if(err) return (Configs[member.guild.id]["config"]["autorole"]["id"] = "disabled");}  // disables autorole if the set role can't be found
    member.roles.add(Configs[member.guild.id]["config"]["autorole"]["id"]);
    return console.log("Gave "+member.id+" the auto-role "+Configs[member.guild.id]["config"]["autorole"]["id"]+" in server <#"+member.guild.id+">");
  }
});


bot.on("guildCreate", guild => {  // bot is added to a new server
  console.log("\x1b[42m"+"Joined "+guild.name);
  Configs[guild.id] = {
    "name": guild.name,
    "prefix": "$",
    "config": {
      "autorole": {
        "type": "disabled",
        "id": null
      },
      "automagic": "disabled",
      "nickname": "enabled",
      "qr-codes": "enabled",
      "embeds": "enabled"
    },
    "categories": {
      "other": "enabled",
      "fun": "enabled"
    },
    "channels": {
      
    }
  }
  
  CACHED_GUILDS++;
  bot.user.setActivity("$commands in "+CACHED_GUILDS+" servers",{type:1});
  global.discord.functions.SaveJSON();
});


bot.on("guildDelete", guild => {  // bot is removed from server

  Configs[guild.id] = null; // clear that server's information.
  SaveJSON(Configs);
});



////////////////////////////
////////////////////////////
////  Functions
////////////////////////////
////////////////////////////

// Writes to the JSON file for discord servers
function SaveJSON(srcJSON){
  srcJSON = srcJSON || require("./configuration.json");
  Fs.writeFile("./configuration.json", JSON.stringify(srcJSON), (err) => {
    if(err) throw err;
  });
}

// Do math :D
function SolveEquation(input){
  try{
    input = input.replace(/\\/g,"")  // remove back slashes(which help ignore \* \*)
      .replace(/,/g,"") // remove commas(used by humans for big numbers)
      .replace(/x/g,"*")
      .replace(/\*\*/g,"^")
      .replace(/÷/gi, "/")
      .replace(/\[/g,"(") // the following four are commonly used in math, but algebra.js doesn't accept them.
      .replace(/\]/g,")")
      .replace(/\{/g,"(")
      .replace(/\}/g,")") 
      .replace(/ /g,"");  // make it one message
    
    var toReturn = Algebra.parse(input);
    if(toReturn.toString().includes("/")){
      return Number(toReturn.toString().split("/")[0]) / Number(toReturn.toString().split("/")[1]);
    }

    return toReturn;
  }catch(err){
    console.error(err);
    return false;
  }

}

// swaps the location of numbers on a scale of 1-100
function setToScale(number){
  // 50 will be 0
  // 100 will be 1
  // 0 will be -1
  if(number >= 50) return (number-50)/100;
  if(number < 50) return (number-100)/100;
}

function factorialize(num) {
  var result = num;
  if(num === 0 || num === 1)return 1; 
    while (num > 1) { 
      num--;
      result *= num;
    }
  return result;
}

function EnglishToMath(input){
  var output = input;

  if(output.startsWith("<@!661249786350927892>"))output = output.replace(/\<\@\!661249786350927892\>/,"");
  if(output.startsWith(" ")){
    for(var e = 0; e < output.length; e++){
      if(e !== " "){
        output = output.substr(e+1);
        break;
      }
    }
  }

  output = output.toLowerCase().replace(/\\\*/g,"*");
  if(!output.includes("+") && !output.includes("-") && !output.includes("*") && !output.includes("/") && !output.includes("^") && !output.includes("%") && !output.includes("0") && !output.includes("1") && !output.includes("2") && !output.includes("3") && !output.includes("4") && !output.includes("5") && !output.includes("6") && !output.includes("7") && !output.includes("8") && !output.includes("9") && !output.includes("="))return;

  if(output.startsWith("what is"))output = change(output,"what is","");

  var variable_priority = "NXYZABCDEFGHIJKLMOPQRSTUVW".split(""); // the order in which unnamed variables should be named
  output = change(output,"?","");
  var toReturnList = {
    input: output,
    interpret: null,
    answer: "unknown"
  }
  var solveBy;
  var variable;
  var splitter; // only used in ratio problems


  /* Square roots like √(25) */
  for(var e = 0; e < output.length; e++){
    if(output[e] == "√" && output[e+1] == "("){
      e++;
      for(var j = e; j < output.length; j++){
        if(output[j] == ")"){

          let squarerooted = Algebra.parse(output.substr(e+1,j-1-e));
          output = output.substr(0, e-1) + Math.sqrt(squarerooted.constants[0].numer/squarerooted.constants[0].denom) + output.substr(j+1);
          
          break;
        }
      }
      break;
    }
  }

  /* Detect if the answer is a variable */
  // had to move this higher up in the function, messed things up when it had a lower priority
  if(output.split(". ").includes("find the number") || output.split("; ").includes("find the number") || output.split(", ").includes("find the number") || output.split(". ").includes("what is the number") || output.split("; ").includes("what is the number") || output.split(", ").includes("what is the number")){
    
    solveBy = "variable";
    output = change(output,[". what is the number.",". what is the number","; what is the number.","; what is the number",", what is the number.",", what is the number","what is the number.","what is the number",". find the number.",". find the number","find the number.","; find the number.","; find the number","find the number.",", find the number."," find the number","find the number.","find the number"],"");
  
  
  }else if(output.startsWith("the ratio of")){
    // This type of equation is solved in this `if` function and nothing external
    // the ratio of x to y in z is number to number, if there were number x, how many y were there
    
    solveBy = "ratio";
    if(output.split(" ").includes(splitter = "in") || output.split(" ").includes(splitter = "was")){ // variables in this if function prevents the need of more ifs later on
      variable = {
        variables: [{},{}] // the ratio variable names and values
      }
      variable["variables"][0][output.split("the ratio of ")[1].split(" to")[0].toString()] = output.split("the ratio of")[1].split(splitter)[1].split("to")[0]
      variable["variables"][1][output.split("the ratio of ")[1].split(" to ")[1].split(" "+splitter)[0]] = output.split("the ratio of")[1].split(splitter)[1].split("to")[1].split(", ")[0] || output.split("the ratio of")[1].split(splitter)[1].split("to")[1].split("; ")[0] || output.split("the ratio of")[1].split(splitter)[1].split("to")[1].split(". ")[0]
      let check = false;

      if(input == output.replace(/ /g,""))return false;

      if(output.split("how many ")[1].split(" ").includes(check = Object.keys(variable["variables"][0])[0]) || output.split("how many ")[1].split(" ").includes(check = Object.keys(variable["variables"][1])[0])){
        if(Object.keys(variable["variables"][0])[0] == check){
          toReturnList.interpret = change(Object.values(variable["variables"][0])[0]+"/"+Object.values(variable["variables"][1])[0]+"="+check.charAt(0)+"/"+output.split("if there were ")[1].split(" ")[0]," ","");
          toReturnList.answer = check+" = "+Algebra.parse(Object.values(variable["variables"][0])[0]+"/"+Object.values(variable["variables"][1])[0]+"="+check.charAt(0)+"/"+output.split("if there were ")[1].split(" ")[0]).solveFor(check.charAt(0));
        }else{
          toReturnList.interpret = change(Object.values(variable["variables"][1])[0]+"/"+Object.values(variable["variables"][0])[0]+"="+check.charAt(0)+"/"+output.split("if there were ")[1].split(" ")[0]," ","");
          toReturnList.answer = check+" = "+Algebra.parse(Object.values(variable["variables"][1])[0]+"/"+Object.values(variable["variables"][0])[0]+"="+check.charAt(0)+"/"+output.split("if there were ")[1].split(" ")[0]).solveFor(check.charAt(0));
        }
      }else{
        toReturnList.answer = output.split("how many ")[1].split(" ")[0]+" was not included in the equation"; 
      }
    }

    return toReturnList;

  }else if(output.startsWith("evaluate")){
    //evaluate [equation] if X is number and E is number

    solveBy = "eval";
    variable = {
      variables: []
    }

    output = change(output,["equals","the result is","answers","is"],"=");
    output = change(output," ","");

    let temp,tempOutput;
    if(output.split("evaluate")[1].split(temp = "if")[1].includes("and") || output.split("evaluate")[1].split(temp = "when")[1].includes("and")){
      tempOutput = output.split("evaluate")[1].split(temp)[0]
      for(var e = 0; e < output.split("evaluate")[1].split(temp)[1].split("and").length; e++){
        variable.variables[e] = {};
        variable.variables[e][output.split("evaluate")[1].split(temp)[1].split("and")[e].split("=")[0]] = Number(output.split("evaluate")[1].split(temp)[1].split("and")[e].split("=")[1]);
      }
    }else if(output.split("evaluate")[1].split(temp = "if")[1] || output.split("evaluate")[1].split(temp = "when")[1]){
      tempOutput = output.split("evaluate")[1].split(temp)[0];
      variable.variables[0] = {};
      variable.variables[0][output.split("evaluate")[1].split(temp)[1].split("and")[0].split("=")[0]] = Number(output.split("evaluate")[1].split(temp)[1].split("and")[0].split("=")[1]);
    }

    output = tempOutput;
  }else if(output.startsWith("if f(") || output.startsWith("f(")){
    var variables = output.split("f(")[1].split(")")[0].replace(/ /g,"").split(",");
    
    output = change(output.split("=")[1].split(",")[0],variables,output.split("f(")[2].split(")")[0].replace(/ /g,"").split(","));
    output = output.split(",")[0].split(";")[0].split("then")[0].split("when")[0].split("what is")[0]; // just covers all basis, if not "... x+2, ..." it'll get "... x+2; ..." then "... x+2 then what is ..." and finally "... x+2 what is ..."
    output = change(output," ","");
    toReturnList.interpret = output;

    if(input == output.replace(/ /g,""))return false;

    if(Algebra.parse(output).constants[0] == undefined){
      toReturnList.answer = 0;
    }else if(Algebra.parse(output).constants[0].denom == 1){
      toReturnList.answer = Algebra.parse(output).constants[0].numer;
    }else{
      toReturnList.answer = Algebra.parse(output).constants[0].numer+"/"+Algebra.parse(output).constants[0].denom;
    }
    
    return toReturnList;
  }

  output = change(output,["percent","%"],"*0.01");

  if(output.startsWith("solve for")){
    solveBy = "variable";
    variable = output[10];
    output = output.substr(14)
    console.log(output);
  }


  /* Decides how the function will solve the equation at the end */
  for(var e = 0; e < output.split("a number").length; e++){
    output = output.replace("a number",variable_priority[e]); // only want to change the first accuorance
    output = change(output,"the number",variable_priority[e]); // ^likewise
    if(solveBy == "variable"){
      variable = variable_priority[e];
    }
    output = change(output,"it's",variable_priority[e]);
  }


  let of_and = output.split(" ").indexOf("the");
  if(of_and > -1 && output.split(" ")[of_and+2] == "of" && ["sum","product","difference","quotient"].includes(output.split(" ")[of_and+1])){
    let operation;
    let synonyms = {
      "sum": "+",
      "difference": "_",
      "product": "*",
      "quotient": "/"
    }
    operation = synonyms[output.split(" ")[of_and+1]];
    let thisLongThing = output.split("the "+output.split(" ")[of_and+1]+" of")[1].split(" ");
    thisLongThing[thisLongThing.indexOf("and")+1] += ")";
    thisLongThing[thisLongThing.indexOf("and")] = operation;
    output = output.split("the "+output.split(" ")[of_and+1]+" of")[0]+"("+change(thisLongThing.toString(),","," ");
  }

  let powered = output.split(" ").indexOf("to");
  if(powered > -1 && output.split(" ")[powered+1] == "the" && output.split(" ")[powered+3] == "power"){
    let operation;
    
    output = change(output.split("to the ")[0]+"^"+output.split("to the ")[1].split("power")[0],["st","nd","rd","th"],"");
     
  }

  /* Converts words to operations and numbers */
  output = change(output, ["increased by"],"+");
  output = change(output, ["to the power of","**"],"^")
  output = change(output, "twice","2 * ");
  output = change(output, ["is doubled","doubled"],"*2"); // different order
  output = change(output, ["plus"],"+");
  output = change(output, ["minus","is decreased by","is reduced by","the opposite of","the opposite"],"-");
  output = change(output, ["times","of","multiplied by"],"*");
  output = change(output, ["divided by","over","÷"],"/");
  output = change(output, ["result of",","],"");
  output = change(output, ["equals","the result is","answers","is"],"=");


  if(output.includes("less than")){
    for(var j = output.indexOf("less than"); j > -1; j-=1){ 
      if(["=","+","-","/","*"].includes(output[j]) || j <= 0){
        console.log(output.substr(0,j)+"-"+output.substr(j+1,output.indexOf("less than")))
        return {
          input: input,
          interpret: "testing",
          answer: "check console"
        };
      }
    }
  }

  /* Handles situations like "is multiplied by 2" */
  for(var e = 0; e < output.length; e++){
    if(output[e] == "="){ // searches for an equals sign
      if(output[e+1] == "*" || output[e+1] == "/" || output[e+1] == "+" || output[e+1] == "-"){ // this is a check so it only finds the words "is [operation]" instead of EVERY equals sign
        for(var j = e-1; j > -1; j-=1){ // go backwards until finding another equals sign(one half or side of the equation) or the beginning of the equation
          if(output[j] == "=" || j <= 0){
            output = output.substr(0, e) +")"+ output.substr(e+1);  // closes off the paranthesis, errors go brr
            output = output.substr(0, j-1) +"("+ output.substr(j);
            break;
          }
        }
        break;
      }
    }
  }

  output = change(output,[" ","if","what is","the"],"");

  
  for(var i = 0; i < output.length; i++){
    if(variable_priority.includes(output[i])){
      solveBy = "variable";
      variable = variable_priority[0];
      break;
    }
  }

  output = output.replace(/\(\)/g,"");
  if(input == output.replace(/ /g,""))return false;
  toReturnList.interpret = output; // this is the interpretation; right here is the final step before finding the answer, where the input is converted to an equation.

  /* Answers */
  
  if(solveBy === "variable"){

    toReturnList.answer = variable+" = "+Algebra.parse(output).solveFor(variable);

  }else if(solveBy === "eval"){

    var expression = Algebra.parse(output);
    for(var e = 0; e < variable.variables.length; e++){
      expression = Algebra.parse(expression.toString()).eval(variable.variables[e]);  
    }

    // same as the thing below
    if(expression.constants[0] == undefined){
      toReturnList.answer = 0;
    }else if(expression.constants[0].denom == 1){
      toReturnList.answer = expression.constants[0].numer;
    }else{
      toReturnList.answer = expression.constants[0].numer+"/"+expression.constants[0].denom;
    }

  }else{
    if(Algebra.parse(output).constants[0] == undefined){
      toReturnList.answer = 0;
    }else if(Algebra.parse(output).constants[0].denom == 1){
      toReturnList.answer = Algebra.parse(output).constants[0].numer;
    }else{
      toReturnList.answer = Algebra.parse(output).constants[0].numer+"/"+Algebra.parse(output).constants[0].denom;
    }

  }

  toReturnList.interpret = toReturnList.interpret.replace(/\*/g,"\*"); // Discord's fancy message thing but instead of "decoding" it i'm "incoding" it
  return toReturnList;
}


function change(input,find,changeto){
  if(typeof find == "string"){
    if(typeof changeto == "string"){
      for(var y = 0; y < input.length; y++){
        input = input.replace(find,changeto);
      }
    }
  }else if(typeof find == "object"){
    if(typeof changeto == "string"){
      for(var x = 0; x < find.length; x++){
        for(var y = 0; y < input.length+1; y++){
          input = input.replace(find[x],changeto);
        }
      }
    }else if(typeof changeto == "object"){
      for(var x = 0; x < find.length; x++){
        if(x > changeto.length) return input;

        for(var y = 0; y < input.length+1; y++){
          input = input.replace(find[x],changeto[x]);
        }
      }
    }
  }
  return input;
}
