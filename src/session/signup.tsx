import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom';
import {jumps, postPaths} from '../routes';
import {apiRequest, HeaderMaker, RainbowButton} from '../utils';
import {useSetUser} from "./auth";
import {GoBackButton} from "../groups/groups-update";

function parseChecksFailedString(checksFailedStr: string) {
    const checksFailedObj = {};
    // Extract the content within parentheses
    const extractedContent = checksFailedStr.match(/\(([^)]+)\)/)[1];
    // Split by comma to get each key-value pair
    const keyValuePairs = extractedContent.split(', ');
    // Convert each key-value pair into an object property
    keyValuePairs.forEach(pair => {
        const [key, value] = pair.split('=');
        checksFailedObj[key] = value === 'true';
    });
    return checksFailedObj;
}

function generatePasswordErrorMessages(checksFailed) {
    const messages = [];
    if (checksFailed.hasDigit) {
        messages.push("Password deve conter pelo menos 1 dígito.");
    }
    if (checksFailed.hasUpper) {
        messages.push("Password deve conter pelo menos um letra maiúscula.");
    }
    if (checksFailed.hasLower) {
        messages.push("Password deve conter pelo menos uma letra minúscula.");
    }
    if (checksFailed.hasSpecial) {
        messages.push("Password deve conter pelo menos um caractere especial.");
    }
    if (checksFailed.isBigEnough) {
        messages.push("Password demasiado pequena.");
    }
    return messages;
}

export function SignUp() {
    const navigate = useNavigate();

    const [usernameNow, setUsername] = useState('')
    const [passwordNow, setPassword] = useState('')
    const [emailNow, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    //const [redirect, setRedirect] = useState(false);
    const setUser = useSetUser();
    const tagsString = localStorage.getItem('tags');
    const tags = tagsString ? JSON.parse(tagsString) : [];


    //if (redirect) return <Navigate to={jumps.profile} replace={true} />;

    async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        setSubmitting(true);

        const username = usernameNow;
        const password = passwordNow;
        const email = emailNow;

        apiRequest(postPaths.signup, "POST", {username, password, email, tags})
            .then(async (rps) => {
                if (!rps.ok) {
                    console.log(rps.statusText)
                    if(rps.status == 406) {     // password insecure
                        const errorMessage = await rps.text();

                        console.log(errorMessage)// Assuming this is where the error message is
                        const checksFailedObj = parseChecksFailedString(errorMessage);
                        const messages = generatePasswordErrorMessages(checksFailedObj);
                        //messages.push(errorMessage.split(":")[0]);
                        messages.reverse()
                        setError(messages.join("\n"));
                        throw new Error(messages.join("\n"));
                    } else {
                        throw new Error(rps.statusText);
                    }
                }
                const user = {
                    "username": usernameNow,
                }
                setUser(user);
                localStorage.removeItem('tags');
                navigate(jumps.profile);
            }).catch((e) => {
            console.log(e.message);
            setError(e.message);
        }).finally(() => {
            setSubmitting(false);
        })


    }

    function handleChangeEmail(ev: React.FormEvent<HTMLInputElement>) {
        //const name = ev.currentTarget.name;
        setEmail(ev.currentTarget.value);
    }

    function handleChangeName(ev: React.FormEvent<HTMLInputElement>) {
        //const name = ev.currentTarget.name;
        setUsername(ev.currentTarget.value);
    }

    function handleChangePass(ev: React.FormEvent<HTMLInputElement>) {
        //const name = ev.currentTarget.name;
        setPassword(ev.currentTarget.value);
    }

    return (
        <div>
            <HeaderMaker/>
            <h2>SignUp</h2>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <form onSubmit={handleSubmit} style={{width: '100%'}}>
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
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={emailNow}
                                onChange={handleChangeEmail}
                            />
                        </div>
                        <div>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={usernameNow}
                                onChange={handleChangeName}
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={passwordNow}
                                onChange={handleChangePass}
                            />
                        </div>
                        <div>
                            <RainbowButton type="submit">SignUp</RainbowButton>
                        </div>
                    </fieldset>
                </form>
            </div>
            <p><GoBackButton place={jumps.home}/></p>
        </div>
    );
}