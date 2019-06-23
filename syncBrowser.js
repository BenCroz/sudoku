//SYNC 
var pageHash = 0;
var pingCount = 0;
function ping() {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', '/sudoku/sudoku.js?ping&' + pingCount++);
    xhr.onload = function () {
        if (!pageHash)
            pageHash = xhr.response.length;
        if (pageHash != xhr.response.length)
            location.reload(); //refresh updated page
    };
    xhr.send();
}
setInterval(ping, 3000);
// /SYNC