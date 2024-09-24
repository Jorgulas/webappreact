import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {apiRequest, Loading, RainbowButton} from "../utils";
import {getPaths, jumps, postPaths} from "../routes";
import {useSetUser} from "./auth";

type User = {
    username: string,
    id: string,
    email: string,
    money: number,
    authority: string,
    dailyStreak: string,
    favoriteTags: string,
    latestSearchedTags: string
}


export function Profile() {
    const [_, setError] = useState('');
    const [userData, setUserData] = useState<User>(undefined)
    const nav = useNavigate()
    const setUser = useSetUser();

    useEffect(() => {

        apiRequest(getPaths.profile, "GET")
            .then(async (rps) => {
                console.log(rps)
                if (!rps.ok) {
                    throw Error(await rps.text());
                }
                const data = await rps.json();
                setUserData(data);
                setUser(data);

                /*apiRequest(getPaths., "GET")
                    .then(async (rps) => {
                        if (!rps.ok) {
                            throw Error(await rps.text());
                        }
                        const data = await rps.json();
                        setUserData((prev) => ({...prev, money: data.money}));
                    }).catch((e) => {
                    console.error('Erro ao buscar dinheiro:', e.message);
                });*/

            }).catch((e) => {
                console.log("We got error: " + e);
                localStorage.removeItem('user')
                setError(e.message);
                window.location.replace(jumps.home);
            });
    }, [])


    function handleLogout() {
        apiRequest(postPaths.logout, "POST")
            .then(async (rps) => {
                if (!rps.ok) {
                    throw new Error(await rps.text());
                }
                localStorage.removeItem('user');
                setUser(undefined);
                window.location.replace(jumps.home);
            }).catch((e) => {
            setError(e.message);
            console.error('Erro ao fazer logout:', e.message);
        })
    }

    return (
        <>
            <div>
                {userData == undefined ?
                    <Loading/> :
                    <>
                        <h2>Perfil</h2>
                        <p><u style={{color: '#3c3c3c',}}>
                            Player ID = {userData.id}
                        </u></p>
                        <p><strong>{userData.username}</strong></p>
                        {/*<p>Moedas: {userData.money}</p>*/}
                        <p>Email: {userData.email}</p>
                        <p>Autoridade: <strong>{
                            userData.authority == 'A' && 'Administrator' ||
                            userData.authority == 'R' && 'Reviewer' ||
                            userData.authority == 'C' && 'Client'
                        }</strong></p>
                        <div id={"centerDivision"}>
                            <div id={"boxFadedGradient"}>
                                {
                                    userData.favoriteTags &&
                                    <p>Favorite Tags: {userData.favoriteTags}</p>
                                }
                                {
                                    userData.latestSearchedTags &&
                                    <p>Latest Searched Tags: {userData.latestSearchedTags}</p>
                                }
                                {/*<p><Link to={jumps.home}><RainbowButton>← Página Inicial</RainbowButton></Link></p>*/}

                                <RainbowButton onClick={() => nav(jumps.groups)}>
                                    Sua biblioteca</RainbowButton>

                                <div id={"evenlySpaced"}>
                                    {
                                        (userData.authority == 'A' || userData.authority == 'R') &&
                                        <div id="evenlySpaced" style={{justifyContent: 'flex-start'}}>

                                            <RainbowButton onClick={() => nav(jumps.checkAppeals)}>
                                                Aprovar Candidatos</RainbowButton>

                                            <RainbowButton onClick={() => nav(jumps.reviewer)}>
                                                Rever Conteúdo</RainbowButton>
                                        </div>
                                    }
                                    {
                                        userData.authority == 'A' ?
                                            <div id="evenlySpaced" style={{justifyContent: 'flex-end'}}>

                                                <RainbowButton onClick={() => nav(jumps.admin)}>
                                                    Adicionar Conteúdo</RainbowButton>

                                                <RainbowButton onClick={() => nav(jumps.tags)}>
                                                    Adicionar Tags ou Secções</RainbowButton>

                                            </div> :
                                            userData.authority == 'C' &&

                                            <RainbowButton onClick={() => nav(jumps.attemptRev)}>
                                                Concorrer a Revisor</RainbowButton>
                                    }
                                </div>
                                <RainbowButton onClick={handleLogout}>← Logout</RainbowButton>
                            </div>
                        </div>
                        {/*<h3>{error}</h3>*/}
                    </>
                }
            </div>
        </>
    )
}