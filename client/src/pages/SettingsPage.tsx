import { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Save, Check } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import axios from 'axios';
import ArticleEdit from '../components/MyArticle';
import NavBar from '../components/NavBar';
import type { User as UserType } from '../types';

type PersonalInfo = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
};

type PasswordInfo = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

type UserData = {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    preferences: string[];
    token: string;
    _id: string;
    dob: string;
};

const SettingsPage = () => {
    // const navigate = useNavigate();
    // const location = useLocation();
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'article'>('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserType | null>(null);


    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        _id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

    const [passwordInfo, setPasswordInfo] = useState<PasswordInfo>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser: UserData = JSON.parse(userData);

            setPersonalInfo({
                _id: parsedUser._id,
                firstName: parsedUser.firstName,
                lastName: parsedUser.lastName,
                email: parsedUser.email,
                phone: parsedUser.phone,
            });
            setUser(parsedUser)
        }


    }, []);

    const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
        setPersonalInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordInfoChange = (field: keyof PasswordInfo, value: string) => {
        setPasswordInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTabChange = (tab: 'profile' | 'password' | 'article') => {
        setActiveTab(tab);
    };

    const validatePasswordChange = (): boolean => {
        return passwordInfo.newPassword === passwordInfo.confirmPassword &&
            passwordInfo.newPassword.length >= 8 &&
            passwordInfo.currentPassword.length > 0;
    };

    const handleUpdateProfile = async () => {
        setIsLoading(true);
        setError(null);

        try {

            if (!personalInfo.firstName?.trim()) {
                setError('First name is required');
                return;
            } else if (personalInfo.firstName.trim().length < 2) {
                setError('First name must be at least 2 characters');
                return;
            }

            if (!personalInfo.lastName?.trim()) {
                setError('Last name is required');
                return;
            } else if (personalInfo.lastName.trim().length < 1) {
                setError('Last name must be at least 1 characters');
                return;
            }

            if (!personalInfo.email?.trim()) {
                setError('Email is required');
                return;
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(personalInfo.email.trim())) {
                    setError('Please enter a valid email address');
                    return;
                }
            }

            if (!personalInfo.phone?.trim()) {
                setError('Phone number is required');
                return;
            } else {
                const phoneRegex = /^[0-9]{10,15}$/;
                if (!phoneRegex.test(personalInfo.phone.trim())) {
                    setError('Please enter a valid phone number (10-15 digits)');
                    return;
                }
            }

            try {
                const res = await axiosClient.put("/auth/profile", personalInfo);
                localStorage.setItem("user", JSON.stringify(res.data.user));

            } catch (err) {
                console.log(err);
                setError('Profile edit failed');
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            let errorMessage = 'Failed to update profile. Please try again.';

            if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setIsLoading(true);
        setError(null);

        if (!validatePasswordChange()) {
            setError('Password requirements not met');
            setIsLoading(false);
            return;
        }

        try {
            await axiosClient.put("/auth/password", { ...passwordInfo, userId: personalInfo._id });

            setPasswordInfo({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            let errorMessage = 'Failed to change password. Please try again.';

            if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <NavBar user={user} />
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
                    <p className="text-gray-600">Manage your account and preferences</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => handleTabChange('profile')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <User className="inline-block w-4 h-4 mr-2" />
                                Edit Profile
                            </button>
                            <button
                                onClick={() => handleTabChange('password')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'password'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Lock className="inline-block w-4 h-4 mr-2" />
                                Change Password
                            </button>
                            <button
                                onClick={() => handleTabChange('article')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'article'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Lock className="inline-block w-4 h-4 mr-2" />
                                Article
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
                        {error}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={personalInfo.firstName}
                                        onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={personalInfo.lastName}
                                        onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={personalInfo.email}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={personalInfo.phone}
                                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Save Button for Profile */}
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={isLoading}
                                    className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center ${saved
                                        ? 'bg-green-500 text-white'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
                                        }`}
                                >
                                    {isLoading ? (
                                        'Saving...'
                                    ) : saved ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password Change Tab */}
                {activeTab === 'password' && (
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordInfo.currentPassword}
                                            onChange={(e) => handlePasswordInfoChange('currentPassword', e.target.value)}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={passwordInfo.newPassword}
                                                onChange={(e) => handlePasswordInfoChange('newPassword', e.target.value)}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={passwordInfo.confirmPassword}
                                                onChange={(e) => handlePasswordInfoChange('confirmPassword', e.target.value)}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {passwordInfo.newPassword && (
                                    <div className="text-sm text-gray-600">
                                        {passwordInfo.newPassword.length < 8 && <p>Password must be at least 8 characters long.</p>
                                        }
                                        {passwordInfo.newPassword !== passwordInfo.confirmPassword && passwordInfo.confirmPassword && (
                                            <p className="text-red-600">Passwords do not match.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Save Button for Password */}
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isLoading || !validatePasswordChange()}
                                    className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center ${saved
                                        ? 'bg-green-500 text-white'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
                                        }`}
                                >
                                    {isLoading ? (
                                        'Saving...'
                                    ) : saved ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Change Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'article' && (
                    <ArticleEdit />
                )}
            </div>
        </div>
    );
};

export default SettingsPage;