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
        // Update user
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
        // Create user
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
        >
          + Thêm người dùng
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('instructor')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'instructor'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Giảng viên ({instructors.length})
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'student'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Học viên ({students.length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày tạo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Chưa có {activeTab === 'instructor' ? 'giảng viên' : 'học viên'} nào
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{user.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.is_active !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active !== false ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString('vi-VN')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          {user.is_active !== false ? 'Vô hiệu' : 'Kích hoạt'}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
            </h3>

            {formError && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
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
                <Button type="submit" variant="primary" className="flex-1">
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

