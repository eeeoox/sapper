function showHint(hint, table, event, content) {
    hint.addEventListener(event, function() {
        if (table.dataset.win == undefined) {
            let tds = table.querySelectorAll('td');

            for (let td of tds) {
                if (td.dataset.bomb == 'true') {
                    td.innerHTML = content;
                }
            }
        }
    });
}
export default showHint;