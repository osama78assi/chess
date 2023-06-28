// To Show The User All Available Moves
function getLegalMoves(callback) {
    let req = new XMLHttpRequest();
    req.open("GET", "getLegalL" , false);
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            callback(req.responseText);
        }
    };
    req.send();
}
// To Handle Bot Move If Start First
function botMove() {
    // To Know If There A Check Before Push Move To The Board
    setTimeout(() => {
        isCheck();
    }, 500);
    let req = new XMLHttpRequest();
    req.open("GET", "botFirstL", false);
    req.onreadystatechange = () => {
        if(req.status === 200 && req.readyState === 4) {
            if(JSON.parse(req.responseText)["gameOver"]) {
                gameOver(JSON.parse(req.responseText)["result"]);
            }
            else {
                let move = JSON.parse(req.responseText)['botMove'];
                // Get All Squares 
                let squares = document.querySelectorAll(".board .row .square");
                let piece;
                squares.forEach((element) => {
                    if(element.id == move.slice(0, 2)) {
                        piece = element.children[0];
                        element.replaceChildren();
                    }
                });
                squares.forEach((element) => {
                    if(element.id == move.slice(2, 4)) {
                        element.replaceChildren(piece);
                    }
                });
                increaseMoves();
            }
        }
    }
    req.send();
}
// To Know If Theres A Check
function isCheck() {
    let req = new XMLHttpRequest();
    req.open("GET", "isCheckL", false)
    req.onreadystatechange = function() {
        let cond = JSON.parse(req.responseText)['check'];
        if(cond) {
            let warn = document.querySelector(".warn");
            warn.classList.add("right");
            setTimeout(() => {
                warn.classList.remove("right");
            }, 2000);
        }
    }
    req.send();
}
// To Show Message When Game Is Over
function gameOver(result) {
    ableToPlay = false;
    clearInterval(matchTime);
    let gameOver = document.createElement("div");
    let gameP = document.createElement("p");
    gameP.appendChild(document.createTextNode(`Game Over With ${document.querySelector(".header .moves").innerText.split(":")[1]} Moves In ${document.querySelector(".header .time").innerText.split(":")[1]}`));
    let resultP = document.createElement("p");
    resultP.appendChild(document.createTextNode("The Result Is: " + result));
    let retryP = document.createElement("p");
    retryP.appendChild(document.createTextNode("To Retry Click On Restart"));
    gameOver.appendChild(gameP);
    gameOver.appendChild(resultP);
    gameOver.appendChild(retryP);
    gameOver.classList.add("game-over");
    document.body.appendChild(gameOver);
    let everyThing = document.querySelectorAll("body :not(.game-over, .game-over *, .header, .header *)");
    everyThing.forEach((element) => element.classList.add("blur"));
}
// To Take Bot Move And Send User Move To The Server
function sendMove(move) {
    increaseMoves();
    // Cooldown To See If There Is A Check
    setTimeout(() => {
        isCheck();
    }, 500);
    let req = new XMLHttpRequest();
    req.open("GET", "startL?move="+move, false);
    req.onloadend = function() {
        let userMoves = document.querySelectorAll(".square");
        userMoves.forEach((ele) => {
                ele.classList.add("dis");
        });
        // Cooldown To Take The Move From User And Block Him\Her From Moving Till The Bot Move
        setTimeout(() => {
            botMove()
            userMoves.forEach((ele) => {
                    ele.classList.remove("dis");
            });
        }, 1000);
    };
    req.send();
}
// Ask The User If Want To Start First
function turn() {
    // The Popup
    let askDiv = document.createElement("div");
    askDiv.className = "turn";
    // The Question
    let askP = document.createElement("p");
    askP.className = "ask";
    let p = document.createElement("p");
    p.className = "pref";
    askP.appendChild(document.createTextNode("Do You Want Your Turn First"));
    p.appendChild(document.createTextNode("\"To Best Performance Set The View To 75%\""))
    // Yes Button
    let whiteBtn = document.createElement("span");
    whiteBtn.appendChild(document.createTextNode("Yes"));
    // No Button
    let blackBtn = document.createElement("span");
    blackBtn.appendChild(document.createTextNode("No"));
    // Container For Design
    let containerAnswers = document.createElement("div");
    containerAnswers.appendChild(whiteBtn);
    containerAnswers.appendChild(blackBtn);
    askDiv.appendChild(askP);
    askDiv.appendChild(p);
    askDiv.appendChild(containerAnswers);
    document.body.appendChild(askDiv);
    // Blur Everything Except The Popup
    let everyThing = document.querySelectorAll("body :not(.turn, .turn *, .header, .header *)");
    everyThing.forEach((element) => element.classList.add("blur"));
}
// To Increase Moves Counter By One
function increaseMoves() {
    let movesContainer = document.querySelector(".header .settings .moves").innerText;
    let counter = movesContainer.split(":");
    counter[1]++;
    movesContainer = counter[0] + ": " + counter[1];
    document.querySelector(".header .settings .moves").replaceChildren(document.createTextNode(movesContainer));
}
// To Handel User Move
function legal() {
    let square = document.querySelector(".clicked");
    let piece = square.children[0];
    // Get The Square That Have The Piece
    let from = square.id;
    // Get The Target 
    let to = this.id
    square.replaceChildren();
    if(this.childElementCount) {
        // Remove BLack Piece If There
        this.replaceChildren();
    }
    this.appendChild(piece);
    // Send The Move To Server
    sendMove((from + to))
    square.classList.remove("clicked");
    this.removeEventListener("click", legal);
    removeAllEventListeners();
}
function removeAllEventListeners() {
    document.querySelectorAll(".can").forEach((square) => {
        square.removeEventListener("click", legal);
        square.classList.remove("can");
    });
}
// Match Time
let matchTime;
// Colors The Board
let rowSquares = document.querySelectorAll(".board .row");
for(let row = 0; row < 8; row++) {
    let squares = rowSquares[row].children;
    for(let col = 0; col < 8; col++) {
        if((row % 2 == 0 && col % 2 != 0) || (row % 2 != 0 && col % 2 == 0)) {
            squares[col].style.backgroundColor = "#d3a06a";
        }
        else {
            squares[col].style.backgroundColor = "white";
        }
    }
}
document.querySelector(".reset").classList.add("dis");
let whiteSymbols = ["P", "N", "K", "Q", "R", "B"];
let squares = document.querySelectorAll(".board .row .square");
// To Block User From Plying Before Click On Start Or Its Him\Her turn
ableToPlay = false;
// Start Button
let startBtn = document.querySelector(".start");
startBtn.onclick = () => {
    turn();
    let yesOrNo = document.querySelectorAll(".turn div span");
    yesOrNo.forEach((btn) => {
        btn.onclick = () => {
            if(btn.innerText == "Yes") {
                document.querySelector(".turn").remove()
                ableToPlay = true;
                let everyThing = document.querySelectorAll("body :not(.turn, .turn *, .header, .header *)");
                everyThing.forEach((element)=>element.classList.remove("blur"));
            }
            else {
                // Let Bot Move
                document.querySelector(".turn").remove()
                ableToPlay = true;
                let everyThing = document.querySelectorAll("body :not(.turn, .turn *, .header, .header *)");
                everyThing.forEach((element)=>element.classList.remove("blur"));
                botMove();
            }
        }
    });
    startBtn.style.pointerEvents = 'none';
}
// Check From Time To Time If User Clicked Start
let ableToPlayInterval = setInterval(() => {
    if(ableToPlay) {
        squares.forEach((ele) => {
            if(ele.childElementCount) {
                if(whiteSymbols.includes(ele.children[0].className)) {
                    ele.children[0].style.cursor = 'pointer';
                }
            }
        })
        clearInterval(ableToPlayInterval);
        // Start Macth Time
        let times = document.querySelector(".header .settings .time");
        let time = times.innerText.split(":");
        let counter = 0;
        matchTime = setInterval(() => {
            let unit;
            counter++;
            if(counter < 60) {
                time[1] = counter;
                unit = "s";
                times.replaceChildren(document.createTextNode(time.join(": ") + unit));
            }
            else if(counter % 60 == 0) {
                time[1] = counter / 60;
                if(time[1] % 60 == 0) {
                    time[1] /= 60;
                    unit = "h";
                    times.replaceChildren(document.createTextNode(time.join(": ") + unit));
                }
                else if(counter < 3600){
                    unit = "m";
                    times.replaceChildren(document.createTextNode(time.join(": ") + unit));
                }
            }
        }, 1000); 
        document.querySelector(".reset").classList.remove("dis");
    }
}, 500);
// If User Clicked Restart The Macth
document.querySelector(".reset").onclick = () => {
    window.location.reload();
};
// Handel User Move
let previous = null;
squares.forEach((square) => {
    square.addEventListener("click",function process() {
        // Check If The User Can Play
        if(ableToPlay) {
            // Check If The Square Has A Piece
            if(square.childElementCount) {
                // Check If The Piece Is A White Piece
                if(whiteSymbols.includes(square.children[0].className)) {
                    if(previous) {
                        previous.classList.remove("clicked");
                        removeAllEventListeners();
                    }
                    // Get The Moves From Server
                    getLegalMoves((response) => {
                        if(JSON.parse(response)["gameOver"]){
                            // If The Game Has Finished
                            gameOver(JSON.parse(response)["result"]);
                        }
                        else {
                            // Get Legal Moves From Json Object
                            let legalMoves = JSON.parse(response)["legalMoves"];
                            // Get The Pieces That Can Move
                            let piecesCanMove = legalMoves.map((element) => element.slice(0,2));
                            // Check The The Piece If Can Move
                            if(piecesCanMove.includes(square.id)) {
                                previous = square;
                                square.classList.add("clicked");
                                // Remove Event Listeners For The Old Legal Moves Of The Previously Selected Piece
                                document.querySelectorAll(".can").forEach((square) => {
                                    square.removeEventListener("click", legal);
                                    square.classList.remove("can");
                                });
                                // Get The Available For Clicked Piece
                                let availClicked = legalMoves.filter((value) => value.slice(0, 2) == square.id);
                                availClicked.forEach((e)=>{
                                    a = document.querySelector("#"+e.slice(2, 4));
                                    a.classList.add("can");
                                    document.querySelectorAll(".can").forEach((e)=>{
                                        e.addEventListener("click", legal);
                                    });
                                });
                            }
                        }
                    });
                }
            }
        }
    });
});