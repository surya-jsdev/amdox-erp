import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Mail, Phone, Building2, MapPin, Calendar, User, Layers, ShieldCheck } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  companyname?: string;
  phone?: string;
  department?: string;
  designation?: string;
  reportingManager?: string;
  location?: string;
  dateOfJoining?: string;
  about?: string;
  profilePicture?: string;
  role?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleSubmit = async () => {
    if (!formData || !user) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const relativePath = `/api/profile/${user.id}`;
    const primaryPath = getApiUrl(relativePath);

    const parseResponse = async (response: Response) => {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      const text = await response.text();
      const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return { message: clean || `Server returned ${response.status}` };
    };

    const doRequest = async (url: string) => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          companyname: formData.companyname,
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
          reportingManager: formData.reportingManager,
          location: formData.location,
          dateOfJoining: formData.dateOfJoining,
          about: formData.about,
          profilePicture: formData.profilePicture,
        }),
      });
      const data = await parseResponse(response);
      return { response, data };
    };

    try {
      let result = await doRequest(primaryPath);

      if (!result.response.ok || !result.data || !('user' in result.data)) {
        if (primaryPath !== relativePath) {
          const fallback = await doRequest(relativePath);
          if (fallback.response.ok && fallback.data && 'user' in fallback.data) {
            const updated = { ...fallback.data.user, id: fallback.data.user._id };
            setUser(updated);
            setFormData(updated);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully.');
            localStorage.setItem('user', JSON.stringify(updated));
            return;
          }
          result = fallback;
        }
      }

      if (!result.response.ok || !result.data || !('user' in result.data)) {
        setError(result.data?.message || `Failed to save profile (${result.response.status})`);
        return;
      }

      const updated = { ...result.data.user, id: result.data.user._id };
      setUser(updated);
      setFormData(updated);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully.');
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/Login');
      return;
    }

    const parsedUser = JSON.parse(storedUser) as UserProfile;
    const userId = parsedUser.id;

    const apiBase = import.meta.env.VITE_API_URL?.trim() || '';
    const relativePath = `/api/profile/${userId}`;
    const primaryPath = apiBase ? `${apiBase.replace(/\/$/, '')}/api/profile/${userId}` : relativePath;

    const fetchProfile = async () => {
      try {
        const response = await fetch(primaryPath);
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
          ? await response.json()
          : { message: await response.text() };

        if (!response.ok || !contentType.includes('application/json')) {
          if (primaryPath !== relativePath) {
            const fallbackResponse = await fetch(relativePath);
            const fallbackContentType = fallbackResponse.headers.get('content-type') || '';
            const fallbackData = fallbackContentType.includes('application/json')
              ? await fallbackResponse.json()
              : { message: await fallbackResponse.text() };

            if (fallbackResponse.ok && fallbackContentType.includes('application/json')) {
              const profile = { ...fallbackData.user, id: fallbackData.user._id };
              setUser(profile);
              setFormData(profile);
              return;
            }

            setError(`${fallbackData.message || 'Failed to load profile'} (${fallbackResponse.status} ${fallbackResponse.statusText})`);
            return;
          }

          setError(`${data.message || 'Failed to load profile'} (${response.status} ${response.statusText})`);
          return;
        }

        const profile = { ...data.user, id: data.user._id };
        setUser(profile);
        setFormData(profile);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-100 px-4 py-8 flex items-center justify-center'>
        <div className='rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-lg shadow-slate-200'>
          <p className='text-center text-lg font-medium text-slate-700'>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-slate-100 px-4 py-8 flex items-center justify-center'>
        <div className='rounded-3xl border border-rose-200 bg-rose-50 px-8 py-12 shadow-lg shadow-rose-100'>
          <p className='text-center text-lg font-medium text-rose-700'>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (

    <section className='min-h-screen bg-slate-100 px-4 py-8'>
      <div className='mx-auto max-w-6xl space-y-6'>
        <div className='grid gap-6 lg:grid-cols-[0.95fr_0.45fr]'>
          <div className='rounded-4xl bg-white p-6 shadow-xl shadow-slate-200 sm:p-8'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm uppercase tracking-[0.3em] text-slate-400'>My Profile</p>
                <h1 className='mt-2 text-3xl font-semibold text-slate-900'>Personal Information</h1>
                <p className='mt-2 max-w-2xl text-sm text-slate-500'>Update your personal details and contact information below.</p>
              </div>
              <div className='flex flex-wrap items-center gap-3'>
                <button
                  className='inline-flex items-center gap-2 rounded-2xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800'
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 size={18} />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                {isEditing && (
                  <button
                    className='inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200'
                    onClick={() => setIsEditing(false)}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className='rounded-4xl bg-white p-6 shadow-xl shadow-slate-200 sm:p-8'>
                <div className='space-y-6'>
                  <form className='space-y-5' onSubmit={(e) => e.preventDefault()}>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div>
                        <label className='block text-sm font-semibold text-slate-700'>Full Name</label>
                        <input
                          type='text'
                          value={formData?.name || ''}
                          onChange={(e) => setFormData(prev => prev ? { ...prev, name: e.target.value } : prev)}
                          className='mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-slate-700'>Email</label>
                        <input
                          type='email'
                          value={formData?.email || ''}
                          disabled
                          className='mt-2 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-slate-700'>Phone</label>
                        <input
                          type='text'
                          value={formData?.phone || ''}
                          onChange={(e) => setFormData(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                          className='mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-slate-700'>Department</label>
                        <input
                          type='text'
                          value={formData?.department || ''}
                          onChange={(e) => setFormData(prev => prev ? { ...prev, department: e.target.value } : prev)}
                          className='mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-slate-700'>Designation</label>
                        <input
                          type='text'
                          value={formData?.designation || ''}
                          onChange={(e) => setFormData(prev => prev ? { ...prev, designation: e.target.value } : prev)}
                          className='mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-slate-700'>Reporting Manager</label>
                        <input
                          type='text'
                          value={formData?.reportingManager || ''}
                          onChange={(e) => setFormData(prev => prev ? { ...prev, reportingManager: e.target.value } : prev)}
                          className='mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-slate-700'>Location</label>
                        <input
                          type='text'
                          value={formData?.location || ''}
                          onChange={(e) => setFormData(prev => prev ? { ...prev, location: e.target.value } : prev)}
                          className='mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-slate-700'>Date of Joining</label>
                        <input
                          type='date'
                          value={formData?.dateOfJoining ? new Date(formData.dateOfJoining).toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData(prev => prev ? { ...prev, dateOfJoining: e.target.value } : prev)}
                          className='mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-semibold text-slate-700'>About Me</label>
                      <textarea
                        value={formData?.about || ''}
                        onChange={(e) => setFormData(prev => prev ? { ...prev, about: e.target.value } : prev)}
                        rows={4}
                        className='mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none'
                      />
                    </div>

                    <div className='flex flex-wrap items-center gap-3'>
                      <button
                        type='button'
                        className='rounded-3xl bg-blue-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900'
                        onClick={handleSubmit}
                      >
                        Save Changes
                      </button>
                      <button
                        type='button'
                        className='rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
                        onClick={() => {
                          setFormData(user);
                          setIsEditing(false);
                          setError('');
                          setSuccessMessage('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>

                    {successMessage && <p className='text-sm text-emerald-600'>{successMessage}</p>}
                    {error && <p className='text-sm text-rose-600'>{error}</p>}
                  </form>
                </div>
              </div>
            ) : (
              <div className='rounded-4xl bg-white p-6 shadow-xl shadow-slate-200 flex flex-col gap-4 sm:p-8'>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Full Name</p>
                  <p className='mt-3 text-base font-medium text-slate-900'>{user.name}</p>
                </div>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Employee ID</p>
                  <p className='mt-3 text-base font-medium text-slate-900'>{user.id}</p>
                </div>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Email Address</p>
                  <p className='mt-3 text-base font-medium text-slate-900'>{user.email}</p>
                </div>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Phone Number</p>
                  <p className='mt-3 text-base font-medium text-slate-900'>{user.phone || 'Not provided'}</p>
                </div>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Department</p>
                  <p className='mt-3 text-base font-medium text-slate-900'>{user.department || 'Not assigned'}</p>
                </div>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Designation</p>
                  <p className='mt-3 text-base font-medium text-slate-900'>{user.designation || 'Not assigned'}</p>
                </div>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Reporting Manager</p>
                  <p className='mt-3 text-base font-medium text-slate-900'>{user.reportingManager || 'Not assigned'}</p>
                </div>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Location</p>
                  <p className='mt-3 text-base font-medium text-slate-900'>{user.location || 'Not provided'}</p>
                </div>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>Date of Joining</p>
                  <p className='mt-3 text-base font-medium text-slate-900'>{user.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div className='sm:col-span-2 rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>About Me</p>
                  <p className='mt-3 text-sm leading-7 text-slate-600'>{user.about || 'No personal summary has been added yet.'}</p>
                </div>
              </div>
            )}
          </div>

          <div className='space-y-6'>
            <div className='rounded-4xl bg-white p-6 shadow-xl shadow-slate-200 sm:p-8'>
              <div className='flex items-center gap-4'>
                <div className='flex h-24 w-24 items-center justify-center overflow-hidden rounded-3l bg-slate-100'>
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt='Profile' className='h-full w-full object-cover' />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center rounded-3xl bg-indigo-600 text-white'>
                      <User size={32} />
                    </div>
                  )}
                </div>
                <div>
                  <p className='text-sm uppercase tracking-[0.2em] text-slate-400'>Profile</p>
                  <h2 className='text-2xl font-semibold text-slate-900'>{user.name}</h2>
                  <p className='mt-1 text-sm text-slate-500'>{user.role || 'Employee'}</p>
                </div>
              </div>

              <div className='mt-8 space-y-4'>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <div className='flex items-center gap-3 text-slate-500'>
                    <ShieldCheck size={18} />
                    <span className='text-sm font-semibold text-slate-700'>Account</span>
                  </div>
                  <dl className='mt-4 space-y-3 text-sm text-slate-600'>
                    <div className='flex items-center justify-between'>
                      <span>Email</span>
                      <span>{user.email}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Employee ID</span>
                      <span>{user.id}</span>
                    </div>
                  </dl>
                </div>

                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <div className='flex items-center gap-3 text-slate-500'>
                    <Layers size={18} />
                    <span className='text-sm font-semibold text-slate-700'>Work Details</span>
                  </div>
                  <dl className='mt-4 space-y-3 text-sm text-slate-600'>
                    <div className='flex items-center justify-between'>
                      <span>Company</span>
                      <span>{user.companyname || 'Not set'}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Department</span>
                      <span>{user.department || 'Not set'}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Designation</span>
                      <span>{user.designation || 'Not set'}</span>
                    </div>
                  </dl>
                </div>

                <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
                  <div className='flex items-center gap-3 text-slate-500'>
                    <Mail size={18} />
                    <span className='text-sm font-semibold text-slate-700'>Contact</span>
                  </div>
                  <dl className='mt-4 space-y-3 text-sm text-slate-600'>
                    <div className='flex items-center gap-2'>
                      <Phone size={16} className='text-slate-400' />
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <MapPin size={16} className='text-slate-400' />
                      <span>{user.location || 'Not provided'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Calendar size={16} className='text-slate-400' />
                      <span>{user.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : 'Not provided'}</span>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
