import React, { useEffect, useState } from "react";
import { Container, Button, OutForm, InForm, ItemForm } from "../components";
import authService from "../appwrite/auth";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AllItems from "./AllItems";
import AllHeads from "./AllHeads";
import AllLocations from "./AllLocations";
import AllOutForms from "./AllOutforms";

const Store = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState("items"); // Default active tab
    const authStatus = useSelector((state) => state.auth.status);
    const navigate = useNavigate();

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

    // Handling tab clicks to set active tab
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    // Navigation functions
    const handleAllItemClick = () => {
        navigate('/all-items');
    };

    const handleAllHeadClick = () => {
        navigate('/all-heads');
    };

    const handleOutFormClick = () => {
        navigate('/stock-out'); // Or just handle routing to an OutForm page
    };

    const handleAllOutFormClick = () => {
        navigate('/stock-outentry'); // Or just handle routing to an OutForm page
    };

    // Function to dynamically set active tab and color
    const getTabClass = (tabName) => {
        return activeTab === tabName
            ? "bg-blue-500 text-white"
            : "bg-gray-300 text-black hover:bg-blue-200";
    };

    return (
        <Container>
            <div className="flex gap-4 flex-col">
                {/* Tabs as Buttons */}
                <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                    {(isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Store") && (
                        <Button
                            className={`p-2 rounded-lg ${getTabClass('items')}`}
                            onClick={() => handleTabClick('items')}>
                            Items
                        </Button>
                    )}

                    {(isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Store") && (
                        <Button
                            className={`p-2 rounded-lg ${getTabClass('stock-out')}`}
                            onClick={() => handleTabClick('stock-out')}>
                            Stock Out
                        </Button>
                    )}

                    {(isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Store") && (
                        <Button
                            className={`p-2 rounded-lg ${getTabClass('add-item')}`}
                            onClick={() => handleTabClick('add-item')}>
                            Add Item
                        </Button>
                    )}
                    {(isAuthor === "Procurement" || isAuthor === "Admin") && (
                        <Button
                            className={`p-2 rounded-lg ${getTabClass('Head')}`}
                            onClick={() => handleTabClick('Head')}>
                            Heads
                        </Button>
                    )}
                    {(isAuthor === "Procurement" || isAuthor === "Admin") && (
                        <Button
                            className={`p-2 rounded-lg ${getTabClass('Location')}`}
                            onClick={() => handleTabClick('Location')}>
                            Locations   
                        </Button>
                    )}
                    {(isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Store") && (
                        <Button
                            className={`p-2 rounded-lg ${getTabClass('Storeentry')}`}
                            onClick={() => handleTabClick('Storeentry')}>
                            Store Entries   
                        </Button>
                    )}
                </div>

                {/* Tab Content Below */}
                <div className="mt-4">
                    {activeTab === "items" && (
                        <div>
                            {/* Add your Items Component or Page here */}
                            <AllItems/>
                            {/* You can render the Items component here */}
                        </div>
                    )}

                    {activeTab === "stock-out" && (
                        <div>
                            <OutForm />
                        </div>
                    )}

                    {activeTab === "add-item" && (
                        <div>
                            <ItemForm />
                        </div>
                    )}
                    {activeTab === "Head" && (
                        <div>
                            <AllHeads />
                        </div>
                    )}
                    {activeTab === "Location" && (
                        <div>
                            <AllLocations />
                        </div>
                    )}
                    {activeTab === "Storeentry" && (
                        <div>
                            <AllOutForms />
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default Store;
