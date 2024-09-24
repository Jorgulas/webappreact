import React, {useEffect, useState} from "react";
import {useCurrentUser} from "../session/auth";
import {apiRequest, Loading, RainbowButton} from "../utils";
import {jumps, postPaths} from "../routes";
import {useNavigate} from "react-router-dom";


export function PDFViewer({ pdfData }) {
    if (!pdfData) {
        return <p>No PDF data available.</p>;
    }

    let pdfDataUri: string;

    if (typeof pdfData === 'string') {
        // If it is a string, assume it is already a Base64 string or data URI
        pdfDataUri = pdfData.startsWith('data:') ? pdfData : `data:application/pdf;base64,${pdfData}`;
    } else if (pdfData instanceof Uint8Array) {
        // If it is a Uint8Array, convert it to a Base64 string
        const binary = Array.from(pdfData).map(byte => String.fromCharCode(byte)).join('');
        pdfDataUri = `data:application/pdf;base64,${btoa(binary)}`;
    } else {
        console.error('Unsupported PDF data type');
        return <p>Error: Unsupported PDF data type.</p>;
    }

    const finalUri = `${pdfDataUri}#view=FitH`;

    return (
        <object
            data={finalUri}
            type="application/pdf"
            style={{
                height: '700px',
                width: '48%',
            }}
        >
            <p>Your browser does not support PDFs.
                <a href={finalUri} target="_blank" rel="noopener noreferrer">Download the PDF</a>.</p>
        </object>
    );
}



/**
 * This is the RequestReviewer page component.
 * It is responsible for rendering the page where the user appeals for the Reviewer role.
 * The user will need to fill in a form with their personal information and submit it.
 * As well as its curriculum vitae and Proof of Qualifications.
 * */
export function RequestReviewer() {
    const [error, setError] = useState('');
    const [proofCompetences, setProofCompetences] = useState(null);
    const [cv, setCV] = useState(null);
    const [alreadyAppealed, setAlreadyAppealed] = useState(false);
    const [pdfByteArrayCV, setPdfByteArrayCV] = useState(null);
    const [pdfByteArrayProof, setPdfByteArrayProof] = useState(null);
    const [checkAppeal, setCheckAppeal] = useState(true);

    const user = useCurrentUser();
    const navigate = useNavigate();


    useEffect(() => {
        if(!user) navigate(jumps.login);
        else if(user.authority == 'A' || user.authority == 'R') navigate("/error");
        apiRequest(postPaths.appealToReviewer, "GET")
            .then(async (rps) => {
                console.log(rps)
                if (!rps.ok) {
                    if(rps.status === 404) { // "Appeal not found" is a good response
                        setCheckAppeal(false);
                        return
                    }
                    throw Error(rps.statusText);
                }
                const data = await rps.json();
                console.log(data)

                setAlreadyAppealed(true);

                setPdfByteArrayCV(data.curriculum);
                setPdfByteArrayProof(data.proofOfCompetences);

                setCheckAppeal(false);

            }).catch((e) => {
            console.log("We got error: " + e);
            setError(e.stackTrace);
        });
    }, []);

    const handleCVChange = (event) => {
        setCV(event.target.files[0]);
        console.log(event.target.files[0])
    };

    const handleCompChange = (event) => {
        setProofCompetences(event.target.files[0]);
        console.log(event.target.files[0])
    };



    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!cv || !proofCompetences) {
            setError('Please select both files before submitting.');
            return;
        }

        const formData = new FormData();
        formData.append('curriculum', cv);
        formData.append('proofOfCompetences', proofCompetences);
        formData.append('username', user.username);
        formData.append('email', user.email);

        // Modify the apiRequest function to handle FormData
  /*      apiRequest(postPaths.appealToReviewer,'POST',formData, false)
            .then(async res => {
                if(res.ok){
                    navigate(jumps.success, {state: {text: "O seu apelo foi colocado em espera!"}});
                } else {
                    setError('Não foi possível enviar os seus dados.');
                }
            })*/

        await fetch(postPaths.appealToReviewer, {
            method: 'POST',
            body: formData,
            credentials: 'include', // Include cookies in the request
        }).then(async res => {
            if (res.ok) {
                navigate(jumps.success, {state: {text: "O seu apelo foi colocado em espera!"}});
            } else {
                setError('Não foi possível enviar os seus dados.');
            }
        }).catch((e) => {
            setError(e.message)
        });



    }

    return (
        <div>
            {
                alreadyAppealed ? (
                    <>
                        <h1>Já apelaste para ser um Revisor</h1>
                        <p>O teu apelo está em <u>espera</u> . Aguarda pela nossa resposta.</p>
                        <p>Aqui está o teu apelo:</p>
                        {pdfByteArrayCV && pdfByteArrayProof ?
                            <>
                                <div id={"evenlySpaced"}>
                                    <h3><i>Curriculum Vitae</i></h3>
                                    <h3><i>Prova de Habilitações</i></h3>
                                </div>
                                <div id={"evenlySpaced"}>
                                    <PDFViewer pdfData={pdfByteArrayCV}/>
                                    <PDFViewer pdfData={pdfByteArrayProof}/>
                                </div>
                            </>
                            :
                            <Loading/>
                        }
                    </>
                ) : (
                    !checkAppeal ?
                    <>
                        <h1>Queres ser um Revisor?</h1>
                        <p>Para te tornares num, basta que preenchas o seguinte formulário:</p>
                        {error && <p style={{color: 'red'}}>{error}</p>}
                        <form onSubmit={handleSubmit}>
                            <label>
                                Nome:&nbsp;
                                <input type="text" name="username" value={user.username} disabled={true} />
                            </label>
                            <label>
                                Email:&nbsp;
                                <input type="text" name="email" value={user.email} disabled={true} />
                            </label>
                            <label>
                                Curriculum Vitae:&nbsp;
                                <input type="file" name="curriculum" accept="application/pdf" onChange={handleCVChange}/>
                            </label>
                            <label>
                                Prova de Habilitações:&nbsp;
                                <input type="file" name="proofOfCompetences" accept="application/pdf" onChange={handleCompChange} />
                            </label>
                            <RainbowButton type="submit">Submeter</RainbowButton>
                        </form>
                    </>:
                        <Loading/>
                )
            }
        </div>
    );
}


/*
const byteArrayToBlob = (byteArray) => {
    return new Blob([byteArray], { type: 'application/pdf' });
};

const PdfViewer = ({ byteArray }) => {
    const blob = byteArrayToBlob(byteArray);
    const url = URL.createObjectURL(blob);

    return (
        <iframe src={url} width="100%" height="500px" />
    );
};
*/

/*
function PDFRender({ byteArray }) {

    const blob = byteArrayToBlob(byteArray);
    const url = URL.createObjectURL(blob);

    const [pdfUrl, setPdfUrl] = useState('');

    useEffect(() => {
        // Step 1: Convert the byte array to a Blob
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // Step 2: Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Step 3: Use the URL
        setPdfUrl(url);

        // Step 4: Clean up the blob URL on component unmount
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [byteArray]);

    return (
        <div>
            {pdfUrl ? (
                <PDFViewer style={{ width: '100%', height: '500px' }}>
                    <Document file={pdfUrl}>
                        <Page pageNumber={1}/>
                    </Document>
                </PDFViewer>
            ) : (
                <div>No PDF file specified.</div>
            )}
            {/!* Display the PDF in an iframe *!/}
            {/!*<iframe src={pdfUrl.} width="100%" height="500px" />*!/}
            {/!* Or create a downloadable link *!/}
            {/!* <a href={pdfUrl} download="downloadedFile.pdf">Download PDF</a> *!/}
        </div>
    );
}*/
