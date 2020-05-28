const algebra = require("algebra.js");
var Embed = global.discord.functions.CustomEmbed; // makes calling it easier
var SolveEquation = global.SolveEquation; // also easier


module.exports = async function(ee){
  global.discord.log("Ran /commands/math/index.js");
  
  let words = global.discord.message.words;
  let $channel = global.discord.message.channel;
  let $cmnd = global.discord.message.command;
  let $pre = global.discord.message.prefix;
  let message = global.discord.message.message;

  if(ee){ // should only occur when called in main.js
    if(SolveEquation(ee) === false) return $channel.send("Something went wrong!");
    return $channel.send( "> "+ Number(SolveEquation(ee)) ); 
  }

  if($cmnd === "math" || $cmnd === "algebra"){
    if(!words[1]) return $channel.send("You're forgetting part of that command!");
    let toEquation = words[1]; // to be evaluated by algebra.js

    if(words.length > 1){
      for(let j = 2; j < words.length; j++){ //start at two because 0 is the command and 
        toEquation += " "+words[j]; 
      }
    }

    toEquation = toEquation.replace(/÷/g,"/").replace(/\{/g,"(").replace(/\[/g,"(").replace(/\]/g,")").replace(/}/g,")").replace(/ /g,"");

    if(SolveEquation(toEquation) === false){return;}{ // only send if it's not false
      let n = SolveEquation( toEquation );
      return $channel.send( Embed("Algebra",toEquation.replace(/\*/g,"\*"))[0].field("Result",n)[1] );
    }

  }else if($cmnd === "root" || words[0].startsWith("√")){ // special case for the symbol type
    if(!words[1]) return $channel.send("You're forgetting part of that command!");
    let num = Number(words[1]); // second word
    let index = Number(words[2]) || 2; // third word
    if(words[0].startsWith("√")){ num = Number(words[0].split("√")[1]); index = Number(words[1]) || 2;} // special case for the symbol
    
    let randomNonsensicalVariable = ["th","st","nd","rd","th","th","th","th","th","th"];
    let theEndingToTheNumber = randomNonsensicalVariable[Number(num.toString().charAt(num.toString().length-1))-2];  // not the most effeciant way, but aye. It works.

    try{
      return $channel.send( Embed("Root","The "+index+""+theEndingToTheNumber+" root of "+num)[0].field("Result",Math.pow(num,1/index))[1] ); // x to power of y, but it's divide first so it's actually root
    }catch(e){
      console.log(e);
      return $channel.send("Sorry, something went wrong!");
    }

  }else if($cmnd === "eval" || $cmnd === "evaluate"){
    if(!words[2]){
      $channel.send("You're forgetting part of that command!");
      setTimeout(function(){
        e.delete();
        return;
      },1500);
    }  
    
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

    return $channel.send(asEmbed);

  }else if($cmnd === "area"){
    if(!words[1]) return $channel.send("Area is the amount of 2D space that a shape takes up");
        
    if(words[1] == "square"){
      if(!words[2]) return $channel.send("You're forgetting the height parameter!");
      if(!words[3]) return $channel.send("You're forgetting the width parameter!");

      let math = Number(words[2]) * Number(words[3]);
      let x = Embed("Area of a square","Height: "+words[2]+" Width: "+words[3])[0].field("Formula","Width * Height")[0].field("Result",math+"²")[1];
      return $channel.send(x);

    }else if(words[1] == "triangle"){
      if(!words[3]) return $channel.send("You're forgetting the height parameter!");
      let math = Number(words[2]) * Number(words[3]);
      math = math/2;
      let x = Embed("Area of a triangle","Width: "+words[2]+" Height: "+words[3])[0].field("Formula","(Width * Height) ÷ 2")[0].field("Result",math+"²")[1];
      return $channel.send(x);

    }else if(words[1] == "circle"){
      if(!words[2]) return $channel.send("You're forgetting the radius parameter!");
      let r = Number(words[2])
      let math = 3.14159 * ( r**2 );
      
      let x = Embed("Area of a square","Radius: "+words[2])[0][0].field("Formula","Pi * (Radius^2)")[0].field("Result",math+"²")[1];
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
      let x = Embed("Volume of a Cube","Height: "+words[2]+" Width: "+words[3]+" Depth: "+words[4])[0].field("Formula","Width * Height * Depth")[0].field("Result",math+"³")[1];
      
      return $channel.send(x);
    }else if(words[1] == "pyramid" || words[1] == "tetrahedron"){
      if(!words[2]) return $channel.send("You're forgetting the height parameter!");
      if(!words[3]) return $channel.send("You're forgetting the width parameter!");
      if(!words[4]) return $channel.send("You're forgetting the depth parameter!");
      
      let math = Number(words[2]) * Number(words[3]) * Number(words[4]);
      math = math/3;
      let x = Embed("Volume of a Tetrahedron","Height: "+words[2]+" Width: "+words[3]+" Depth: "+words[4])[0].field("Formula","(Width * Height * Depth) ÷ 3")[0].field("Result",math+"³")[1];
      return $channel.send(x);

    }else if(words[1] == "cylinder"){
      if(!words[2]) return $channel.send("You're forgetting the radius parameter!");
      if(!words[3]) return $channel.send("You're forgetting the height parameter!");
      
      let math = ( 3.14159 * (Number(words[2])**2) ) * Number(words[3]);
      
      let x = Embed("Volume of a Cylinder","Radius: "+words[2]+" Height: "+words[3])[0].field("Formula","[π * (Raidus^2) ] * Height")[0].field("Result",math+"³")[1];
      return $channel.send(x);

    }else if(words[1] == "sphere"){
      if(!words[2]) return $channel.send("You're forgetting the radius!");
      
      let math = (4/3)*3.14159*(Number(words[2])**3);

      let x = Embed("Volume of a Sphere","Radius: "+words[2])[0].field("Formula","(4/3) * π * (Raidus^3)")[0].field("Result",math+"³")[1];
      return $channel.send(x);
    }



  }else if($cmnd === "convert"){ // 100cm --> 1m, 3ft --> 1yd, 1.5 --> 1(1/2)
    if(!words[1]) return $channel.send("You're forgetting part of that command!");
    
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
      ug: 0.000001,
      mg: 0.001, //milligram
      cg: 0.01, //centigram
      dg: 0.1,
      g: 1, //gram
      dkg: 10,
      hg: 100,
      kg: 1000
    }
    let usDist = {
      // U.S. Customary Distances, based around inches
      cm: 2.54,
      "in.": 1, // in quotes because `in` is already an operator
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
      conversion = Embed("Convert "+A+" to "+B,"1"+AL+" is "+(metricDist[B]/metricDist[AL])+""+B)[0].field("Result", (AN * ( metricDist[AL] / metricDist[B] ) ).toString() + B)[1];
    }else if(AL in usDist && B in usDist && AL != B){
      conversion = Embed("Convert "+A+" to "+B,"1"+AL+" is "+(usDist[B]/usDist[AL])+""+B)[0].field("Result", (AN * ( usDist[AL] / usDist[B] ) ).toString() + B)[1];
    }else if(AL in usDist && B in metricDist){
      let calc = AN * ( ( usDist[AL] * 2.54 / metricDist[B]) / 100);
      //calc = calc.toFixed(4); // shortens the decimals to 4 places
      conversion = Embed("Convert "+A+" to "+B,"1"+AL+" is "+(calc/AN)+""+B)[0].field("Result", calc + B)[1];
    }else if(AL in metricDist && B in usDist){
      let calc = AN * ( ( metricDist[AL] / 0.01 ) / 2.54 ) / usDist[B];
      conversion = Embed("Convert "+A+" to "+B,"1"+AL+" is "+(calc/AN)+""+B)[0].field("Result", calc + B)[1];
    
    }else if(AL in metricMeas && B in metricMeas && AL != B){
      let calc = ( metricMeas[AL] / metricMeas[B] ) * AN; // bruh I'm soo jealous of the metirc system! It's so easy!
      conversion = Embed("Convert "+A+" to "+B,"1"+AL+" is "+(calc/AN)+""+B)[0].field("Result", calc+B)[1];
    }else if(AL in usMeas && B in usMeas && AL != B){
      let calc = ( usMeas[AL] / usMeas[B] ) * AN;
      conversion = Embed("Convert "+A+" to "+B,"1"+AL+" is "+(calc/AN)+""+B)[0].field("Result", calc+B)[1];
    
    }else{
      return $channel.send("Something went wrong!\nDid you spell the abbreviations right?");
    }

    return $channel.send(conversion);
  }else if($cmnd === "simplify" || $cmnd === "simp"){
    if(!words[1]) return $channel.send("You're forgetting part of that command!");

    let equation = message.split($pre+$cmnd+" ")[1];
    let pre_parse = message.split($pre+$cmnd+" ")[1].replace(/\\/g,"").replace(/\*\*/g,"^").replace(/÷/gi, "/").replace(/\[/g,"(").replace(/\]/g,")").replace(/\{/g,"(").replace(/\}/g,")").replace(/ /g,"");
    let SimpedEquation = algebra.parse( pre_parse );  // Simplify the eqution... wait that means parsing is the same as simping
    return $channel.send(Embed("Simplify",equation.replace(/\*/g,"\*"))[0].field("Result",SimpedEquation)[1]);
  
  }else if($cmnd === "solve"){
    if(!words[2]) return $channel.send("You're forgetting part of that command!");
    let expr = algebra.parse(words[1]);
    let x = expr.solveFor(words[2]);

    return $channel.send( Embed("Solve for "+words[2],"in "+words[1])[0].field("Equals",words[2]+" = "+x.toString())[1] );
  }else if($cmnd === "factorial"){
    if(!words[1]) return $channel.send("You're forgetting part of that command!");
    
    function factorialize(num) {
      var result = num;
      if(num === 0 || num === 1)return 1; 
        while (num > 1) { 
        num--;
        result *= num;
      }
      return result;
    }

    return $channel.send("> "+ factorialize( Number(words[1]) ) ); 
  }else if($cmnd === "group"){
    var groups = ["counting","whole","integer","real","complex"]
    if(!words[1]) return $channel.send("You're forgetting part of that command!");

    var TheNumber = Number(words[1]);

    if(TheNumber <= 0){
      return $channel.send(Embed("Whole Number","A whole number is any even or odd number, that has no decimal places.")[1]);
    }else if(Math.round(TheNumber) === TheNumber && TheNumber > 0){
      return $channel.send(Embed("Counting Number","A counting number is any even or odd number, greater than 0, that has no decimal places")[1]);
    }else if(TheNumber.toString().includes(".") && Number(TheNumber.toString().split(".")[1]) != 0){
      return $channel.send(Embed("Integer","An integer is any number that has a finite amount of decimal places")[1]);
    }else{
      // return $channel.send(TheNumber+"\nReal");
      return $channel.send(Embed("Real or Complex","It is at this point that I am un-able to identify the number you've selected.\nReal numbers can be rational or irrational.\nA rational number is any of the previous numbers.\nAn irrational number is a decimal number that has an infinite amount of decimal places.\nA complex number is a number that can be express using the equation `a+bi`, where `a` and `b` are Real numbers and `i` is an \"imaginary number\" or a number that doesn't exist, example:\n`x^2 = -1`")[1]);
    }

  }else if($cmnd === "perimeter"){
    if(!words[1]) return $channel.send("Perimeter is the space around the outside of a 2D object");

    if(words[1] === "square"){
      if(!words[2]) return $channel.send("You're forgetting the width parameter!");
      if(!words[3]) return $channel.send("You're forgetting the height parameter!");
      
      let math = (Number(words[2]) *2) + (Number(words[3]) *2)
      
      return $channel.send(Embed("Perimeter of a Square","Width: "+words[2]+" Height: "+words[3])[0].field("Formula","(Width \* 2) + (Height \* 2)")[0].field("Result",math)[1]);
      
    }else if(words[1] === "triangle"){
      if(!words[2]) return $channel.send("You're forgetting the base parameter!");
      if(!words[3]) return $channel.send("You're forgetting the height1 parameter!");
      if(!words[4]) return $channel.send("You're forgetting the height2 parameter!");
      
      let math = Number(words[2]) + Number(words[3]) + Number(words[4]);
      
      return $channel.send(Embed("Perimeter of a Triangle","Width: "+words[2]+" Height1: "+words[3]+" Height2: "+words[4])[0].field("Formula","Width + Height1 + Height2")[0].field("Result",math)[1]);
      
    }else if(words[1] === "circle"){
      if(!words[2]) return $channel.send("You're forgetting the radius parameter!");
      
      let math = 2*3.14159*Number(words[2]);
      
      return $channel.send(Embed("Circumference of a Circle","Radius: "+words[2])[0].field("Formula","2 \* Pi \* Radius")[0].field("Result",math)[1]); 
    }

  }

}