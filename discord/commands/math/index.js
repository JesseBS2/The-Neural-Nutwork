const algebra = require("algebra.js");
var Embed = global.discord.functions.CustomEmbed; // makes calling it easier
var SolveEquation = global.SolveEquation; // also easier

module.exports = function(ee){
  global.discord.debug("DISCORD: Ran /commands/math/index.js");
  
  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;

  if(ee){
    if(SolveEquation(ee) === false){$channel.send("Something went wrong!");return;};
    $channel.send( "> "+SolveEquation(ee) );
    return;
  }

  if($cmnd === "math" || $cmnd === "algebra"){
    if(!words[1]){$channel.send("You're forgetting part of that Command!"); return;}
    let toEquation = words[1]; // to be evaluated by algebra.js

    if(words.length > 1){
      for(let j = 2; j < words.length; j++){ //start at two because 0 is the command and 
        toEquation += " "+words[j]; 
      }
    }

    toEquation = toEquation.replace(/÷/gi,"/").replace(/\{/g,"(").replace(/\[/g,"(").replace(/\]/g,")").replace(/}/g,")").replace(" ","");

    if(SolveEquation(toEquation) === false){return;}{ // only send if it's not false
      let n = SolveEquation(toEquation);
      $channel.send( Embed("Algebra",toEquation)[0].field("Result",n)[1] );
    }
    return;

  }else if($cmnd === "root" || words[0].startsWith("√")){ // special case for the symbol type
    let num = Number(words[1]); // second word
    let index = Number(words[2]) || 2; // third word
    if(words[0].startsWith("√")){ num = Number(words[0].split("√")[1]); index = Number(words[1]) || 2;} // special case for the symbol
    
    let randomNonsensicalVariable = ["th","st","nd","rd","th","th","th","th","th","th"];
    let theEndingToTheNumber = randomNonsensicalVariable[Number(num.toString().charAt(num.toString().length-1))-2];  // not the most effeciant way, but aye. It works.

    try{
      $channel.send( Embed("Root","The "+index+""+theEndingToTheNumber+" root of "+num)[0].field("Result",Math.pow(num,1/index))[1] ); // x to power of y, but it's divide first so it's actually root
      return;
    }catch(e){
      console.log(e);
      $channel.send("Sorry, something went wrong!");
      return;
    }

  }else if($cmnd === "eval" || $cmnd === "evaluate"){

    if(!words[2]){$channel.send("You're forgetting part of that Command!"); return;}  
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

    let expr = algebra.parse(words[1]);
    let asEmbed = Embed("Evaluate","Evaluating "+words[1]+" when: "+nameForEveryVariableOccurence)[0].field("Result",expr.eval(obj))[1];

    $channel.send(asEmbed);
    return;

  }else if($cmnd === "area"){
    if(!words[1]){$channel.send("Area is the amount of 2D space that a shape takes up"); return;}
        
    if(words[1] == "square"){
      if(!words[2]){$channel.send("You're forgetting the height parameter!"); return;}
      if(!words[3]){$channel.send("You're forgetting the width parameter!"); return;}

      let math = Number(words[2]) * Number(words[3]);
      let x = Embed("Area of a square","Height: "+words[2]+" Width: "+words[3])[0].field("Formula","Width * Height")[0].field("Result",math+"²")[1];
      $channel.send(x)
      return;

    }else if(words[1] == "triangle"){
      if(!words[3]){$channel.send("You're forgetting the height parameter!"); return;}
      let math = Number(words[2]) * Number(words[3]);
      math = math/2;
      let x = Embed("Area of a triangle","Width: "+words[2]+" Height: "+words[3])[0].field("Formula","(Width * Height) ÷ 2")[0].field("Result",math+"²")[1];
      $channel.send(x)
      return;

    }else if(words[1] == "circle"){
      if(!words[2]){$channel.send("You're forgetting the radius parameter!"); return;}
      let r = Number(words[2])
      let math = 3.14159 * ( r**2 );
      
      let x = Embed("Area of a square","Radius: "+words[2])[0].field("Formula","Pi * (Radius^2)")[0].field("Result",math+"²")[1];
      $channel.send(x)
      return;
        
    }else{
      $channel.send(words[1]+" is not the name of 2D shape!");
      return;
    }

    return;
  }else if($cmnd === "volume"){
    if(!words[1]){$channel.send("Volume is the amount of space that an object takes up"); return;}
    if(words[1] == "cube" || words[1] == "cuboid"){
      if(!words[2]){$channel.send("You're forgetting the height parameter!"); return;}
      if(!words[3]){$channel.send("You're forgetting the width parameter!"); return;}
      if(!words[4]){$channel.send("You're forgetting the depth parameter!"); return;}

      let math = Number(words[2]) * Number(words[3]) * Number(words[4]);
      let x = Embed("Area of a square","Height: "+words[2]+" Width: "+words[3]," Depth: "+words[4])[0].field("Formula","Width * Height * Depth")[0].field("Result",math+"³")[1];
      $channel.send(x)
      return;
    }
  }

}