import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components";
import authService from "../appwrite/auth";
import { useSelector } from "react-redux";
import {
  FaListAlt,
  FaSignOutAlt,
  FaPlus,
  FaUsers,
  FaQrcode,
  FaSearch,
  FaMapMarkerAlt,
  FaArchive,
} from 'react-icons/fa';
import { AiOutlinePlus } from 'react-icons/ai';

const Store = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const authStatus = useSelector((state) => state.auth.status);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = await authService.getCurrentUser();
                setCurrentUser(user);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };
        fetchCurrentUser();
    }, [authStatus]);

    const isAuthor = currentUser?.name;

    const storePages = [
        ...((isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Store") ? [
            { label: 'Items', path: '/all-items', icon: <FaListAlt size={50} /> },
            { label: 'Stock Out', path: '/stock-out', icon: <FaSignOutAlt size={50} /> },
            { label: 'Add Item', path: '/add-item', icon: <AiOutlinePlus size={50} /> },
        ] : []),
        ...((isAuthor === "Procurement" || isAuthor === "Admin") ? [
            { label: 'Heads', path: '/all-heads', icon: <FaUsers size={50} /> },
            { label: 'Add Appliances', path: '/qrgenerator', icon: <FaQrcode size={50} /> },
            { label: 'View Appliance', path: '/qrscanner', icon: <FaSearch size={50} /> },
            { label: 'Locations', path: '/all-locations', icon: <FaMapMarkerAlt size={50} /> },
        ] : []),
        ...((isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Store") ? [
            { label: 'Store Entries', path: '/all-outforms', icon: <FaArchive size={50} /> },
            { label: 'Multiple QR', path: '/multipleqr', icon: <FaQrcode size={50} /> },
        ] : []),
    ];

    return (
        <Container>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6">
                {storePages.map((page) => (
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
        </Container>
    );
};

export default Store;