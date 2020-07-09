let secure = document.location.href.includes("https");

let ws = new WebSocket(`ws${secure?"s":""}://${document.location.hostname}/hostWS`)

wsRefreshInterval = setInterval(()=>{
    ws.send("heroku refresh")
}, 30*1000);

const speed = 2;
const rotspeed = 0.1;
const size = 10;

let playerObject = {
    id: "a",
    x: 100,
    y: 100,
    length: 2,
    positions: [],
    rotation: 0,
    rotspeed: 0,
    dead: false,
    deathAnimationFrame: 0
}

let players = [playerObject]

ws.onmessage = (message) => {
    let data = JSON.parse(message.data);
    console.log(data);
    let player = players.find(a=>a.id === data.id);
    if(!player){
        let x = 100+Math.random()*canvas.width;
        let y = 100+Math.random()*canvas.height
        player = {
            id: data.id,
            x,
            y,
            length: 5,
            positions: [],
            rotation: Math.random()*Math.PI*2,
            rotspeed: 0,
            dead: false,
            deathAnimationFrame: 0
        }
        players.push(player);
    }
    player.rotspeed = rotspeed * (data.direction === "right"?1:-1) * (data.action === "pressed"?1:0);
    console.log(rotspeed, data.direction === "right"?1:-1, data.action === "pressed"?1:0, player.rotspeed);
}

let canvas = document.createElement("canvas");
canvas.height = 900;
canvas.width = 1800;

window.onload = ()=>{
    document.body.appendChild(canvas);
    document.onkeydown = event => {
        if(event.key === "ArrowLeft"){
            playerObject.rotspeed=-0.1
        }
        if(event.key === "ArrowRight"){
            playerObject.rotspeed=0.1;
        }
    };
    document.onkeyup = event => {
        if(event.key === "ArrowLeft"){
            playerObject.rotspeed=0;
        }
        if(event.key === "ArrowRight"){
            playerObject.rotspeed=0;
        }
    }
}
let context = canvas.getContext("2d");

setInterval(gameLoop, 20)

setInterval(()=>playerObject.length++, 2000);
function gameLoop(){
    context.clearRect(0,0,canvas.width, canvas.height)
    context.fillStyle = "black";
    context.fillRect(0,0,canvas.width, canvas.height)
    players.forEach(player=>{
        checkWallCollision(player);
        if(!player.dead){
            player.rotation+=player.rotspeed;
            player.x += speed*Math.cos(player.rotation);
            player.y += speed*Math.sin(player.rotation);
            player.positions.push({x:player.x, y:player.y})
        }else{
            player.deathAnimationFrame++;
        }
        if(player.deathAnimationFrame % 10 < 5){
            for (let i = 0; i < player.length; i++) {
                let {x, y} = player.positions[player.positions.length-1-(i*5)] || player.positions[0];
                drawDiamond(x,y, size)
            }
        }
        if(player.deathAnimationFrame > 50){
            players.splice(players.findIndex(a=>a.id === player.id),1)
        }
    })
}
/*
function checkPlayerCollision(player){
    players.forEach(other=>{
        let i = 0;
        if(other.id ==)
    })
}*/

function checkWallCollision(player){
    if(player.x<size/2 || player.x > canvas.width-size/2 || player.y < 0 || player.y > canvas.height-size){
        player.dead = true;
    }
}

function collisionDiamonds(x,y,x2,y2){
    return Math.abs(x-x2)<size/2 && Math.abs(y-y2)<size/2
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
}