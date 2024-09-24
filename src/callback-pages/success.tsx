import React, {useEffect, useState} from "react";
import {jumps} from "../routes";
import {useLocation} from "react-router-dom";


export function SuccessPage() {
    const location = useLocation();
    const passedText = location.state.text;

    const [seconds, setSeconds] = useState(5);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSeconds(seconds => seconds - 1);
        }, 1000);

        // Clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    useEffect(() => {
        if (seconds === 0) {
            window.location.href = jumps.profile;
        }
    }, [seconds]);

    return (
        <div>
            <h1>A sua submissão teve êxito!</h1>
            <h2>{passedText}</h2>
            <h3>Vamos redirecioná-lo de volta ao seu perfil em... {seconds}</h3>
        </div>
    );
}