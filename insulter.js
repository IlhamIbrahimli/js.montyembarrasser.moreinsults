function loadFiles() {
    try {
        var filename = "./insults.json"
        loadedInsults = JSON.parse(fs.readFileSync(filename, 'utf8'))
    }catch(error) {
        console.error("Chat file dead:", error)
    }
}


socket.on("insult", async (returnInsult) => {
    const insult = "Monty is a " + loadedInsults["adj"][Math.floor(Math.random() * loadedInsults["adj"].length)].toLowerCase() + " " + loadedInsults["verbs"][Math.floor(Math.random() * loadedInsults["verbs"].length)].toLowerCase() + " " + loadedInsults["nouns"][Math.floor(Math.random() * loadedInsults["nouns"].length)].toLowerCase();
    
    returnInsult(insult);
});

function insultOnLoad() {
    // Adding functionality from py.insultgen
    socket.emit('insult', (callback) => {
        console.log(callback)
    })
}