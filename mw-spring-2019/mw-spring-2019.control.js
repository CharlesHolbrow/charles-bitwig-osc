loadAPI(8);

// Remove this if you want to be able to use deprecated methods without causing script to stop.
// This is useful during development.
host.setShouldFailOnDeprecatedUse(true);

host.defineController("charles", "mw-spring-2019", "0.1", "d17003f5-e8d4-4c51-91b7-3b95ff52d6fb", "audioishi");

function init() {
   // TODO: Perform further initialization here.
   println("mw-spring-2019 initialized!");
   var transport = host.createTransport();
   var position = transport.getPosition();
   // position is a SettableBeatTimeValue
   // file:///C:/Program%20Files/Bitwig%20Studio/resources/doc/control-surface/api/a00176.html
   position.addValueObserver(function(v){
      println(v);
   });
   var masterTrack = host.createMasterTrack(1);
   masterTrack.addVuMeterObserver(127, -1, false, function(v){
      println('level: ' + v);
   });
}


function flush() {
   // TODO: Flush any output to your controller here.
}

function exit() {

}