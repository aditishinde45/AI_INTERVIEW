import React, { useEffect } from 'react'
import { Routes,Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice.js';
export const ServeUrl="http://localhost:8000";
function App() {
      const dispatch=useDispatch();
  useEffect(()=>{
    const getUser=async()=>{
      try{
        const result=await axios.get(ServeUrl+"/api/user/current-user",
          {withCredentials:true});
          dispatch(setUserData(result.data));
      }catch(err){
        dispatch(setUserData(null));
        console.log(err);
      }
    }
    getUser();
    },[dispatch]);
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/auth' element={<Auth/>}/>
    </Routes>
  )
}

export default App
