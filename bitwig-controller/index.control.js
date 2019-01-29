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
  clip.getLoopLength().markInterested();
  clip.getLoopStart().markInterested();

  // Create a scrollable bank of tracks.
  var trackBank = host.createMainTrackBank(1, 8, 1);
  var track = trackBank.getItemAt(0);
  var clipBank = track.clipLauncherSlotBank();
  var clipSlot = clipBank.getItemAt(0);

  trackBank.scrollPosition().markInterested();
  clipBank.scrollPosition().markInterested();
  clipSlot.name().markInterested();

  // setup scene
  var sceneBank = trackBank.sceneBank();
  var scene = sceneBank.getItemAt(0);
  scene.name().markInterested();

  // Configure osc. AddressSpace is a term from the OSC spec. It means
  var oscModule = host.getOscModule();
  var as = oscModule.createAddressSpace();

  // handler (OscConnection source, OscMessage message)
  as.registerDefaultMethod(function(connection, msg) {
    println('- unregistered method - ' + msg.getAddressPattern())
  });

  // Create a note, with the beat position specified from the beginning. Leaves
  // the scroll position and step size in an arbitrary state.
  as.registerMethod('/launcher/selected-clip/create-note',
    ',iiff',
    'add a note to selected launcher clip, specifying start point as a beat (float)',
    function(c, msg) {
      if (!clip.exists().get()) {
        println('Warning! no clip selected');
        // It's possible that the clip does exists, but our .get() result is out
        // of date. In that case, it is a bug to return, so we print a warning
        // instead.
      };

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

      // We are not re-setting the step size or scrolTo. My methods should not
      // expect any particular step size or scroll position.
  });

  as.registerMethod('/launcher/selected-clip/set-loop',
    ',ff',
    'Set loop start and loop length',
    function(c, msg){
      var start = msg.getFloat(0);
      var length = msg.getFloat(1);

      println('loop start('+start+') length('+length+')');

      clip.getLoopStart().set(start);
      clip.getLoopLength().set(length);
  });

  as.registerMethod('/launcher/selected-clip/set-start',
    ',f',
    'Set clip start point',
    function(c, msg){
      clip.getPlayStart().set(msg.getFloat(0));
  });

  // create a clip in the launcher, optionally deleting the existing clip
  as.registerMethod('/launcher/create-clip',
    ',iisi',
    'create a clip. The fourth arg indicates if an existing clip should be deleted',
    function(c, msg) {
      var trackIndex = msg.getInt(0);
      var clipIndex = msg.getInt(1);
      var clipName = msg.getString(2);
      var clear = msg.getInt(3); // 0 or 1 (bools are non standard in osc)

      println('Create Clip: ('+trackIndex+', '+clipIndex+')'
        + (clear ? ' Delete existing clip!' : '')); // requires parenthesis

      // Scroll to the desired location. Note that .set() is asyncronous. If we
      // call .get immediately after, we will get the old value. This means that
      // we cannot .
      trackBank.scrollPosition().set(trackIndex);
      clipBank.scrollPosition().set(clipIndex);
      if (clear) clipBank.deleteClip(0);
      clipBank.createEmptyClip(0, 4);
      clipBank.select(0);

      // Because, the scroll set commands above have not yet taken place, we
      // cannot yet get the name. That is why the following lines (commented
      // out) will not have the desired effect.
      // var clipSlot = clipBank.getItemAt(0);
      // println(clipSlot.name().get();)

      // We can set the name, because calls do execute in the correct order.
      clip.setName(clipName);
      clipBank.showInEditor(0);
  });

  as.registerMethod('/launcher/select-clip',
    'ii',
    'Select a clip in the launcher',
    function(c, msg){
      var trackIndex = msg.getInt(0);
      var clipIndex = msg.getInt(1);
      trackBank.scrollPosition().set(trackIndex);
      clipBank.scrollPosition().set(clipIndex);
      clipBank.select(0);
    });

  // as.registerMethod('/test/',
  //   '#bundle',
  //   'can i use a bundle?',
  //   function(c, msg) {
  //     println('bundle: ' + msg);
  //   });

  oscModule.createUdpServer(48888, as);
}

function flush() {
   // TODO: Flush any output to your controller here.
}

function exit() {
}
