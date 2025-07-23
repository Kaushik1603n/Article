import { BookOpen, LogOut, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';
import type { User } from '../types';

interface NavBarProps {
    user: User | null;
}

const NavBar: React.FC<NavBarProps> = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = async (): Promise<void> => {
        try {
            await axiosClient.post(`auth/logout`, {}, {
                withCredentials: true,
            });

            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            navigate('/login');

        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    return (
        <header className="bg-white/80 border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Welcome back, {user?.firstName}!
                            </h1>
                            <p className="text-sm text-gray-500">Discover amazing articles today</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">


                        <button
                            onClick={() => navigate('/create-article')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Create</span>
                        </button>

                        <button
                            onClick={() => navigate('/settings')}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NavBar;