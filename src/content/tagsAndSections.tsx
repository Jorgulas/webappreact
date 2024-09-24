import React, {useEffect, useState} from "react";
import {apiRequest} from "../utils";
import {getPaths, jumps, postPaths} from "../routes";
import {useNavigate} from "react-router-dom";

export function AddTagsAndSections(){
    const [tag, setTag] = useState("")
    const [section, setSection] = useState("")
    const [allSections, setAllSections] = useState([])
    const [selectedSection, setSelectedSection] = useState('');
    const [error, setError] = useState("")
    const navigate = useNavigate();

    useEffect(() => {
        apiRequest(getPaths.getSections, "GET")
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data.sectionList)
                setAllSections(data.sectionList);
            }).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.stackTrace);
        });
    }, []);

    const handleTagNameChange = (e) => {
        setTag(e.target.value);
    };

    const handleSectionNameChange = (e) => {
        setSection(e.target.value);
    };

    const handleSectionSelectChange = (e) => {
        setSelectedSection(e.target.value);
    };

    const handleTagSubmit = (e) => {
        e.preventDefault();
        apiRequest(postPaths.addTag, "POST", {nome: tag, section: selectedSection})
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data)
                navigate(jumps.success, { state: { text: "A Tag foi adicionada com êxito!" } });
            }
        ).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.stackTrace);
        });
    }

    const handleSectionSubmit = (e) => {
        e.preventDefault();
        apiRequest(postPaths.addSection, "POST", {nome: section})
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data)
                navigate(jumps.success, { state: { text: "A secção foi adicionada com êxito!" } });
            }
        ).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.stackTrace);
        });
    }

    return (
        <div style={{
            marginLeft: '10%',
        }}>
            <h1>O que pretende adicionar?</h1>
            <h2 style={{
                display: 'flex',
                justifyContent: 'left',
            }}>Adicionar Tag</h2>
            <form onSubmit={handleTagSubmit} style={{
                marginBottom: '100px',
            }}>
                <label>Nome da Tag</label>
                <input
                    type="text"
                    name="tag-name"
                    value={tag}
                    onChange={handleTagNameChange}
                />
                <label>Secção</label>
                <select
                    value={selectedSection}
                    onChange={handleSectionSelectChange}
                >
                    <option value="">Selecione uma seção</option>
                    {allSections.map((section) => (
                        <option key={section.id} value={section.id}>
                            {section.name}
                        </option>
                    ))}
                </select>
                <button type="submit">Adicionar</button>
            </form>
            <div>
                <h2 style={{
                    display: 'flex',
                    justifyContent: 'left',
                }}>Adicionar Secção</h2>
                <form onSubmit={handleSectionSubmit}>
                    <label>Nome da Seção</label>
                    <input
                        type="text"
                        name="section-name"
                        value={section}
                        onChange={handleSectionNameChange}
                    />
                    <button type="submit">Adicionar</button>
                </form>
            </div>
        </div>
    )
}