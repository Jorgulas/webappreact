import * as React from 'react'
import {createContext, useContext, useState} from 'react'

/**
 * Interface that represents the cookie information.
 * @param username represent the username.
 * @param token represent the token of the user.
 */
interface Cookie {
    username: string;
    token: string;
}

//Type "ContextType" representing the "user" saved in a cookie and the "setUser" representing the new user.
type ContextType = {
    user: Cookie | undefined,
    setUser: (v: { username: string }) => void
}

//Const "AuthnContext" representing the context when the user is not found in the localStorage.
const AuthnContext = createContext<ContextType>({ user: undefined, setUser: () => {} });

/**
 * Function "AuthnContainer" responsible to authenticate a new user to be valid to go more in the application using the cookies.
 * @param children
 * @constructor
 */
export function AuthnContainer({ children }: { children: React.ReactNode }) {
    const storedUser = localStorage.getItem('user');
    const [user, setUser] = useState<Cookie | undefined>(storedUser ? JSON.parse(storedUser) : undefined);
    const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null);

    const updateUser = (newUser: Cookie | undefined) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
            const expirationTimeInMilliseconds = 60 * 59 * 1000; // 1 hour
            const timer = setTimeout(() => {
                // Log the user out when the timer expires
                setUser(undefined);
                localStorage.removeItem('user');
            }, expirationTimeInMilliseconds);
            setLogoutTimer(timer);

        } else {
            localStorage.removeItem('user');
            // Clear the timer when the user logs out
            if (logoutTimer) {
                clearTimeout(logoutTimer);
                setLogoutTimer(null);
            }
        }

    };

    return (
            <AuthnContext.Provider value={{ user: user, setUser: updateUser }}>
                {children}
            </AuthnContext.Provider>

    );
}

/**
 * Function responsible to get the currentUser of the application on that browser.
 */
export function useCurrentUser() {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : useContext(AuthnContext).user;
}


/**
 * Function responsible to set the user to the new "setUser" information.
 */
export function useSetUser() {
    const { setUser } = useContext(AuthnContext);
    return setUser;
}