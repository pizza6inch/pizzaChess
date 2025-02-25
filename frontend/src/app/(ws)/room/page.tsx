"use client";

import "@/app/global.css";
import React, { useState, useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketProvider";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";

import { useRouter } from "next/navigation";

import RoomCard from "@/components/RoomCard";

import { GameInfo } from "@/types/webSocket";

import { motion } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import { setIsFetching } from "@/redux/slices/webSocketSlice";

type status = "ALL" | "In-Game" | "Available";

type sortBy = "GameId" | "Timer" | "Rating" | "People";

type sortOrder = "asc" | "desc";

export default function Room() {
  const { createGame, register, login } = useWebSocket();

  const router = useRouter();

  const dispatch = useDispatch();

  const { wsConnected, gameOwnerToken, games, playerInfo, currentGame } =
    useSelector((state: RootState) => state.websocket);

  const { user } = useSelector((state: RootState) => state.auth);

  const [status, setStatus] = useState<status>("ALL");
  const [sortBy, setSortBy] = useState<sortBy>("GameId");
  const [sortOrder, setSortOrder] = useState<sortOrder>("asc");

  const categories: Array<{ status: status }> = [
    { status: "ALL" },
    { status: "In-Game" },
    { status: "Available" },
  ];
  const sortOptions: Array<{ sortBy: sortBy }> = [
    { sortBy: "GameId" },
    { sortBy: "Timer" },
    { sortBy: "Rating" },
    { sortBy: "People" },
  ];

  useEffect(() => {
    if (!wsConnected) return;
    if (!playerInfo) return;
    if (currentGame) window.location.href = `/game/${currentGame.gameId}`;
  }, [playerInfo]);

  useEffect(() => {
    if (!wsConnected) return;

    const playerToken = sessionStorage.getItem("playerToken");
    const accessToken = sessionStorage.getItem("accessToken");

    const handleRegister = (displayName: string, rating: number) => {
      const payload = {
        displayName: displayName,
        rating: rating,
      };
      register(payload);
    };

    if (!playerToken) {
      if (!accessToken) {
        // generate random string as display name
        const randomName = Math.random().toString(36).substring(2, 6);
        handleRegister(`${randomName}_guest`, 1200);
      }
      if (accessToken) {
        if (!user) return;
        handleRegister(user.displayName, user.rating);
      }
    }

    if (playerToken) {
      const payload = {
        playerToken: playerToken,
      };
      login(payload);
    }
  }, [wsConnected, user]);

  const handleCreateGame = () => {
    const playerToken = sessionStorage.getItem("playerToken");
    if (!playerToken) {
      toast.error("You need to login first!");
      return;
    }
    const payload = {
      playerToken: playerToken,
      playWhite: true,
      timeLimit: 600,
    };
    createGame(payload);
  };

  return (
    <>
      <section className="flex items-center justify-between p-4">
        <h1 className="text-3xl font-bold">Room List</h1>
        <p>{playerInfo?.displayName}</p>
        <button
          className="bg-white text-black"
          onClick={() => {
            sessionStorage.clear();
          }}
        >
          clear sessionStorage
        </button>
        {games && (
          <p className="text-2xl font-semibold">{`${games.length} Games`}</p>
        )}
      </section>
      {/* <p>{playerInfo.displayName}</p> */}
      <section className="items-between flex flex-col justify-end gap-4 border-b-2 border-white p-4">
        <div className="flex justify-end gap-4">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`${
                status === category.status
                  ? "border-red-700 bg-red-500"
                  : "bg-[#1A1C21]"
              } box-border rounded-full border-2 p-2 text-sm font-semibold text-white hover:border-red-700 hover:bg-red-500 md:p-4 md:text-base`}
              onClick={() => setStatus(category.status)}
            >
              {`# ${category.status}`}
            </button>
          ))}
        </div>
        <div className="flex flex-row items-center justify-between">
          <button
            className="flex h-[50%] items-center justify-center rounded-xl border-2 border-green-700 bg-green-500 p-2 font-bold text-white hover:bg-green-600 disabled:border-transparent disabled:bg-gray-600 md:gap-2"
            onClick={handleCreateGame}
          >
            <span className="material-symbols-outlined">add</span>
            <p className="text-sm">Create Game！</p>
          </button>

          <div className="relative flex items-end">
            <p className="text-sm">Sort by：</p>

            <DropdownMenu>
              <DropdownMenuTrigger className="mr-2 flex items-end md:hidden">
                <p className="text-sm">{sortBy}</p>
                <span className="material-symbols-outlined">
                  arrow_drop_down
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white text-black">
                {sortOptions.map((option, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setSortBy(option.sortBy)}
                  >{`${option.sortBy}`}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {sortOptions.map((option, index) => (
              <p
                key={index}
                className={`${
                  sortBy === option.sortBy ? "text-white" : "text-slate-400"
                } mr-4 hidden cursor-pointer font-semibold hover:text-white md:block`}
                onClick={() => setSortBy(option.sortBy)}
              >
                {`${option.sortBy}`}
              </p>
            ))}

            <motion.span
              key={sortOrder}
              initial={{ rotate: 0 }}
              animate={{ rotate: [180, 360] }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="material-symbols-outlined absolute -bottom-[45px] -right-[30px] cursor-pointer rounded-full bg-white p-2 text-black md:relative md:right-0 md:top-0"
            >
              {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
            </motion.span>
          </div>
        </div>
      </section>
      <section className="grid min-h-[80vh] grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
        <GameList
          games={games}
          status={status}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </section>
    </>
  );
}

const GameList = ({
  status,
  sortBy,
  sortOrder,
  games,
}: {
  status: status;
  sortBy: sortBy;
  sortOrder: sortOrder;
  games: GameInfo[] | null;
}) => {
  if (!games) return null;
  const filteredGames = games.filter((game) => {
    if (status === "In-Game") return game.gameState === "in-progress";
    if (status === "Available") return game.gameState === "waiting";
    return true; // 'ALL'
  });

  const sortedGames = filteredGames.sort((a, b) => {
    if (sortOrder === "asc") {
      if (sortBy === "GameId") return a.gameId.localeCompare(b.gameId);
      if (sortBy === "Timer") return a.timeLimit - b.timeLimit;
      if (sortBy === "Rating") {
        return (
          (a?.white?.rating ?? 0) +
          (a?.black?.rating ?? 0) -
          (b?.white?.rating ?? 0) -
          (b?.black?.rating ?? 0)
        );
      }
      if (sortBy === "People") return a.spectators.length - b.spectators.length;
    }
    if (sortOrder === "desc") {
      if (sortBy === "GameId") return b.gameId.localeCompare(a.gameId);
      if (sortBy === "Timer") return b.timeLimit - a.timeLimit;
      if (sortBy === "Rating") {
        return (
          (b?.white?.rating ?? 0) +
          (b?.black?.rating ?? 0) -
          (a?.white?.rating ?? 0) -
          (a?.black?.rating ?? 0)
        );
      }
      if (sortBy === "People") return b.spectators.length - a.spectators.length;
    }
    return 0;
  });

  return (
    <>
      {sortedGames.map((game, index) => (
        <div key={game.gameId} className="max-h-[500px]">
          <RoomCard key={index} game={game} />
        </div>
      ))}
    </>
  );
};
