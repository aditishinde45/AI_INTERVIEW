import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion';
import { BsRobot, BsCoin, BsClockHistory } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServeUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel.jsx';
import UpiPaymentModal from './UpiPaymentModal.jsx';

function Navbar() {
    const {userData}=useSelector((state)=>state.user);
    const [showCreditPopup,setShowCreditPopup]=useState(false);
    const [showUserPopup,setShowUserPopup]=useState(false);
    const [showAuth,setShowAuth]=useState(false);
    const [showPaymentModal, setShowPaymentModal]=useState(false);
    const navigate=useNavigate();
    const dispatch=useDispatch();
    const handleLogout=async()=>{
        try{
            await axios.get(ServeUrl+"/api/auth/logout",{withCredentials:true});
            dispatch(setUserData(null));
            setShowCreditPopup(false);
            setShowUserPopup(false);
            navigate('/')
        }catch(err){
            console.log(err);
        }
    }
  return (
    <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6'>
      <motion.div 
      initial={{opacity:0,y:-40}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.3}}
      className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative'>
        <div onClick={()=>navigate('/')} className='flex items-center gap-3 cursor-pointer'>
            <div className='bg-black text-white p-2 rounded-lg'>
                <BsRobot size={18}/>
            </div>
            <h1 className='font-semibold hidden md:block text-lg'>interviewIQ.AI</h1>
        </div>
        <div className='flex items-center gap-6 relative'>
            <div className='relative'>
                <button onClick={()=>{
                    if(!userData){
                        setShowAuth(true);
                        return;
                    }
                    setShowCreditPopup(!showCreditPopup);
                    setShowUserPopup(false)}} className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition'>
                    <BsCoin size={20} className="text-amber-500"/>
                    <span className="font-bold text-sm">{userData?.credits || 0}</span>
                </button>

                {showCreditPopup && (
                    <div className='absolute right-[-50px] mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-2xl p-5 z-50'>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Credit Balance</span>
                            <span className="text-xs font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{userData?.credits || 0} pts</span>
                        </div>
                        <p className='text-xs text-gray-600 mb-4'>Each AI interview costs 50 credits. Refill your balance instantly via UPI.</p>
                        <button 
                            onClick={()=>{
                                setShowCreditPopup(false);
                                setShowPaymentModal(true);
                            }} 
                            className='w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm'
                        >
                            <BsCoin size={14} className="text-amber-400"/>
                            Buy Credits with UPI
                        </button>
                    </div>
                )}
            </div>
            <div className='relative'>
                <button onClick={()=>{
                    if(!userData){
                        setShowAuth(true);
                        return;
                    }
                    setShowUserPopup(!showUserPopup);
                    setShowCreditPopup(false)}} className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold'>
                    {userData? userData?.name.slice(0,1).toUpperCase():<FaUserAstronaut size={16}/>}
                </button>
                {showUserPopup && (
                    <div className='absolute right-0 mt-3 w-52 bg-white shadow-xl border border-gray-200 rounded-2xl p-4 z-50'>
                        <p className='text-sm text-gray-900 font-bold mb-2 pb-2 border-b border-gray-100 truncate'>{userData?.name}</p>
                        <button onClick={()=>{
                            setShowUserPopup(false);
                            navigate('/history');
                        }} className='w-full text-left text-xs font-semibold py-2 hover:text-black text-gray-700 flex items-center gap-2 rounded-lg hover:bg-gray-50 px-2 transition'>
                            <BsClockHistory size={14} className="text-green-600"/>
                            Interview History
                        </button>
                        <button onClick={()=>{
                            setShowUserPopup(false);
                            setShowPaymentModal(true);
                        }} className='w-full text-left text-xs font-semibold py-2 hover:text-black text-gray-700 flex items-center gap-2 rounded-lg hover:bg-gray-50 px-2 transition'>
                            <BsCoin size={14} className="text-amber-500"/>
                            Recharge Credits
                        </button>
                        <div className="my-1 border-t border-gray-100" />
                        <button onClick={handleLogout} className='w-full text-left text-xs font-semibold py-2 flex items-center gap-2 text-red-500 rounded-lg hover:bg-red-50 px-2 transition'>
                            <HiOutlineLogout size={15}/>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
      </motion.div>
      {showAuth && <AuthModel onClose={()=>setShowAuth(false)}/>}
      <UpiPaymentModal isOpen={showPaymentModal} onClose={()=>setShowPaymentModal(false)}/>
    </div>
  )
}

export default Navbar
