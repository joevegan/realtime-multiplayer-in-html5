'use strict';

function network () {
    const playerClients = new Map();
    const clientPlayers = new Map();

    function addClientPlayer (client, player) {
        playerClients.set(player, client);
        clientPlayers.set(client, player);
    }

    function removeClientPlayer (client) {
        const player = clientPlayers.get(client);

        clientPlayers.delete(client);
        playerClients.delete(player);
    }

    function sendUpdates (game) {
        const players = Array.from(game.players.values());

        if (players.length > 1) {
            for (const player of game.players) {
                if (playerClients.has(player)) {
                    const state = {
                        serverTime: game.local_time,
                        ownPlayer: player.toJSON(),
                        players: Array.from(game.players.values()).filter(p => {
                            return p !== player;
                        })
                    };

                    playerClients.get(player).emit('onserverupdate', state);
                }
            }
        }
    }

    function receiveClientInput (client, input, inputTime, inputSeq) {
        const player = clientPlayers.get(client);

        player.inputs.push({
            inputs: input,
            time: inputTime,
            seq: inputSeq
        });
    }

    return {
        getPlayerByClient (client) {
            return clientPlayers.get(client);
        },
        getClientByPlayer (player) {
            return playerClients.get(player);
        },
        addClientPlayer,
        removeClientPlayer,
        sendUpdates,
        receiveClientInput
    };
}

module.exports = network;