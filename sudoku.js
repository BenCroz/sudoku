function score(b) {
    var scoreboard = {};

    b.forEach(function (line, i, arr) {
        scoreboard["R" + i] = line.reduce(function (a, c) {
            return a + c;
        }, 0);
    });

    for (let i = 0; i < b.length; i++)
        for (let j = 0; j < b[0].length; j++)
            scoreboard["C" + j] = (scoreboard["C" + j] ? scoreboard["C" + j] : 0) + b[i][j];

    //score 3x3 blocks:
    function sumAdjacent(t, x, y) {
        // console.log(t[x][y]);
        return 0 +
            t[x][y] + t[x][y - 1] + t[x][y + 1] +
            t[x - 1][y] + t[x - 1][y - 1] + t[x - 1][y + 1] +
            t[x + 1][y] + t[x + 1][y - 1] + t[x + 1][y + 1];
    }

    //3x3 blocks
    scoreboard["blockA"] = sumAdjacent(b, 1, 1);
    scoreboard["blockB"] = sumAdjacent(b, 1, 4);
    scoreboard["blockC"] = sumAdjacent(b, 1, 7);

    scoreboard["blockD"] = sumAdjacent(b, 4, 1);
    scoreboard["blockE"] = sumAdjacent(b, 4, 4);
    scoreboard["blockF"] = sumAdjacent(b, 4, 7);

    scoreboard["blockG"] = sumAdjacent(b, 7, 1);
    scoreboard["blockH"] = sumAdjacent(b, 7, 4);
    scoreboard["blockI"] = sumAdjacent(b, 7, 7);

    var success = true;
    for (var key in scoreboard) {
        if (scoreboard[key] != 45) {
            scoreboard[key] = "<b>ERROR: " + scoreboard[key] + "</b>";
            success = false;
        }
    }
    scoreboard.results = success ? "GOOD!" : "<b>FAILED!</b>";

    //RENDER
    // document.querySelector("#score p").innerHTML = JSON.stringify(scoreboard, null, "\t");

    return success;
}

function newBoard(n, m) {
    var b = [];
    for (let i = 0; i < n; i++)
        b.push(new Array(m).fill(0));
    return b;
}

function blockRouter(b, x, y) {
    function getCentered(z) {
        return z < 3 ? 1 : z < 6 ? 4 : 7;
    }
    y = getCentered(y);
    x = getCentered(x);
    function returnAdjacent() {
        return [
            [y - 1, x - 1], [y, x - 1], [y + 1, x - 1],
            [y - 1, x], [y, x], [y + 1, x],
            [y - 1, x + 1], [y, x + 1], [y + 1, x + 1]
        ]
    }
    function returnAdjacentValues() {
        return returnAdjacent().map(function (toup) {
            return b[toup[0]][toup[1]];
        });
    }
    return {
        returnAdjacent: returnAdjacent,
        returnAdjacentValues: returnAdjacentValues
    }
}

function filter(filter, set) {
    return set.filter(function (n) {
        for (let i = 0; i < filter.length; i++)
            if (filter[i] == n)
                return false
        return true;
    });
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = rand(currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function rand(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function updateTable(toup, table) {
    // console.log(toup, table);
    var td = table.querySelectorAll("td")[toup[1] * 9 + toup[0]];
    td.innerHTML = toup[2];
    td.style.background = "#333333";
    setTimeout(function () {
        td.style.background = "none";
    }, 0);
}

function displayTable(arr, table) {
    var innerHTML = "<table>";
    arr.forEach(function (row) {
        innerHTML += "\n\t<tr>";
        row.forEach(function (cell) {
            innerHTML += "<td>" + cell + "</td>";
        });
        innerHTML += "\n\t</tr>";
    });
    innerHTML += "</table>";
    table.innerHTML = innerHTML;
}

var clues;
function getClues() {
    var input = document.querySelector("#input > textarea").value;
    var arr = input.match(/[0-9]/g);
    if (arr.length != 81)
        throw arr.length + " numbers found, shoudl be 81!";
    clues = arr.map(function (s) {
        return parseInt(s);
    });
    init();
}
document.querySelector("#input > button").addEventListener("click", getClues);

function addClues(b) {
    bLen = b.length;
    if (clues){
        for (let i = 0; i < bLen; i++)
            for (let j = 0; j < b[0].length; j++)
                if (clues[i * bLen + j])
                    b[i][j] = clues[i * bLen + j];
    }
    else
        console.log("NO CLUES!?");
}

function init() {
    function updateCell(x, y) {
        if (!board[y][x]) {
            //filter
            var colFilter = board.map(function (v) { return v[x]; });
            // console.log("colFilter", colFilter);
            var rowFitler = board[y];
            // console.log("rowFitler", rowFitler);
            var blockFilter = blockRouter(board, x, y).returnAdjacentValues();
            // console.log("blockFilter", blockFilter);
            var allFilters = colFilter.concat(rowFitler).concat(blockFilter);
            // console.log("allFilters", allFilters);

            //write
            board[y][x] = filter(allFilters, shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]))[0];
            // console.log(board[y][x]);

            if (board[y][x] === undefined) {
                // console.log("OH NOES!", x, y);

                //CORRECTIONS
                board.forEach(function (row) {
                    row[x] = 0; //clear colum
                });
                board[y].forEach(function (cell) {
                    cell = 0; //clear row
                });
                blockRouter(board, x, y).returnAdjacent().forEach(function (toup) {
                    board[toup[0]][toup[1]] = 0; //clear block
                });
                
                //re-add clues
                addClues(board);

                //ERROR HISTORY
                errorMessage = x + "-" + y;
                errorHistory.push(errorMessage);
                if (errorHistory.length > 18)
                    errorHistory.shift();
                var errorCount = errorHistory.filter(function (m) {
                    return errorMessage == m;
                });
                if (errorCount.length > 4) {
                    console.log("BALK!");
                    console.log(errorCount.length, errorHistory);
                    // throw "STALLED";
                    init(); //RESTART!
                }

                //RENDER
                // window.requestAnimationFrame(function () {
                //     displayTable(board, table);
                //     table.style.background = "#1b1b1b";
                //     setTimeout(function () {
                //         table.style.background = "none";
                //     }, 0);
                // });
            }
            else {
                //RENDER
                // updateTable([y, x, board[y][x]], table);
                // score(board);
            }
        }

        x++;
        if (x == bLen) {
            x = 0;  //loop x
            y++;    //increment y
        }
        if (y == bLen)
            y = 0; //loop y

        if (score(board)) {
            console.log("success!", opsCounter.value);

            //RENDER and exit
            return displayTable(board, table); //exit case!
            // init(); //restart!
        }
        else {
            // window.requestAnimationFrame(function () {
            //     opsCounter.stepUp();
            //     updateCell(x, y);
            // });

            setTimeout(function () {
                opsCounter.stepUp();
                updateCell(x, y);
            }, 0);
        }
    }

    //init
    var board = newBoard(9, 9);
    var bLen = board.length;
    var table = document.getElementById("answer");
    var opsCounter = document.querySelector("#ops");
    opsCounter.value = 0;
    var errorHistory = [];

    //solving? 
    addClues(board);

    //RENDER
    displayTable(board, table);

    //go
    updateCell(0, 0);
}

console.log("go");
// init();