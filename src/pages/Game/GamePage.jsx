import React from "react";
import { NavLink } from "react-router";
import GameLayout from "./GameLayout";
import { Outlet } from "react-router";

export default function GamePage() {
  const games = [
    { id: 1, name: "Jumble Jester", path: "/Game/Jumbo", img: "/assets/wordfind.svg" },
    { id: 2, name: "Scrabble", path: "", img: "/assets/OO.png" },
  ];

  return (
    <GameLayout>
      <div className="absolute w-full min-h-screen bg-gradient-radial from-[#FAA31E] to-[#D72B29] flex items-center justify-center">
        <img
          className="absolute w-full h-full object-cover -z-50"
          src="/assets/secondbackground.webp"
          alt="Background"
        />

        <div className="relative text-center w-full max-w-2xl px-4">
          <ul className="space-y-6">
            {games.map((game) => (
              <li
                key={game.id}
                className="text-2xl text-white flex flex-col items-center py-4 px-6 rounded-lg bg-primary"
              >
                <div className="flex flex-col items-center">
                  {game.img && <img src={game.img} alt={game.name} className="mb-2 w-16 h-16" />}
                  <span className="text-4xl md:text-6xl font-bold comic-font mb-8 text-black">
                    {game.name}
                  </span>
                </div>

                <NavLink
                  to={game.path}
                  className={({ isActive }) =>
                    `cursor-pointer bg-[#FAA31E] h-10 text-md w-fit px-6 text-black font-medium mt-2 rounded-lg ${
                      isActive ? "bg-[#50C42F]" : ""
                    }`
                  }
                >
                  Play
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <Outlet />
      </div>
    </GameLayout>
  );
}
