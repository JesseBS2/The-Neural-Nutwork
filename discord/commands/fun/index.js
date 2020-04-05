exports.module = function(){
  let $cmnd = global.discord.message.command;
  if($cmnd === "respect" || $cmnd == "F"){
    let respecters = [];

    const isAVote = msg => {
      if(msg.content == "F"){return true;}
    };
    let ReSPECt = $channel.createMessageCollector(isAVote, {time: 15000});  // 15 second window

  }
}