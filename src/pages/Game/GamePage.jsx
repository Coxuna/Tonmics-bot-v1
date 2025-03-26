import React from "react";
import { NavLink } from "react-router";
import GameLayout from "./GameLayout";
import { Outlet } from "react-router";
import ResponsivePadding from "../../components/shared/ResponsivePadding";

export default function GamePage() {
  const games = [
    { id: 1, name: "Jumble Jester", path: "/Game/Jumbo", img: "/assets/wordfind.svg" },
    { id: 2, name: "Scrabble", path: "/Game/Scrabble", img: "/assets/OO.png" },
  ];

  return (
    <GameLayout>
      <ResponsivePadding>
        {/* Scrollable Container */}
        <div className="flex justify-center items-start overflow-auto py-4 px-4 pb-16 w-full min-h-screen">
          {/* Background Image */}
          <img
            className="fixed w-full h-full object-cover top-0 left-0 -z-10"
            src="/assets/secondbackground.webp"
            alt="Background"
          />

          {/* Content */}
          <div className="w-full max-w-2xl">
            <ul className="space-y-8">
              {games.map((game) => (
                <li
                  key={game.id}
                  className="text-2xl text-white flex flex-col items-center py-6 px-6 rounded-lg bg-primary"
                >
                  <div className="flex flex-col items-center">
                    {game.img && <img src={game.img} alt={game.name} className="mb-4 w-20 h-20" />}
                    <span className="text-4xl md:text-6xl font-bold comic-font mb-6 text-black">
                      {game.name}
                    </span>
                  </div>

                  <NavLink
                    to={game.path}
                    className={({ isActive }) =>
                      `cursor-pointer bg-[#FAA31E] h-10 text-md w-fit px-6 text-black font-medium mt-4 rounded-lg ${
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
        </div>
      </ResponsivePadding>

      <Outlet />
    </GameLayout>
  );
}
