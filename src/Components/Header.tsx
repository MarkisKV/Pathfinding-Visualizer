import { useStateContext } from "../context";

const Header = () => {
    const state = useStateContext();

    return (
        <div className="w-full h-[10%] bg-black800 rounded-lg flex items-center justify-between gap-md p-2 px-4">
            <h1 className="text-2xl font-bold">Pathfinding Visualizer</h1>
            <div className="flex gap-md font-semibold text-btnTxt">
                <button className="bg-green200 h-fit w-fit px-4 py-1 rounded-md" onClick={() => state.setState("start")}>Start</button>
                <button className="bg-green200 h-fit w-fit px-4 py-1 rounded-md" onClick={() => state.setState("wall")}>Wall</button>
                <button className="bg-green200 h-fit w-fit px-4 py-1 rounded-md" onClick={() => state.setState("end")}>End</button>
                <button className="bg-green200 h-fit w-fit px-4 py-1 rounded-md" onClick={() => state.setState("node")}>Node</button>
            </div>
        </div>
    )
};

export default Header;