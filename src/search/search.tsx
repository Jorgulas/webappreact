import React, {useEffect, useState} from "react";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {apiRequest, RainbowButton} from "../utils";
import {getPaths, jumps, postPaths} from "../routes";
import {useCurrentUser} from "../session/auth";
import {GoBackButton} from "../groups/groups-update";


function presentVideo(title, video, user, navigate: NavigateFunction, handleShowOptions: (videoId: string) => void, showOptions: string | null, groups: any[], handleAddToGroup: (groupId: string, groupName: string, videoId: string) => void) {
    return (
        <div id={"evenlySpaced"} style={{ flexDirection: 'column' }}>
            <h2>{title}</h2>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    if (video) {
                        if (user) {
                            navigate(jumps.videoDetail.replace(":id", video.id));
                        } else {
                            navigate(jumps.signup);
                        }
                    }
                }}
            >
                {video.title}
            </a>
            <img src={`//img.youtube.com/vi/${video.link}/mqdefault.jpg`} alt={video.title} />
            {user && (
                <span
                    style={{ cursor: "pointer", marginLeft: "10px" }}
                    onClick={() => handleShowOptions(video.id)}
                >⨭</span>
            )}
            {showOptions === video.id && (
                <div style={{
                    position: "relative",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    paddingBottom: "10px",
                    border: "1px solid #ccc",
                    backgroundColor: "#1b1b1b",
                    zIndex: 100
                }}>
                    <p onClick={() => handleShowOptions(video.id)}>Adicionar a um grupo: </p>
                    {groups.length > 0 ? (
                        groups.map((group) => (
                            <a key={group.id}
                                onClick={() => handleAddToGroup(group.id, group.name, video.id)}>
                                {group.name}
                            </a>
                        ))
                    ):
                    <p>Não existem grupos</p>
                    }

                </div>
            )}
        </div>
    );
}

export function Search() {
    const [error, setError] = useState('')
    const [searchedItens, setSearchedItens] = useState([])
    const [showOptions, setShowOptions] = useState(null);
    const [groups, setGroups] = useState([]);
/*    const [selectedVideo, setSelectedVideo] = useState(false);*/
    const user = useCurrentUser()

/*    const [thumbnail, setThumbnail] = useState("");*/
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0);

    const tagsString = localStorage.getItem('tags');
    const tags = tagsString ? JSON.parse(tagsString) : [];


    useEffect(() => {
        apiRequest(getPaths.search + `?tags=${tags}`, "GET")
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                setSearchedItens(data.selectionVideos);
            }).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.stackTrace);
        });
    }, []);


    const handleShowOptions = (videoId: string) => {
        setShowOptions(prevId => prevId === videoId ? null : videoId);
        console.log("showOptions: " + showOptions);
        // Fetch the groups of the user
        apiRequest(getPaths.groups, "GET")
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                setGroups(data.groups);
            }).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.message);
        });
    };

    const handleAddToGroup = (groupId, groupName, videoId) => {
        apiRequest(postPaths.updateGroup, "POST", {id: groupId, name: groupName, video: videoId})
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data);
                // Hide options after adding to group
                setShowOptions(null);
            }).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.message);
        });
    };

    const byRevRating = [...searchedItens].sort((a, b) => b.revRating - a.revRating);
    const byDailyRelevance = [...searchedItens].sort((a, b) => b.dailyRelevance - a.dailyRelevance);
    const byTagsLength = [...searchedItens].sort((a, b) => a.tags.length - b.tags.length);

    const revRatingVideo = byRevRating[currentIndex];
    const dailyRelevanceVideo = byDailyRelevance[currentIndex];
    const tagsLengthVideo = byTagsLength[currentIndex];

    const handleNext = () => {
        setCurrentIndex(prevIndex => {
            const newIndex = prevIndex + 1;
            if (newIndex >= searchedItens.length) {
                alert("lamentamos, não encontrámos o exercício perfeito para sí :( , volte ao inicio");
                return prevIndex;
            }
            return newIndex;
        });
    };

    const videoData = [
        {title: "Mais relevante por avaliação", video: revRatingVideo},
        {title: "Mais relevante do dia", video: dailyRelevanceVideo},
        {title: "Mais preciso em relação a Tags", video: tagsLengthVideo}
    ];

    return (
        <div>
            <GoBackButton place={jumps.home}/>
            <h1>Searched results</h1>
            <p>{error}</p>
            {searchedItens.length > 0 ? (
                <div id={"evenlySpaced"} >
                    {
                        videoData.map(({title, video}) =>
                            presentVideo(title, video, user, navigate, handleShowOptions, showOptions, groups, handleAddToGroup))
                    }
                    <RainbowButton onClick={handleNext} style={{whiteSpace: 'pre-line', textAlign: 'center'}}>
                        {`Quero Outros Vídeos!\n(Menos relevantes)`}</RainbowButton>
                </div>
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
}
