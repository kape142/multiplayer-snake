function unique_ID() {
    return Math.random().toString(36).substr(2, 9);
}

const xhttp = new XMLHttpRequest();
const id = unique_ID();

function eventHandler(direction, action) {
    xhttp.open("POST", "/data/" + id);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({id, direction, action}))
}
