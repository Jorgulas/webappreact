import {createBrowserRouter, Outlet, RouteObject, RouterProvider} from "react-router-dom";
import React from "react";
import {createRoot} from "react-dom/client";
import {jumps} from "./routes";
import {Home} from "./home";
import {Profile} from "./session/profile";
import {Login} from "./session/login";
import {SignUp} from "./session/signup";
import {themedPageMaker} from "./utils"
import {AuthnContainer} from "./session/auth";
//import {GroupsCreate} from "./groups/create-group";
import {GroupDetails} from "./groups/group-details";
import {Search} from "./search/search";
import {NavigationBar} from "./navigation";
import {GroupsUpdate} from "./groups/groups-update";
import {RequestReviewer} from "./content/reviewer";
import {Admin} from "./content/admin";
import {Groups} from "./groups/groups";
import {VideoDetail} from "./search/videoDetail";
import {FallbackPage} from "./callback-pages/fallback";
import {SuccessPage} from "./callback-pages/success";
import {AddTagsAndSections} from "./content/tagsAndSections";
import {ReviewAppeals} from "./content/review-appeal";
import {ReviewVideos} from "./content/review-videos";
import ProtectedRoute from "./callback-pages/ProtectedRoute";


function route( path: string, element: React.JSX.Element, children: RouteObject[] = []) : RouteObject {
    return {
        path: path,
        element: element,
        children: children
    }
}

const router = createBrowserRouter([
        route(jumps.home, <AuthnContainer><NavigationBar/><Outlet/></AuthnContainer>, [
            route('*', <FallbackPage/>),
            route(jumps.home, <Home/> ),
            //[route(jumps.profile, <Profile/>)]
            //route(jumps.logout, <Logout/>),
            route(jumps.login, <Login/>),
            route(jumps.signup, <SignUp/>),
            route(jumps.search, <Search/>),
            route(jumps.success, <SuccessPage/>),
            route(jumps.videoDetail, <VideoDetail/>),
            route(jumps.profile, <AuthnContainer children={<Profile/>}/>, ),
            route(jumps.tags, <ProtectedRoute allowedRoles={['A']}><AddTagsAndSections/></ProtectedRoute>),
            route(jumps.admin, <ProtectedRoute allowedRoles={['A']}><Admin/></ProtectedRoute>),
            route(jumps.groups, <ProtectedRoute allowedRoles={['C', 'A', 'R']}><Groups/></ProtectedRoute>),
            route(jumps.reviewer, <ProtectedRoute allowedRoles={['A', 'R']}><ReviewVideos/></ProtectedRoute>),
            route(jumps.attemptRev, <ProtectedRoute allowedRoles={['C']}><RequestReviewer/></ProtectedRoute>),
            route(jumps.groupUpdate, <ProtectedRoute allowedRoles={['C', 'A', 'R']}><GroupsUpdate/></ProtectedRoute>),
            route(jumps.groupDetails, <ProtectedRoute allowedRoles={['C', 'A', 'R']}><GroupDetails/></ProtectedRoute>),
            route(jumps.checkAppeals, <ProtectedRoute allowedRoles={['A', 'R']}><ReviewAppeals/></ProtectedRoute>),
            route(jumps.beginReviewing, <ProtectedRoute allowedRoles={['A', 'R']}><ReviewVideos/></ProtectedRoute>),
        ]),
    ]
)

function Page() {
    /*
    document.querySelectorAll('button').forEach(button => {
        button.setAttribute('data-text', button.textContent);
    });
    */

    themedPageMaker();

    return (
        <RouterProvider router={router}/>
    );
}

export function FitnessApp() {

    /*
    document.addEventListener('DOMContentLoaded', () => {
        const iframe = document.querySelector('iframe:first-of-type');
        if (iframe) {
            const iframeSrc = iframe.getAttribute('src');
            const youtubeVideoIdMatch = iframeSrc?.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/);
            const youtubeVideoId = youtubeVideoIdMatch ? youtubeVideoIdMatch.pop() : null;

            if (youtubeVideoId && youtubeVideoId.length === 11) {
                const videoThumbnail = document.createElement('img');
                videoThumbnail.src = `//img.youtube.com/vi/${youtubeVideoId}/0.jpg`;
                document.body.appendChild(videoThumbnail);

                const firstImg = document.querySelector('img:first-of-type');
                firstImg?.addEventListener('click', () => {
                    iframe.classList.toggle('hidden');
                });
            }
        }
    });
    */

    const root = createRoot(document.getElementById("container"))

    root.render(<Page/>);
}