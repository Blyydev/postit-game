const UTILITIES = require('./utilities.js')

class Privategame{

	constructor(roomid, admin, io) {
		this.io = io.of(roomid)
		// base Room
		this.roomId = roomid
		this.admin = admin
		
		// Players
		this.PLAYERS = {
			list: {},
			disconnected: {}
		}

		// Game
		this.GAME = {
			state: 0, // 0 _ Off - 1 _ On
		}

	}

	// PLAYERS --------------

		// Connexion
		connection(pseudo, id){
			this.newPlayer(pseudo, id)
		}

		// Add new Player in this ROOM
		async newPlayer(pseudo, id){
			this.PLAYERS.list[id] = {
				id: id,
				pseudo: pseudo,
				postit_content: null,
				postit_author: null
			};
			await this.updatePlayersList();
			this.io.to(id).emit('connected', true);
		}

		// emit Updated list of Players
		async updatePlayersList(){
			return await new Promise(resolve => {
				this.io.to('players').emit('players_list', this.PLAYERS.list, this.admin);
				resolve()
			})
		}

		// Disconnection
		async disconnect(id, keep = true){
			if(id in this.PLAYERS.list){
				if(keep){
					this.PLAYERS.disconnected[id] = this.PLAYERS.list[id]
				}else{
					if(this.GAME.state === 1) this.setPostItAuthor()
				}
				delete this.PLAYERS.list[id]
				// Update info
				await this.updatePlayersList()
			}
		}

		// Reconnection
		async reconnection(socketId, previousId){
			this.PLAYERS.list[socketId] = this.PLAYERS.disconnected[previousId]
			this.PLAYERS.list[socketId].id = socketId

			// Change AuthorId from Player with Post-It wrote by this player
			let postItWrote = this.getPostItByAuthorId(previousId)
			this.PLAYERS.list[postItWrote].postit_author = socketId

			// remove in disconnect players list
			delete this.PLAYERS.disconnected[previousId];
			await this.updatePlayersList()
		}


	// GAME --------------

		getPostItByAuthorId(id){
			for(let x in this.PLAYERS.list){
				if(this.PLAYERS.list[x].postit_author === id) return x
			}
		}

		getAuthorByPlayerId(id){
			for(let x in this.PLAYERS.list){
				if(x === id) return this.PLAYERS.list[x].postit_author
			}
		}

		// ---- ///

		setPostItAuthor(){
			let tmpAuthors = []
			for(let x in this.PLAYERS.list) tmpAuthors.push(x)

			let idxAuthor = 0
			for(let y in this.PLAYERS.list){
				idxAuthor++
				if(idxAuthor >= tmpAuthors.length){
					this.PLAYERS.list[y].postit_author = tmpAuthors[0]
				}else{
					this.PLAYERS.list[y].postit_author = tmpAuthors[idxAuthor]
				}
			}
		}

		startGame(socketId){
			if(socketId != this.admin) return false

			// set State
			this.GAME.state = 1

			this.setPostItAuthor()

			// send Data
			this.updatePlayersList()
			
			// Emit START GAME to ALL Players
			this.io.to('players').emit('startGame');
		}

		setPostIt(authorId, content){
			let postItPlayer = null
			for(let x in this.PLAYERS.list){
				if(this.PLAYERS.list[x].postit_author === authorId){
					postItPlayer = x
				}
			}

			this.PLAYERS.list[postItPlayer].postit_content = content
			this.updatePlayersList()
		}

		newPostIt(playerId){
			let authorId = this.getAuthorByPlayerId(playerId)
			this.io.to(authorId).emit('newPostIt', true);
		}

	// End

		testDestroy(){
			if(Object.keys(this.PLAYERS.list).length === 0 && this.PLAYERS.list.constructor === Object){
				return true
			}else{
				return false
			}
		}


}

module.exports = Privategame