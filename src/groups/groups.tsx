import {useEffect, useRef, useState} from "react";
import {apiRequest, RainbowButton} from "../utils";
import {getPaths, jumps, postPaths} from "../routes";
import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {GoBackButton} from "./groups-update";
import {Button} from "react-bootstrap";

const delay = 5;

export function Groups(){
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [name, setName] = useState('');
    const timer = useRef(null)

    async function req() {
        return apiRequest(getPaths.groups, "GET")
            .then(async (rps) => {
                if(!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data)
                setGroups(data.groups);
            }).catch((e) => {
                console.log("We got error: " + e.message);
                setError(e.message);
            })
    }

    useEffect(() => {
        req();
        timer.current = setInterval(
            () => req(),
            delay * 1000);

        return () => {
            clearInterval(timer.current);
        };
    }, [])

    const handleNameChange = (e) => {
        setName(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        apiRequest(postPaths.createGroup, "POST", {name: name})
            .then(async (rps) => {
                if(!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data)
                setSuccess("Group created successfully");
                navigate(jumps.groups);
            }).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.message);
        });
    }

    const handleDelete = (groupId) => {
        apiRequest(postPaths.deleteGroup, "DELETE", {id: groupId})
            .then(async (rps) => {
                if(!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data)
                setSuccess("Group deleted successfully");
                req();
            }).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.message);
        });
    }


    return (
        <div>
            <GoBackButton place={jumps.profile}/>
            <h1>Biblioteca</h1>
            <p>{error}</p>
            <p>Criar novo Grupo</p>
            <form onSubmit={handleSubmit}>
                <label>
                    Nome do novo Grupo: &nbsp;
                    <input type="text" value={name} onChange={handleNameChange}/>
                </label>
                <div>
                    <RainbowButton type="submit">Criar grupo</RainbowButton>
                </div>
            </form>
            <ul>
                {groups.map((group) => (
                    <li key={group.id}>
                        <Link to={jumps.groupDetails.replace(':id', group.id)}>{group.name}</Link>
                        <p>tags: {group.tags ? group.tags : "Este grupo está vazio."}</p>
                        <Button onClick={() => handleDelete(group.id)}>Delete Group</Button>
                    </li>
                ))}
            </ul>

        </div>
    );
}
