const axios = require('axios');
const express = require('express');
const app = express();
const path = require('path');
const socketio = require('socket.io');
const fs = require('node:fs');
const port = 9000
let adj;
let ver;
let nou;

app.use(express.static('public'));

// make server serve index.html when requested
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// start server
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


const io = socketio(server)
function loadFiles() {
    try {
        adj = fs.readFileSync("./adj.txt", 'utf8').split("\n")
        ver = fs.readFileSync("./ver.txt", 'utf8').split("\n")
        nou = fs.readFileSync("./nou.txt", 'utf8').split("\n")

        console.log(adj)
        console.log(ver)
        console.log(nou)
    }catch(error) {
        console.error("Chat file dead:", error)
    }
}

loadFiles();
// use folder public




// Replace with your Steam API Key and Steam User ID
const steamApiKey = '8D5948BD8EF0A3E6D105CB5A3676E39E';
//const steamId = '76561199061101466';

// Function to get game's banner image URL from the Steam store
async function getGameBanner(appId) {
    try {
        const url = `https://store.steampowered.com/api/appdetails`;
        const response = await axios.get(url, {
            params: {
                appids: appId,
            }
        });

        const gameData = response.data[appId];
        if (gameData.success) {
            return gameData.data.header_image; // Returns the URL for the game's banner image
        }
        return null;
    } catch (error) {
        console.error(`Error fetching banner for appId ${appId}:`, error);
        return null;
    }
}

// Function to get user's owned games and their playtime
async function getOwnedGames(steamId) {
    try {
        const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/`;
        const response = await axios.get(url, {
            params: {
                key: steamApiKey,
                steamid: steamId,
                include_played_free_games: true,  // Include free games in the result
                include_appinfo: true,            // Include appinfo such as game name
            }
        });

        const games = response.data.response.games;

        // Sort games by playtime (descending order) and get the top 20
        const topGames = games.sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 20);

        // Create an object to store game information in JSON format
        const topGamesJSON = [];

        // Loop through each game and fetch its banner URL
        for (let game of topGames) {
            const bannerUrl = await getGameBanner(game.appid); // Fetch the banner image URL
            topGamesJSON.push({
                name: game.name,
                timemin: (game.playtime_forever).toFixed(2),
                timehrs: (game.playtime_forever / 60).toFixed(2),
                banner: bannerUrl
            });
        }

        // Output the top games in JSON format
        console.log(JSON.stringify(topGamesJSON, null, 2));
    } catch (error) {
        console.error('Error fetching owned games:', error);
    }
}

io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on("request", async (data, callback) => {
        try {
            // Get the user's owned games with the provided steamId
            const topGames = await getOwnedGames(data.steamId);

            // Call the callback with the top games JSON data once the games are fetched
            callback(topGames); // This triggers the callback with the returned data
        } catch (error) {
            console.error("Error during request:", error);
            callback({ error: "An error occurred while fetching data." }); // Error handling callback
        }
    });

    socket.on("insult", async (returnInsult) => {
        const insult = "Monty is a" + adj[Math.floor(Math.random() * adj.length)].toLowerCase() + " " + ver[Math.floor(Math.random() * ver.length)].toLowerCase() + " " + nou[Math.floor(Math.random() * nou.length)].toLowerCase();
        
        returnInsult(insult);
    });
});