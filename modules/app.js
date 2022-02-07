import createGameField from './createGameField.js';
import setTimer from './setTimer.js'
import showHint from './showHint.js'
        
function startGame() {
    let startBtn = document.getElementById('start-btn');
    let rule = document.getElementById('rule');
    let ruleBtn = document.getElementById('rule-btn');
    let levels = document.getElementsByClassName('level');
    let startWindow = document.getElementById('start-window');
    let gameFiled = document.getElementById('game-filed');
    let hint = document.getElementById('hint');
    let restartBtn = document.getElementById('new-game');
    let container = document.getElementById('container');
    let timer = document.getElementById('timer');
    let status = document.getElementById('status');
    let closeStatus = document.getElementById('closeStatus');
    
    for (let level of levels) {
        level.addEventListener('click', function(){
            
            for (let level of levels) {
                level.dataset.picked = false;
                level.classList.remove('focused');
            }
            this.dataset.picked = true;
            this.classList.toggle('focused');
        });
    }

    rule.addEventListener('click', function(){
        this.classList.remove('rule-close');
        this.classList.add('rule-open');
    });
    
    ruleBtn.addEventListener('click', function clear(e) {
        e.stopPropagation();

        let parent = this.closest('li');
        parent.classList.remove('rule-open');
        parent.classList.add('rule-close');
    });

    
    startBtn.addEventListener('click', function(){
        for (let level of levels) {
            level.classList.remove('focused');

            if (level.dataset.picked == 'true'){
                let table = createGameField(level.dataset.column, level.dataset.row, level.dataset.mine);
                rule.classList.remove('rule-close');
                container.append(table);
                startWindow.style.display = 'none';
                gameFiled.classList.add('field');

                setTimer(container, timer, table, restartBtn);
                showHint(hint, table, 'mousedown', '*');
                showHint(hint, table, 'mouseup', '');
            }
        }
    });
    restartBtn.addEventListener('click', function() {
        startWindow.style.display = 'flex';
        container.removeChild(container.firstChild);
        gameFiled.classList.remove('field');
        status.innerHTML = '';
        status.append(closeStatus);
        status.classList.remove('msgWindow');
    })
}

startGame();


