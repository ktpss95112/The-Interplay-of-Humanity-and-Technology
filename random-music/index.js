const keyboard = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C4'];
const frequency = [262, 294, 330, 349, 392, 440, 494, 523];
const noteLength = [1, 1, 1, 2, 2, 3];
const baseDuration = 0.25;
const pauseRate = 0.2;
const musicLength = 64; // 4 measure, eighth note
const canvasSize = [400, 600]; // [width, height]


function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


// function drawBackground () {
//     const ctx = document.querySelector('#background-layer').getContext('2d');

//     // draw keyboard
//     keyboard.forEach((val, idx, arr) => { drawKey(ctx, idx, 'white') })
// }


// function drawKey (ctx, idx, color) {
//     ctx.save();

//     ctx.

//     ctx.restore();
// }


function generateMusic () {
    let result = [];
    for (let i = 0; i < musicLength; ) {
        const note = (Math.random() < pauseRate) ? 'pause' : randomChoice(keyboard);
        const len = Math.min(randomChoice(noteLength), musicLength - i);
        result.push({'note': note, 'length': len});
        i += len;
    }
    return result;
}


function playGeneratedMusic (music) {
    console.log(music);

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'triangle';

    oscillator.frequency.value = 0;
    const startTime = audioCtx.currentTime;
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
    }, 1000 * baseDuration * musicLength);

    let count = 0;
    for (let {note, length} of music) {
        const startTimeOfCurrNote = startTime + baseDuration * count;

        if (note == 'pause') {
            oscillator.frequency.setValueAtTime(0, startTimeOfCurrNote);
            continue;
        }

        const freq = frequency[keyboard.indexOf(note)];

        oscillator.frequency.setValueAtTime(freq, startTimeOfCurrNote);
        gainNode.gain.exponentialRampToValueAtTime(0.2, startTimeOfCurrNote + baseDuration * (0.01));
        gainNode.gain.setValueAtTime(0.2, startTimeOfCurrNote + baseDuration * (length - 0.4));
        gainNode.gain.exponentialRampToValueAtTime(1e-10, startTimeOfCurrNote + baseDuration * (length - 0.01));

        count += length;
    }
}


function runSpecial () {
    document.querySelector('#start-button').disabled = true;
    setTimeout(() => {
        document.querySelector('#start-button').disabled = false;
    }, 1000 * baseDuration * musicLength);

    new Promise ((resolve, reject) => { playGeneratedMusic(generateMusic()) });
    new Promise ((resolve, reject) => { playGeneratedMusic(generateMusic()) });
}

