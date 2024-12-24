import { useEndContext, useStartContext, useStateContext } from "../context";

interface NodeProps {
  x: number;
  y: number;
  type: string;
  height: number;
  width: number;
  isMousePressed: boolean;
  onWallToggle: () => void;
}

const Node = ({ 
  x, y, type, height, width, isMousePressed, onWallToggle 
}: NodeProps) => {
  const state = useStateContext();
  const start = useStartContext();
  const end = useEndContext();

  const handleClick = () => {
    if (state.state === "start") {
      start.setPosition({ x, y });
    } else if (state.state === "end") {
      end.setPosition({ x, y });
    } else if (state.state === "wall") {
      onWallToggle();
    }
  };

  const handleMouseEnter = () => {
    if (isMousePressed && state.state === "wall") {
      onWallToggle();
    }
  };

  const getNodeClassName = () => {
    if (start.position.x === x && start.position.y === y) return "bg-green200";
    if (end.position.x === x && end.position.y === y) return "bg-red";
    if (type === "wall") return "bg-happyOrange";
    if (type === "visited") return "visited";
    if (type === "path") return "path";
    return "";
  };

  return (
    <div 
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`border-[1px] border-black500 flex flex-none ${getNodeClassName()} cursor-pointer`} 
      style={{ height: `${height}px`, width: `${width}px` }}
    />
  );
};

export default Node;