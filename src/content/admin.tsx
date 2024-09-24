import React, {useState} from "react";
import {TagSelector} from "../search/tag-selector";
import {apiRequest, RainbowButton} from "../utils";
import {getPaths, jumps, postPaths} from "../routes";
import {useNavigate} from "react-router-dom";


/**
 * This is the Admin page component.
 *
 * This component is responsible for rendering the Admin page.
 *
 * The Admin page is where authorized users can:
 * - Post a link
 * - Select tags
 * - Select a slider for evaluation
 * - Upload the above data to the API
 *
 * @component
 */
export function Admin() {
    const [link, setLink] = useState("");
    const [tags, setTags] = useState<string[]>(() => {
        const storedTags = localStorage.getItem("tags");
        return storedTags ? JSON.parse(storedTags) : [];
    });
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [error, setError] = useState("");
    const [infoText, setInfoText] = useState("");
    const navigate = useNavigate();

    function setThumbAndTitle(videoID: string) {
        apiRequest(getPaths.checkVideo, "POST", {
            videoID: videoID
        }).then(r => {
            if (r.ok) {
                console.log("Video found")
                const data = r.json()
                setLink(videoID);
                console.log(data)
                data.then(r => {
                    setInfoText(r.snippet.title)
                    /*setThumbnail(r.snippet.thumbnails.medium.url)*/
                })
            } else {
                setInfoText("Video not found")
                console.log("Video doesn't exist")
            }
        })
    }

    const handleLinkChange = (event) => {
        let wholeLink = event.target.value
        setInfoText("Connecting...")
        if(wholeLink === ""){
            setInfoText("Not a valid link")
            return;
        }
        if (wholeLink.includes("youtube.com")) {
            let videoID = wholeLink.split("v=")[1]
            if(videoID.includes("&")){
                videoID = videoID.split("&")[0]
            }
            setThumbAndTitle(videoID);
        } else {
            setThumbAndTitle(wholeLink);
        }
    };

    const handleSliderChange = (event) => {
        setSliderValue(event.target.value);
    };

    const handleSubmit = () => {
        console.log("InfoText: ", infoText);
        console.log("VideoID: ", link);
        console.log("Tags: ", tags);
        console.log("Slider Value: ", sliderValue);

        apiRequest(postPaths.adminAddVideo, "POST", {
            name: infoText,
            ytLinkId: link,
            tags: JSON.parse(localStorage.getItem("tags")),
            revRating: sliderValue
        }).then(r => {
            if(r.ok){
                console.log("Video added successfully")
                navigate(jumps.success, { state: { text: "O teu vídeo foi submetido com êxito!" } });
            } else {
                setError(r.statusText)
                console.log("Error adding video")
            }
        })
    };

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    Não te assustes! Nós encurtamos imediatamente o link do Youtube!
                    <label>
                        <input type="text" style={{width: '40%'}} value={link} onChange={handleLinkChange}
                               placeholder="Link do youtube aqui"/>
                    </label>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{color: 'white', textAlign: 'center'}}>{infoText}</div>
                    {/*<img src={thumbnail} alt=""/>*/}
                    { link && <img src={`//img.youtube.com/vi/${link}/mqdefault.jpg`} alt={link}/>}
                </div>
            </div>
            <TagSelector size={1.2}/>
            <input type="range" min={0} max={5} step={0.5} value={sliderValue} onChange={handleSliderChange} style={
                {
                    width: "15%",
                    margin: "1em",
                }
            }/>
            <> Rating: {sliderValue} </>
            <RainbowButton onClick={handleSubmit}>Enviar Conteúdo</RainbowButton>
            {error}
        </div>
    );
}