
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
  
  const [successMessage, setSuccessMessage] = useState('')
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

    const getApiUrl = (path: string) => {
      const envUrl = import.meta.env.VITE_API_URL?.trim() || '';
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

      if (!envUrl) {
        return path;
      }

      try {
        const envOrigin = new URL(envUrl).origin;
        if (envOrigin === currentOrigin) {
          return path;
        }
        return `${envUrl.replace(/\/$/, '')}${path}`;
      } catch {
        return path;
      }
    };

    try {
      const response = await fetch(
        getApiUrl('/api/auth/login'),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        }
      );

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { message: await response.text() };

      if (!response.ok) {
        setFormData({ ...formData, error: data.message || 'Login failed' });
        return;
      }

      if (!contentType.includes('application/json')) {
        setFormData({ ...formData, error: 'Unexpected response format from server.' });
        return;
      }

      console.log('Login successful:');
      setSuccessMessage(data.message || 'Login successful!');

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true');

      // Clear form
      setFormData({ email: '', password: '', error: '' });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/Dashboard');
      }, 1000);

    } catch (error) {
      console.error(error);
      setFormData({ ...formData, error: error instanceof Error ? error.message : 'Login failed', });
    }
  }

  return (
    <section className='min-h-screen bg-slate-100 px-4 py-6 sm:py-8'>
      <div className='mx-auto w-full max-w-5xl h-150 overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] px-4 sm:px-0 mt-15 '>
        <div className='hidden md:block bg-cover bg-center min-h-105' style={{ backgroundImage: `url(${loginBg})` }} />
        <div className='flex min-h-full flex-col justify-center p-6 sm:p-8 lg:p-10'>
          <div className='mb-8 text-center lg:text-left'>
            <h1 className='text-3xl font-bold text-slate-900 sm:text-4xl'>Welcome Back! 👋</h1>
            <p className='mt-3 text-sm text-slate-500 sm:text-base'>Sign in to continue to Amdox ERP.</p>
          </div>

          <form onSubmit={handleLoginForm} className='space-y-5 '>
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
            {successMessage && <p className='text-lg text-center bg-green-300 rounded-2xl border-white font-medium text-white p-2'>{successMessage}</p>}
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
