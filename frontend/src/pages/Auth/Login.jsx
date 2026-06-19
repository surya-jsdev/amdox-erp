import React from 'react'

const Login = () => {
  return (
    <>
      <section className='h-dvh flex justify-center items-center'>
        <div className='w-xl rounded-2xl  flex h-[700px] shadow-2xl'>
          <div className='w-[230px] bg-blue-950 rounded-tl-2xl rounded-bl-2xl'>
            <h2 className='text-white'>AMDOX<span className='text-blue-800'>ERP</span></h2>
          </div>
          <div className='flex p-4 flex-col  w-sm h-vh'>
            <div className='mt-25'>
              <h1 className='font-bold text-center'>Welcome Back !</h1>
              <p className='text-center'>Sign in to continue to Amdox ERP</p>
            </div>
            <form action="#" className='mt-5'>
              <div className='flex flex-col'>
                <label htmlFor="email" className='font-bold p-1 mt-2'>Email Address</label>
                <input type="email" name="email" id="" placeholder='Enter your email address' className='border-1 p-2 rounded-sm' />
              </div>
              <div className='flex flex-col'>
                <label htmlFor="password" className='font-bold p-1 mt-2'>Password</label>
                <input type="password" name="password" id="" placeholder='Enter your password' className='border-1 p-2 rounded-sm' />
              </div>
              <button type="submit" className='bg-blue-800 text-white w-xs mt-5 p-2 rounded-xl font-bold'>Sign In</button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default Login
