class Privategame {
  constructor(roomid, admin, io) {
    this.io = io.of(roomid);

    // base Room
    this.roomId = roomid;
    this.admin = admin;

    // Players
    this.PLAYERS = {};

    // Game
    this.gameStarted = false;
  }

  // PLAYERS --------------

  // Connexion
  async connection(pseudo, id) {
    const isPlayer = !this.gameStarted;

    if (isPlayer) {
      // Add new player
      this.PLAYERS[id] = {
        id: id,
        pseudo: pseudo,
        postit_content: null,
        postit_author: null,
        disconnect: false,
      };
    }

    await this.io.to(id).emit("connected", isPlayer);
    await this.syncData();
  }

  async syncData() {
    this.io.to("players").emit("sync_data", {
      players: this.PLAYERS,
      admin: this.admin,
    });
  }

  // Disconnection
  async disconnect(id, keep = true) {
    if (!id in this.PLAYERS) return;

    if (!this.gameStarted || !keep) {
      delete this.PLAYERS[id];
      if (this.admin === id) this.admin = Object.keys(this.PLAYERS)[0];
      if (this.gameStarted) this.setPostItAuthor();
    } else {
      if (this.PLAYERS[id]) this.PLAYERS[id].disconnect = true;
    }

    // Update info
    await this.syncData();
  }

  // Reconnection
  async reconnection(socketId, previousId) {
    delete Object.assign(this.PLAYERS, {
      [socketId]: this.PLAYERS[previousId],
    })[previousId];

    this.PLAYERS[socketId].id = socketId;
    this.PLAYERS[socketId].disconnect = false;

    // Change AuthorId from Player with Post-It wrote by this player
    const targetId = this.getPostItByAuthorId(previousId);
    const targetPostit = this.PLAYERS[targetId].postit_content;

    this.PLAYERS[targetId].postit_author = socketId;

    await this.syncData();

    return { testReconnexion: true, needPostit: targetPostit === null };
  }

  // GAME --------------

  getPostItByAuthorId(id) {
    for (let x in this.PLAYERS) {
      if (this.PLAYERS[x].postit_author === id) return x;
    }
    return false;
  }

  // ---- ///

  setPostItAuthor() {
    let tmpAuthors = [];
    for (let x in this.PLAYERS) tmpAuthors.push(x);

    let idxAuthor = 0;
    for (let y in this.PLAYERS) {
      idxAuthor++;
      if (idxAuthor >= tmpAuthors.length) {
        this.PLAYERS[y].postit_author = tmpAuthors[0];
      } else {
        this.PLAYERS[y].postit_author = tmpAuthors[idxAuthor];
      }
    }
  }

  startGame(socketId) {
    if (socketId != this.admin) return false;

    // set State
    this.gameStarted = true;

    this.setPostItAuthor();

    // send Data
    this.syncData();

    // Emit START GAME to ALL Players
    this.io.to("players").emit("startGame");
  }

  setPostIt(authorId, content) {
    let postItPlayer = null;
    for (let x in this.PLAYERS) {
      if (this.PLAYERS[x].postit_author === authorId) {
        postItPlayer = x;
      }
    }

    this.PLAYERS[postItPlayer].postit_content = content;
    this.syncData();
  }

  // End

  testDestroy() {
    if (
      Object.keys(this.PLAYERS).length === 0 &&
      this.PLAYERS.constructor === Object
    ) {
      return true;
    } else {
      return false;
    }
  }
}

module.exports = Privategame;
