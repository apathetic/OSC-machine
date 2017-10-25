const MidiConvert = require('midiconvert');
const Tone = require('tone'); // tone/Tone/event/Part'
const OSC = require('osc-js');

// --------------------------------

const socket = new OSC({
  plugin: new OSC.WebsocketServerPlugin()
});

const loadMidi = new Promise((resolve, reject) => {
  MidiConvert.load('path/to/midi.mid', (midi) => {
    resolve(midi);
  });
});

const socketOpen = new Promise((resolve, reject) => {
  socket.on('open', resolve);
});

// -----------------

Promise.all([loadMidi, socketOpen]).then(values => {
  const midi = values[0];

  // loadMidi.then((midi) => {
  // make sure you set the tempo before you schedule the events
  Tone.Transport.bpm.value = midi.header.bpm;

  // pass in the note events from one of the tracks as the second argument to Tone.Part
  new Tone.Part(function(time, note) { // 'time' is useful for sequencing events
    const message = new OSC.Message('/socket', note);
    socket.send(message);
  }, midi.tracks[0].notes).start(0); // start immediately with the Transport

  // start the transport to hear the events
  Tone.Transport.start();
});


// -----------------


// Blast off
// socket.on('open', play);
socket.open({ port: 9912 }); // receive at: ws://localhost:9912
