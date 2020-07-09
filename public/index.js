fetch("data")
    .then(data=>data.json())
    .then(data=>console.log(data));

const xhttp = new XMLHttpRequest();
const id = "a5025234"

function eventHandler(direction, action) {
    xhttp.open("POST", "/data/" + id);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({id, direction, action}))
}
