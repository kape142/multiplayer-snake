function unique_ID() {
    return Math.random().toString(36).substr(2, 9);
}

fetch("data")
    .then(data=>data.json())
    .then(data=>console.log(data));

