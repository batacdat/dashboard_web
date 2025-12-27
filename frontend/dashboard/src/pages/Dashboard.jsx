import React from 'react';

const Dashboard = () => {
    return (
        <div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Thống kê doanh thu */}
                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-title">Tổng doanh thu</div>
                        <div className="stat-value text-primary">25.6M</div>
                        <div className="stat-desc">Tháng này</div>
                    </div>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Chào mừng trở lại! 👋</h2>
                <p>Đây là trang tổng quan tình hình kinh doanh.</p>
            </div>
        </div>
    );
};

export default Dashboard;