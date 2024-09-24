import { useEffect, useState } from "react";
import { apiRequest, Loading, RainbowButton } from "../utils";
import { getPaths, jumps } from "../routes";
import { PDFViewer } from "./reviewer";
import {useBlocker, useNavigate} from "react-router-dom";
import React from "react";

type Appeal = {
    username: string;
    email: string;
    curriculum: any;
    proofOfCompetences: any;
}

export function ReviewAppeals() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [block, setBlock] = useState(true);

    const [appeal, setAppeal] = useState<Appeal | null>(null);

    useBlocker(
        ({ currentLocation, nextLocation }) =>
            block &&
            currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        apiRequest(getPaths.checkSession, "GET").then(async res => {
            if (res.ok) {
                apiRequest(getPaths.appealsReview, "GET").then(async res => {
                    if (res.ok) {
                        const json = await res.json() as Appeal;
                        setAppeal(json);
                    } else {
                        throw Error(await res.text());
                    }
                    setLoading(false);
                }).catch((e) => {
                    setError(e.message);
                    setBlock(false);
                    setLoading(false);
                });
            } else {
                throw Error(await res.text());
            }
        }).catch((e) => {
            setError(e.message);
            setBlock(false);
            setLoading(false);
        });
    }, []);

    const handleApproval = (bool: boolean) => {
        setBlock(false);
        apiRequest(getPaths.appealsReview, "POST", {
            approval: bool,
            username: appeal?.username,
            email: appeal?.email,
        })
            .then(async res => {
                if (res.ok) {
                    navigate(jumps.success, { state: { text: `A solicitação foi ${bool ? 'aprovada' : 'rejeitada'} com sucesso!` } });
                } else {
                    throw Error(await res.text());
                }
            }).catch((e) => {
            setError(e.message);
        });
    }

    return (
        <div>
            {loading && <Loading />}
            {error && <h1>{error}</h1>}
            {!loading && !error && appeal && (
                <div>
                    <h1>Appeals</h1>
                    <h2>Username: {appeal.username}</h2>
                    <h2>Email: {appeal.email}</h2>
                    <PDFViewer pdfData={appeal.curriculum} />
                    <PDFViewer pdfData={appeal.proofOfCompetences} />
                    <RainbowButton onClick={() => { handleApproval(false); }}>Reject</RainbowButton>
                    <RainbowButton onClick={() => { handleApproval(true); }}>Approve</RainbowButton>
                </div>
            )}
        </div>
    );
}