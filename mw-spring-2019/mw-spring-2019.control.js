loadAPI(8);

// Remove this if you want to be able to use deprecated methods without causing script to stop.
// This is useful during development.
host.setShouldFailOnDeprecatedUse(true);

host.defineController("Charles", "mw-spring-2019", "0.1", "d17003f5-e8d4-4c51-91b7-3b95ff52d6fb", "audioishi");

function init() {
   var osc = host.getOscModule();
   var sender = osc.connectToUdpServer('127.0.0.1', 6969, null);
   

   println("mw-spring-2019 initialized!");
   var transport = host.createTransport();
   var position = transport.getPosition();
   // position is a SettableBeatTimeValue
   // file:///C:/Program%20Files/Bitwig%20Studio/resources/doc/control-surface/api/a00176.html

   // send osc for transport
   position.addValueObserver(function(v){
      try {
         sender.sendMessage('/transport/position', v);
      } catch (err) {
         println('error sending transport position: ' + err);
      }
   });

   // send osc for track
   var masterTrack = host.createMasterTrack(1);
   masterTrack.addVuMeterObserver(256, -1, false, function(v){
      try {
         sender.sendMessage('/track/master/meter', v);
      } catch (err) {
         println("error sending level: " + err);
      }
   });
}


function flush() {
   // TODO: Flush any output to your controller here.
}

function exit() {

}