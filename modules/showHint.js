function showHint(hint, hintImg, table, event, content) {
    hint.addEventListener(event, function() {
        if (table.dataset.win == undefined) {
            let tds = table.querySelectorAll('td');

            for (let td of tds) {
                if (td.dataset.bomb == 'true') {
                    td.innerHTML = content;
                }
            }
        }
        if (event == 'mousedown' && event != 'mouseout') {
            hintImg.classList.add('hint-eye');
        } else {
            hintImg.classList.remove('hint-eye');
        }
    });
}
export default showHint;