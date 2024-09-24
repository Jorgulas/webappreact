import React, {useEffect, useState} from "react";
import {Link, Navigate} from "react-router-dom";
import {useCurrentUser} from "../session/auth";
import {jumps} from "../routes";
import {Button} from "react-bootstrap";

/*function ProtectedRoute({ allowedRoles, children }) {

    const user = useCurrentUser();

    if (!user) {
        return <Navigate to={jumps.login}/>;
    }

    if (allowedRoles && !allowedRoles.includes(user.authority)) {
        return <Navigate to={jumps.home}/>;
    }

    return children;
}

export default ProtectedRoute;*/



export default function aProtectedRoute({ allowedRoles, children }) {
    const user = useCurrentUser();
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user) {
            setMessage("Faça login para continuar");
        } else if (allowedRoles && !allowedRoles.includes(user.authority)) {
            setMessage("Você não tens permissão para acessar esta página");
        }
    }, [user, allowedRoles]);


    if (!user || (allowedRoles && !allowedRoles.includes(user.authority))) {
        return (
            <div>
                <p>{message}</p>
                <Link to={jumps.home}>Voltar ao Início</Link> {/* Botão para voltar ao home */}
            </div>
        );
    }

    return children;
}

