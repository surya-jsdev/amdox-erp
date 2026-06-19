import React from 'react';
import { Mail, Lock } from "lucide-react";

function App() {
  return (
    <div>
      <Home size={24} />
      <User size={24} />
      <Settings size={24} />
    </div>
  );
}

const Login = () => {
  return (
    <>
      <section className='h-dvh flex justify-center items-center'>
        <div className='w-xl rounded-2xl  flex h-[700px] shadow-xl/20'>
          <div className='w-[230px] bg-blue-950 rounded-tl-2xl rounded-bl-2xl'>
            <h2 className='text-white'>AMDOX<span className='text-blue-800'>ERP</span></h2>
          </div>
          <div className='flex p-4 flex-col  w-sm h-vh'>
            <div className='mt-25'>
              <h1 className='font-bold text-center'>Welcome Back !</h1>
              <p className='text-center text-gray-400'>Sign in to continue to Amdox ERP</p>
            </div>
            <form action="#" className='mt-5 p-2'>
              <div className='flex flex-col'>
                <label htmlFor="email" className='font-bold p-1 mt-2'>Email Address</label>
                <div className="flex items-center border rounded-sm px-3">
                  <Mail size={18} className="text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    className="p-2 outline-none w-full"
                  />
                </div>
              </div>
              <div className='flex flex-col'>
                <label htmlFor="password" className='font-bold p-1 mt-2'>Password</label>
                <div className='flex items-center border rounded-sm px-3'>
                  <Lock size={18} className="text-gray-500" />
                  <input type="password" name="password" placeholder='Enter your password' className='p-2 outline-none w-full' />
                </div>
              </div>
              <button type="submit" className='bg-blue-800 text-white w-xs mt-5 p-2 rounded-xl'>Sign In</button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default Login
