import { ref, onMounted, computed, inject } from "vue";
import { io } from "socket.io-client";

import Home from "@/components/Home.vue";
import Login from "@/components/Login.vue";
import Lobby from "@/components/Lobby.vue";
import PostIt from "@/components/PostIt.vue";
import Game from "@/components/Game.vue";

export function useWebsocket() {
  const $cookies = inject("$cookies");
  const Cookie_name = "sql_postit";

  const gameState = {
    Home: 0,
    Lobby: 1,
    PostIt: 2,
    Game: 3,
  };

  const socket = ref(null);
  const logged = ref(false);
  const visitor = ref(false);
  const reconnect = ref(false);
  const state = ref(gameState.Home);
  const players = ref({});
  const admin = ref("");
  const roomId = ref("/");

  const currentView = computed(() => {
    if (logged.value) {
      // Waiting for players
      if (state.value === gameState.Lobby) {
        return {
          component: Lobby,
          props: {
            players: players.value,
            roomId: roomId.value,
            admin: admin.value,
            socket: socket.value,
          },
          events: {},
        };
      }

      // Writting a post-it
      if (state.value === gameState.PostIt) {
        return {
          component: PostIt,
          props: {
            players: players.value,
            socket: socket.value,
          },
          events: {
            initGameView: showGame,
          },
        };
      }

      // Playing : showing others post-it
      if (state.value === gameState.Game) {
        return {
          component: Game,
          props: {
            players: players.value,
            socket: socket.value,
            visitor: visitor.value,
          },
          events: {
            backHome: backHome,
            changePostit: changePostit,
          },
        };
      }
    } else {
      if (roomId.value !== "/") {
        return {
          component: Login,
          props: {
            socket: socket.value,
          },
          events: {
            backHome: backHome,
          },
        };
      } else {
        return {
          component: Home,
          props: {
            socket: socket.value,
          },
          events: {},
        };
      }
    }
  });

  const connectSocket = async () => {
    return await new Promise((resolve) => {
      socket.value = io.connect(
        `${import.meta.env.VITE_WEBSOCKET_URL}${roomId.value}`,
        {
          transports: ["websocket"], // check for prod !?
        }
      );

      socket.value.on("connect", () => {
        resolve();
      });
    });
  };

  const setSockets = async () => {
    return await new Promise((resolve) => {
      socket.value.on("sync_data", (data) => {
        players.value = data.players;
        admin.value = data.admin;
      });

      socket.value.on("roomJoined", (nspc) => {
        joiningRoom(nspc);
      });

      if (roomId.value !== "/") {
        // Player connection
        socket.value.on("connected", (isPlayer) => {
          if (isPlayer) {
            $cookies.set(
              Cookie_name,
              `${socket.value.id}___${socket.value.nsp}`,
              "3d"
            );
          } else {
            visitor.value = true;
          }

          logged.value = true;

          if (state.value === gameState.Home && isPlayer)
            state.value = gameState.Lobby;
          else state.value = gameState.Game;
        });

        // Game is starting
        socket.value.on("startGame", () => {
          state.value = gameState.PostIt;
        });

        // Update Players list
        socket.value.on("players_list", (playersData, adminId) => {
          players.value = playersData;
          admin.value = adminId;
        });
      }

      resolve();
    });
  };

  const reconnectingToRoom = async (cookie) => {
    const cookieData = cookie.split("___");
    const oldSocketId = cookieData[0];
    const oldSpace = cookieData[1];

    await joiningRoom(oldSpace);

    socket.value.emit(
      "reconnectionToRoom",
      oldSocketId,
      (test, dataPlayers, needPostit, deleteCookie) => {
        reconnect.value = false;

        if (!test) {
          console.log("Post-it game | Reconnection Failed !");
          backHome(deleteCookie);
          return;
        }

        state.value = needPostit ? gameState.PostIt : gameState.Game;
        roomId.value = oldSpace;
        players.value = dataPlayers;
        logged.value = true;

        $cookies.set(Cookie_name, `${socket.value.id}___${oldSpace}`, "3d");
      }
    );
  };

  const joiningRoom = async (nspc) => {
    if (nspc) roomId.value = nspc;
    await connectSocket();
    await setSockets();
  };

  // Components Events Functions

  const showGame = () => {
    state.value = gameState.Game;
  };

  const backHome = (deleteCookie = true) => {
    joiningRoom("/");
    logged.value = false;
    state.value = gameState.Home;

    if (deleteCookie) $cookies.remove(Cookie_name);
  };

  const changePostit = () => {
    if (state.value === gameState.Game) state.value = gameState.PostIt;
  };

  onMounted(async () => {
    // Check Cookie for Reconnection
    let cookieUser = $cookies.get(Cookie_name);
    if (cookieUser !== null) {
      console.log("Post-it game | Trying to reconnect...");
      reconnect.value = true;

      reconnectingToRoom(cookieUser);
    } else {
      joiningRoom();
    }
  });

  const displayRoomCode = computed(() => {
    if (state.value === gameState.Game) return roomId.value.replace("/", "");
    return false;
  });

  return {
    currentView,
    displayRoomCode,
    reconnect,
    visitor,
  };
}
