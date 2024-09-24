import {createRoot} from "react-dom/client";
import React from "react";
import {themedPageMaker} from "../utils";
import {Link, useLocation} from "react-router-dom";
import {jumps} from "../routes";

function Error() {
    return (
        <>
            <h1>404 - Page Not Found</h1>
            <h2>A página que procura não existe...</h2>
        </>
    );
}

export function FallbackPage() {
    const location = useLocation()
    const currentPath = location.pathname
    const possiblePaths :string[] = []

    for(const path in jumps) {
        if (jumps[path].includes(currentPath)) {
            possiblePaths.push(path)
        }
    }

    return (
        <>
            <Error/>
            {possiblePaths.map((item, index) => (
                <p key={index}>{item}</p>
            ))}
        </>
    )
}