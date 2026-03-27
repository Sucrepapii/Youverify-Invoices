import React, { useState, ChangeEvent, useEffect, useCallback } from 'react';
import {
    Lock,
    Email,
    Phone,
    Visibility,
    VisibilityOff,
    Shield,
    ArrowBack,
    Person,
    Business,
    Badge
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/api';

// Type definitions
interface ProfileData {
    name: string;
    email: string;
    phone: string;
    company: string;
    bio: string;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ShowPasswords {
    current: boolean;
    new: boolean;
    confirm: boolean;
}

interface LoadingStates {
    profile: boolean;
    password: boolean;
}

interface SettingsSectionProps {
    title: string;
    description: string;
    icon: React.ComponentType<import('@mui/material').SvgIconProps>;
    children: React.ReactNode;
}

interface FormInputProps {
    label: string;
    type: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder: string;
    icon?: React.ComponentType<import('@mui/material').SvgIconProps>;
    showToggle?: boolean;
    showPassword?: boolean;
    onToggle?: () => void;
    error?: string;
    disabled?: boolean;
    isTextArea?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, icon: Icon, children }) => {
    const { theme } = useTheme();
    return (
        <div className={`
            rounded-[2rem] border p-8 mb-8 transition-all duration-300
            ${theme === 'dark' ? 'bg-gray-800/20 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}
        `}>
            <div className="flex items-start gap-4 mb-8">
                <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <Icon fontSize="medium" />
                </div>
                <div>
                    <h2 className={`text-xl font-black mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
};

const FormInput: React.FC<FormInputProps> = ({
    label,
    type,
    name,
    value,
    onChange,
    placeholder,
    icon: Icon,
    showToggle = false,
    showPassword = false,
    onToggle,
    error,
    disabled = false,
    isTextArea = false
}) => {
    const { theme } = useTheme();
    return (
        <div className="mb-6">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                {label}
            </label>
            <div className="relative group">
                {Icon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${theme === 'dark' ? 'text-gray-600 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-blue-500'} ${isTextArea ? 'top-6' : ''}`}>
                        <Icon sx={{ fontSize: 18 }} />
                    </div>
                )}
                {isTextArea ? (
                    <textarea
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={3}
                        className={`
                            w-full pl-12 pr-6 py-3.5 rounded-2xl border text-sm font-semibold transition-all
                            ${theme === 'dark' 
                                ? 'bg-gray-800/40 border-gray-700 text-white placeholder-gray-600 focus:bg-gray-700/50' 
                                : 'bg-gray-50/50 border-gray-100 text-gray-900 placeholder-gray-400 focus:bg-white focus:shadow-lg'
                            }
                            focus:border-blue-500 outline-none focus:ring-4 focus:ring-blue-500/10
                            ${error ? 'border-red-500' : ''}
                        `}
                    />
                ) : (
                    <input
                        type={showToggle && showPassword ? 'text' : type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`
                            w-full pl-12 pr-12 py-3.5 rounded-2xl border text-sm font-semibold transition-all
                            ${theme === 'dark' 
                                ? 'bg-gray-800/40 border-gray-700 text-white placeholder-gray-600 focus:bg-gray-700/50' 
                                : 'bg-gray-50/50 border-gray-100 text-gray-900 placeholder-gray-400 focus:bg-white focus:shadow-lg'
                            }
                            focus:border-blue-500 outline-none focus:ring-4 focus:ring-blue-500/10
                            ${error ? 'border-red-500' : ''}
                        `}
                    />
                )}
                {showToggle && onToggle && (
                    <button
                        type="button"
                        onClick={onToggle}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                        disabled={disabled}
                    >
                        {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                    </button>
                )}
            </div>
            {error && <p className="mt-2 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</p>}
        </div>
    );
};

const ProfilePage: React.FC = () => {
    const { theme } = useTheme();
    const { token } = useAuth();
    const navigate = useNavigate();

    // Profile state
    const [profileData, setProfileData] = useState<ProfileData>({
        name: '',
        email: '',
        phone: '',
        company: '',
        bio: ''
    });

    // Password state
    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordError, setPasswordError] = useState<string>('');

    // Loading states
    const [loading, setLoading] = useState<LoadingStates>({
        profile: false,
        password: false
    });

    const fetchProfile = useCallback(async () => {
        if (!token) return;
        setLoading(prev => ({ ...prev, profile: true }));
        try {
            const response = await fetch(API_ENDPOINTS.AUTH.ME, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfileData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    company: data.company || '',
                    bio: data.bio || ''
                });
            }
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(prev => ({ ...prev, profile: false }));
        }
    }, [token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setPasswordError('');
    };

    const togglePasswordVisibility = (field: keyof ShowPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmitProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, profile: true }));
        try {
            const response = await fetch(API_ENDPOINTS.AUTH.ME, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(profileData)
            });
            if (response.ok) {
                toast.success('Profile updated successfully');
            } else {
                throw new Error();
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(prev => ({ ...prev, profile: false }));
        }
    };

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        setLoading(prev => ({ ...prev, password: true }));
        // Mock password update
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error('Failed to update password');
        } finally {
            setLoading(prev => ({ ...prev, password: false }));
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                            <Person />
                        </div>
                        <h1 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>My Profile</h1>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Manage your personal and professional identity</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                >
                    <ArrowBack sx={{ fontSize: 14 }} /> Back to Dashboard
                </button>
            </div>

            <div className="space-y-8">
                {/* Personal & Business Info */}
                <SettingsSection 
                    title="Professional Identity" 
                    description="Information shown on your invoices and documents"
                    icon={Badge}
                >
                    <form onSubmit={handleSubmitProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <FormInput
                                label="Full Name"
                                type="text"
                                name="name"
                                value={profileData.name}
                                onChange={handleProfileChange}
                                placeholder="Enter your full name"
                                icon={Person}
                                disabled={loading.profile}
                            />
                            <FormInput
                                label="Company Name"
                                type="text"
                                name="company"
                                value={profileData.company}
                                onChange={handleProfileChange}
                                placeholder="Global Ventures Inc."
                                icon={Business}
                                disabled={loading.profile}
                            />
                            <FormInput
                                label="Email Address"
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleProfileChange}
                                placeholder="identity@domain.com"
                                icon={Email}
                                disabled={loading.profile}
                            />
                            <FormInput
                                label="Phone Number"
                                type="tel"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleProfileChange}
                                placeholder="+1 (700) 000-0000"
                                icon={Phone}
                                disabled={loading.profile}
                            />
                            <div className="md:col-span-2">
                                <FormInput
                                    label="Short Biography"
                                    type="text"
                                    name="bio"
                                    value={profileData.bio}
                                    onChange={handleProfileChange}
                                    placeholder="Tell us about yourself or your company..."
                                    icon={Badge}
                                    disabled={loading.profile}
                                    isTextArea
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading.profile}
                                className={`
                                    px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3
                                    ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/10'}
                                    disabled:opacity-50 disabled:grayscale
                                `}
                            >
                                {loading.profile ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Person sx={{ fontSize: 16 }} />}
                                {loading.profile ? 'Saving...' : 'Save Profile Details'}
                            </button>
                        </div>
                    </form>
                </SettingsSection>

                {/* Account Security Section */}
                <SettingsSection 
                    title="Account Security" 
                    description="Security credentials and authorization"
                    icon={Shield}
                >
                    <form onSubmit={handleSubmitPassword} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <div className="md:col-span-2">
                                <FormInput
                                    label="Current Password"
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter current password"
                                    icon={Lock}
                                    showToggle
                                    showPassword={showPasswords.current}
                                    onToggle={() => togglePasswordVisibility('current')}
                                    error={passwordError}
                                    disabled={loading.password}
                                />
                            </div>
                            <FormInput
                                label="New Password"
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Min. 8 characters"
                                icon={Lock}
                                showToggle
                                showPassword={showPasswords.new}
                                onToggle={() => togglePasswordVisibility('new')}
                                disabled={loading.password}
                            />
                            <FormInput
                                label="Confirm New Password"
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Re-enter new password"
                                icon={Lock}
                                showToggle
                                showPassword={showPasswords.confirm}
                                onToggle={() => togglePasswordVisibility('confirm')}
                                disabled={loading.password}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading.password}
                                className={`
                                    px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3
                                    ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/10'}
                                    disabled:opacity-50 disabled:grayscale
                                `}
                            >
                                {loading.password ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Lock sx={{ fontSize: 16 }} />}
                                {loading.password ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </SettingsSection>
            </div>
        </div>
    );
};

export default ProfilePage;