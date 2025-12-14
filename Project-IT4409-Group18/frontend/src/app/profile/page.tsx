'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { Header } from '@/components/layout/Header';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Helper function to get full avatar URL
const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  // Static files are served from /uploads (not /api/uploads)
  // So we need to use base URL without /api
  const baseUrl = API_BASE_URL.replace('/api', '');
  const fullUrl = `${baseUrl}${avatarUrl}`;
  // Add timestamp to bust browser cache
  return `${fullUrl}?t=${Date.now()}`;
};

interface Profile {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  bio?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  profile?: InstructorProfile | StudentProfile;
}

interface InstructorProfile {
  bio?: string;
  headline?: string;
  payout_info?: any;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  experience_years?: number;
  specialization?: string;
}

interface StudentProfile {
  about?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  interests?: string[];
  education?: string;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, fetchCurrentUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date_of_birth: '',
    bio: '',
    website: '',
    // Role-specific fields
    headline: '',
    experience_years: '',
    specialization: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    education: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/profile/me');
      const profileData = response.data.profile;
      setProfile(profileData);
      
      // Populate form with existing data
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        date_of_birth: profileData.date_of_birth ? profileData.date_of_birth.split('T')[0] : '',
        bio: profileData.bio || '',
        website: profileData.website || '',
        headline: profileData.profile?.headline || '',
        experience_years: profileData.profile?.experience_years?.toString() || '',
        specialization: profileData.profile?.specialization || '',
        linkedin: profileData.profile?.linkedin || '',
        twitter: profileData.profile?.twitter || '',
        facebook: profileData.profile?.facebook || '',
        education: profileData.profile?.education || '',
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Không thể tải thông tin profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      // Upload avatar if changed
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatarFile);
        
        try {
          await apiClient.post('/api/profile/avatar', avatarFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          // Clear avatar preview and file after successful upload
          setAvatarFile(null);
          setAvatarPreview(null);
          
          // Fetch profile again to get updated avatar URL
          const profileResponse = await apiClient.get('/api/profile/me');
          setProfile(profileResponse.data.profile);
          
          // Update user context to refresh avatar in Header
          await fetchCurrentUser();
        } catch (err: any) {
          console.error('Error uploading avatar:', err);
          setError('Không thể upload ảnh đại diện');
          setIsSaving(false);
          return;
        }
      }

      const updateData: any = {
        name: formData.name,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        bio: formData.bio || null,
        website: formData.website || null,
        profile: {},
      };

      // Add role-specific fields
      if (user?.role === 'teacher') {
        updateData.profile = {
          headline: formData.headline || null,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          specialization: formData.specialization || null,
          linkedin: formData.linkedin || null,
          twitter: formData.twitter || null,
          facebook: formData.facebook || null,
        };
      } else if (user?.role === 'student') {
        updateData.profile = {
          linkedin: formData.linkedin || null,
          twitter: formData.twitter || null,
          facebook: formData.facebook || null,
          education: formData.education || null,
        };
      }

      const response = await apiClient.put('/api/profile/me', updateData);
      setProfile(response.data.profile);
      setSuccessMessage('Cập nhật profile thành công!');
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Không thể cập nhật profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original profile data
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
        bio: profile.bio || '',
        website: profile.website || '',
        headline: profile.profile?.['headline'] || '',
        experience_years: profile.profile?.['experience_years']?.toString() || '',
        specialization: profile.profile?.['specialization'] || '',
        linkedin: profile.profile?.['linkedin'] || '',
        twitter: profile.profile?.['twitter'] || '',
        facebook: profile.profile?.['facebook'] || '',
        education: profile.profile?.['education'] || '',
      });
    }
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setError('');
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chỉnh sửa
              </button>
            )}
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Profile Content */}
          <div className="px-6 py-6">
            {!isEditing ? (
              // View Mode - giữ nguyên phần view mode từ file gốc
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <p className="text-gray-900">{profile.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                    <p className="text-gray-900 capitalize">
                      {profile.role === 'teacher' ? 'Giảng viên' : profile.role === 'student' ? 'Học viên' : 'Quản trị viên'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <p className="text-gray-900">{profile.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                    <p className="text-gray-900">
                      {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <p className="text-gray-900">
                      {profile.website ? (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile.website}
                        </a>
                      ) : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{profile.bio || 'Chưa cập nhật'}</p>
                </div>

                {/* Role-specific fields và Social Links - giữ nguyên từ file gốc */}
                {user.role === 'teacher' && (
                  <>
                    <div className="border-t pt-6">
                      <h2 className="text-lg font-semibold mb-4">Thông tin giảng viên</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                          <p className="text-gray-900">{profile.profile?.['headline'] || 'Chưa cập nhật'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số năm kinh nghiệm</label>
                          <p className="text-gray-900">{profile.profile?.['experience_years'] || 'Chưa cập nhật'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên môn</label>
                          <p className="text-gray-900">{profile.profile?.['specialization'] || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {user.role === 'student' && profile.profile && (
                  <>
                    <div className="border-t pt-6">
                      <h2 className="text-lg font-semibold mb-4">Thông tin học viên</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Học vấn</label>
                          <p className="text-gray-900">{profile.profile['education'] || 'Chưa cập nhật'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Social Links */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold mb-4">Liên kết mạng xã hội</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                      <p className="text-gray-900">
                        {profile.profile?.['linkedin'] ? (
                          <a href={profile.profile['linkedin']} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.profile['linkedin']}
                          </a>
                        ) : 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                      <p className="text-gray-900">
                        {profile.profile?.['twitter'] ? (
                          <a href={profile.profile['twitter']} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.profile['twitter']}
                          </a>
                        ) : 'Chưa cập nhật'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                      <p className="text-gray-900">
                        {profile.profile?.['facebook'] ? (
                          <a href={profile.profile['facebook']} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.profile['facebook']}
                          </a>
                        ) : 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode - giữ nguyên phần edit mode từ file gốc (đã có trong file trên)
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4 pb-6 border-b">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : getAvatarUrl(profile.avatar_url) ? (
                        <img src={getAvatarUrl(profile.avatar_url)!} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-white font-semibold">
                          {profile.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <label 
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-500">Click vào icon camera để thay đổi ảnh đại diện</p>
                  {avatarFile && (
                    <p className="text-sm text-green-600">Ảnh mới đã chọn: {avatarFile.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      id="date_of_birth"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Giới thiệu
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Giới thiệu về bản thân..."
                  />
                </div>

                {/* Role-specific fields */}
                {user.role === 'teacher' && (
                  <>
                    <div className="border-t pt-6">
                      <h2 className="text-lg font-semibold mb-4">Thông tin giảng viên</h2>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
                            Tiêu đề
                          </label>
                          <input
                            type="text"
                            id="headline"
                            name="headline"
                            value={formData.headline}
                            onChange={handleInputChange}
                            placeholder="VD: Chuyên gia Web Development"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1">
                              Số năm kinh nghiệm
                            </label>
                            <input
                              type="number"
                              id="experience_years"
                              name="experience_years"
                              value={formData.experience_years}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                              Chuyên môn
                            </label>
                            <input
                              type="text"
                              id="specialization"
                              name="specialization"
                              value={formData.specialization}
                              onChange={handleInputChange}
                              placeholder="VD: Full-stack Development"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {user.role === 'student' && (
                  <>
                    <div className="border-t pt-6">
                      <h2 className="text-lg font-semibold mb-4">Thông tin học viên</h2>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                            Học vấn
                          </label>
                          <input
                            type="text"
                            id="education"
                            name="education"
                            value={formData.education}
                            onChange={handleInputChange}
                            placeholder="VD: Đại học Bách Khoa Hà Nội"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Social Links */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold mb-4">Liên kết mạng xã hội</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        id="linkedin"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter
                      </label>
                      <input
                        type="url"
                        id="twitter"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook
                      </label>
                      <input
                        type="url"
                        id="facebook"
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

