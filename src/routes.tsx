
const host = '/api'

const domains = {
    users : `${host}/users`,
    groups: `${host}/groups`,
    video: `${host}/videos`,
    reviewer: `${host}/reviewer`,
    yt: `${host}/yt`,
    tags: `${host}/tags`,
}

export const getPaths = {
    search: `${domains.video}/search`,
    groups: `${domains.groups}/userGroups`,             // +group_name
    profile: `${domains.users}/profile`,
    userByName: `${domains.users}/`,                    // +user_name
    groupDetails: `${domains.groups}/:id`,              // +group_id

    checkVideo: `${domains.yt}/checkIfVideoExists`,
    getVideoDetails: `${domains.video}/:videoId`,       // +video_id

    me: `${domains.reviewer}/me`,
    test: `${domains.reviewer}/test`,
    attemptRev: `${domains.reviewer}/attemptRev`,
    videosReview: `${domains.reviewer}/reviewVideos`,
    appealsReview: `${domains.reviewer}/reviewAppeals`,

    getTags: `${domains.tags}/getTags`,
    getSections: `${domains.tags}/getSection`,

    checkSession: `${domains.users}/checkSession`,
}

export const postPaths = {
    login: `${domains.users}/login`,        // +body
    logout: `${domains.users}/logout`,      // +body
    signup: domains.users + '/createUser',  // +body

    createGroup: `${domains.groups}/createGroup`, // +body
    updateGroup: `${domains.groups}/updateGroup`, // +body
    deleteGroup: `${domains.groups}/deleteGroup`, // +body
    deleteVideoFromGroup: `${domains.groups}/deleteVideoFromGroup`, // +body

    addTag: `${domains.tags}/addTag`,           // +body
    addSection: `${domains.tags}/addSection`,   // +body

    banVideo: `${domains.video}/banVideo`,      // +body
    adminAddVideo: `${domains.video}/add`,      // +body
    updateVideoRating: `${domains.video}/updateRating`, // +body

    test: `${domains.reviewer}/test`,
    stopReview: `${domains.reviewer}/stopReview`,       // +body`
    appealToReviewer: `${domains.reviewer}/attemptRev`, // +body
    reviewerAddVideo: `${domains.reviewer}/reviewerAddVideo`,   // +body
}


/*export const motherRoutes = {
    home: '/',
    login: '/login',
    signup: '/createUser',
    profile: '/profile',
    search: '/search',

}*/

export const jumps = {
    home: '/',
    //logout: '/logout',
    login: '/login',
    signup: '/createUser',
    profile: '/profile',

    groups: `/groups`,
    /*groupCreate: '/profile/groups/create',*/
    groupDetails: '/groups/:id',
    groupUpdate: '/group/update/:id',

    search: '/search',

    admin: '/admin',

    videoDetail: '/video/:id',

    reviewer: '/reviewer',
    attemptRev: '/attemptRev',
    checkAppeals: '/checkAppeals',
    beginReviewing: '/review',

    tags: '/tags',

    success: '/success'


}