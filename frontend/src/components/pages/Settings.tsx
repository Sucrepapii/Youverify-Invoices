import React, { useState, ChangeEvent } from 'react';
import {
    Lock,
    Email,
    Phone,
    Visibility,
    VisibilityOff,
    CheckCircle,
    Shield,
    ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

// Type definitions
interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface EmailData {
    newEmail: string;
    confirmEmail: string;
}

interface PhoneData {
    newPhone: string;
}

interface ShowPasswords {
    current: boolean;
    new: boolean;
    confirm: boolean;
}

interface LoadingStates {
    password: boolean;
    email: boolean;
    phone: boolean;
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
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    icon?: React.ComponentType<import('@mui/material').SvgIconProps>;
    showToggle?: boolean;
    showPassword?: boolean;
    onToggle?: () => void;
    error?: string;
    disabled?: boolean;
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
    disabled = false
}) => {
    const { theme } = useTheme();
    return (
        <div className="mb-6">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                {label}
            </label>
            <div className="relative group">
                {Icon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${theme === 'dark' ? 'text-gray-600 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-blue-500'}`}>
                        <Icon sx={{ fontSize: 18 }} />
                    </div>
                )}
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

const SettingsPage: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

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
    const [passwordSuccess, setPasswordSuccess] = useState<string>('');

    // Email state
    const [emailData, setEmailData] = useState<EmailData>({
        newEmail: '',
        confirmEmail: ''
    });
    const [emailError, setEmailError] = useState<string>('');
    const [emailSuccess, setEmailSuccess] = useState<string>('');

    // Phone state
    const [phoneData, setPhoneData] = useState<PhoneData>({
        newPhone: ''
    });
    const [phoneError, setPhoneError] = useState<string>('');
    const [phoneSuccess, setPhoneSuccess] = useState<string>('');

    // Loading states
    const [loading, setLoading] = useState<LoadingStates>({
        password: false,
        email: false,
        phone: false
    });

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setPasswordError('');
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEmailData(prev => ({ ...prev, [name]: value }));
        setEmailError('');
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPhoneData(prev => ({ ...prev, [name]: value }));
        setPhoneError('');
    };

    const togglePasswordVisibility = (field: keyof ShowPasswords) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        setLoading(prev => ({ ...prev, password: true }));

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setPasswordSuccess('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordError('Failed to update password');
        } finally {
            setLoading(prev => ({ ...prev, password: false }));
        }
    };

    const handleSubmitEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError('');
        setEmailSuccess('');
        setLoading(prev => ({ ...prev, email: true }));

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setEmailSuccess('Email updated successfully');
            setEmailData({ newEmail: '', confirmEmail: '' });
        } catch (error) {
            setEmailError('Failed to update email');
        } finally {
            setLoading(prev => ({ ...prev, email: false }));
        }
    };

    const handleSubmitPhone = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError('');
        setPhoneSuccess('');
        setLoading(prev => ({ ...prev, phone: true }));

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setPhoneSuccess('Phone number updated successfully');
            setPhoneData({ newPhone: '' });
        } catch (error) {
            setPhoneError('Failed to update phone number');
        } finally {
            setLoading(prev => ({ ...prev, phone: false }));
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                            <Shield />
                        </div>
                        <h1 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Account Security</h1>
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Update your login information and secure your account</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                >
                    <ArrowBack sx={{ fontSize: 14 }} /> Back to Console
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Change Password Section */}
                <SettingsSection 
                    title="Change Password" 
                    description="Update your account password regularly to stay secure"
                    icon={Lock}
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

                        {passwordSuccess && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                <CheckCircle className="text-emerald-500" sx={{ fontSize: 18 }} />
                                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{passwordSuccess}</span>
                            </div>
                        )}

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

                {/* Change Email Section */}
                <SettingsSection 
                    title="Change Email Address" 
                    description="Update the email address associated with your account"
                    icon={Email}
                >
                    <form onSubmit={handleSubmitEmail} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <FormInput
                                label="New Email Address"
                                type="email"
                                name="newEmail"
                                value={emailData.newEmail}
                                onChange={handleEmailChange}
                                placeholder="identity@domain.com"
                                icon={Email}
                                error={emailError}
                                disabled={loading.email}
                            />
                            <FormInput
                                label="Confirm Email"
                                type="email"
                                name="confirmEmail"
                                value={emailData.confirmEmail}
                                onChange={handleEmailChange}
                                placeholder="identity@domain.com"
                                icon={Email}
                                disabled={loading.email}
                            />
                        </div>

                        {emailSuccess && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                <CheckCircle className="text-emerald-500" sx={{ fontSize: 18 }} />
                                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{emailSuccess}</span>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading.email}
                                className={`
                                    px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3
                                    ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/10'}
                                    disabled:opacity-50 disabled:grayscale
                                `}
                            >
                                {loading.email ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Email sx={{ fontSize: 16 }} />}
                                {loading.email ? 'Verifying...' : 'Update Email'}
                            </button>
                        </div>
                    </form>
                </SettingsSection>

                {/* Change Phone Number Section */}
                <SettingsSection 
                    title="Change Phone Number" 
                    description="Used for two-factor authentication and alerts"
                    icon={Phone}
                >
                    <form onSubmit={handleSubmitPhone} className="space-y-6">
                        <div className="max-w-md">
                            <FormInput
                                label="New Phone Number"
                                type="tel"
                                name="newPhone"
                                value={phoneData.newPhone}
                                onChange={handlePhoneChange}
                                placeholder="+1 (700) 000-0000"
                                icon={Phone}
                                error={phoneError}
                                disabled={loading.phone}
                            />
                        </div>

                        {phoneSuccess && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                <CheckCircle className="text-emerald-500" sx={{ fontSize: 18 }} />
                                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{phoneSuccess}</span>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading.phone}
                                className={`
                                    px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3
                                    ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/10'}
                                    disabled:opacity-50 disabled:grayscale
                                `}
                            >
                                {loading.phone ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Phone sx={{ fontSize: 16 }} />}
                                {loading.phone ? 'Updating...' : 'Update Phone'}
                            </button>
                        </div>
                    </form>
                </SettingsSection>
            </div>
        </div>
    );
};

export default SettingsPage;