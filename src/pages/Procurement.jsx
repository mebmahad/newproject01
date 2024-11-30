import React, { useEffect, useState } from "react";
import { Container, Button} from "../components";
import authService from "../appwrite/auth";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AllProcures from "./AllProcures";
import AddPo from "./AddPo";
import AllPos from "./AllPos";

const Procurement = () => {
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
                            className={`p-2 rounded-lg ${getTabClass('allprocures')}`}
                            onClick={() => handleTabClick('allprocures')}>
                            Material required
                        </Button>
                    )}

                    {(isAuthor === "Procurement" || isAuthor === "Admin") && (
                        <Button
                            className={`p-2 rounded-lg ${getTabClass('add-po')}`}
                            onClick={() => handleTabClick('add-po')}>
                            Make PO
                        </Button>
                    )}

                    {(isAuthor === "Procurement" || isAuthor === "Admin") && (
                        <Button
                            className={`p-2 rounded-lg ${getTabClass('all-pos')}`}
                            onClick={() => handleTabClick('all-pos')}>
                            All Purchase Orders
                        </Button>
                    )}
                </div>

                {/* Tab Content Below */}
                <div className="mt-4">
                    {activeTab === "allprocures" && (
                        <div>
                            {/* Add your Items Component or Page here */}
                            <AllProcures/>
                            {/* You can render the Items component here */}
                        </div>
                    )}

                    {activeTab === "add-po" && (
                        <div>
                            <AddPo />
                        </div>
                    )}
                    {activeTab === "all-pos" && (
                        <div>
                            <AllPos />
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default Procurement;
