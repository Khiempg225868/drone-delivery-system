import { useEffect, useState } from 'react'
import { getAllAccounts, removeAccount, updateAccount } from '../services/api'

const RoleBadge = ({ role }) => {
  const colors = {
    admin: 'bg-red-100 text-red-800',
    operator: 'bg-blue-100 text-blue-800',
    customer: 'bg-green-100 text-green-800',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[role]}`}>
      {role.toUpperCase()}
    </span>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await getAllAccounts()
      setUsers(response.data.accounts || response.data)
    } catch (error) {
      setError('Failed to fetch users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await removeAccount(userId)
        setSuccess('User deleted successfully')
        fetchUsers()
        setTimeout(() => setSuccess(''), 3000)
      } catch (error) {
        setError('Failed to delete user')
        console.error(error)
      }
    }
  }

  const handleEditSave = async (userId) => {
    try {
      await updateAccount(userId, editData)
      setSuccess('User updated successfully')
      setEditingId(null)
      setEditData({})
      fetchUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to update user')
      console.error(error)
    }
  }

  const startEdit = (user) => {
    setEditingId(user._id)
    setEditData(user)
  }

  // Filter and sort users
  let filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Phone.includes(searchTerm)

    const matchesRole = filterRole === 'all' || user.Role === filterRole

    return matchesSearch && matchesRole
  })

  if (sortBy === 'name') {
    filteredUsers.sort((a, b) => a.FullName.localeCompare(b.FullName))
  } else if (sortBy === 'email') {
    filteredUsers.sort((a, b) => a.Email.localeCompare(b.Email))
  } else if (sortBy === 'role') {
    filteredUsers.sort((a, b) => a.Role.localeCompare(b.Role))
  } else if (sortBy === 'createdAt') {
    filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">👥 User Management</h1>
        <p className="text-gray-600">Manage all system users</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow">
          <p className="text-blue-600 text-sm font-medium">Total Users</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{users.length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 shadow">
          <p className="text-red-600 text-sm font-medium">Admins</p>
          <p className="text-3xl font-bold text-red-900 mt-2">
            {users.filter((u) => u.Role === 'admin').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow">
          <p className="text-blue-600 text-sm font-medium">Operators</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            {users.filter((u) => u.Role === 'operator').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow">
          <p className="text-green-600 text-sm font-medium">Customers</p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {users.filter((u) => u.Role === 'customer').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Name, Email, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="createdAt">Newest</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">&nbsp;</label>
            <button
              onClick={fetchUsers}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Phone</th>
                <th className="px-6 py-4 text-left font-semibold">Role</th>
                <th className="px-6 py-4 text-left font-semibold">Joined</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      {editingId === user._id ? (
                        <input
                          type="text"
                          value={editData.FullName || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, FullName: e.target.value })
                          }
                          className="px-2 py-1 border rounded"
                        />
                      ) : (
                        <span className="font-semibold text-gray-900">
                          {user.FullName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.Email}</td>
                    <td className="px-6 py-4 text-gray-600">{user.Phone}</td>
                    <td className="px-6 py-4">
                      {editingId === user._id ? (
                        <select
                          value={editData.Role || user.Role}
                          onChange={(e) =>
                            setEditData({ ...editData, Role: e.target.value })
                          }
                          className="px-2 py-1 border rounded"
                        >
                          <option value="admin">Admin</option>
                          <option value="operator">Operator</option>
                          <option value="customer">Customer</option>
                        </select>
                      ) : (
                        <RoleBadge role={user.Role} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {editingId === user._id ? (
                          <>
                            <button
                              onClick={() => handleEditSave(user._id)}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm font-semibold hover:bg-green-600 transition"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setEditData({})
                              }}
                              className="px-3 py-1 bg-gray-400 text-white rounded text-sm font-semibold hover:bg-gray-500 transition"
                            >
                              ✕ Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(user)}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-600 transition"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm font-semibold hover:bg-red-600 transition"
                            >
                              🗑️ Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-600">
        Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
        <span className="font-semibold">{users.length}</span> users
      </div>
    </div>
  )
}