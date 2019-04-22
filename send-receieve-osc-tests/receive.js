const osc = require('osc');

const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0", // to listen on
    localPort: 6969,         // to listen on
    metadata: true,
});

udpPort.on('message', (oscMsg)=>{
    // args which is an array of either raw argument values or type-annotated
    // Argument objects (depending on the value of the metadata option used
    // when reading the message).
    console.log(oscMsg.address, oscMsg.args);
});

udpPort.open();
