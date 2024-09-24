import React, {useState} from "react";
import {Navigate} from "react-router-dom";
import {jumps, postPaths} from "../routes";
import {apiRequest, HeaderMaker, RainbowButton} from "../utils";
import {useCurrentUser, useSetUser} from "./auth";
import {GoBackButton} from "../groups/groups-update";

export function Login() {

    const [usernameNow, setUsername] = useState('')
    const [passwordNow, setPassword] = useState('')
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const setUser = useSetUser();
    const getUser = useCurrentUser();

    if (getUser) return (<Navigate to={jumps.profile}/>)

    async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault()
        setSubmitting(true)
        const username = usernameNow
        const password = passwordNow

        apiRequest(postPaths.login, "POST", {username, password}, false)
            .then(async (rps) => {
                    if (!rps.ok) {
                        throw new Error(await rps.text());
                    }
                    const user = {
                        "username": usernameNow,
                    }
                    setUser(user);
                }
            ).catch((e) => {
                console.log(e.message);
                setError(e.message);
                setSubmitting(false)
            })

    }

/*    useEffect(() => {
        apiRequest(getPaths.profile, "GET")
            .then(
                async (rps) => {
                    if (!rps.ok) {
                        throw Error(await rps.text());
                    }
                    const data = await rps.json();
                    setUser(data);

                }).catch((e) => {
            console.log("We got error: " + e)
            localStorage.removeItem('user')
            setError(e)
            setSubmitting(true)

        }).finally(() => {
            setSubmitting(false)
            // Use a Navigate component instead of window.location.replace()
            return <Navigate to={jumps.profile} replace/>
            /!*window.location.replace(jumps.profile)*!/
        });
    }, [getUser]);*/

    function handleChangeName(ev: React.FormEvent<HTMLInputElement>) {
        //const name = ev.currentTarget.name;
        setUsername(ev.currentTarget.value)
    }

    function handleChangePass(ev: React.FormEvent<HTMLInputElement>) {
        //const name = ev.currentTarget.name;
        setPassword(ev.currentTarget.value)
    }

    return (
        <div>
            <HeaderMaker/>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <fieldset disabled={submitting}>
                    {error && (
                        <div style={{
                            padding: '10px',
                            marginBottom: '20px',
                            color: 'red',
                            borderRadius: '5px',
                            // Adjust the styling as needed
                        }}>
                            <pre>{error}</pre>
                        </div>
                    )}
                    <div>
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={usernameNow}
                            onChange={handleChangeName}/>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={passwordNow}
                            onChange={handleChangePass}/>
                    </div>
                    <div>
                        <RainbowButton type="submit">Login</RainbowButton>
                    </div>
                </fieldset>
            </form>
            <p><GoBackButton place={jumps.home}/></p>
        </div>
    )
}
