// random placeholder
function randomChoice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}
const placeholders = ['開心果', '猴子', '正妹', '媽寶', '邊緣人', '學霸', '學渣', '尷尬王', '中央空調', '魯蛇', '懦弱', '笨蛋', '大嘴巴'];
document.querySelector('#input-word').placeholder = randomChoice(placeholders);

// bind keyboard [Enter] with submit
document.querySelector('#input-word').addEventListener('keyup', event => {
    if(event.key !== 'Enter') return;
    document.querySelector('#submit-button').click();
    event.preventDefault();
});

// submit word
document.querySelector('#submit-button').addEventListener('click', event => {
    const word = document.querySelector('#input-word').value;
    if (word === '') return;
    let formData = new FormData();
    formData.append('word', word);
    fetch('/submit', {
        method: 'POST',
        body: formData,
    });
    document.querySelector('#input-word').placeholder = '';
    document.querySelector('#input-word').value = '';
});

// update canvas
if (!WordCloud.isSupported) {
    alert('Your browser is too old to run this application.');
}

let drawIndex = 0;
function draw () {
    // get data
    fetch('/data')
    .then(resp => resp.json())
    .then(data => {
        if (data.length === 0) return;

        let count = {};
        for (const word of data) {
            count[word] = (count[word] || 0) + 1;
        }
        WordCloud(document.querySelector(`#word-cloud${drawIndex}`), {
            list: count2list(count),
            shuffle: false,
            rotateRatio: 0,
            color: (word, weight, fontSize, distance, theta) => ((fontSize > 70) ? '#b98fe2' : '#3C415C'),
            backgroundColor: '#00000000',
        });
        drawIndex ^= 1;
    });
}

setInterval(draw, 4000);
draw()

document.querySelector('#word-cloud0').addEventListener('wordcloudstop', event => {
    document.querySelector('#word-cloud0').style.opacity = 1;
    document.querySelector('#word-cloud1').style.opacity = 0;
});
document.querySelector('#word-cloud1').addEventListener('wordcloudstop', event => {
    document.querySelector('#word-cloud0').style.opacity = 0;
    document.querySelector('#word-cloud1').style.opacity = 1;
});

function count2list (count) {
    const targetMinFontSize = 10;
    const targetMaxFontSize = 100;
    const targetDiff = targetMaxFontSize - targetMinFontSize;
    const sum = Object.values(count).reduce((sum, val) => sum + val * val);
    const factor = Math.sqrt(48000 / sum);

    let list = [];
    for (const word in count) {
        list.push([word, Math.min(targetMaxFontSize, Math.max(targetMinFontSize, count[word] * factor))]);
    }
    return list
}
