import { useState } from "react";
import Header from "../Components/Header"
import Maze from "../Components/Maze"
import { StateContext } from "../context";

function Frontpage() {
  const [state, setState] = useState<string>("start");

  return (
    <div className="bg-blackbg h-screen w-screen flex flex-col justify-between text-grey100 p-4">
      <StateContext.Provider value={{ state, setState }}>
        <Header />
        <Maze />
      </StateContext.Provider>
    </div>
  )
}

export default Frontpage
