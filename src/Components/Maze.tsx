import { useEffect, useRef, useState } from "react";
import Node from "./Node";
import { EndContext, StartContext } from "../context";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types for cleaner code
type Position = { x: number; y: number };
type GridNode = { x: number; y: number; type: string };

const getManhattanDistance = (pos1: Position, pos2: Position): number => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

const Maze = () => {
    const [grid, setGrid] = useState<GridNode[][]>([]);
    const [startPosition, setStartPosition] = useState<Position>({ x: -1, y: -1 });
    const [endPosition, setEndPosition] = useState<Position>({ x: -1, y: -1 });
    const [isVisualizing, setIsVisualizing] = useState(false);
    const [isMousePressed, setIsMousePressed] = useState(false);

    const mazeRef = useRef<HTMLDivElement>(null);
    const DIRECTIONS = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
    ];

    useEffect(() => {
        const rows = 40;
        const cols = 80;
        const newGrid = Array.from({ length: rows }, (_, x) =>
            Array.from({ length: cols }, (_, y) => ({ x, y, type: "node" }))
        );
        setGrid(newGrid);
    }, []);

    // Mouse event handlers
    const handleMouseDown = () => setIsMousePressed(true);
    const handleMouseUp = () => setIsMousePressed(false);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);

    // Helper to update node types
    const updateNodeType = (x: number, y: number, newType: string) => {
        if ((startPosition.x === x && startPosition.y === y) ||
            (endPosition.x === x && endPosition.y === y)) return;

        setGrid(prevGrid => {
            const newGrid = prevGrid.map(row => [...row]);
            if (newType === "node" && prevGrid[x][y].type === "wall") return prevGrid;
            newGrid[x][y] = { ...newGrid[x][y], type: newType };
            return newGrid;
        });
    };

    const resetVisualization = () => {
        return grid.map(row =>
            row.map(cell => ({
                ...cell,
                type: cell.type === "visited" || cell.type === "path" ? "node" : cell.type
            }))
        );
    };

    const validatePositions = (): boolean => {
        if (startPosition.x === -1 || endPosition.x === -1) {
            alert("Start and End positions must be set.");
            return false;
        }
        return true;
    };

    const performBFS = async () => {
        if (!validatePositions()) return;
        setIsVisualizing(true);

        const newGrid = resetVisualization();
        const visited = new Set<string>();
        const queue = [{
            x: startPosition.x,
            y: startPosition.y,
            path: [] as Position[]
        }];

        while (queue.length > 0) {
            const current = queue.shift()!;
            const { x, y, path } = current;

            if (visited.has(`${x},${y}`)) continue;
            visited.add(`${x},${y}`);

            if (!isStartOrEnd(x, y) && newGrid[x][y].type !== "wall") {
                newGrid[x][y].type = "visited";
                setGrid([...newGrid]);
                await delay(10);
            }

            if (x === endPosition.x && y === endPosition.y) {
                await visualizePath(path, newGrid);
                setIsVisualizing(false);
                return;
            }

            for (const { dx, dy } of DIRECTIONS) {
                const nx = x + dx, ny = y + dy;
                if (isValidMove(nx, ny, visited, newGrid)) {
                    queue.push({ x: nx, y: ny, path: [...path, { x, y }] });
                }
            }
        }

        alert("No path found.");
        setIsVisualizing(false);
    };

    const performDFS = async () => {
        if (!validatePositions()) return;
        setIsVisualizing(true);

        const newGrid = resetVisualization();
        const visited = new Set<string>();
        const stack = [{
            x: startPosition.x,
            y: startPosition.y,
            path: [] as Position[]
        }];

        while (stack.length > 0) {
            const current = stack.pop()!;
            const { x, y, path } = current;
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            // Create a path
            const currentPath = [...path, { x, y }];

            // Mark as visited if not start/end/wall
            if (!isStartOrEnd(x, y) && newGrid[x][y].type !== "wall") {
                newGrid[x][y].type = "visited";
                setGrid([...newGrid]);
                await delay(5);
            }

            if (x === endPosition.x && y === endPosition.y) {
                const pathToVisualize = currentPath.slice(1, -1);
                await visualizePath(pathToVisualize, newGrid);
                setIsVisualizing(false);
                return;
            }

            for (const { dx, dy } of DIRECTIONS) {
                const nx = x + dx;
                const ny = y + dy;

                if (isValidMove(nx, ny, visited, newGrid)) {
                    stack.push({
                        x: nx,
                        y: ny,
                        path: currentPath
                    });
                }
            }
        }

        alert("No path found.");
        setIsVisualizing(false);
    };

    // A* Implementation
    const performAStar = async () => {
        if (!validatePositions()) return;
        setIsVisualizing(true);

        const newGrid = resetVisualization();
        const visited = new Set<string>();
        const openSet = new Set<string>();
        const cameFrom = new Map<string, Position>();
        const gScore = new Map<string, number>();
        const fScore = new Map<string, number>();

        const start = `${startPosition.x},${startPosition.y}`;
        openSet.add(start);
        gScore.set(start, 0);
        fScore.set(start, getManhattanDistance(startPosition, endPosition));

        while (openSet.size > 0) {
            // Find node with lowest fScore
            let current = Array.from(openSet).reduce((a, b) =>
                (fScore.get(a) ?? Infinity) < (fScore.get(b) ?? Infinity) ? a : b
            );

            const [x, y] = current.split(',').map(Number);

            if (x === endPosition.x && y === endPosition.y) {
                // Reconstruct and visualize path
                const path = [];
                let currentPos = { x, y };
                while (cameFrom.has(`${currentPos.x},${currentPos.y}`)) {
                    path.unshift(currentPos);
                    currentPos = cameFrom.get(`${currentPos.x},${currentPos.y}`)!;
                }
                await visualizePath(path, newGrid);
                setIsVisualizing(false);
                return;
            }

            openSet.delete(current);
            visited.add(current);

            if (!isStartOrEnd(x, y) && newGrid[x][y].type !== "wall") {
                newGrid[x][y].type = "visited";
                setGrid([...newGrid]);
                await delay(10);
            }

            // Check neighbors
            for (const { dx, dy } of DIRECTIONS) {
                const nx = x + dx, ny = y + dy;
                if (!isValidMove(nx, ny, visited, newGrid)) continue;

                const neighbor = `${nx},${ny}`;
                const tentativeGScore = (gScore.get(current) ?? Infinity) + 1;

                if (tentativeGScore < (gScore.get(neighbor) ?? Infinity)) {
                    cameFrom.set(neighbor, { x, y });
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + getManhattanDistance({ x: nx, y: ny }, endPosition));
                    openSet.add(neighbor);
                }
            }
        }

        alert("No path found.");
        setIsVisualizing(false);
    };

    // Helper functions
    const isStartOrEnd = (x: number, y: number): boolean => {
        return (x === startPosition.x && y === startPosition.y) ||
            (x === endPosition.x && y === endPosition.y);
    };

    const isValidMove = (x: number, y: number, visited: Set<string>, grid: GridNode[][]): boolean => {
        return x >= 0 && y >= 0 && x < grid.length && y < grid[0].length &&
            !visited.has(`${x},${y}`) && grid[x][y].type !== "wall";
    };

    const visualizePath = async (path: Position[], grid: GridNode[][]) => {
        for (const pos of path) {
            if (!isStartOrEnd(pos.x, pos.y) && grid[pos.x][pos.y].type !== "wall") {
                grid[pos.x][pos.y].type = "path";
                setGrid([...grid]);
                await delay(20);
            }
        }
    };

    const generateMaze = () => {
        const rows = 40;
        const cols = 80;
        const newGrid = Array.from({ length: rows }, (_, x) =>
            Array.from({ length: cols }, (_, y) => {
                // Create boundary
                if (x === 0 || x === rows - 1 || y === 0 || y === cols - 1) {
                    return { x, y, type: "wall" };
                }

                // Create concentric circles
                const centerX = rows / 2;
                const centerY = cols / 2;
                const distance = Math.sqrt(
                    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                );

                // Add concentric circular barriers
                if (distance % 8 < 0.8 && distance > 5 && Math.random() < 0.7) {
                    return { x, y, type: "wall" };
                }

                // Add spiral pattern
                const spiralAngle = Math.atan2(y - centerY, x - centerX);
                const spiralDist = Math.sqrt(
                    Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
                );
                if (Math.abs((spiralAngle + spiralDist / 3) % (Math.PI / 6)) < 0.2
                    && spiralDist > 5 && Math.random() < 0.6) {
                    return { x, y, type: "wall" };
                }

                // Create some guaranteed pathways
                if ((x + y) % 5 === 0 && (x * y) % 3 === 0) {
                    return { x, y, type: "node" };
                }

                return { x, y, type: "node" };
            })
        );

        // Ensure maze is traversable by creating some guaranteed paths
        for (let x = 1; x < rows - 1; x += 6) {
            for (let y = 1; y < cols - 1; y += 6) {
                newGrid[x][y].type = "node";
                if (x + 1 < rows - 1) newGrid[x + 1][y].type = "node";
                if (y + 1 < cols - 1) newGrid[x][y + 1].type = "node";
            }
        }

        // Reset start and end positions
        setStartPosition({ x: -1, y: -1 });
        setEndPosition({ x: -1, y: -1 });
        setGrid(newGrid);
    };

    return (
        <div className="w-full h-[89%] flex items-center justify-between bg-black800 rounded-lg p-2">
            <div className="flex flex-col justify-center items-center w-[250px] gap-4">
                <button
                    className="bg-happyOrange h-fit w-fit px-4 py-1 rounded-md text-btnTxt"
                    onClick={generateMaze}
                    disabled={isVisualizing}
                >Generate </button>
                <button
                    className="bg-green200 h-fit w-fit px-4 py-1 rounded-md text-btnTxt"
                    onClick={performBFS}
                    disabled={isVisualizing}
                >
                    BFS
                </button>
                <button
                    className="bg-blue-500 h-fit w-fit px-4 py-1 rounded-md text-white"
                    onClick={performDFS}
                    disabled={isVisualizing}
                >
                    DFS
                </button>
                <button
                    className="bg-purple-500 h-fit w-fit px-4 py-1 rounded-md text-white"
                    onClick={performAStar}
                    disabled={isVisualizing}
                >
                    A*
                </button>
            </div>
            <div
                className="bg-grey200 w-[1600px] h-[800px] flex flex-wrap outline outline-[1px] outline-black500"
                ref={mazeRef}
                onMouseDown={handleMouseDown}
            >
                <EndContext.Provider value={{ position: endPosition, setPosition: setEndPosition }}>
                    <StartContext.Provider value={{ position: startPosition, setPosition: setStartPosition }}>
                        {grid.map((row, i) =>
                            row.map((cell, j) => (
                                <Node
                                    key={`${i}-${j}`}
                                    x={cell.x}
                                    y={cell.y}
                                    type={cell.type}
                                    height={20}
                                    width={20}
                                    isMousePressed={isMousePressed}
                                    onWallToggle={() => updateNodeType(i, j, "wall")}
                                />
                            ))
                        )}
                    </StartContext.Provider>
                </EndContext.Provider>
            </div>
        </div>
    );
};

export default Maze;