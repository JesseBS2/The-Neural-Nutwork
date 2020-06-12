const jimp = require("jimp");
var Embed = global.discord.functions.CustomEmbed;

var FooterTitle = "Image manipulation provided by JIMP";
module.exports = function(Client){
  var msg = global.discord.message.msg; // message content
  var $cmnd = global.discord.message.command;
  var $channel = global.discord.message.channel;
  var words = global.discord.message.words;

  global.discord.log("Ran /commands/image/index.js");

  if(msg.attachments.size <= 0) {
    return $channel.send("You need to attach an image!");
  }else if(msg.attachments.size > 1){
    return $channel.send("Don't attach more than one image!");
  }


  //console.log(Images());
  var fileType = Images().name.split(".")[Images().name.split(".").length-1]; // gets file type, such as png or jpeg

  if($cmnd === "image" || $cmnd === "image-data" || $cmnd === "data"){
    
    return $channel.send(Embed("Image Data","Width: "+Images().width+"px\nHeight: "+Images().height+"px\nSize: "+Images().size+" bytes")[1]); // some stuff built into the discord API 
  
  }else if($cmnd === "grey" || $cmnd === "greyscale"){
    jimp.read(Images().url).then(file => {
      file
        .greyscale()
        .write("discord/commands/image/image_manipulation."+fileType);   

      return $channel.send(ImageEmbed("Greyscaled colors"));
    }).catch(err => {
      if(err)throw err;
    });
    
  }else if($cmnd === "invert"){  
    
    jimp.read(Images().url).then(file => {
      file
        .invert()
        .write("discord/commands/image/image_manipulation."+fileType);

      return $channel.send(ImageEmbed("Inverted colors"));
    }).catch(err => {
      if(err)throw err;
    });

  }else if($cmnd === "mirror"){
    let directions = [false,false];
    if(words[1] == "horizontal" || words[1] == "side" || words[2] == "horizontal" || words[2] == "side")directions[0] = true;
    if(words[1] == "vertical" || words[1] == "top" || words[2] == "vertical" || words[2] == "top")directions[1] = true;

    jimp.read(Images().url).then(file => {
      file
        .flip(directions[0],directions[1])
        .write("discord/commands/image/image_manipulation."+fileType);

      return $channel.send(ImageEmbed("Flipped directions"));
    }).catch(err => {
      if(err)throw err;
    });
  
  }else if($cmnd === "blur"){
    var intensity = Number(words[1]) || 5;
    jimp.read(Images().url).then(file => {
      file
        .blur(intensity)
        .write("discord/commands/image/image_manipulation."+fileType);

      return $channel.send(ImageEmbed("Blurred image"));
    }).catch(err => {
      if(err)throw err;
    });

  }else if($cmnd === "pixelate" || $cmnd === "pixel"){ // as of now, this does not work
    var intensity = Number(words[1]) || 3;
    jimp.read(Images().url).then(file => {
      file
        .pixelate(intensity,0,0,Images().width,Images().height)
        .write("discord/commands/image/image_manipulation."+fileType);

      return $channel.send(ImageEmbed("Pixelated image"));
    }).catch(err => {
      if(err)throw err;
    });
  
  }else if($cmnd === "subtitle"){
    if(!words[1])return $channel.send("You're forgetting to add text!");
    var toSendMessage = "", endsInColor = false;
    if(words[words.length-1] === "!!WHITE" || words[words.length-1] === "!!BLACK")endsInColor = true;
    for(var e = 1; e < words.length; e++){
      if(e == words.length-1 && endsInColor === true) break;
      if(e == words.length-1) toSendMessage += words[e];
      toSendMessage += words[e]+" ";
    }

    
    var ImageWidth = Images().width, ImageHeight = Images().height, TextSizeH = ImageHeight/3, fontcolor = jimp.FONT_SANS_16_BLACK;
    
    if(words[words.length-1] == "!!WHITE"){
      fontcolor = jimp.FONT_SANS_16_WHITE;
    }else if(words[words.length-1] == "!!BLACK"){
      fontcolor = jimp.FONT_SANS_16_BLACK;
    }

    jimp.read(Images().url).then(file => {
      jimp.loadFont(fontcolor).then(font => {
        file
        .print(font, 0, ImageHeight-TextSizeH, {
              text: toSendMessage,
              alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
              alignmentY: jimp.VERTICAL_ALIGN_BOTTOM
            },
            ImageWidth, TextSizeH)
          .write("discord/commands/image/image_manipulation."+fileType); // prints 'Hello world!' on an image, middle and center-aligned, when x = 0 and y = 0
        return $channel.send(ImageEmbed("Added subtitles"));
      });
    });
  
  }


  function Images() {
    var INFO = msg.attachments.first();
    return INFO;
  }

  function ImageEmbed(desc){
    return Embed("Image Manipulation",desc)[0].setAttachment(new Client.MessageAttachment("./discord/commands/image/image_manipulation."+fileType, "image_manipulation."+fileType))[0].setPicture("attachment://image_manipulation."+fileType)[0].footer(FooterTitle)[1];
  }

}
