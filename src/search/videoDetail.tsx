import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {apiRequest, RainbowButton} from "../utils";
import {getPaths, jumps, postPaths} from "../routes";
import YouTube from "react-youtube";
import Modal from "react-modal";
import {GoBackButton} from "../groups/groups-update";

// Estilo do modal
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#333',
        color: '#fff',
        padding: '20px',
        borderRadius: '10px'
    }
};

type Video = {
    id: number,
    title: string,
    link: string,
    tags: string[],
    relevance: number,
    revRating: number,
    userRating: number

}

export function VideoDetail() {
    const {id} = useParams();
    const [video, setVideo] = useState(null);
    const [error, setError] = useState(null);
    const [groups, setGroups] = useState([]);
    const [showGroups, setShowGroups] = useState(false);
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const fromGroup = new URLSearchParams(location.search).get('fromGroup') === 'true';
    const groupId = new URLSearchParams(location.search).get('groupId');

    useEffect(() => {
        apiRequest(getPaths.getVideoDetails.replace(":videoId", id), "GET")
            .then(async (r )=> {
            if (!r.ok) {
                throw Error(r.statusText);
            }
            const data = await r.json();
            console.log(data.video);
            setVideo(data.video);
        });
    }, []);

    const handleStateChange = (event) => {
        if (event.data === YouTube.PlayerState.PLAYING) {
            console.log('Video was clicked and is now playing');
        } else if (event.data === YouTube.PlayerState.ENDED) {
            console.log('Video ended');
            if (!fromGroup) {
                setShowModal(true);
            }
        }
    };


    const fetchGroups = () => {
        apiRequest(getPaths.groups, "GET")
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data.groups);
                setGroups(data.groups);
                setShowGroups(true);
            })
            .catch((e) => {
                console.log("We got error: " + e.message);
                setError(e.message);
            });
    };

    const handleAddToGroup = (groupId: number, groupName: string) => {
        apiRequest(postPaths.updateGroup, "POST", { id: groupId, name: groupName, video: id })
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data);
                // Hide groups list after adding to group
                setShowGroups(false);
            })
            .catch((e) => {
                console.log("We got error: " + e.message);
                setError(e.message);
            });
    };

    const handleSliderChange = (event) => {
        setSliderValue(event.target.value);
    };

    const handleRatingSubmit = (slideRate: number, videoId: number) => {
        console.log(`Rated: ${sliderValue}`);
        setShowModal(false);
        apiRequest(postPaths.updateVideoRating, "POST", { videoId: videoId, rating: slideRate })
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                console.log("rating updated")
            })
            .catch((e) => {
                console.log("We got error: " + e.message);
                setError(e.message);
            });
            navigate(jumps.home, { state: { text: "Avaliação submetida com sucesso!" } })
    };


    return (
        <div>
            {video ? (
                <>
                    <h2>{video.title}</h2>
                    <p style={{
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                        <YouTube
                            videoId={video.link}
                            onStateChange={handleStateChange}
                        />
                    </p>
                    {/*<iframe
                        width="420"
                        height="345"
                        src={`https://www.youtube.com/embed/${video.link}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>*/}
                    <p>Tags do video: {video.tags.join(", ")}</p>
                    {/*<p>Relevância atual: {video.relevance}</p>*/}
                    <p>Avaliação do revisor: {video.revRating}</p>
                    <p>Avaliação global: {video.userRating}</p>
                </>
            ) : (
                <p>Loading...</p>
            )}
            {groupId ? (
                <p><Link to={jumps.groupDetails.replace(":id", groupId)}><RainbowButton>← Go back to Your Group</RainbowButton></Link></p>
            ) : (
                <p><GoBackButton place={jumps.home}/></p>
            )}

            <Modal
                isOpen={showModal}
                onRequestClose={() => {
                }}
                style={customStyles}
                contentLabel="Rate Video Modal"
                ariaHideApp={false}
            >
                <div>
                    <RainbowButton onClick={fetchGroups}>Adicionar a um grupo</RainbowButton>
                    {showGroups && (
                        <ul>
                            {groups.map((group) => (
                                <li key={group.id} onClick={() => handleAddToGroup(group.id, group.name)}>
                                    {group.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <h2>Avalie este vídeo</h2>
                <input type="range" min={0} max={5} step={0.5} value={sliderValue} onChange={handleSliderChange}
                       style={{
                           width: "100%",
                           margin: "1em 0",
                       }}
                />
                <p>Rating: {sliderValue}</p>
                <button onClick={() => handleRatingSubmit(sliderValue, video.id)}>Voltar à pagina inicial</button>
            </Modal>
        </div>
    );

}