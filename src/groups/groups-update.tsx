import React, {useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {apiRequest, RainbowButton} from "../utils";
import {jumps, postPaths} from "../routes";

export function GoBackButton({place} : {place: string}) {
    return <Link to={place}><RainbowButton>← Voltar</RainbowButton></Link>;
}

export function GroupsUpdate(){
    const navigate = useNavigate();
    const {id} = useParams()
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault()
        apiRequest(postPaths.updateGroup, "POST", {id: id, name: name})
            .then(async (rps) => {
                if(!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data)
                navigate(jumps.groups);
            }).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.message);
        });
    }

    function handleChangeName(ev: React.FormEvent<HTMLInputElement>) {
        //const name = ev.currentTarget.name;
        setName(ev.currentTarget.value);
    }

    return (
        <div>
            <h1>Update Group</h1>
            <p>{error}</p>
            <form onSubmit={handleSubmit}>
                <label>
                    New Group name:
                    <input type="text" value={name} onChange={handleChangeName}/>
                </label>
                <div>
                    <button type="submit">Update group</button>
                </div>
            </form>
            <GoBackButton place={jumps.groups} />
        </div>
    );
}