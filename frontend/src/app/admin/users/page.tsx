'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import TextInput from '@/components/forms/TextInput';
import Select from '@/components/forms/Select';
import Button from '@/components/common/Button';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  is_active?: boolean;
  created_at?: string;
};

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
};

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'instructor' | 'student'>('instructor');
  const [instructors, setInstructors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const [instructorsRes, studentsRes] = await Promise.all([
        apiFetch('/api/admin/users/role/teacher'),
        apiFetch('/api/admin/users/role/student'),
      ]);
      setInstructors(instructorsRes);
      setStudents(studentsRes);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      alert('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: activeTab === 'instructor' ? 'teacher' : 'student',
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email) {
      setFormError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!editingUser && !formData.password) {
      setFormError('Vui lòng nhập mật khẩu cho user mới');
      return;
    }

    try {
      if (editingUser) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await apiFetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
      } else {
        await apiFetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      handleCloseModal();
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa user "${user.name}" (${user.email})?`)) {
      return;
    }

    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa user');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const currentUsers = activeTab === 'instructor' ? instructors : students;
  const filteredUsers = currentUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tổng giảng viên</p>
              <p className="text-2xl font-semibold text-gray-900">{instructors.length}+</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-purple-600">👨‍🏫</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tổng học viên</p>
              <p className="text-2xl font-semibold text-gray-900">{students.length}+</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-blue-600">🎓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm inline-flex">
        <button
          onClick={() => setActiveTab('instructor')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'instructor'
              ? 'bg-purple-50 text-purple-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Giảng viên ({instructors.length})
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'student'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          Học viên ({students.length})
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'instructor' ? 'Quản lý giảng viên' : 'Quản lý học viên'}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">→</button>
              <Button
                variant="primary"
                onClick={() => handleOpenModal()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                + Thêm
              </Button>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchQuery ? 'Không tìm thấy kết quả' : `Chưa có ${activeTab === 'instructor' ? 'giảng viên' : 'học viên'} nào`}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-gray-600 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">+33757005467</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'teacher' ? 'Giảng viên' : 'Học viên'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            {user.is_active !== false ? 'Vô hiệu' : 'Kích hoạt'}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                          <button className="text-gray-400 hover:text-gray-600">⋯</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextInput
                label="Tên đầy đủ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <TextInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <TextInput
                label={editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />

              <Select
                label="Vai trò"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'student' | 'teacher',
                  })
                }
                options={[
                  { value: 'student', label: 'Học viên' },
                  { value: 'teacher', label: 'Giảng viên' },
                ]}
                required
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {editingUser ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}