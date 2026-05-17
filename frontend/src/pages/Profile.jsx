import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { updateAccount, changePassword } from '../services/api'
import { useLanguage } from '../i18n/LanguageContext'

export default function Profile() {
  const { user } = useAuth()
  const { locale, t } = useLanguage()
  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    FullName: user?.FullName || '',
    Phone: user?.Phone || '',
    DateOfBirth: user?.DateOfBirth ? user.DateOfBirth.split('T')[0] : ''
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateAccount(user._id, formData)
      setMessage({ type: 'success', text: t('Profile updated successfully') })
      setEditMode(false)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('Update failed') })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('Passwords do not match') })
      return
    }

    setLoading(true)
    try {
      await changePassword({
        user: { email: user.Email },
        body: {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        }
      })
      setMessage({ type: 'success', text: t('Password changed successfully') })
      setPasswordMode(false)
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('Change password failed') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">{t('My Profile')}</h1>

        {message.text && (
          <div className={`px-4 py-3 rounded mb-4 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-400'
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('Personal Information')}</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {editMode ? t('Cancel') : t('Edit')}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('Full Name')}</label>
                <input
                  type="text"
                  name="FullName"
                  value={formData.FullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('Phone')}</label>
                <input
                  type="tel"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('Date of Birth')}</label>
                <input
                  type="date"
                  name="DateOfBirth"
                  value={formData.DateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
              >
                {loading ? t('Saving...') : t('Save Changes')}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">{t('Full Name')}</p>
                <p className="text-lg font-semibold">{user?.FullName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">{t('Email')}</p>
                <p className="text-lg font-semibold">{user?.Email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">{t('Phone')}</p>
                <p className="text-lg font-semibold">{user?.Phone}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">{t('Role')}</p>
                <p className="text-lg font-semibold capitalize">{user?.Role}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">{t('Date of Birth')}</p>
                <p className="text-lg font-semibold">
                  {user?.DateOfBirth ? new Date(user.DateOfBirth).toLocaleDateString(locale) : t('Not set')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('Change Password')}</h2>
            <button
              onClick={() => setPasswordMode(!passwordMode)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {passwordMode ? t('Cancel') : t('Change')}
            </button>
          </div>

          {passwordMode && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('Old Password')}</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('New Password')}</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">{t('Confirm Password')}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
              >
                {loading ? t('Updating...') : t('Update Password')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
