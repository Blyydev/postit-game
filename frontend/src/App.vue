<template>

	<div class="app-content" :id="currentView.component">

		<header :class="headerClass">
			<Svg name="logo"/>
		</header>

		<transition name="sql-fade">
		</transition>

		<component
			:is="currentView.component"
			v-bind="currentView.props"
			v-on="currentView.events"
			:key="currentView.component"
		></component>
	</div>

</template>

<script>
	import Home from './components/Home.vue'
	import Login from './components/Login.vue'
	import Lobby from './components/Lobby.vue'
	import PostIt from './components/PostIt.vue'
	import Game from './components/Game.vue'

	import { io } from 'socket.io-client'

	let _this

	export default {
		data() {
			return {
				socket : null,
				logged : false,
				reconnect: false,
				state : 0,
				players : {},
				admin : null,
				roomId : '/'
			}
		},
		computed: {
			headerClass: function(){
				if(this.currentView.component === 'Game')
					return 'small'
				else
					return ''
			},
			currentView: function(){
				if(this.logged){
					if(this.state === 1){
						return {
							component: 'Lobby',
							props: {
								players: this.players,
								roomId: this.roomId,
								admin: this.admin,
								socket: this.socket
							},
							events: {}
						}
					}
					if(this.state === 2){
						return {
							component: 'PostIt',
							props: {
								players: this.players,
								socket: this.socket,
							},
							events: {
								initGameView: this.showGame
							}
						}
					}
					if(this.state === 3){
						return {
							component: 'Game',
							props: {
								players: this.players,
								socket: this.socket,
							},
							events: {
								backHome: this.backHome
							}
						}
					}
				}else{
					if(this.roomId == '/'){
						return {
							component: 'Home',
							props: {
								tryreconnect: this.reconnect,
								socket: this.socket
							},
							events: {}
						}
					}else{
						return {
							component: 'Login',
							props: {
								socket: this.socket
							},
							events: {}
						}
					}
				}
			}
		},
		methods: {
			async connectSocket(){
				let namespace = this.roomId;
				return await new Promise(resolve => {
					// ~ DEV
					if(import.meta.env.MODE === "development" ){
						this.socket = io('localhost:8082'+namespace, {
							"force new connection" : true,
							"reconnectionAttempts": "Infinity",
							"timeout" : 10000,
							"transports" : ["websocket"]
						})
					}
					// ~ BUILD
					if(import.meta.env.MODE === "production" ){
						this.socket = io.connect(namespace, {
							forceNew:true,
							reconnection: true,
							reconnectionDelay: 500,
							reconnectionDelayMax : 5000,
							reconnectionAttempts: 99999
						});
					}
					this.socket.on('connect', () => {
						resolve()
					})

				})
			},
			async setSockets(){
				return await new Promise(resolve => {

					if(this.roomId == '/'){
						// Joined a new Room
							this.socket.on('roomJoined', (nspc) => {
								this.joiningRoom(nspc)
							})
					}else{
						// Player connection
							this.socket.on('connected', (realPlayer) => {
								if(realPlayer){
									let cookieV = this.socket.id + '___' + this.socket.nsp
									createCookie('sql_postit', cookieV, 1)
								}
								this.logged = true
								if(this.state == 0) this.state = 1
							})

						// Game is starting
							this.socket.on('startGame', (settings) => {
								this.state = 2
							})

						// Update Players list
							this.socket.on('players_list', (players, admin) => {
								this.players = players
								this.admin = admin
							})
					}

					// custom RECONNECTION
						this.socket.on('reconnect_player', (test, namespace, oldId) => {
							eraseCookie('sql_postit')
							this.reconnect = false

							if(test){
								return this.reconnectingToRoom(namespace, oldId)
							}else{
								console.log('reconnection FAILED')
							}
						})

					resolve()
				})
			},
			async reconnectingToRoom(namespace, oldId){
				this.roomId = namespace
				this.logged = true

				await this.connectSocket()
				await this.setSockets()

				let newCookie = this.socket.id + '___' + namespace
				createCookie('sql_postit', newCookie, 1)

				this.socket.emit('reconnectionToRoom', oldId, (res) => {
					if(res.state === 1){
						if(res.postIt === null){
							_this.state = 2
						}else{
							_this.state = 3
						}
					}else{
						this.state = 1
					}
				})				
			},
			async joiningRoom(nspc){
				this.roomId = nspc
				await this.connectSocket()
				await this.setSockets()
			},
			showGame(){
				this.state = 3
			},
			backHome(){
				this.joiningRoom('/');
				this.state = 0
				this.logged = false
				eraseCookie('sql_postit')
			}
		},
		async created(){
			_this = this

			await this.connectSocket()
			await this.setSockets()

			// Check Cookie for Reconnection
			let cookieUser = readCookie('sql_postit')
			if(cookieUser != null){
				this.reconnect = true
				this.socket.emit('customReconnect', cookieUser)
			}

		},
		async mounted() {

		},
		components: {
			Home, Login, Lobby, PostIt, Game
		}
	}

	// COOKIE functions

		function createCookie(name,value,days){
			if (days) {
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			else var expires = "";
			document.cookie = name+"="+value+expires+"; path=/";
		}
		function readCookie(name){
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
		}
		function eraseCookie(name){
			createCookie(name,"",-1);
		}
</script>

<style lang="less">
	@import "assets/css/base.less";
</style>
