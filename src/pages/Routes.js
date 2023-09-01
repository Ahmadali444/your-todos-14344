import { Navigate, Route, Routes } from 'react-router-dom';
import React from 'react'
import { useLocation } from 'react-router-dom';


import DashboardHeader from '../components/Header/dashboradHeader';
import { useAuthContext } from '../contexts/AuthContext'
import Auth from "./auth";
import Todos from './Todos';
import AddTodo from './Todos/AddTodo';
import EddTodo from './Todos/EddTodo';
import PrivateRoute from '../components/PrivateRoute';
import Settings from './Settings';

export default function Index() {
    const { isAuth } = useAuthContext();
    const location = useLocation();
    const shouldShowHeader = location.pathname === '/';
    return (
        <>
            <div className='d-flex'>
                {shouldShowHeader && <DashboardHeader />}
                <Routes>
                    <Route path='/' element={<PrivateRoute Component={Todos} />} />
                    <Route path='/todos/addtodo' element={<PrivateRoute Component={AddTodo} />} />
                    <Route path='/todos/eddtodo/:id' element={<PrivateRoute Component={EddTodo} />} />
                    <Route path='/settings/:id' element={<PrivateRoute Component={Settings} />} />
                    <Route path='/auth/*' element={!isAuth ? <Auth /> : <Navigate to="/" />} />
                </Routes>
            </div>
        </>
    )
}
