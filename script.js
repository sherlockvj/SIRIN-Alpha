const synth = new Tone.Synth().toDestination();
const analyser = new Tone.Waveform(1024);
synth.connect(analyser);

const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');

let sequence;
let melody = [];
const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
const keyboardEl = document.getElementById("keyboard");

keyboardEl.innerHTML = "";
notes.forEach(note => {
    const key = document.createElement("div");
    key.classList.add("key");
    key.dataset.note = note;
    keyboardEl.appendChild(key);
});

function highlightKey(note) {
    document.querySelectorAll(".key").forEach(k => k.classList.remove("playing"));
    const key = document.querySelector(`.key[data-note="${note}"]`);
    if (key) key.classList.add("playing");
}

function generateRandomMelody(length = 60) {
  return Array.from({ length }, () => notes[Math.floor(Math.random() * notes.length)]);
}


function generateMusic() {
    melody = generateRandomMelody();
    if (sequence) sequence.dispose();

    sequence = new Tone.Sequence((time, note) => {
        synth.triggerAttackRelease(note, "8n", time);
        Tone.Draw.schedule(() => highlightKey(note), time);
    }, melody, "4n");

    sequence.start(0);
    document.getElementById("controls").style.display = "block";
}

document.getElementById("generateBtn").addEventListener("click", async () => {
    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel();
    generateMusic();
});

document.getElementById("playBtn").addEventListener("click", () => {
    Tone.Transport.start();
    animateWaveform();
});

document.getElementById("pauseBtn").addEventListener("click", () => {
    Tone.Transport.pause();
});

function animateWaveform() {
    requestAnimationFrame(animateWaveform);

    const values = analyser.getValue();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = "#00e5ff";
    const sliceWidth = canvas.width / values.length;
    let x = 0;

    for (let i = 0; i < values.length; i++) {
        const v = (values[i] + 1) / 2;
        const y = v * canvas.height;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.stroke();
}

document.getElementById("downloadMp3Btn").addEventListener("click", async () => {
  if (!melody || melody.length === 0) {
    return;
  }

  const renderedBuffer = await Tone.Offline(({ transport }) => {
    const offlineSynth = new Tone.Synth().toDestination();

    const offlineMelody = new Tone.Sequence((time, note) => {
      offlineSynth.triggerAttackRelease(note, "8n", time);
    }, melody, "4n");

    offlineMelody.start(0);
    transport.start();
  }, melody.length * 0.5);

  const wavData = audioBufferToWav(renderedBuffer);

  const mp3Blob = wavToMp3(wavData);
  const url = URL.createObjectURL(mp3Blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "generated-melody.mp3";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

function audioBufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels,
        length = buffer.length * numOfChan * 2 + 44,
        bufferArray = new ArrayBuffer(length),
        view = new DataView(bufferArray),
        channels = [],
        sampleRate = buffer.sampleRate;

  let offset = 0;

  function writeString(str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
    offset += str.length;
  }

  writeString("RIFF");
  view.setUint32(offset, length - 8, true); offset += 4;
  writeString("WAVE");
  writeString("fmt ");
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numOfChan, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * 2 * numOfChan, true); offset += 4;
  view.setUint16(offset, numOfChan * 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeString("data");
  view.setUint32(offset, length - offset - 4, true); offset += 4;

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let j = 0; j < numOfChan; j++) {
      const sample = Math.max(-1, Math.min(1, channels[j][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Uint8Array(bufferArray);
}

function wavToMp3(wavData) {
  const wav = new Uint8Array(wavData);
  const wavReader = new DataView(wav.buffer);
  const sampleRate = wavReader.getUint32(24, true);
  const channels = wavReader.getUint16(22, true);
  const bitsPerSample = wavReader.getUint16(34, true);

  // Read PCM samples
  const pcmData = new Int16Array(wav.buffer, 44); // skip 44-byte WAV header
  const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
  const mp3Data = [];
  const samplesPerFrame = 1152;

  if (channels === 1) {
    // Mono
    for (let i = 0; i < pcmData.length; i += samplesPerFrame) {
      const chunk = pcmData.subarray(i, i + samplesPerFrame);
      const mp3buf = mp3Encoder.encodeBuffer(chunk);
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }
  } else if (channels === 2) {
    // Stereo: separate left and right channels
    const left = new Int16Array(pcmData.length / 2);
    const right = new Int16Array(pcmData.length / 2);
    for (let i = 0, j = 0; i < pcmData.length; i += 2, j++) {
      left[j] = pcmData[i];
      right[j] = pcmData[i + 1];
    }
    for (let i = 0; i < left.length; i += samplesPerFrame) {
      const leftChunk = left.subarray(i, i + samplesPerFrame);
      const rightChunk = right.subarray(i, i + samplesPerFrame);
      const mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }
  }

  const end = mp3Encoder.flush();
  if (end.length > 0) mp3Data.push(end);

  return new Blob(mp3Data, { type: "audio/mp3" });
}
