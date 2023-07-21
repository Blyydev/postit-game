// INIT LIBS

require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const PORT = process.env.SERVER_PORT || 8080;

// prive Game class
const Privategame = require("./privategame.js");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", req.get("origin"));
  next();
});

app.get("/", function (req, res) {
  res.send("Hello World!");
});

let gamesList = {};

function createRoom() {
  let test = false;
  let tmp = null;
  while (!test) {
    tmp = "/" + Math.floor(1000 + Math.random() * 9000);
    if (!(tmp in gamesList)) test = true;
  }
  return tmp;
}

// Default namespace -> when create new game
io.on("connection", (socket) => {
  socket.on("createRoom", () => {
    let newNspc = createRoom();
    socket.emit("roomJoined", newNspc);
  });

  socket.on("joinRoom", (roomId) => {
    let tmpNamespace = "/" + roomId;
    if (tmpNamespace in gamesList && gamesList[tmpNamespace].GAME.state != 1) {
      socket.emit("roomJoined", tmpNamespace);
    }
  });

  socket.on("customReconnect", (cookie) => {
    let tmpCookie = cookie.split("___");
    let userSCKT = tmpCookie[0];
    let roomNSP = tmpCookie[1];

    if (
      roomNSP in gamesList &&
      userSCKT in gamesList[roomNSP].PLAYERS.disconnected
    ) {
      socket.emit("reconnect_player", true, roomNSP, userSCKT);
    } else {
      socket.emit("reconnect_player", false);
    }
  });
});

io.of(/^\/[0-9]{4}/).on("connection", (socket) => {
  const namespace = socket.nsp.name;

  // Connexion
  socket.on("connectionRoom", (pseudo) => {
    if (pseudo.length > 2 && pseudo.length < 15) {
      socket.join("players");

      // if  room doesn't exist, init it
      if (!(namespace in gamesList)) {
        gamesList[namespace] = new Privategame(namespace, socket.id, io);
      }
      gamesList[namespace].connection(pseudo, socket.id);
    }
  });

  // Player RECONNECTION
  socket.on("reconnectionToRoom", async (oldSocket, fn) => {
    socket.join("players");
    await gamesList[namespace].reconnection(socket.id, oldSocket);
    let postItWrote = gamesList[namespace].getPostItByAuthorId(socket.id);
    fn({
      state: gamesList[namespace].GAME.state,
      postIt: gamesList[namespace].PLAYERS.list[postItWrote].postit_content,
    });
  });

  // LOBBY
  socket.on("startgame", () => {
    if (namespace in gamesList) gamesList[namespace].startGame(socket.id);
  });

  // Game ACTIONS
  socket.on("setPostIt", (postItContent) => {
    gamesList[namespace].setPostIt(socket.id, postItContent);
  });

  socket.on("changeMyPostIt", () => {
    gamesList[namespace].newPostIt(socket.id);
  });

  // Quitter la partie
  socket.on("quitGame", () => {
    if (namespace in gamesList) {
      // Remove player
      gamesList[namespace].disconnect(socket.id, false);
      // if no more player : delete this room
      if (gamesList[namespace].testDestroy()) {
        delete gamesList[namespace];
      }
    }
  });

  // DECONNEXION
  socket.on("disconnect", () => {
    if (namespace in gamesList) {
      // Remove player
      gamesList[namespace].disconnect(socket.id);
      // if no more player : delete this room
      if (gamesList[namespace].testDestroy()) delete gamesList[namespace];
    }
  });
});

// Listen the Server
server.listen(PORT, () => {
  console.log(`Post-it game BACKEND | listening on port ${PORT}`);
});
