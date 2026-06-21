import Navbar from './Navbar';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user._id) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">First Name</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{user.firstName}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Last Name</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{user.lastName}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Role</div>
            <div className="text-2xl font-bold text-blue-600 mt-2 capitalize">{user.role}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Status</div>
            <div className={`text-2xl font-bold mt-2 capitalize ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {user.status}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <p className="text-gray-900">{user.department || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a href="/profile" className="block px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition">
                Edit Profile
              </a>
              <a href="/change-password" className="block px-4 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition">
                Change Password
              </a>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <p className="text-gray-600 text-sm mb-4">Your account is active and verified.</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Account Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${user.isEmailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-700">
                  Email {user.isEmailVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
