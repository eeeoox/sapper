export function openEmptyCells(table, adjacent, rest, direction) {
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
            td.innerHTML = '';
            td.dataset.opened = true;
            td.classList.remove('cell-closed');
            td.classList.add('cell-opened');
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

export function openRestEmpty([...merged], table, adjacent, rest) {
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

// export default { openEmptyCells, openRestEmpty }