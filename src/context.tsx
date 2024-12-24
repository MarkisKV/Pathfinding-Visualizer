import { createContext, useContext } from "react";

interface StateType {
    state:string,
    setState: Function,
};

interface NodeType {
    position : {x: number, y: number}
    setPosition : Function
}


export const StateContext = createContext<StateType | undefined>(undefined);

export const useStateContext = () => {
    const state = useContext(StateContext);

    if (state == undefined)
        throw new Error('useStateContext must be used with a StateContext.Provider');

    return state;
};

export const StartContext = createContext<NodeType | undefined>(undefined);

export const useStartContext = () => {
    const start = useContext(StartContext);

    if (start == undefined)
        throw new Error('useStartContext must be used with a StartContext.Provider');

    return start;
}

export const EndContext = createContext<NodeType | undefined>(undefined);

export const useEndContext = () => {
    const end = useContext(EndContext);

    if (end == undefined)
        throw new Error('useEndContext must be used with a EndContext.Provider');

    return end;
}