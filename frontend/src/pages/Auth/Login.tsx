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
        "http://localhost:5000/api/auth/login",
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
    <>
      <section className='h-dvh flex justify-center items-center'>
        <div className='w-auto rounded-2xl  flex h-175 shadow-xl/20'>
          <div className='w-87 rounded-tl-2xl rounded-bl-2xl' style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover' }}>
            {/* <h2 className='text-white'>AMDOX<span className='text-blue-800'>ERP</span></h2> */}
          </div>
          <div className='flex p-4 flex-col  w-sm h-vh'>
            <div className='mt-25'>
              <h1 className='font-bold text-center'>Welcome Back! 👋</h1>
              <p className='text-center text-gray-400'>Sign in to continue to Amdox ERP</p>
            </div>
            <form onSubmit={handleLoginForm} className='mt-5 p-2'>
              <div className='flex flex-col'>
                <label htmlFor="email" className='font-bold p-1 mt-2'>Email Address</label>
                <div className="flex items-center border border-gray-400 rounded-lg px-3">
                  <Mail size={16} className="text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handlingdata}
                    name="email"
                    placeholder="Enter your email address"
                    className="p-2 outline-none w-full"
                    autoComplete='off'
                  />
                </div>
              </div>
              <div className='flex flex-col'>
                <label htmlFor="password" className='font-bold p-1 mt-2'>Password</label>
                <div className='flex items-center border border-gray-400 rounded-lg px-3'>
                  <Lock size={16} className="text-gray-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handlingdata}
                    placeholder='Enter your password'
                    className='p-2 outline-none w-full'
                    autoComplete='off'
                  />
                </div>
              </div>
              {/* {formData.error && <p className='text-red-500 text-sm mt-3'>{formData.error}</p>} */}
              <button type='submit' className='bg-blue-800 text-white w-xs mt-5 p-2 rounded-xl cursor-pointer'>Login</button>
            </form>
            <div className=' mt-10'>
              <p className='text-center'>OR</p>
            </div>
            <div className='text-center mt-6'>
              Don't have an account? <Link to='/registration' className='text-blue-700'>Register now</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Login
