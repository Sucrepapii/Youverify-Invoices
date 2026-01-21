import React, { useState, ChangeEvent } from 'react';
import {
    Lock,
    Email,
    Phone,
    Visibility,
    VisibilityOff,
    CheckCircle,
    ErrorOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
    icon: React.ComponentType<any>;
    children: React.ReactNode;
}

interface FormInputProps {
    label: string;
    type: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    icon?: React.ComponentType<any>;
    showToggle?: boolean;
    showPassword?: boolean;
    onToggle?: () => void;
    error?: string;
    disabled?: boolean;
}

// Component definitions moved outside to prevent re-creation on every render
const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Icon className="text-blue-600" fontSize="medium" />
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        {children}
    </div>
);

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
}) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Icon fontSize="small" />
                </div>
            )}
            <input
                type={showToggle && showPassword ? 'text' : type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 
                 focus:border-blue-500 outline-none transition-colors
                 ${error ? 'border-red-500' : 'border-gray-300'}
                 ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {showToggle && onToggle && (
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={disabled}
                >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </button>
            )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const SettingsPage: React.FC = () => {
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

    const navigate = useNavigate();

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

    const validatePassword = (): boolean => {
        if (!passwordData.currentPassword.trim()) {
            setPasswordError('Current password is required');
            return false;
        }
        if (passwordData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return false;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return false;
        }
        if (passwordData.currentPassword === passwordData.newPassword) {
            setPasswordError('New password must be different from current password');
            return false;
        }
        return true;
    };

    const validateEmail = (): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailData.newEmail.trim()) {
            setEmailError('New email is required');
            return false;
        }
        if (!emailRegex.test(emailData.newEmail)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        if (emailData.newEmail !== emailData.confirmEmail) {
            setEmailError('Emails do not match');
            return false;
        }
        return true;
    };

    const validatePhone = (): boolean => {
        const cleanedPhone = phoneData.newPhone.replace(/\D/g, '');

        if (!phoneData.newPhone.trim()) {
            setPhoneError('New phone number is required');
            return false;
        }

        // Nigerian phone validation (you can adjust this)
        if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
            setPhoneError('Please enter a valid phone number (10-15 digits)');
            return false;
        }

        return true;
    };

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!validatePassword()) return;

        setLoading(prev => ({ ...prev, password: true }));

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            setPasswordSuccess('Password updated successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswords({
                current: false,
                new: false,
                confirm: false
            });
        } catch (error) {
            setPasswordError(error instanceof Error ? error.message : 'Failed to update password');
        } finally {
            setLoading(prev => ({ ...prev, password: false }));
        }
    };

    const handleSubmitEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError('');
        setEmailSuccess('');

        if (!validateEmail()) return;

        setLoading(prev => ({ ...prev, email: true }));

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            setEmailSuccess('Email updated successfully! Verification email sent.');
            setEmailData({
                newEmail: '',
                confirmEmail: ''
            });
        } catch (error) {
            setEmailError(error instanceof Error ? error.message : 'Failed to update email');
        } finally {
            setLoading(prev => ({ ...prev, email: false }));
        }
    };

    const handleSubmitPhone = async (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneError('');
        setPhoneSuccess('');

        if (!validatePhone()) return;

        setLoading(prev => ({ ...prev, phone: true }));

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            setPhoneSuccess('Phone number updated successfully! Verification code sent.');
            setPhoneData({
                newPhone: ''
            });
        } catch (error) {
            setPhoneError(error instanceof Error ? error.message : 'Failed to update phone number');
        } finally {
            setLoading(prev => ({ ...prev, phone: false }));
        }
    };



    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                    <p className="text-gray-600">Manage your account security and contact information</p>
                </div>
                <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => navigate('/dashboard')}
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Change Password Section */}
            <SettingsSection title="Change Password" icon={Lock}>
                <form onSubmit={handleSubmitPassword}>
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

                    <FormInput
                        label="New Password"
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password (min. 8 characters)"
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
                        placeholder="Confirm new password"
                        icon={Lock}
                        showToggle
                        showPassword={showPasswords.confirm}
                        onToggle={() => togglePasswordVisibility('confirm')}
                        disabled={loading.password}
                    />

                    {passwordSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                            <CheckCircle className="text-green-600" fontSize="small" />
                            <span className="text-green-700 text-sm">{passwordSuccess}</span>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading.password}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 
                       rounded-lg font-medium flex items-center gap-2 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                        >
                            {loading.password ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Lock fontSize="small" />
                                    Update Password
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </SettingsSection>

            {/* Change Email Section */}
            <SettingsSection title="Change Email Address" icon={Email}>
                <form onSubmit={handleSubmitEmail}>
                    <FormInput
                        label="New Email Address"
                        type="email"
                        name="newEmail"
                        value={emailData.newEmail}
                        onChange={handleEmailChange}
                        placeholder="Enter new email address"
                        icon={Email}
                        error={emailError}
                        disabled={loading.email}
                    />

                    <FormInput
                        label="Confirm New Email"
                        type="email"
                        name="confirmEmail"
                        value={emailData.confirmEmail}
                        onChange={handleEmailChange}
                        placeholder="Confirm new email address"
                        icon={Email}
                        disabled={loading.email}
                    />

                    {emailSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                            <CheckCircle className="text-green-600" fontSize="small" />
                            <span className="text-green-700 text-sm">{emailSuccess}</span>
                        </div>
                    )}

                    {emailError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <ErrorOutline className="text-red-600" fontSize="small" />
                            <span className="text-red-700 text-sm">{emailError}</span>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading.email}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 
                       rounded-lg font-medium flex items-center gap-2 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                        >
                            {loading.email ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Email fontSize="small" />
                                    Update Email
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </SettingsSection>

            {/* Change Phone Number Section */}
            <SettingsSection title="Change Phone Number" icon={Phone}>
                <form onSubmit={handleSubmitPhone}>
                    <FormInput
                        label="New Phone Number"
                        type="tel"
                        name="newPhone"
                        value={phoneData.newPhone}
                        onChange={handlePhoneChange}
                        placeholder="e.g., +234 801 234 5678"
                        icon={Phone}
                        error={phoneError}
                        disabled={loading.phone}
                    />

                    {phoneSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                            <CheckCircle className="text-green-600" fontSize="small" />
                            <span className="text-green-700 text-sm">{phoneSuccess}</span>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading.phone}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 
                       rounded-lg font-medium flex items-center gap-2 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                        >
                            {loading.phone ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Phone fontSize="small" />
                                    Update Phone Number
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </SettingsSection>
        </div>
    );
};

export default SettingsPage;