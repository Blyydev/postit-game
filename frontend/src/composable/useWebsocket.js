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
          },
          events: {
            backHome: backHome,
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
            tryreconnect: reconnect.value,
            socket: socket.value,
          },
          events: {},
        };
      }
    }
  });

  const connectSocket = async () => {
    return await new Promise((resolve) => {
      let options;
      // ~ DEV
      if (import.meta.env.MODE === "development") {
        options = {
          "force new connection": true,
          reconnectionAttempts: "Infinity",
          timeout: 10000,
          transports: ["websocket"],
        };
      } else {
        options = {
          forceNew: true,
          reconnection: true,
          reconnectionDelay: 500,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 99999,
        };
      }

      socket.value = io.connect(
        `${import.meta.env.VITE_WEBSOCKET_URL}${roomId.value}`,
        options
      );

      socket.value.on("connect", () => {
        resolve();
      });
    });
  };

  const setSockets = async () => {
    return await new Promise((resolve) => {
      if (roomId.value == "/") {
        // Joined a new Room
        socket.value.on("roomJoined", (nspc) => {
          joiningRoom(nspc);
        });
      } else {
        // Player connection
        socket.value.on("connected", (realPlayer) => {
          if (realPlayer) {
            let cookieV = socket.value.id + "___" + socket.value.nsp;
            // createCookie("sql_postit", cookieV, 1);
            $cookies.set(Cookie_name, cookieV, "3d");
          }
          logged.value = true;
          if (state.value === gameState.Home) state.value = gameState.Lobby;
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

        socket.value.on("newPostIt", (test) => {
          if (!test) return false;
          state.value = gameState.PostIt;
        });
      }

      // custom RECONNECTION
      socket.value.on("reconnect_player", (test, namespace, oldId) => {
        $cookies.remove(Cookie_name);
        reconnect.value = false;

        if (test) {
          return reconnectingToRoom(namespace, oldId);
        } else {
          console.log("reconnection FAILED");
        }
      });

      resolve();
    });
  };

  const reconnectingToRoom = async (namespace, oldId) => {
    roomId.value = namespace;
    logged.value = true;

    await connectSocket();
    await setSockets();

    let newCookie = socket.value.id + "___" + namespace;
    $cookies.set(Cookie_name, newCookie, "3d");

    socket.value.emit("reconnectionToRoom", oldId, (res) => {
      if (res.state == gameState.Lobby) {
        if (res.postIt === null) {
          state.value = gameState.PostIt;
        } else {
          state.value = gameState.Game;
        }
      } else {
        state.value = gameState.Lobby;
      }
    });
  };

  const joiningRoom = async (nspc) => {
    roomId.value = nspc;
    await connectSocket();
    await setSockets();
  };

  // Components Events Functions

  const showGame = () => {
    state.value = gameState.Game;
  };

  const backHome = () => {
    joiningRoom("/");
    logged.value = false;
    state.value = gameState.Home;

    $cookies.remove(Cookie_name);
  };

  onMounted(async () => {
    await connectSocket();
    await setSockets();

    // Check Cookie for Reconnection
    let cookieUser = $cookies.get(Cookie_name);
    if (cookieUser != null) {
      console.log("Trying to reconnect...");
      reconnect.value = true;
      socket.value.emit("customReconnect", cookieUser);
    }
  });

  return currentView;
}
