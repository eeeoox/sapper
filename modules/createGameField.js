import {openEmptyCells, openRestEmpty} from './openEmptyCells.js';


function createGameField(columns, rows, random) {
    let table = document.createElement('table');
    let idNum = 1; 

    for (let i = 0; i < +rows; i++) {
        let tr = document.createElement('tr');
        
        for (let j = 0; j < +columns; j++) {
            let td = document.createElement('td');

            td.id = idNum;
            tr.append(td);
            idNum++;
        }
        table.append(tr);
    }
    let adjacent = getAdjacentCells(table, +columns);

    guessCells(table, adjacent, +random); 

    let tds = table.querySelectorAll('td');
    tds.forEach(td => td.addEventListener('contextmenu', setFlag));
    tds.forEach(td => td.classList.add('cell-closed'));

    return table;
}

function setFlag(e) {
    e.preventDefault();

    if (e.target.innerHTML == '' && e.target.dataset.opened == undefined) {
        e.target.innerHTML = '🚩';
    } else if (e.target.innerHTML == '🚩'){
        e.target.innerHTML = '';
    } 
}

function getAdjacentCells(table, x) {
    let tds = table.querySelectorAll('td');
    let adjacent = new Map();
    let helper1 = [];
    let helper2 = [];

    for (let i = x * x - x; i > x; i -= x) {
        helper1.push(i);
    }
    for (let i = x * x - 2 * x + 1; i > x; i -= x) {
        helper2.push(i);
    }
    
    for (let td of tds) {
        let instruction = [];

        if (td.id == 1) {instruction = [0,0,0,0,1,0,1,1]}
        else if (td.id == x) {instruction = [0,0,0,1,0,1,1,0]}
        else if (td.id == x * x) {instruction = [1,1,0,1,0,0,0,0]}
        else if (td.id == x * x - x + 1) {instruction = [0,1,1,0,1,0,0,0]}

        else if (td.id > 1 && td.id < x) {instruction = [0,0,0,1,1,1,1,1]}
        else if (td.id > x * x - x + 1 && td.id < x * x) {instruction = [1,1,1,1,1,0,0,0]}

        else if (helper1.indexOf(+td.id) != -1) {instruction = [1,1,0,1,0,1,1,0]}
        else if (helper2.indexOf(+td.id) != -1) {instruction = [0,1,1,0,1,0,1,1]}

        else {instruction = [1,1,1,1,1,1,1,1]}

        adjacent.set(td.id, getAdjCellsArr(instruction, x, td.id));
    }
    return adjacent;
}

function getAdjCellsArr(instruction, x, id) {
    let arr = [];
    let clean = [];

    arr[0] = +id -x - 1;
    arr[1] = +id -x;
    arr[2] = +id -x + 1;
    arr[3] = +id - 1;
    arr[4] = +id + 1;
    arr[5] = +id +x - 1;
    arr[6] = +id +x;
    arr[7] = +id +x + 1;

    if (instruction) {
        for (let i = 0; i < arr.length; i++) {
            if (!instruction[i] == 0) {
                clean.push(arr[i]);
            }
        }
    }

    return clean;
}

function guessCells(table, adjacent, random) {
    let tds = table.querySelectorAll('td');
    let randoms = [];
    
    while (randoms.length < random) {
        let random = Math.round(Math.random() * (tds.length - 1));
        
        if (randoms.indexOf(random) != -1) {
            continue;
        } else {
            randoms.push(random);
        }
    }
    let {bombs, nearCells, rest} = defineCellsRole(table, adjacent, randoms);
    
    addCellsEventListeners(bombs, nearCells, rest, table, tds, adjacent);
}

function addCellsEventListeners(bombs, nearCells, rest, table, tds, adjacent) {
    let restAndNear = rest.concat(nearCells);
    let openCells = (e) => {
        let up = openEmptyCells.call(e.target, table, adjacent, rest, 'up');
        let down = openEmptyCells.call(e.target, table, adjacent, rest, 'down');
        let merged = new Set([...up, ...down]);
        let fullSet = openRestEmpty(merged, table, adjacent, rest);
        let opened = rest.every(element => {return element.dataset.opened == 'true'});

        for (let td of tds) {
            if (td.dataset.opened == 'true' && td.dataset.near != undefined) {
                showNumOfBombs.call(td);
            }
        }
    }
    rest.forEach(element => {
        element.dataset.rest = 'true';
        element.addEventListener('click', openCells);
    });
    nearCells.forEach(elem => elem.addEventListener('click', showNumOfBombs));
    bombs.forEach(elem => elem.addEventListener('click', function() {stopGame('lose')}));
    tds.forEach(td => {
        td.addEventListener('click', function() {
            let allOpened = restAndNear.every(elem => elem.dataset.opened == 'true');
            if (allOpened) {stopGame('win')};
        });
    });

    function stopGame(winStatus) {
        tds.forEach(td => td.removeEventListener('contextmenu', setFlag));
        nearCells.forEach(elem => elem.removeEventListener('click', showNumOfBombs));
        rest.forEach(element   => element.removeEventListener('click', openCells));
        table.dataset.win = winStatus;

        if (winStatus === 'win') {
            bombs.forEach(element  => {
                element.innerHTML = '🚩';
            });
        } else {
            bombs.forEach(element  => {
                element.innerHTML = '&#128165'
                element.classList.remove('cell-closed');
                element.classList.add('cell-opened');
            });
        }
    }
}
    
function defineCellsRole(table, adjacent, randoms) {
    let tds = table.querySelectorAll('td');
    let bombs = [];
    let near = new Set();
    let rest = [];
    
    for (let td of tds) {
        if ( randoms.indexOf(+td.id) != -1 ) {
            bombs.push(td);

            let adjCells = adjacent.get(td.id);
            
            [...tds].forEach(element => {
                if ( adjCells.indexOf(+element.id) != -1 ) {
                    element.dataset.near += ' around' + td.id;
                    near.add(element);
                }
            })
        }
    }
    let nearCells = Array.from(near);

    for (let td of tds) {
        if ( randoms.indexOf(+td.id) == -1 && td.dataset.near == undefined) {
            rest.push(td);
        }
    }
    bombs.forEach(bomb => {
        let index = nearCells.indexOf(bomb);
        if (index != -1) {
            nearCells.splice(index, 1);
        }
        bomb.removeAttribute('data-near');
        bomb.setAttribute('data-bomb', true);
    });

    return {'bombs': bombs, 'nearCells': nearCells, 'rest': rest}
}

function showNumOfBombs() {
        if (this.dataset.near) {

            let cellsNum = this.dataset.near.split(' ').length - 1;
            this.dataset.opened = 'true';
            this.innerHTML = cellsNum;
            this.classList.remove('cell-closed');
            this.classList.add('cell-opened');
        }
}

export default createGameField;