const tempo = 1000 * 60 / 140;
const discoInferno = [
  // skip 1st
  [60, 1],
  [67, 1],
  [60, 1],
  [63, 1],
  [65, 1],
  [58, 1],
  [60, 2],
  [60, 1],
  [67, 1],
  [60, 1],
  [63, 1],
  [63, 1],
  [65, 1],
  [60, 2]
];
let i = 0;

function play() {
  const note = discoInferno[i];
  const freq = note[0];
  const dur = note[1] * tempo;
  const message = new OSC.Message('/socket', freq);

  console.log('note: ', freq);

  socket.send(message);

  i++;
  if (i >= discoInferno.length) i = 0;

  setTimeout(play, dur);
}

// Blast off
socket.on('open', play);
socket.open({ port: 9912 }); // receive at: ws://localhost:9912

