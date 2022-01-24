
function createTable(columns, rows, random, container) {
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
    container.append(table);

    let adjacent = getAdjacentCells(table, +columns);

    guessCells(table, adjacent, +random); 
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
    let {bombs, nearCells, rest} = separateBombsAndNear(table, adjacent, randoms);
    
    let open = (e) => {
        let up = openEmptyCells.call(e.target, table, adjacent, rest, 'up');
        let down = openEmptyCells.call(e.target, table, adjacent, rest, 'down');
        let merged = new Set([...up, ...down]);
        let fullSet = openRestEmpty(merged, table, adjacent, rest);
        let allOpened = rest.every(element => {return element.dataset.opened == 'true'});

        for (let td of tds) {
            if (td.dataset.opened == 'true' && td.dataset.near != undefined) {
                showNumOfBombs.call(td);
            }
        }

        if (allOpened) {stopGame('true')};
    }
    
    rest.forEach(element => {
        element.style.backgroundColor = 'lightgrey';
        element.dataset.rest = 'true';
        element.addEventListener('click', open);
    });
    nearCells.forEach(elem => elem.addEventListener('click', showNumOfBombs));

    bombs.forEach(elem => elem.addEventListener('click', function() {stopGame('false')}));

    function stopGame(winStatus) {
        nearCells.forEach(elem => elem.removeEventListener('click', showNumOfBombs));
        rest.forEach(element   => element.removeEventListener('click', open));
        bombs.forEach(element  => element.innerHTML = '*');
        table.dataset.win = winStatus;
    }
}
    
function separateBombsAndNear(table, adjacent, randoms) {
    let tds = table.querySelectorAll('td');
    let bombs = [];
    let nearCells = [];
    let rest = [];
    
    for (let td of tds) {
        if ( randoms.indexOf(+td.id) != -1 ) {
            td.style.backgroundColor = 'rgb(252, 247, 247)';
            bombs.push(td);

            let adjCells = adjacent.get(td.id);
            
            [...tds].forEach(element => {
                if ( adjCells.indexOf(+element.id) != -1 ) {
                    element.dataset.near += ' around' + td.id;
                    nearCells.push(element);
                }
            })
        }
    }
    for (let td of tds) {
        if ( randoms.indexOf(+td.id) == -1 && td.dataset.near == undefined) {
            rest.push(td);
        }
    }
    bombs.forEach(bomb => {
        bomb.removeAttribute('data-near');
        bomb.setAttribute('data-bomb', true);
    });

    return {'bombs': bombs, 'nearCells': nearCells, 'rest': rest}
}

function showNumOfBombs() {
        if (this.dataset.near) {

            let cellsNum = this.dataset.near.split(' ').length - 1;
            this.innerHTML = cellsNum;
        }
}

function openEmptyCells(table, adjacent, rest, direction) {
    let restIDs = rest.map(function(elem) {return +elem.id});
    let adjCells = adjacent.get(this.id);
    let set = new Set();
    let presentTr = this.closest('tr');
    let presentTds = presentTr.children;
    let tdsNums = [...presentTds].map(function(elem) {return +elem.id});
    let thisNum = +this.id;
    let tds = Array.from(table.getElementsByTagName('td'));
    let allTrs = Array.from(table.children);

    adjCells.forEach(elem => set.add(elem));
    set.add(+this.id);

    for (let i = thisNum; i <= tdsNums[ tdsNums.length - 1 ]; i++) {
        set = fillSet(i, set, restIDs, adjacent);
    }

    for (let i = thisNum; i >= tdsNums[0]; i--) {
        set = fillSet(i, set, restIDs, adjacent);
    }
    
    for (let td of tds) {
        if ([...set].indexOf(+td.id) != -1) {
            td.style.backgroundColor = 'orange';
            td.dataset.opened = true;
        }
    }
    
    let indx = getNearTrIndx(table, allTrs, presentTr, direction);

    if (indx != -1 && indx != allTrs.length) {
        let nearTds = allTrs[indx].children;
        let nearTdsNums = [...nearTds].map(function(elem) {return +elem.id});
        let filtered = nearTdsNums.filter(num => [...set].includes(num) && restIDs.includes(num));
        let firstElems = getFirstElemsOfSubArr(filtered);

        for (let first of firstElems) {
            let nearTd = document.getElementById(first);
            let subset = openEmptyCells.call(nearTd, table, adjacent, rest, direction);
            [...subset].forEach(element => set.add(element));
        }
    } else {
        return set;
    }
    return set;
}

function openRestEmpty([...merged], table, adjacent, rest) {
    let restIDs = rest.map(function(elem) {return +elem.id});
    let tds = table.querySelectorAll('td');
    let mergedSet = new Set(merged);
    let restEmptyIDs = [];
    
    for (let td of tds) {
        if (restIDs.indexOf(+td.id) != -1 && td.dataset.opened == 'true' && td.dataset.passed == undefined) {
            restEmptyIDs.push(+td.id);
        }
    }
    
    if (restEmptyIDs[0]) {
        let shortEmptyIDs = getFirstElemsOfSubArr(restEmptyIDs);
        
        shortEmptyIDs.forEach(tdId => {
            let tdElem = document.getElementById(tdId);
            let up = openEmptyCells.call(tdElem, table, adjacent, rest, 'up');
            let down = openEmptyCells.call(tdElem, table, adjacent, rest, 'down');

            [...up].forEach(item => mergedSet.add(item));
            [...down].forEach(item => mergedSet.add(item));
        })
        
        let fullSet = openRestEmpty([...mergedSet], table, adjacent, rest);
        [...fullSet].forEach(item => mergedSet.add(item));

    } else {
        return mergedSet;
    }
    return mergedSet;
}

function getFirstElemsOfSubArr(arr) {
    let index = 0;
    let firstElems = [];

    for (let i = 0; i < arr.length; i++) {
        let num1 = arr[i] + 1;
        let num2 = arr[i + 1];

        if (num1 != num2) {
            let subArr = arr.slice(index, i + 1);
            firstElems.push(subArr[0]);
            index = i + 1;
        }
    }
    return firstElems;
}

function getNearTrIndx(table, allTrs, presentTr, direction) {
    let trIndex = allTrs.indexOf(presentTr);
    let indx;
    
    if (direction == 'up') {
        indx = +trIndex - 1;
    } else if (direction == 'down') {
        indx = +trIndex + 1;
    }
    return indx;
}

function fillSet(i, set, restIDs, adjacent) {
    if ([...set].indexOf(i) != -1 && restIDs.indexOf(i) != -1) {
        let cell = document.getElementById(i);
        let adjCells = adjacent.get(i.toString());

        adjCells.forEach(elem => set.add(elem));
        set.add(i);
        cell.dataset.passed = true;
    }
    return set; 
}