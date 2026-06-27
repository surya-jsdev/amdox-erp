import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Contact, Building2, Contact2, LockKeyhole } from "lucide-react"
import registerBg from '../../assets/register.png';
import { apiUrl } from '../../lib/api';

interface RegisterData {
    name: string;
    email: string;
    companyname: string;
    password: string;
    role: string;
    error: string;
}

function Registration() {
    const navigate = useNavigate();

    const [RegisterData, setRegisterData] = useState<RegisterData>({
        name: '',
        email: '',
        companyname: '',
        password: '',
        role: 'Employee',
        error: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const handlingregisterdata = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRegisterData({
            ...RegisterData,
            [e.target.name]: e.target.value,
            error: ''
        })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        const { name, email, companyname, password, role } = RegisterData;

        try {
            const response = await fetch(apiUrl('/api/auth/register'), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, companyname, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            console.log(data);
            setSuccessMessage(data.message);
            setRegisterData({ name: '', email: '', companyname: '', password: '', role: 'Employee', error: '' });

            // setTimeout after Registration go to Login Page
            const timer = setTimeout(() => {
                navigate('/Login')
            }, 1000)

            clearInterval(timer)

        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Registration error');
        }
    };
    return (
        <>
            <section className='h-dvh flex justify-center items-center p-2'>
                <div className='w-180 rounded-2xl  flex h-175 shadow-xl/20  '>
                    <div className='w-87 rounded-tl-2xl rounded-bl-2xl' style={{ backgroundImage: `url(${registerBg})`, backgroundSize: 'cover' }}>
                    </div>
                    <div className='flex p-4 flex-col w-sm h-vh'>
                        <div className='flex flex-wrap justify-center mt-15'>
                            <div className='flex flex-wrap justify-center'>
                                <h1 className='font-bold text-center'>Create Account</h1>
                                <Contact size={22} className='ml-2' />
                                <p className='text-center text-gray-400'>Fill the details below to get started</p>
                            </div>
                            <form onSubmit={handleSubmit} className='mt-2 p-2'>
                                <div className='flex flex-col'>
                                    <label htmlFor="name" className='font-bold p-1 mt-2 text-sm'>Full Name</label>
                                    <div className="flex items-center border border-gray-400 rounded-lg px-3">
                                        <Contact2 size={16} className="text-gray-500" />
                                        <input
                                            type="text"
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
                                            type="text"
                                            name="companyname"
                                            value={RegisterData.companyname}
                                            onChange={handlingregisterdata}
                                            placeholder='Enter your company name'
                                            className='p-2 outline-none w-full'
                                            autoComplete='off'
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <label htmlFor="role" className='font-bold p-1 mt-2 text-sm'>Role</label>
                                    <div className='flex items-center border border-gray-400 rounded-lg px-3'>
                                        <User size={16} className="text-gray-500" />
                                        <select
                                            name="role"
                                            value={RegisterData.role}
                                            onChange={handlingregisterdata}
                                            className='p-2 outline-none w-full bg-white'
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Employee">Employee</option>
                                        </select>
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
                                {/* <div className='flex flex-col'>
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
                                </div> */}
                                {/* {formData.error && <p className='text-red-500 text-sm mt-3'>{formData.error}</p>} */}

                                <button type='submit' className='bg-blue-800 text-white text-sm w-xs mt-5 p-2 rounded-xl cursor-pointer'>Create Account</button>
                                {successMessage && <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4 text-center'>{successMessage}</div>}
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