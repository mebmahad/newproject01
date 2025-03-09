import React, { useEffect, useState } from "react";
import { Container, Button } from "../components";
import authService from "../appwrite/auth";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AllProcures from "./AllProcures";
import AddPo from "./AddPo";
import AllPos from "./AllPos";
// Import icons for each tab
import { MdInventory } from "react-icons/md";
import { AiOutlinePlusCircle, AiOutlineOrderedList } from "react-icons/ai";

const Procurement = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("allprocures"); // Default to Material Required
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

  // Function to dynamically set active tab and color with icons
  const getTabClass = (tabName) => {
    return activeTab === tabName
      ? "flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow transition duration-200"
      : "flex items-center gap-2 bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-blue-200 transition duration-200";
  };

  return (
    <Container>
      <div className="flex flex-col">
        {/* Tabs */}
        <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
          {(isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Store") && (
            <Button
              className={getTabClass("allprocures")}
              onClick={() => handleTabClick("allprocures")}
            >
              <MdInventory size={20} />
              <span>Material Required</span>
            </Button>
          )}
          {(isAuthor === "Procurement" || isAuthor === "Admin") && (
            <Button
              className={getTabClass("add-po")}
              onClick={() => handleTabClick("add-po")}
            >
              <AiOutlinePlusCircle size={20} />
              <span>Make PO</span>
            </Button>
          )}
          {(isAuthor === "Procurement" || isAuthor === "Admin") && (
            <Button
              className={getTabClass("all-pos")}
              onClick={() => handleTabClick("all-pos")}
            >
              <AiOutlineOrderedList size={20} />
              <span>All Purchase Orders</span>
            </Button>
          )}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "allprocures" && (
            <div>
              <AllProcures />
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
