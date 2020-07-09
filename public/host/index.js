let secure = document.location.href.includes("https");

let ws = new WebSocket(`ws${secure?"s":""}://${document.location.hostname}/hostWS`)

wsRefreshInterval = setInterval(()=>{
    ws.send("heroku refresh")
}, 30*1000);

const speed = 2;
const rotspeed = 0.1;
const size = 10;

let players = []

let nextRewardId = 1;
let rewards = []

ws.onmessage = (message) => {
    let data = JSON.parse(message.data);
    //console.log(data);
    let player = players.find(a=>a.id === data.id);
    if(!player){
        let x = 200+Math.random()*(canvas.width-200);
        let y = 90+Math.random()*(canvas.height-100)
        player = {
            id: data.id,
            x,
            y,
            length: 5,
            positions: [{x,y}],
            rotation: Math.random()*Math.PI*2,
            rotspeed: 0,
            dead: false,
            deathAnimationFrame: 0
        }
        players.push(player);
    }
    if(data.action === "released"){
        if(data.direction === "right" && player.rotspeed > 0){
            player.rotspeed = 0
        }
        if(data.direction === "left" && player.rotspeed < 0){
            player.rotspeed = 0
        }
    }else{
        player.rotspeed = rotspeed * (data.direction === "right"?1:-1)
    }
    //console.log(rotspeed, data.direction === "right"?1:-1, data.action === "pressed"?1:0, player.rotspeed);
}

let canvas = document.createElement("canvas");
canvas.height = 900;
canvas.width = 1800;

window.onload = ()=>{
    document.body.appendChild(canvas);
}
let context = canvas.getContext("2d");

setInterval(gameLoop, 20)

function gameLoop(){
    context.clearRect(0,0,canvas.width, canvas.height)
    context.fillStyle = "black";
    context.fillRect(0,0,canvas.width, canvas.height)
    refreshRewards();
    players.forEach(player=>{
        if(checkWallCollision(player) || checkPlayerCollision(player)){
            player.dead = true;
        }

        if(!player.dead){
            checkRewardCollision(player);
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

function checkRewardCollision(player){
    rewards.forEach((reward, index)=>{
        if(collisionDiamonds(player.x,player.y,reward.x,reward.y,size, size*3)){
            player.length += 3;
            rewards.splice(index, 1);
        }
    })
}

function refreshRewards(){
    while(rewards.length < players.length){
        let x = 200+Math.random()*(canvas.width-200);
        let y = 70+Math.random()*(canvas.height-100)
        rewards.push({
            id: nextRewardId++,
            x,
            y
        })
    }
    rewards.forEach(reward=>{
        drawDiamond(reward.x,reward.y, size*3);
    })
}

function checkPlayerCollision(player){
    let collision = false;
    players.forEach(other=>{
        if(other.dead){
            return;
        }
        let i = 0;
        if(other.id === player.id){
            i++;
        }
        for (; i < other.length; i++) {
            let {x, y} = other.positions[other.positions.length-1-(i*5)] || {x: -100, y: -100};
            if(collisionDiamonds(player.x, player.y, x,y, size, size)){
                collision = true
            }
        }
    })
    return collision
}

function checkWallCollision(player){
    return player.x<size/2 || player.x > canvas.width-size/2 || player.y < 0 || player.y > canvas.height-size
}

function collisionDiamonds(x,y,x2,y2, size1, size2){
    return Math.abs(x-x2)<size2/2 && Math.abs((y+size1/2)-(y2+size2/2))<size2/2
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