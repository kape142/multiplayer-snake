let ws = new WebSocket(`ws://${document.location.hostname}/hostWS`)

wsRefreshInterval = setInterval(()=>{
    ws.send("heroku refresh")
}, 30*1000);

ws.onmessage = (message) => {
    let data = JSON.parse(message.data);
    console.log(data);
}

let playerObject = {
    id: "a",
    x: 100,
    y: 100,
    length: 2,
    positions: [],
    rotation: 0,
}

const speed = 2;

let players = [playerObject]

let canvas = document.createElement("canvas");
canvas.height = 900;
canvas.width = 1000;
window.onload = ()=>{
    document.body.appendChild(canvas);
    document.onkeydown = event => {
        if(event.key === "ArrowLeft"){
            playerObject.rotation+=0.1;
        }
        if(event.key === "ArrowRight"){
            playerObject.rotation-=0.1;
        }
    };
}
let context = canvas.getContext("2d");

setInterval(gameLoop, 20)

setInterval(()=>playerObject.length++, 2000);
function gameLoop(){
    context.clearRect(0,0,canvas.width, canvas.height)
    context.fillStyle = "black";
    context.fillRect(0,0,canvas.width, canvas.height)
    players.forEach(player=>{
        player.x += speed*Math.cos(player.rotation);
        player.y += speed*Math.sin(player.rotation);
        player.positions.push({x:player.x, y:player.y})
        console.log(player);
        for (let i = 0; i < player.length; i++) {
            let {x, y} = player.positions[player.positions.length-1-(i*5)] || player.positions[0];
            drawDiamond(x,y, 10)
        }
    })
}

function drawDiamond(x, y, size){
    context.save()
    context.beginPath();
    context.fillStyle = "white";
    context.moveTo(x, y);
    context.lineTo(x - size / 2, y + size / 2);
    context.lineTo(x, y + size);
    context.lineTo(x + size / 2, y + size / 2);
    context.closePath();

    context.fill();
    context.restore()
    console.log(x,y,size)
}