import showGameStatus from './showGameStatus.js';

function setTimer(container, timer, table, restartBtn) {
    let time = timer.innerHTML.split(':');
    let minutes = +time[0];
    let seconds = +time[1];
    
    let interv = setInterval(() => {
        
        if (seconds == 0 && minutes != 0) {
            minutes--;
            seconds = 59;
        } 
        else if (table.dataset.win != undefined) {
            clearInterval(interv);
            showGameStatus(table.dataset.win, minutes, seconds)
        } 
        else if (seconds == 0 && minutes == 0 ) {
            clearInterval(interv);

            let clone = table.cloneNode(true);
            container.removeChild(container.firstChild);
            container.appendChild(clone);
            showGameStatus('time-is-out', minutes, seconds);
        }
        else {
            seconds--;
        }
        
        timer.innerHTML = addZero(minutes) + ':' + addZero(seconds);

        restartBtn.addEventListener('click', function restartTimer() {
                clearInterval(interv);
                timer.innerHTML = '30:00';
                restartBtn.removeEventListener('click', restartTimer);
        });

    }, 1000);
}
function addZero(num) {
    let length = num.toString().length;

    if (length == 1) {
        return num = '0' + num; 
    } 
    return num;
}

export default setTimer;