import {Link, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {apiRequest, Loading, RainbowButton} from "../utils";
import {getPaths, jumps, postPaths} from "../routes";
import {GoBackButton} from "./groups-update";
import {Button} from "react-bootstrap";


export function GroupDetails(){

    const {id} = useParams();
    const [group, setGroup] = useState(null);
    const [videos, setVideos] = useState([]);
    //const [groupId, setGroupId] = useState('');
    const [error, setError] = useState('');

    /*useEffect(() => {
        apiRequest(getPaths.groupDetails.replace(":id", id), "GET")
            .then(async (rps) => {
                if(!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data)
                setGroup(data.group);
                //setGroupId(data.id);
                if (data.group.videos) {
                    await fetchVideos(data.group.videos);
                }
            }).catch((e) => {
            console.log("We got error: " + e.message);
        });
    }, [id]);*/

    async function req() {
        return apiRequest(getPaths.groupDetails.replace(":id", id), "GET")
            .then(async (rps) => {
                if(!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data)
                setGroup(data.group);
                //setGroupId(data.id);
                if (data.group.videos) {
                    fetchVideos(data.group.videos);
                }
            }).catch((e) => {
                console.log("We got error: " + e.message);
            });

    }

    useEffect(() => {
        req();
        /*apiRequest(getPaths.groupDetails.replace(":id", id), "GET")
            .then(async (rps) => {
                if(!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data)
                setGroup(data.group);
                //setGroupId(data.id);
                if (data.group.videos) {
                    fetchVideos(data.group.videos);
                }
            }).catch((e) => {
            console.log("We got error: " + e.message);
        });*/
    }, [id]);

    const fetchVideos = async (videoIds) => {
        try {
            const videoDetails = await Promise.all(videoIds.map(async (videoId) => {
                const response = await apiRequest(getPaths.getVideoDetails.replace(":videoId", videoId), "GET");
                if (!response.ok) {
                    throw new Error(`Error fetching video ${videoId}`);
                }
                return await response.json();
            }));
            setVideos(videoDetails.map(detail => detail.video));
        } catch (e) {
            console.log("We got error: " + e.message);
            setError(e.message);
        }
    };

    const handleDeleteVideo = (videoId) => {
        apiRequest(postPaths.deleteVideoFromGroup, "DELETE", {videoId: videoId, groupId: id})
            .then(async (rps) => {
                if (!rps.ok) {
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data);
                req();
                //setVideos(videos.filter(video => video.id !== videoId));  // Atualizar a lista de vídeos após a exclusão
            }).catch((e) => {
            console.log("We got error: " + e.message);
            setError(e.message);
        });
    };


    return (
        <div>
            <h1>Detalhes do Grupo</h1>
            <p>{error}</p>
            {group ? (
                <>
                    <h1>{group.name}</h1>
                    <p>{group.id}</p>
                    <h2>Videos</h2>
                    <ul>
                        {videos.map((video, index) => (
                            <li key={index}>
                                <Link to={`${jumps.videoDetail.replace(":id", video.id)}?groupId=${group.id}&fromGroup=true`}>{video.title}</Link>
                                <Button onClick={() => handleDeleteVideo(video.id)}>Delete Video from this group</Button>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <Loading/>
            )}
            <GoBackButton place={jumps.groups}/>
            <p><Link to={jumps.groupUpdate.replace(":id", id)}><RainbowButton>Atualizar Grupo</RainbowButton></Link></p>
        </div>

    );
}