import React from "react";
import {Link} from "react-router-dom";
import {RainbowButton} from "./utils";
import {jumps} from "./routes";
import {TagSelector} from "./search/tag-selector";

export function Home(){

    return (
        <>
            <div>
                <h1>Bem-vindo !</h1>
                <h2>Encontre o seu treino ideal selecionando o que mais lhe convém!</h2>
                <TagSelector size={1.1}/>
                <Link id={"centerDivision"} to={jumps.search}>
                    <RainbowButton type="submit" style={{fontSize: "3em",}}>Procurar</RainbowButton>
                </Link>
            </div>
            {/*< Outlet/>*/}
        </>
    )
}

