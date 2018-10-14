loadAPI(7);

// Remove this if you want to be able to use deprecated methods without causing script to stop.
// This is useful during development.
host.setShouldFailOnDeprecatedUse(true);

host.defineController("Charles", "charles-bitwig-osc", "0.1", "2ab99a8c-c7cd-4c5f-a91a-def687b698dc", "audioishi");

function init() {
  // TODO: Perform further initialization here.
  println("charles-bitwig-osc initialized"
    + ' - ' + host.getHostVendor()
    + ' - ' + host.getHostProduct()
    + ' - ' + host.getHostVersion()
  );

  // Global transport
  var transport = host.createTransport();
  transport.isPlaying().markInterested();

  // `clip` mostly follows the clip slot that is selected in the launcher GUI.
  // However, when moving the GUI cursor to a clip slot that is empty, 'clip'
  // will still point to the most recently selected clip. 
  var clip = host.createLauncherCursorClip(512, 128);
  clip.exists().markInterested();
  clip.setStepSize(1);
  
  // Configure osc. AddressSpace is a term from the OSC spec. It means 
  var m = host.getOscModule();
  var as = m.createAddressSpace();
  var nameIndex = 0;

  clip.exists().addValueObserver(function(exists){
    if (!exists) {
      println('clip does not exists')
      return;
    }

    println('clip exists');
    clip.setName('c' + nameIndex++);
  });

  // handler (OscConnection source, OscMessage message)
  as.registerDefaultMethod(function(connection, msg) {
    println('---')
    println(msg.getTypeTag());
    println(msg.getInt(0));
    println(msg.getFloat(2));
  });

  // Proxy clip.setStep
  as.registerMethod('/launcher/selected-clip/create-note',
    ',iiif',
    'add a note to selected launcher clip', 
    function(c, msg) {
      if (!clip.exists().get()) {
        println('cannot place notes - no clip selected');
        return;
      }
      var x = msg.getInt(0);
      var y = msg.getInt(1);
      var v = msg.getInt(2);   // velocity
      var l = msg.getFloat(3); // length in beats (not )
      clip.setStep(x, y, v, l);
  });

  m.createUdpServer(9000, as);
}


function flush() {
   // TODO: Flush any output to your controller here.
}

function exit() {

}