const osc = require('osc');

const io = new osc.UDPPort({
    metadata: true,
    localAddress: "127.0.0.1",
    localPort: 9001,
    remoteAddress: "127.0.0.1",
    remotePort: 9000,
});

let i = 0;

const heartbeat = () => {
    io.send({
        address: '/launcher/selected-clip/create-note-with-step',
        args: [
            {
                type: 'i',
                value: i % 4,
            },{
                type: 'i',
                value: i % 128,
            },{
                type: 'i',
                value: i % 128,
            },{
                type: 'f',
                value: 1/3,
            },
        ],
    }, '127.0.0.1', 9000);
    i++;
};

io.on('ready', () => {
    console.log('ready')
    setInterval(heartbeat, 400);
});

io.on('error', (error) => {
    console.error(error);
});

io.open();