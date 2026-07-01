import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from "lucide-react";
import loginBg from '../../assets/login_bg.png';

// Interface Describe the Object
interface FormData {
  email: string;
  password: string;
  error: string;
}

// Login Function
function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    error: ''
  });
  // HandalingLogin Input
  const handlingdata = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      error: ''
    })
  }

  // Handaling LoginForm data 
  const handleLoginForm = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      setFormData({ ...formData, error: 'Email and password are required' });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setFormData({ ...formData, error: data.message });
        return;
      }

      console.log('Login successful:', data);
      alert(data.message);

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      // Clear form
      setFormData({ email: '', password: '', error: '' });

      // Redirect to dashboard
      navigate('/Dashboard');
    } catch (error) {
      console.error(error);
      setFormData({ ...formData, error: error instanceof Error ? error.message : 'Login failed', });
    }
  }

  return (
    <section className='max-h-screen bg-slate-100 px-4 py-8'>
      <div className='mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200 sm:grid-cols-[1.1fr_0.9fr] mt-20'>
        <div className='hidden lg:block bg-cover bg-center h-dvh w-120' style={{ backgroundImage: `url(${loginBg})` }} />
        <div className='flex min-h-full w-lg flex-col justify-center p-6 sm:p-10'>
          <div className='mb-8 text-center lg:text-left'>
            <h1 className='text-3xl font-bold text-slate-900 sm:text-4xl'>Welcome Back! 👋</h1>
            <p className='mt-3 text-sm text-slate-500 sm:text-base'>Sign in to continue to Amdox ERP.</p>
          </div>

          <form onSubmit={handleLoginForm} className='space-y-5'>
            <div className='space-y-3'>
              <label htmlFor='email' className='block text-sm font-semibold text-slate-700'>Email Address</label>
              <div className='flex items-center gap-3 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3'>
                <Mail size={18} className='text-slate-400' />
                <input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={handlingdata}
                  name='email'
                  placeholder='Enter your email address'
                  className='w-full bg-transparent text-sm text-slate-900 outline-none'
                  autoComplete='off'
                />
              </div>
            </div>

            <div className='space-y-3'>
              <label htmlFor='password' className='block text-sm font-semibold text-slate-700'>Password</label>
              <div className='flex items-center gap-3 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3'>
                <Lock size={18} className='text-slate-400' />
                <input
                  id='password'
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handlingdata}
                  placeholder='Enter your password'
                  className='w-full bg-transparent text-sm text-slate-900 outline-none'
                  autoComplete='off'
                />
              </div>
            </div>

            {formData.error && <p className='text-sm font-medium text-rose-600'>{formData.error}</p>}

            <button type='submit' className='w-full rounded-3xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900'>
              Login
            </button>
          </form>

          <div className='mt-6 text-center text-sm text-slate-500'>
            Don't have an account?{' '}
            <Link to='/registration' className='font-semibold text-blue-700 hover:text-blue-800'>
              Register now
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
