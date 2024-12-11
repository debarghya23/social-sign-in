import React from 'react';
import './Dashboard.css';

interface DashboardProps {
    user: any;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    return (
        <div className="dashboard">
            <h1>Welcome, {user.username || user.email || 'User'}!</h1>
            <button className="logout-button" onClick={onLogout}>
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
