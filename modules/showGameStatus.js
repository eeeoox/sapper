function showGameStatus(state, minutes, seconds) {
    let status = document.getElementById('status');
    let closeStatus = document.getElementById('closeStatus');
    let phrases = [];
    let result = countEfficencyAndTime(minutes, seconds);

    status.classList.add('msgWindow');

    if (state == 'win') {
        phrases = [`Congradulations!`, `You\'ve cleared all the field.`, 
            `Your time: ${result.diffMinutes} minutes and ${result.diffSeconds} seconds`,
            `Your efficiency: ${result.efficiency}%`,
            `Press "New Game" to clear another field.`
        ]

    } else if (state == 'lose') {
        phrases = ['You\'ve detonated the bomb, sapper... Press "New Game" and practice.'];

    } else if (state == 'time-is-out') {
        phrases = ['Your time is out... Press "New Game" and play again.'];
    }
    let text = getTextElems(phrases);
    status.append(text);

    closeStatus.addEventListener('click', closeMsgWindow);
}
function countEfficencyAndTime(minutes, seconds){
    let passed = +minutes * 60 + +seconds;
    let total = 30 * 60;
    let diff = total - passed;
    let diffMinutes = Math.floor(diff / 60);
    let diffSeconds = diff - diffMinutes * 60;
    let efficiency = 100 - (diff * 100 / total).toFixed(1);

    return {
        efficiency: efficiency,
        diffMinutes: diffMinutes,
        diffSeconds: diffSeconds
    };
}

function getTextElems(phrases) {
    let text = document.createElement('div');
    text.id = 'text';

    for (const phrase of phrases) {
        let p = document.createElement('p');
        p.innerHTML = phrase;
        text.appendChild(p);
    }
    return text;
}

function closeMsgWindow() {
    let window = this.closest('#status');
    window.classList.remove('msgWindow');
}

export default showGameStatus;