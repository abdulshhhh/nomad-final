import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiMap, FiBarChart2, FiCompass, FiLogOut } from "react-icons/fi";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Add logout function
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          console.error("No authentication token found");
          return;
        }
        
        console.log("Using token:", token.substring(0, 10) + "...");
        
        const response = await axios.get(`${BACKEND_URL}/api/admin/users`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        
        if (response.data && response.data.success) {
          setUserData(response.data.users);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response && error.response.status === 401) {
          console.log("Authentication failed - token may be expired");
          // Optional: Redirect to login
          // navigate('/login');
        }
      }
    };

    fetchData();
  }, [BACKEND_URL]);

  const cardData = [
    {
      title: "User Details",
      icon: <FiUsers className="text-4xl text-[#2c5e4a]" />,
      onClick: () => {
        navigate("/admin/users");
      },
    },
    {
      title: "Trip Details",
      icon: <FiMap className="text-4xl text-[#2c5e4a]" />,
      onClick: () => {
        navigate("/admin/trips");
      },
    },
    {
      title: "Charts",
      icon: <FiBarChart2 className="text-4xl text-[#2c5e4a]" />,
      onClick: () => {
        navigate("/admin/charts");
      },
    },
    {
      title: "Destinations",
      icon: <FiCompass className="text-4xl text-[#2c5e4a]" />,
      onClick: () => {
        navigate("/admin/destinations");
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="/assets/images/NomadNovalogo.jpg" 
                alt="NomadNova Logo" 
                className="w-14 h-14 rounded-full mr-3"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-[#f8d56b]">
                Admin Dashboard
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#5E5854] hover:bg-[#2c5e4a] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-[#2c5e4a] mb-10 text-center font-cinzel">
          Admin Controls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {cardData.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl shadow-lg border border-[#d1c7b7] flex flex-col items-center justify-center p-8 cursor-pointer hover:shadow-2xl transition transform hover:scale-105"
              onClick={card.onClick}
            >
              {card.icon}
              <h3 className="mt-4 text-xl font-semibold text-[#2c5e4a] font-cinzel">{card.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
