import {useNavigate} from "react-router-dom";
import {jumps} from "./routes";
import React, {useState} from "react";
import {RainbowButton} from "./utils";
import {useCurrentUser} from "./session/auth";

const myGif = "https://catalystvisuals.com/wp-content/uploads/2017/08/animated-sound-bars.gif"
const myPng = "./animated-sound-bars.png"
const logo = "./svg.png"

export const NavigationBar = () => {
    const [playing, setPlaying] = useState(false)
    const audio: Partial<HTMLAudioElement> = document.getElementById('music')
    const [volume, setVolume] = useState(0.06);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [delay, setDelay] = useState(true);

    const navigate = useNavigate()

    const user = useCurrentUser()

    if (playing)
        audio.play()
    else
        audio.pause()

    audio.volume = volume


    const handlePlay = () => {
        audio.play()
        setPlaying(true)
    }

    const handlePause = () => {
        audio.pause()
        setPlaying(false)
    }

    const handleVolumeChange = (e) => {
        audio.volume = e.target.value;
        setVolume(e.target.value);
        //audioRef.current.volume = e.target.value;
    }

    let timeout = null

    const toggleMenu = () => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }

        if(isMenuOpen) {
            setDelay(false)
            timeout = setTimeout(() => {
                setDelay(true);
                setIsMenuOpen(false);
            }, 300);
        } else {
            setIsMenuOpen(true);
        }
    };

    const handleNavigation = (path :string) => {
        navigate(path)
    }

    return (
        <nav>
            {
                <>
                    <style>
                        {/*{`
                    body.light-theme p{
                        color: #2e1527;
                        background-color: #ecb496;
                    }
                    `}*/}
                    </style>
                    <div style={{
                        alignContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                        gap: '20px',
                        height: '64px',
                        padding: '20px',
                        position: 'relative'
                    }}>
                        <img height={48} alt={"logo"} src={logo}/>
                        <button id="logo" onClick={() => handleNavigation(jumps.home)}>Open Fitness</button>
                    </div>
                </>
            }
            <div id="myNav" style={{width: '100%'}}>
                <img style={
                    {
                        display: 'block',
                        height: '48px',
                    }

                } src={playing ? myGif : myPng} alt="၊၊||၊၊၊||၊|။||၊"/>
                {/*၊၊||၊၊၊||၊|။||၊*/}
                {
                    playing ?
                        <RainbowButton onClick={handlePause}>❚❚</RainbowButton> :
                        <RainbowButton onClick={handlePlay}>▶</RainbowButton>
                }

                <input style={{marginLeft: 'unset'}} type="range" min="0" max="1" step="0.01" value={volume}
                       onChange={handleVolumeChange}/>
            </div>
            <div id="myNav" style={{
                backgroundColor: 'transparent'
            }}>
                {/*<Link to={jumps.home}><RainbowButton>Home</RainbowButton></Link>*/}
                {
                    user != null ?
                        <>
                            <RainbowButton onClick={toggleMenu}>Missão Diária</RainbowButton>
                            {isMenuOpen && (
                                <div id="daily_streak" className={delay ? "open" : "close"}>
                                    {
                                        user.dailyStreak.split(';').map((exercise) => {
                                            const [exerciseName, quantityWithUnits] = exercise.split(':');
                                            const [quantity, units] = quantityWithUnits.includes(',') ? quantityWithUnits.split(',') : [quantityWithUnits, ''];
                                            const name = exerciseName.replace("_", " ")[0].toUpperCase() + exerciseName.replace("_", " ").slice(1)
                                            return <p key={exerciseName}>
                                                <strong>{name}</strong>{`: ${quantity} ${units == '' ? 'rep' : units}`}
                                            </p>
                                        })
                                    }
                                </div>
                            )}
                            <RainbowButton onClick={() => handleNavigation(jumps.profile)}>{user.username}</RainbowButton>
                        </>
                        :
                        <>
                            <RainbowButton onClick={() => handleNavigation(jumps.login)}>Login</RainbowButton>
                            <RainbowButton onClick={() => handleNavigation(jumps.signup)}>SignUp</RainbowButton>
                        </>
                }
            </div>
        </nav>
    );
};