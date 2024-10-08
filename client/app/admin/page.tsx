"use client";

// TODO: Maybe some sort of auth

import ConnectionStatus from "@/components/ConnectionStatus";
import { GameState } from "@/types/game";
import { ParticipatingTeam } from "@/types/teams";
import { humanizePrice } from "@/utils/humanize";
import TeamLogos from "@/utils/teamlogos";
import { showToast, ToastType } from "@/utils/toast";
import { useEffect, useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";
import Image from "next/image";
import AdminLayout from "./layout";

const AdminPage = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [participatingTeams, setParticipatingTeams] = useState<ParticipatingTeam[]>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [modalAction, setModalAction] = useState<() => void>(() => { });

  const fetchTeamData = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/participatingteam/all`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setParticipatingTeams(data);
      })
      .catch(() => {
        showToast("Failed to fetch updated team data", ToastType.ERROR)
      });
  }

  const handleStartBidding = () => {
    setModalText("Are you sure you want to start bidding?");
    setModalAction(() => () => {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game/start`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (response.ok) {
          showToast("Bidding started successfully", ToastType.SUCCESS)
        } else {
          showToast("Failed to start bidding", ToastType.ERROR)
        }
      }).catch((error) => {
        showToast("Failed to start bidding: " + error, ToastType.ERROR)
      });
    });
    setIsModalOpen(true);
  };

  const handleEndBidding = () => {
    setModalText("Are you sure you want to finish bidding?");
    setModalAction(() => () => {

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/game/end`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (response.ok) {
          showToast("Bidding ended successfully", ToastType.SUCCESS)
        } else {
          showToast("Failed to end bidding", ToastType.ERROR)
        }
      }).catch((error) => {
        showToast("Failed to end bidding: " + error, ToastType.ERROR)
      });

    });
    setIsModalOpen(true);
  };

  const assignPlayerToTeam = async (team: ParticipatingTeam) => {
    setModalText(`Are you sure you want to assign ${gameState?.CurrentPlayerInBid?.name} to ${team.name} for ${humanizePrice(gameState!.CurrentBidAmount)} ?`);
    setModalAction(() => () => {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/players/assign-team`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: team.id,
        }),
      }).then((response) => {
        if (response.ok) {
          fetchTeamData();
          showToast(`${gameState?.CurrentPlayerInBid?.name} assigned to ${team.name} for ${humanizePrice(gameState!.CurrentBidAmount)}`, ToastType.SUCCESS)
        } else {
          response.json().then((data) => {
            showToast("Failed to assign player to team: " + data.error, ToastType.ERROR)
          });
        }
      }).catch((error) => {
        showToast("Failed to assign player to team: " + error, ToastType.ERROR)
      });
    });
    setIsModalOpen(true);
  }

  const assignUnsoldToPlayer = async () => {
    setModalText(`Are you sure you want to assign unsold player to ${gameState?.CurrentPlayerInBid?.name} ?`);
    setModalAction(() => () => {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/players/unsold`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (response.ok) {
          fetchTeamData();
          showToast(`${gameState?.CurrentPlayerInBid?.name} went unsold`, ToastType.SUCCESS)
        } else {
          response.json().then((data) => {
            showToast("Failed to assign unsold to player: " + data.error, ToastType.ERROR)
          });
        }
      }).catch((error) => {
        showToast("Failed to assign unsold to player: " + error, ToastType.ERROR)
      });
    })
    setIsModalOpen(true);
  }

  const handleBidIncrement = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/players/increment-bid`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (!response.ok) {
        showToast("Failed to increment bid", ToastType.ERROR)
      }
    }).catch((error) => {
      showToast("Failed to increment bid: " + error, ToastType.ERROR)
    });
  }


  const handleBidDecrement = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/players/decrement-bid`, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (!response.ok) {
        showToast("Failed to decrement bid", ToastType.ERROR)
      }
    }).catch((error) => {
      showToast("Failed to decrement bid: " + error, ToastType.ERROR)
    });
  }

  useEffect(() => {
    fetchTeamData();
  }, []);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const wsUrl = backendUrl!.replace(/^https?:\/\//, '');
    const wsProtocol = backendUrl!.startsWith("https") ? "wss" : "ws";

    let ws: WebSocket | null = null;
    let retryInterval: NodeJS.Timeout | null = null;

    const connectWebSocket = () => {
      ws = new WebSocket(`${wsProtocol}://${wsUrl}/game/ws`);

      ws.onopen = () => {
        setConnected(true);
        console.log(socket)
        console.log('Connected to WebSocket');
        if (retryInterval) {
          clearInterval(retryInterval);
          retryInterval = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const serverMessage = JSON.parse(event.data);

          if (serverMessage.gameState) {
            setGameState(serverMessage.gameState);
          } else if (serverMessage.message) {
            // TODO: Implement the message receiving logic
            console.log("Message received: ", serverMessage.message);
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('Disconnected from WebSocket');
        if (!retryInterval) {
          retryInterval = setInterval(() => {
            console.log('Attempting to reconnect...');
            connectWebSocket();
          }, 5000);
        }
      };

      setSocket(ws);
    };

    connectWebSocket();

    return () => {
      setConnected(false);
      if (ws) {
        ws.close();
      }
      if (retryInterval) {
        clearInterval(retryInterval);
      }
    };
  }, []);


  useEffect(() => {
    if (gameState?.IsFinished) {
      alert("Game is finished! Restarting...");
      // TODO: Implement logic to restart the database
    }
  }, [gameState]);


  return (
    <div className="flex flex-col min-h-screen relative">
      <div className="absolute top-6 right-6">
        <ConnectionStatus connected={connected} />
      </div>

      <div className="flex-1 flex">
        <div className="w-1/2 h-screen flex">
          <div className="w-1/2 h-full relative">
            {gameState?.CurrentPlayerInBid?.avatarUrl.Valid && (
              <Image
                width={400}
                height={400}
                src={`${gameState.CurrentPlayerInBid.avatarUrl.String}`}
                alt={gameState.CurrentPlayerInBid.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <h2 className="text-2xl font-bold">Current Player</h2>
              <h3 className="text-xl font-semibold">{gameState?.CurrentPlayerInBid?.name}</h3>
              <p className="text-lg">{gameState?.CurrentPlayerInBid?.country}</p>
              <p className="text-lg">Role: {gameState?.CurrentPlayerInBid?.role}</p>
              <p className="text-lg">Rating: {gameState?.CurrentPlayerInBid?.rating}</p>
            </div>
          </div>
          <div className="w-1/2 h-full relative">
            {gameState?.NextPlayerInBid?.avatarUrl.Valid && (
              <Image
                width={400}
                height={400}
                src={`${gameState.NextPlayerInBid.avatarUrl.String}`}
                alt={gameState.NextPlayerInBid.name}
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <h2 className="text-2xl font-bold">Next Player</h2>
              <h3 className="text-xl font-semibold">{gameState?.NextPlayerInBid?.name}</h3>
              <p className="text-lg">{gameState?.NextPlayerInBid?.country}</p>
              <p className="text-lg">Role: {gameState?.NextPlayerInBid?.role}</p>
              <p className="text-lg">Rating: {gameState?.NextPlayerInBid?.rating}</p>
            </div>
          </div>
        </div>
        <div className="w-1/2 flex flex-col justify-between p-8 h-screen overflow-y-auto">
          <div>
            {gameState?.IsBiddingActive ? (
              <>
                <h2 className="text-4xl font-bold mb-4">Current Bid</h2>
                <div className="flex flex-col items-start justify-center mb-4">
                  <div className="flex items-center mb-2">
                    <p className="text-xl font-bold mr-4">Current Bid:</p>
                    <p className="text-5xl font-bold text-green-600">₹{humanizePrice(gameState!.CurrentBidAmount)}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-xl font-bold mr-4">Next Bid:</p>
                    <p className="text-3xl font-bold text-yellow-500">₹{humanizePrice(gameState!.NextBidAmount)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleBidIncrement}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-lg w-full"
                  >
                    Increment Player Bid
                  </button>
                  <button
                    onClick={handleBidDecrement}
                    className="bg-yellow-400 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg text-lg w-full"
                  >
                    Decrement Player Bid
                  </button>
                  <button
                    onClick={handleEndBidding}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-lg w-full"
                  >
                    End Bidding
                  </button>

                  <button
                    onClick={() => assignUnsoldToPlayer()}
                    className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg text-lg w-full"
                  >
                    Set Unsold
                  </button>

                </div>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleStartBidding}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-lg w-full"
                >
                  Start Bidding
                </button>
              </div>
            )}
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold mb-4">Participating Teams</h2>
            <div className="grid grid-cols-3 gap-3">
              {participatingTeams?.map((team) => (
                <button
                  key={team.id}
                  onClick={() => assignPlayerToTeam(team)}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center ${team.balance < (gameState?.CurrentBidAmount || 0)
                    ? 'bg-red-500 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  disabled={team.balance < (gameState?.CurrentBidAmount || 0)}
                >
                  <Image
                    src={TeamLogos(team.name)}
                    width={48}
                    height={48}
                    alt={team.name}
                    className="w-12 h-12 object-cover rounded-full mb-1"
                  />
                  <h3 className="text-sm text-black font-bold text-center">{team.name}</h3>
                  <p className="text-xs text-black">₹{humanizePrice(team.balance)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            modalAction();
            setIsModalOpen(false);
          }}
          text={modalText}
        />
      </div>
    </div>
  );
}

AdminPage.getLayout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminPage;
