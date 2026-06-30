import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Contact, Building2, Contact2, LockKeyhole } from "lucide-react"
import registerBg from '../../assets/register.png';

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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name, email, companyname, password, role }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            console.log(data);
            setSuccessMessage(data.message);
            setRegisterData({ name: '', email: '', companyname: '', password: '', role: 'Employee', error: '' });

            // redirect after successful registration
            setTimeout(() => {
                navigate('/Login');
            }, 1000);

        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Registration error');
        }
    };
    return (
        <section className='min-h-screen bg-slate-100 px-4 py-8'>
            <div className='mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200 sm:grid-cols-[1.1fr_0.9fr]'>
                <div className='hidden lg:block bg-cover bg-center' style={{ backgroundImage: `url(${registerBg})` }} />
                <div className='flex flex-col justify-center p-8 sm:p-10'>
                    <div className='mb-8 text-center lg:text-left'>
                        <div className='inline-flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 sm:justify-start'>
                            <span>Create Account</span>
                            <Contact size={24} className='text-blue-700' />
                        </div>
                        <p className='mt-3 text-sm text-slate-500 sm:text-base'>Fill the details below to get started.</p>
                    </div>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='space-y-2'>
                            <label htmlFor='name' className='block text-sm font-semibold text-slate-700'>Full Name</label>
                            <div className='flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-3'>
                                <Contact2 size={18} className='text-slate-400' />
                                <input
                                    id='name'
                                    type='text'
                                    name='name'
                                    value={RegisterData.name}
                                    onChange={handlingregisterdata}
                                    placeholder='Enter your full name'
                                    className='w-full bg-transparent p-3 text-sm outline-none'
                                    autoComplete='off'
                                />
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <label htmlFor='email' className='block text-sm font-semibold text-slate-700'>Email Address</label>
                            <div className='flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-3'>
                                <Mail size={18} className='text-slate-400' />
                                <input
                                    id='email'
                                    type='email'
                                    name='email'
                                    value={RegisterData.email}
                                    onChange={handlingregisterdata}
                                    placeholder='Enter your email address'
                                    className='w-full bg-transparent p-3 text-sm outline-none'
                                    autoComplete='off'
                                />
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <label htmlFor='companyname' className='block text-sm font-semibold text-slate-700'>Company / Organization</label>
                            <div className='flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-3'>
                                <Building2 size={18} className='text-slate-400' />
                                <input
                                    id='companyname'
                                    type='text'
                                    name='companyname'
                                    value={RegisterData.companyname}
                                    onChange={handlingregisterdata}
                                    placeholder='Enter your company name'
                                    className='w-full bg-transparent p-3 text-sm outline-none'
                                    autoComplete='off'
                                />
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <label htmlFor='role' className='block text-sm font-semibold text-slate-700'>Role</label>
                            <div className='flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-3'>
                                <User size={18} className='text-slate-400' />
                                <select
                                    id='role'
                                    name='role'
                                    value={RegisterData.role}
                                    onChange={handlingregisterdata}
                                    className='w-full bg-transparent p-3 text-sm outline-none'
                                >
                                    <option value='Admin'>Admin</option>
                                    <option value='Manager'>Manager</option>
                                    <option value='Employee'>Employee</option>
                                </select>
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <label htmlFor='password' className='block text-sm font-semibold text-slate-700'>Password</label>
                            <div className='flex items-center rounded-2xl border border-slate-300 bg-slate-50 px-3'>
                                <LockKeyhole size={18} className='text-slate-400' />
                                <input
                                    id='password'
                                    type='password'
                                    name='password'
                                    value={RegisterData.password}
                                    onChange={handlingregisterdata}
                                    placeholder='Create a password'
                                    className='w-full bg-transparent p-3 text-sm outline-none'
                                    autoComplete='off'
                                />
                            </div>
                        </div>
                        <button type='submit' className='w-full rounded-2xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900'>Create Account</button>
                        {successMessage && <div className='rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700'>{successMessage}</div>}
                    </form>
                    <div className='mt-6 text-center text-sm text-slate-500'>
                        Already have an account? <Link to='/Login' className='font-semibold text-blue-700 hover:text-blue-800'>Login now</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Registration