"use client";

// TODO: Maybe some sort of auth

import ConnectionStatus from "@/components/ConnectionStatus";
import { GameState } from "@/types/game";
import { ParticipatingTeam } from "@/types/teams";
import { humanizePrice } from "@/utils/humanize";
import TeamLogos from "@/utils/teamlogos";
import { showToast, ToastType } from "@/utils/toast";
import { useEffect, useState } from "react";

export default function Admin() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [participatingTeams, setParticipatingTeams] = useState<ParticipatingTeam[]>();

  const fetchTeamData = () => {
    fetch("http://localhost:8069/teams/all")
      .then((response) => response.json())
      .then((data) => {
        setParticipatingTeams(data);
      })
      .catch((error) => {
        showToast("Failed to fetch updated team data", ToastType.ERROR)
      });
  }

  const handleStartBidding = () => {

    // TODO: Add logic to check if the team has enough balance to start the bidding and errors

    fetch("http://localhost:8069/game/start", {
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
  };

  const handleFinishBidding = () => {
    // TODO: Implement finish bidding logic
    showToast("Finish bidding logic not implemented", ToastType.ERROR)
  };

  const assignPlayerToTeam = async (team: ParticipatingTeam) => {

    // TODO: Do a confirmation modal

    fetch("http://localhost:8069/players/assign-team", {
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
        showToast(`${gameState?.CurrentPlayerInBid?.name} assigned to ${team.name}`, ToastType.SUCCESS)
      } else {
        response.json().then((data) => {
          showToast("Failed to assign player to team: " + data.error, ToastType.ERROR)
        });
      }
    }).catch((error) => {
      showToast("Failed to assign player to team: " + error, ToastType.ERROR)
    });
  }


  useEffect(() => {
    fetchTeamData();
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8069/game/ws');

    ws.onopen = () => {
      setConnected(true);
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      console.log('Message received:', event.data);
      try {
        const gameState: GameState = JSON.parse(event.data);
        setGameState(gameState);
        setGameStarted(gameState.IsBiddingActive);
        if (gameState.IsFinished) {
          console.log("game is finished")
        }
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('Disconnected from WebSocket');
    };

    setSocket(ws);

    return () => {
      setConnected(false);
      ws.close();
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
        <div className="w-1/2 h-screen relative">
          {gameState?.CurrentPlayerInBid?.avatarUrl.Valid && (
            <img
              src={gameState.CurrentPlayerInBid.avatarUrl.String}
              alt={gameState.CurrentPlayerInBid.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
            <h2 className="text-3xl font-bold">{gameState?.CurrentPlayerInBid?.name}</h2>
            <p className="text-xl">{gameState?.CurrentPlayerInBid?.country}</p>
            <p className="text-xl">Role: {gameState?.CurrentPlayerInBid?.role}</p>
            <p className="text-xl">Rating: {gameState?.CurrentPlayerInBid?.rating}</p>
          </div>
        </div>
        <div className="w-1/2 flex flex-col justify-center items-center p-8">
          {gameStarted ? (
            <>
              <h2 className="text-6xl font-bold mb-8">Current Bid</h2>
              <p className="text-8xl font-bold text-green-600">₹{humanizePrice(gameState!.CurrentBidAmount)}</p>
              <div className="mt-12 space-y-4">
                <button
                  onClick={handleFinishBidding}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg text-xl"
                >
                  Finish Bidding
                </button>
              </div>
            </>
          ) : (
            <div className="mt-12 space-y-4">
              <button
                onClick={handleStartBidding}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl"
              >
                Start Bidding
              </button>
            </div>
          )}
          <div className="mt-8">
            <h2 className="text-4xl font-bold mb-8">Participating Teams</h2>
            <div className="grid grid-cols-5 gap-4">
              {participatingTeams?.map((team) => (
                <button
                  key={team.id}
                  onClick={() => assignPlayerToTeam(team)}
                  className="bg-gray-200 hover:bg-gray-300 p-4 rounded-lg flex flex-col items-center justify-center"
                >
                  <img
                    src={TeamLogos(team.name)}
                    alt={team.name}
                    className="w-16 h-16 object-cover rounded-full mb-2"
                  />
                  <h3 className="text-lg text-black font-bold text-center">{team.name}</h3>
                  <p className="text-sm text-black">₹{humanizePrice(team.balance)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


