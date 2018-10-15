loadAPI(7);

var CLIP_WIDTH = Math.pow(2, 13); // 8192. 2^14 seems to cause slowdowns.

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
  var clip = host.createLauncherCursorClip(CLIP_WIDTH, 1);
  clip.exists().markInterested();
  clip.setStepSize(1);
  
  // Configure osc. AddressSpace is a term from the OSC spec. It means 
  var oscModule = host.getOscModule();
  var as = oscModule.createAddressSpace();


  // handler (OscConnection source, OscMessage message)
  as.registerDefaultMethod(function(connection, msg) {
    println('- unregistered method - ' + msg.getAddressPattern())
  });

  // create a note, with the beat position specified from the beginning
  as.registerMethod('/launcher/selected-clip/create-note',
    ',iiff',
    'add a note to selected launcher clip, specifying start point as a beat (float)',
    function(c, msg) {
      if (!clip.exists().get()) {
        println('cannot place notes - no clip selected');
        return;
      }

      var y = msg.getInt(0);   // midi note number
      var v = msg.getInt(1);   // velocity
      var x = msg.getFloat(2); // beat position as float
      var l = msg.getFloat(3); // length in beats (not steps)

      // where do we want to position the note?
      var beat = Math.floor(x); // integer beat number
      var remainder = x - beat; // just the decimal

      // We will scroll the clip to the beat, and then used setStep to specify
      // the point within the beat.
      var remainderInSteps = Math.floor(remainder * CLIP_WIDTH);

      clip.setStepSize(1 / CLIP_WIDTH); // this resets step scrolling to 0
      clip.scrollToStep(beat * CLIP_WIDTH);
      clip.scrollToKey(y);
      clip.setStep(remainderInSteps, 0, v, l);

      println('scroll to: ' + beat + ' - ' + remainder + ' - ' + remainderInSteps);

      // Strinctly speaking, this is needed. My methods should not expect any
      // particular step size or scroll position.
      clip.setStepSize(1);
      clip.scrollToStep(0);
  });

  oscModule.createUdpServer(9000, as);
}



function flush() {
   // TODO: Flush any output to your controller here.
}

function exit() {
}
