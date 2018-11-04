// -----------------------------------------------
//  Application
// -----------------------------------------------
const MidiConvert = require('midiconvert');
// const Tone = require('Tone').Transport;
const Tone2 = require('Tone').Part;
const OSC = require('osc-js');
const fs = require('fs');

let songs = [];

fs.readdirSync('songs').forEach((name) => {
  songs.push(route);
});


// -----------------------------------------------
//  Open Socket and Select MIDI
// -----------------------------------------------
const socket = new OSC({
  plugin: new OSC.WebsocketServerPlugin()
});

const loadMidi = new Promise((resolve, reject) => {
  let random = Math.floor(Math.random() * songs.length);

  MidiConvert.load(songs[random], (midi) => {
    resolve(midi);
  });
});

const socketOpen = new Promise((resolve, reject) => {
  socket.on('open', resolve);
});


// -----------------------------------------------
//  Load MIDI and stream
// -----------------------------------------------
Promise.all([loadMidi, socketOpen]).then(values => {
  const midi = values[0];
  let meta = {
    bpm: midi.header.bpm,
    names: []
  };

  midi.tracks.forEach((track) => {
    if (track.notes) {
      meta.names.push(track.name.trim());
    }
  });

  // set the tempo before you schedule the events
  Tone.Transport.bpm.value = midi.header.bpm;

  // pass in the note events from one of the tracks as the second argument to Tone.Part
  new Tone.Part(function(time, note) { // 'time' is useful for sequencing events
    const message = new OSC.Message('/socket', note);
    socket.send(message);
  }, midi.tracks[0].notes).start(0); // start immediately with the Transport

  // start the transport to hear the events
  Tone.Transport.start();
});


// -----------------------------------------------
//  Blast off
// -----------------------------------------------
// socket.on('open', play);
socket.open({ port: 9912 }); // receive at: ws://localhost:9912
