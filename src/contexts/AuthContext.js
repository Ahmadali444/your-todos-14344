import { message } from 'antd'
import { auth, firestore } from '../config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import React, { useState, useEffect, createContext, useContext, useReducer } from 'react'

const AuthContext = createContext()
const SelectDataContext = createContext();
const CalDataContext = createContext();
const SearchTodoContext = createContext();
const initialState = { isAuth: false, user: {} }

const reducer = (state, { type, payload }) => {
    switch (type) {
        case "SET_LOGGED_IN":
            return { isAuth: true, user: payload.user }
        case "SET_LOGGED_OUT":
            return initialState
        default:
            return state
    }
}

export default function AuthContextProvider({ children }) {

    const [isAppLoading, setIsAppLoading] = useState(true)
    const [state, dispatch] = useReducer(reducer, initialState)

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                readUserProfile(user)
            } else {
                setIsAppLoading(false)
            }
        })
    }, [])

    const readUserProfile = async (user) => {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const user = docSnap.data()
            dispatch({ type: "SET_LOGGED_IN", payload: { user } })
        } else {
            message.error("User Data Not Found. Try Again!")
        }
        setIsAppLoading(false)
    }

    const [selectedData, setSelectedData] = useState(null);
    const [calData, setCalData] = useState(null);
    const [searchTodo, setSearchTodo] = useState("");

    return (
        <AuthContext.Provider value={{ isAppLoading, ...state, dispatch, readUserProfile }}>
            <SelectDataContext.Provider value={{ selectedData, setSelectedData }}>
                <CalDataContext.Provider value={{ calData, setCalData }}>
                    <SearchTodoContext.Provider value={{ searchTodo, setSearchTodo }}>
                        {children}
                    </SearchTodoContext.Provider>
                </CalDataContext.Provider>
            </SelectDataContext.Provider>
        </AuthContext.Provider >
    )
}

export const useAuthContext = () => useContext(AuthContext)
export const useSelectDataContext = () => useContext(SelectDataContext);
export const useCalDataContext = () => useContext(CalDataContext);
export const useSearchTodoContext = () => useContext(SearchTodoContext);
