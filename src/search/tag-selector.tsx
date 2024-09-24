import React, {CSSProperties, useEffect, useState} from "react";
import {apiRequest, Loading} from "../utils";
import {getPaths} from "../routes";

type Tag = {
    id: string,
    name: string,
    idSection: number
};

type Section = {
    id: number,
    name: string
};

/*type coloredTag = {
    tags: Tag[],
    motif: string,
    color: string
}*/

// Function to return color for a given section name
function getColorForSection(sectionName: string): string {
    const sectionColors: { [key: string]: string } = {
        'Músculos': '#c51700',
        'Objetivos': '#009f9f',
        'Equipamento': '#737373',
        'Duração': '#23850b',
        'Intensidade': '#e6540e',
        'Tipo': '#b88900',
        'Acessibilidade': '#870ced',
        'Músculos Afetados': '#6c3c2b'
    };
    return sectionColors[sectionName] || '#a8a8a8'; // Default to orange if section name is not found
}

type FlexDirection = "row" | "column" | "inherit";


const sideBarsDivForTags: CSSProperties = {
    display: 'flex',
    flexDirection: 'inherit',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    justifyContent: 'center',
    alignItems: 'flex-start'
}

const transparentSS = {background: 'transparent', border: 'none'};

export function TagSelector({size, nameItem}: { size: number, nameItem?: string | null }) {
    const [error, setError] = useState('')
    const [nameTags, setNameTags] = useState<string[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [tags, setTags] = useState<Tag[][]>([]);
    const [flexDirectionObj, setFlexDirection] = useState<FlexDirection>("inherit");

    const scaledSize = `${size.valueOf()}em`;

    const updateFlexDirection = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (!(width < height * (1.70))) {
            setFlexDirection("row");
        } else {
            setFlexDirection("column");
        }
    };

    useEffect(() => {
        updateFlexDirection(); // Update on mount to set initial state
        window.addEventListener("resize", updateFlexDirection);

        return () => {
            window.removeEventListener("resize", updateFlexDirection);
        };
    }, []);

    useEffect(() => {
        apiRequest(getPaths.getSections, "GET")
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data.sectionList)
                setSections(data.sectionList);
            }).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.stackTrace);
        });

        apiRequest(getPaths.getTags, "GET")
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data.tagList)
                setTags(data.tagList);

            }).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.stackTrace);
        });

        if (localStorage.getItem(nameItem ?? "tags")) {
            setNameTags(JSON.parse(localStorage.getItem(nameItem ?? "tags") || ''));
            console.log(nameTags)
        } else {
            console.log("No tags selected")
        }
    }, []);


    function handleNameTagsChange(id: string, isChecked: boolean) {
        if (isChecked) {
            setNameTags(prevTags => {
                const updatedTags = [...prevTags, id];
                localStorage.setItem(nameItem ?? "tags", JSON.stringify(updatedTags));
                return updatedTags;
            });
        } else {
            setNameTags(prevTags => {
                const updatedTags = prevTags.filter(tag => tag !== id);
                localStorage.setItem(nameItem ?? "tags", JSON.stringify(updatedTags));
                return updatedTags;

            });
        }
    }


    return (
        <div className="tagBox">
            <h2 style={{fontSize: scaledSize, textAlign: 'center', marginBottom: '20px'}}>
                Escolha as suas tags:
            </h2>

            {error && <p style={{color: 'red'}}>
                {error}
            </p>}

            { sections.length ? (
                <div className="tagSelector" style={{flexDirection: flexDirectionObj}}>
                    {sections.map((section, index) => {
                        const sectionStyle = {
                            fontSize: scaledSize,
                            color: getColorForSection(section.name),
                            marginBottom: `${size * 10}px`
                        };
                        return (
                            <div key={section.id} style={transparentSS}>
                                <h3 style={sectionStyle}>
                                    {section.name}
                                </h3>
                                <div style={sideBarsDivForTags}>

                                    {tags[index] && tags[index].map((tag) => (
                                        <div className="tag" key={tag.id} style={transparentSS}>

                                            <Checkbox
                                                id={`${section.name}_${tag.name}_${tag.id}`}
                                                label={tag.name}
                                                color={getColorForSection(section.name)}
                                                checked={nameTags.includes(`${tag.name}`)}
                                                onCheckChange={(isChecked: boolean) => handleNameTagsChange(`${tag.name}`, isChecked)}
                                                size={size}
                                                nameItem={nameItem}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>) : <Loading/>}
        </div>
    );
}

export function Checkbox({id, label, checked, color, onCheckChange, size, nameItem, ...props}) {
    const defaultChecked = checked ? checked : false;
    const [isChecked, setIsChecked] = useState(defaultChecked);
    const scaledSize = `${size}em`;

    useEffect(() => {
        const tags = JSON.parse(localStorage.getItem(nameItem ?? "tags") || '[]');
        setIsChecked(tags.includes(label));
    }, [label]);

    const handleCheck = () => {
        const newCheckedState = !isChecked;
        setIsChecked(newCheckedState);
        onCheckChange(newCheckedState);
    }

    return (
        <>
            <label htmlFor={id} style={{fontSize: scaledSize}}>
                <input
                    style={{
                        content: label,
                        backgroundColor: color,
                        marginRight: `${size * 10}px`,
                        marginLeft: `${size * 10}px`,
                        fontSize: `${size * 16}px`,
                    }}
                    size={size}
                    className={isChecked ? 'tagAnimation color' : ''}
                    id={id}
                    data-text={label}
                    data-color={color}
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleCheck}
                    {...props}
                />
            </label>
        </>
    )
}