import React, {useEffect, useState} from "react";

/*
export class User {
    username: string;
    id: number;
}

const gitErrors = "https://github.com/isel-leic-daw/2023-daw-leic53d-2023-daw-leic53d-g06/tree/main/code/jvm/Gomoku/docs/problems/"

export function fetchError( weburl :String) {
    const url = weburl.replace(gitErrors, "");
    return url.replace(/-/g, " ").toUpperCase();
    /!*
    const url = weburl.replace('github.com', 'raw.githubusercontent.com');
    const response = await fetch(url, {
        headers: {
            'Authorization': `token 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`
        }
    });
    const data = await response.text();
    console.log(data);
    return data;
    *!/
}
*/

export const RainbowButton = ({children, ...props}) => (
    <button data-text={children} {...props}>{children}</button>
);


export function themedPageMaker() {
    return useEffect(() => {
        const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;

        if (themeToggle) {
            const toggleTheme = () => {
                document.body.classList.toggle('light-theme');
                const container = document.getElementById('container');
                const myNav = document.getElementById('myNav');
                if (myNav) {
                    myNav.classList.toggle('light-theme');
                }
                if (container) {
                    container.classList.toggle('light-theme');
                }
            };

            // Attach the event listener
            themeToggle.addEventListener('click', toggleTheme);

            // Clean up the event listener when the component unmounts
            return () => {
                themeToggle.removeEventListener('click', toggleTheme);
            };
        }
    }, []);
}

export function HeaderMaker() {
    return (
        <header>
            <h1>OPEN FITNESS</h1>
        </header>
    );
}

export function apiRequest(path: string, method: string, body: any = null, cred: boolean = true) {
    const options: RequestInit = {
        method: method,
        headers: {'Content-Type': 'application/json'},
    };
    if ( cred ) options.credentials = 'include'
    if( body != null ) options.body = JSON.stringify(body)
    console.log("API Request: ", path, options, body)
    return fetch(path, options);
}

const array = ['🚶','🏃','🤸','🧎']

export function Loading() {
    const [frame, setFrame] = useState(0);
/*  const [dots, setDots] = useState(''); */

    useEffect(() => {
        const timer = setInterval(() => {
           /* setDots(dots => dots.length < 3 ? dots + '.' : '');*/
            setFrame(frame => (frame + 1) % array.length);
        }, 300); // Change the dots every 300ms

        return () => clearInterval(timer);
    }, []);

    return (
        <h1>Loading {array[frame]}</h1>
    );
}





