import {CSSProperties, ReactNode, useEffect, useState} from "react";
import {apiRequest, Loading, RainbowButton} from "../utils";
import {getPaths, jumps, postPaths} from "../routes";
import React from "react";
import {useNavigate} from "react-router-dom";
import {TagSelector} from "../search/tag-selector";
import YouTube from "react-youtube";

type Video = {
    id: string; // id.videoId
    title: string; // snippet.title
    description: string; // snippet.description
    submittedBy: string; // snippet.channelTitle
    submittedAt: any; // snippet.publishedAt
    thumbnails: string; // snippet.thumbnails.medium.url
}

type Reviewer = {
    id: string;
    eval: number;
}

type ReviewList = {
    reviews: string[];
}

type VideoMin = {
    title: string;
    link: string;
    revRating: number;
    tags: string[]
}

type TestResult = {
    newEval: number;
}

let numberOfVideos = 3;

const beginnerTutorial = <>
    <p>Bem-Vindo! 🎉</p>
    <p>Eu sou o tutorial! 🤖</p>
    <p>Este teste tem como objetivo avaliar a tua capacidade de revisão de vídeos. 🧐</p>
    <p>Para cada vídeo, deves assistir ao vídeo completamente. 📹👀</p>
    <p>Se o titulo do vídeo não te parecer adequado ou for muito longo, deves alterá-lo. 📝📌</p>
    <p>De seguida, deves atribuir uma classificação ao vídeo, de 0 a 5 (Isto é a tua opinião, não conta para avaliação).
        ⭐️🔢</p>
    <p>Por fim, deves selecionar as tags que melhor descrevem o vídeo. 🏷️🔍</p>
    <p>Nós garantimos que cada vídeo que te mostramos na avaliação tem no mínimo uma tag.
        Por isso, se não selecionares pelo menos uma tag, temos a certeza que <u>falharás o teste</u>. 🚫❌</p>
    <p> <u>Pontos importantes a denotar:</u>
        <p>
            Se tiveres vídeos repetidos, não te preocupes, foi misericórdia do sistema de aleatoriedade. 🙏
        </p>
        <p>
            Quanto ao Título novo, se existirem palavras que estão presentes nas tags, remove-as se não forem relevantes.
            Isto é, "Treino Intenso" pode ser removido uma vez que as tags "Intenso" e "Treino" existem.
            Por norma tenta descrever o vídeo de forma sucinta e clara. 📌
        </p>
        <p>
            Quanto à Classificação, não te preocupes com a avaliação que o vídeo já tem.
            A tua avaliação não conta para a avaliação dele. ⭐️
        </p>
    </p>
    <p>Se fizeres tudo corretamente, passarás no teste e estarás pronto a rever vídeos! 🎉🎉</p>
    <p>Mas lembra-te, para a semana há mais! 📅</p>
    <p>Boa sorte! 🍀</p>
</>

const information = <>
    <p>Nesta página, ser-te-ão disponibilizados <u>{numberOfVideos} vídeos para reveres</u>.<br/> 📹👀</p>
    <p>De forma a que fiquem <u>bem avaliados</u>, deves assistir ao <u>vídeo</u> completamente
        e ler a sua <u>descrição</u>. <br/> ✅📖</p>
    <p>De seguida, deverás atribuir uma <u>classificação</u> ao vídeo, de 0 a 5. <br/> ⭐️🔢</p>
    <p>Por fim, deves selecionar as <u>tags que melhor descrevem</u> o vídeo (tenta selecionar pelo menos uma tag em cada categoria). <br/> 🏷️🔍</p>
    <p>Parece simples, porém, de vez em quando entregar-te-emos um vídeo
    <i> dummy</i> para testar a tua atenção e
    promover uma dinâmica de revisão mais precisa. <br/> 🎥🧠</p>
</>;


export function ReviewVideos() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tutorialText, setTutorialText] = useState(false);
    const [notAVideo, setNotAVideo] = useState<boolean[]>([false,false,false]);
    const [videos, setVideos] = useState<Video[] | null>(null);
    const [titles, setTitles] = useState<string[]>([]);
    const [sliderValue, setSliderValue] = useState<number[]>([0,0,0]);
    const [isTest, setTest] = useState<boolean | null>(null);
    const [testsCorrection, setTestsCorrection] = useState<VideoMin[] | null>(null);

    const navigate = useNavigate();

    for(let i = 1; i <= numberOfVideos; i++) {
        if(localStorage.getItem("reviewTags" + i) == null ) {
            localStorage.setItem("reviewTags" + i, JSON.stringify([]));
        }
    }

    const [workFinished, setWorkFinished] = useState<number>(0);

    useEffect(() => {
        if(workFinished >= numberOfVideos-1) {
            navigate(jumps.success, {state: {text: "Os teus vídeo foram submetidos com êxito!"}});
        } else return

    }, [workFinished])

    const handleToggle = () => {
        setTutorialText(!tutorialText);
    };

    const handleSliderChange = (index) => {
        return (event) => {
            const value = event.target.value;
            setSliderValue(prev => {
                prev[index] = parseFloat(value);
                return [...prev];
            });
        };
    };

    const handleStateChange = () => {
        console.log('Video was clicked');
    }


    useEffect(() => {
        apiRequest(getPaths.checkSession, "GET").then(async res => {
            if (res.ok) {
                apiRequest(getPaths.me, "GET").then(async r => {
                    if (r.ok) {
                        const rev = await r.json() as Reviewer;
                        setTest(rev.eval < 50)
                    } else
                        throw Error(await r.text());
                }).catch(e => {
                    setError("Reviewer getting return an error: "+e)
                    setLoading(false)
                })
            } else {
                console.log("Session not found")
                navigate(jumps.login);
            }
        }).catch(e => {
            console.log("2"+e.message)
            setError(e)
            setLoading(false)
        });
    }, []);

    useEffect(() => {
        if(isTest === null) return;
        if(!isTest)
            apiRequest(getPaths.videosReview, "GET")
                .then(async res => {
                    if (res.status === 200) {
                        const j = await res.json() as ReviewList;
                        console.log("videosReview: ");
                        console.log(j);
                        if (j.reviews.length === 0) {
                            setLoading(false);
                            throw Error("Não há vídeos para rever");
                        }
                        numberOfVideos = j.reviews.length
                        let arr = j.reviews.map(r => r);
                        arr.forEach(id => {
                            setThumbAndTitle(id);
                            console.log("loading video:" + id);
                        });

                    } else
                        throw Error(await res.text());
                    setLoading(false);
                }).catch(e => {
                    console.log("1"+e.stackTrace)
                    setError(e)
                    setLoading(false)
                });
        else
            for(let i = 0; i < numberOfVideos; i++) {
                apiRequest(getPaths.test, "GET")
                    .then(async res => {
                        if (res.ok) {
                            const data = await res.json() as VideoMin;
                            console.log(data);
                            setTitles(prevTitles => {
                                if (prevTitles.length === 0) {
                                    return [data.title];
                                } else {
                                    return [...prevTitles, data.title];
                                }
                            })
                            setTestsCorrection(prev => {
                                if (prev === null) {
                                    return [data];
                                } else {
                                    return [...prev, data];
                                }
                            })
                        } else
                            throw Error(await res.text());
                        setLoading(false);

                    }).catch(e => {
                        console.log("Error: " + e);
                        setError(e);
                        setLoading(false);
                    })
            }
    }, [isTest]);

    function setThumbAndTitle(videoId: string) {
        console.log(`Checking if video ${videoId} exists`);
        apiRequest(getPaths.checkVideo, "POST", { videoID: videoId })
            .then(async r => {
                if (r.ok) {
                    console.log("Video found");
                    const data = await r.json();
                    console.log(data);
                    setTitles(prevTitles => {
                        if (prevTitles.length === 0) {
                            return [data.snippet.title];
                        } else {
                            return [...prevTitles, data.snippet.title];
                        }
                    })
                    const vid = {
                        id: videoId,
                        title: data.snippet.title,
                        description: data.snippet.description,
                        submittedBy: data.snippet.channelTitle,
                        submittedAt: data.snippet.publishedAt,
                        thumbnails: data.snippet.thumbnails.medium.url
                    } as Video

                    setVideos(prevVideos => {
                        if (prevVideos === null) {
                            return [vid];
                        } else {
                            return [...prevVideos, vid];
                        }
                    });
                } else
                    throw Error(await r.text());

                setLoading(false);
            }).catch(e => {
                console.log("Error: " + e);
                /* setError(e.message); */
                setLoading(false);
            });
    }

    const handleSubmit = () => {
        if(!isTest){
            for(let i = 0; i < numberOfVideos; i++) {
                if (!notAVideo[i]) {
                    console.log(`Video ${i} is NOT a fitness video`);
                    apiRequest(postPaths.banVideo, "POST", {
                        video: videos[i].id
                    }).then(r => {
                        if (r.ok) {
                            console.log("Video banned successfully")
                        } else {
                            setError(r.statusText)
                            console.log("Error banning video")
                        }
                    })
                } else {
                    console.log(`Video ${i} is a fitness video`);
                    apiRequest(postPaths.reviewerAddVideo, "POST", {
                        newTitle: titles[i],
                        linkId: videos[i].id,
                        revRating: sliderValue[i],
                        tags: JSON.parse(localStorage.getItem("reviewTags"+(i+1)) || ''),
                    }).then(r => {
                        if (r.ok) {
                            console.log("Video added successfully")
                        } else {
                            setError(r.statusText)
                            console.log("Error adding video")
                        }
                    })
                }
                setWorkFinished(prev => prev + 1);
            }
        } else {
            let arrayOfResults : number[] = []
            testsCorrection.forEach((video, index) => {
                const totalTags : number = 78
                const selectedTags = JSON.parse(localStorage.getItem("reviewTags"+(index+1)) || '') as string[]
                if(totalTags < selectedTags.length) {
                    console.error("Too many tags selected for video " + index);
                    setError("Too many tags selected for video " + index);
                    return;
                }
                let correctGuesses : number = 0
                selectedTags.forEach(tag => {
                    if(video.tags.includes(tag)) {
                        correctGuesses++;
                    }
                })

                arrayOfResults.push(correctGuesses / video.tags.length)
            })
            const total = arrayOfResults.reduce((sum, result) => sum + result, 0) / arrayOfResults.length;
            const result : number = total * 100;
            console.log(arrayOfResults)
            console.log(result)
            apiRequest(postPaths.test, "POST", { result })
                .then(async r => {
                    if (r.ok) {
                        const data = await r.json() as TestResult;
                        console.log("Test result added successfully")
                        if(data.newEval < 50)
                            navigate(jumps.success,
                                {state: {text: "Não passaste no teste! Tiveste uma cotação de " + data.newEval + "%. Tenta novamente!"}});
                        else
                            navigate(jumps.success, {state: {text: "Passaste no teste! Tiveste uma cotação de " + data.newEval + "%"}});
                    } else
                        throw Error(await r.text());
                }).catch(e => {
                    setError(e)
                    console.log("Error adding test result")
                })
        }
    };

    const handleNewTitle = (index: number) => {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            console.log(`New title for video ${index}: ${value}`);
            setTitles(prev => {
                prev[index] = value;
                return [...prev];
            });
        };
    }

    const handleBan = (index: number) => {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.checked;
            console.log(`Video ${index} is not a fitness video: ${value}`);
            setNotAVideo(prev => {
                prev[index] = value;
                return [...prev];
            });
        };
    }

    return (
        <>
            {loading && <Loading/>}
            {error && <div>Error: {error}</div>}
            {!loading && !error &&
                <div>
                    {isTest ? <h1>Teste de Revisão</h1> : <h1>Revisão de Videos</h1>}
                    <div id={"centerDivision"} style={{flexDirection: 'column'}}>
                        {isTest &&
                            <div style={informationBoxSS}>
                                {beginnerTutorial}
                            </div>
                        }
                        <GreenButton onClick={handleToggle}>O que faço?</GreenButton>
                        {tutorialText &&
                            <div style={informationBoxSS}>
                                {information}
                            </div>
                        }
                        <br/>
                    </div>
                    <div id={"boxFadedGradient"}></div>
                    {isTest && testsCorrection && testsCorrection.map((video, index) => (
                        <>
                            <VideoCardTests video={video} onClick={handleStateChange} key={video.title}/>
                            <>
                                {titles.length>0 &&
                                    (<p style={{...getStyle, flexDirection: 'column' }}>
                                        <label htmlFor={"title"+index}>Novo Título</label>
                                        <input
                                            style={{ width: '50%' }}
                                            id={"title"+index}
                                            type="text"
                                            name={"title"+index}
                                            value={titles[index]}
                                            onChange={handleNewTitle(index)}/>
                                    </p>)
                                }
                                <p style={getStyle}>
                                    Abaixo poderá avaliar de 0 a 5 o vídeo que visualizou.
                                </p>
                                <p style={getStyle}>
                                    {ratingSlider(sliderValue, index, handleSliderChange(index))} Rating:{sliderValue[index]}
                                </p>
                                <div>
                                    <TagSelector size={1.2} nameItem={"reviewTags" + (1 + index)}/>
                                </div>
                            </>
                            <div id={"boxFadedGradient"}></div>
                        </>
                    ))}

                    {!isTest && videos && videos.map((video, index) => (
                        <>
                            <VideoCard video={video} onClick={handleStateChange} key={video.id}/>
                            <p style={getStyle}>
                                {noFitnessVideoButton(index, notAVideo, handleBan(index))}
                            </p>
                            {notAVideo[index] &&
                                <>
                                    {titles.length>0 &&
                                        (<p style={{...getStyle, flexDirection: 'column' }}>
                                            <label htmlFor={"title"+index}>Novo Título</label>
                                            <input
                                                style={{ width: '50%' }}
                                                id={"title"+index}
                                                type="text"
                                                name={"title"+index}
                                                value={titles[index]}
                                                onChange={handleNewTitle(index)}/>
                                        </p>)
                                    }
                                    <p style={getStyle}>
                                        {ratingSlider(sliderValue, index, handleSliderChange(index))} Rating:{sliderValue[index]}
                                    </p>
                                    <div>
                                        <TagSelector size={1.2} nameItem={"reviewTags" + (1 + index)}/>
                                    </div>
                                </>}
                            <div id={"boxFadedGradient"}></div>
                        </>
                    ))}
                    <RainbowButton onClick={handleSubmit}>Enviar Conteúdo</RainbowButton>
                </div>
            }
        </>
    );
}

function VideoCardTests( single : {video : VideoMin, onClick: () => any } ) {
    const video = single.video;
    const handleStateChange = single.onClick;
    return (
        <div style={{
            padding: '1em',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '20px 20px 0 0'
        }}>
            <h2>Título original do vídeo: {video.title}</h2>
            <h3>Avaliação atual do vídeo de acordo com um dos nossos revisores: {single.video.revRating}</h3>
            <div id={"evenlySpaced"} style={{justifyContent:'center'}}>
                {/*<img src={`//img.youtube.com/vi/${video.id}/mqdefault.jpg`} alt={video.thumbnails}/>*/}
                <YouTube
                    videoId={video.link}
                    onStateChange={handleStateChange}
                />
            </div>
            <p>Este é o id original do vídeo: {video.link}</p>
        </div>
    );
}

function VideoCard( single : {video : Video, onClick: () => any } ) {
    const video = single.video;
    const handleStateChange = single.onClick;
    return (
        <div style={{
            padding: '1em',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '20px 20px 0 0'
        }}>
            <h2>{video.title}</h2>

            <p><u>Submitted by</u>: {video.submittedBy}</p>
            <p><u>Submitted at</u>: {formatDate(video.submittedAt.value)}</p>
            <div id={"evenlySpaced"} style={{justifyContent:'center'}}>
                {/*<img src={`//img.youtube.com/vi/${video.id}/mqdefault.jpg`} alt={video.thumbnails}/>*/}
                <YouTube
                    videoId={video.id}
                    onStateChange={handleStateChange}
                />
                <p style={{ maxWidth: '40%' }}>{video.description}</p>
            </div>
            <p>Video id: {video.id}</p>
        </div>
    );
}

function formatDate(timestamp: number) {

    const date = new Date(timestamp);

    return date.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function GreenButton(props: { onClick: () => void, children: ReactNode }) {
    return (
        <button
            style={greenButtonStyle}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

const ratingSlider = (sliderValue: number[], index: number, handleSliderChange: (event) => void) => {
    return <input type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={sliderValue[index]}
                  onChange={handleSliderChange}
                  id={"evenlySpaced"}
                  style={
                      {
                          maxWidth: "50%",
                          width: "50%",
                          margin: "1em",
                      }
                  }/>;
}

const noFitnessVideoButton = (index: number, notAVideo: boolean[], handleBan: (event: React.ChangeEvent<HTMLInputElement>) => void) => {
    const idName = "notAVideo"+index;
    const color = 'limegreen'
    const text = "Isto é um vídeo de Fitness?";

    return <label htmlFor={idName} style={{
        color: 'black',
        backgroundColor: 'rgba(184,193,51,0.7)',
        padding: '8px',
        borderRadius: "12px",
    }}>
        <input
            style={{
                content: text,
                backgroundColor: color,
                marginRight: "1em",
                marginLeft: "1em",
                fontSize: "1em",
            }}
            id={idName}
            data-color={color}
            type="checkbox"
            checked={notAVideo[index]}
            onChange={ handleBan }
        /> {text}
    </label>
}

const greenButtonStyle : CSSProperties = {
    backgroundColor: '#64a12c',
    border: 'none',
    color: 'white',
    padding: '10px 22px',
    textAlign: 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    margin: '2px 1px',
    cursor: 'pointer',
    borderRadius: '12px',
};

const informationBoxSS :React.CSSProperties = {
    textAlign: 'center',
    fontSize: 'large',
    maxWidth: '50%',
    lineHeight: '20px',
    fontWeight: '200',
    background: 'linear-gradient(180deg, rgb(108 129 35 / 38%), transparent)',
    padding: '1em',
    border: '1px solid #999999',
    borderRadius: '12px',
    animation: 'fadeIn 300ms linear forwards',
};

const getStyle : CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    margin: 'auto'
}


