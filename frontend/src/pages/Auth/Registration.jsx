import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, Contact, Building2, Contact2, LockKeyhole } from "lucide-react"
import registerBg from '../../assets/register.png';

function Registration() {

    const [RegisterData, setRegisterData] = useState({
        name: '',
        email: '',
        companyname: '',
        password: '',
        confirmpassword: '',
        error: ''
    });
    const handlingregisterdata = (e) => {
        setRegisterData({
            ...RegisterData,
            [e.target.name]: e.target.value,
            error: ''
        })
    }
    return (
        <>
            <section className='h-dvh flex justify-center items-center'>
                <div className='w-180 rounded-2xl  flex h-175 shadow-xl/20'>
                    <div className='w-87 rounded-tl-2xl rounded-bl-2xl' style={{ backgroundImage: `url(${registerBg})`, backgroundSize: 'cover' }}>
                    </div>
                    <div className='flex p-4 flex-col  w-sm h-vh'>
                        <div className='mt-10 '>
                            <div className='flex flex-wrap justify-center'>
                                <h1 className='font-bold text-center'>Create Account</h1>
                                <Contact size={22} className='ml-2' />
                                <p className='text-center text-gray-400'>Fill the details below to get started</p>
                            </div>
                            <form className='mt-2 p-2'>
                                <div className='flex flex-col'>
                                    <label htmlFor="text" className='font-bold p-1 mt-2 text-sm'>Full Name</label>
                                    <div className="flex items-center border border-gray-400 rounded-lg px-3">
                                        <Contact2 size={16} className="text-gray-500" />
                                        <input
                                            type="name"
                                            name="name"
                                            value={RegisterData.name}
                                            onChange={handlingregisterdata}
                                            placeholder="Enter your full name"
                                            className="p-2 outline-none w-full"
                                            autoComplete='off'
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <label htmlFor="password" className='font-bold p-1 mt-2 text-sm'>Email Address</label>
                                    <div className='flex items-center border border-gray-400 rounded-lg px-3'>
                                        <Mail size={16} className="text-gray-500" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={RegisterData.email}
                                            onChange={handlingregisterdata}
                                            placeholder='Enter your email address'
                                            className='p-2 outline-none w-full'
                                            autoComplete='off'
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <label htmlFor="text" className='font-bold p-1 mt-2 text-sm'>Company / Organization</label>
                                    <div className='flex items-center border border-gray-400 rounded-lg px-3'>
                                        <Building2 size={16} className="text-gray-500" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={RegisterData.companyname}
                                            onChange={handlingregisterdata}
                                            placeholder='Enter your company name'
                                            className='p-2 outline-none w-full'
                                            autoComplete='off'
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <label htmlFor="text" className='font-bold p-1 mt-2 text-sm'>Password</label>
                                    <div className='flex items-center border border-gray-400 rounded-lg px-3'>
                                        <LockKeyhole size={16} className="text-gray-500" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={RegisterData.password}
                                            onChange={handlingregisterdata}
                                            placeholder='Create a password'
                                            className='p-2 outline-none w-full'
                                            autoComplete='off'
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <label htmlFor="text" className='font-bold p-1 mt-2 text-sm'>Confirm Password</label>
                                    <div className='flex items-center border border-gray-400 rounded-lg px-3'>
                                        <LockKeyhole size={16} className="text-gray-500" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={RegisterData.confirmpassword}
                                            onChange={handlingregisterdata}
                                            placeholder='Confirm your password'
                                            className='p-2 outline-none w-full'
                                            autoComplete='off'
                                        />
                                    </div>
                                </div>
                                {/* {formData.error && <p className='text-red-500 text-sm mt-3'>{formData.error}</p>} */}
                                <button type='submit' className='bg-blue-800 text-white text-sm w-xs mt-5 p-2 rounded-xl cursor-pointer'>Create Account</button>
                            </form>
                        </div>
                        <div className='text-center mt-6'>
                            Already have an account ?<Link to='/Login' className='text-blue-700'> Login now</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Registration