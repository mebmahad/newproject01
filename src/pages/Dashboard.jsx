import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  AiFillHome, 
  AiOutlineLogin, 
  AiOutlineUserAdd, 
  AiOutlinePlusCircle, 
} from 'react-icons/ai';
import { FaStore, FaShoppingCart, FaListAlt } from 'react-icons/fa';

const Dashboard = () => {
  const authStatus = useSelector(state => state.auth.status);

  const basePages = [
    { label: 'Home', path: '/', icon: <AiFillHome size={50} /> },
    { label: 'View Complaints', path: '/all-posts', icon: <FaListAlt size={50} /> },
    { label: 'Register Complaint', path: '/add-post', icon: <AiOutlinePlusCircle size={50} /> },
    { label: 'Store', path: '/store', icon: <FaStore size={50} /> },
    { label: 'Procurement', path: '/procurement', icon: <FaShoppingCart size={50} /> },
  ];

  const authPages = !authStatus ? [
    { label: 'Login', path: '/login', icon: <AiOutlineLogin size={50} /> },
    { label: 'Signup', path: '/signup', icon: <AiOutlineUserAdd size={50} /> },
  ] : [];

  const allPages = [...basePages, ...authPages];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6">
      {allPages.map((page, index) => (
        <Link 
          key={page.path} 
          to={page.path} 
          className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-4 hover:scale-105 transition transform duration-200"
        >
          <div className="mb-2 text-blue-500">{page.icon}</div>
          <div className="text-gray-700 font-semibold text-sm">{page.label}</div>
        </Link>
      ))}
    </div>
  );
};

export default Dashboard;