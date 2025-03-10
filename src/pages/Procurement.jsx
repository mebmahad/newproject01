import React, { useEffect, useState } from "react";
import { Container } from "../components";
import authService from "../appwrite/auth";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdInventory, MdShoppingCart, MdDoneAll, MdLocalShipping } from "react-icons/md";
import { AiOutlinePlusCircle } from "react-icons/ai";

const Procurement = () => {
  const [currentUser, setCurrentUser] = useState(null);
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
    if (authStatus) fetchCurrentUser();
  }, [authStatus]);

  // Authorization checks
  const isProcurement = currentUser?.name === "Procurement";
  const isStore = currentUser?.name === "Store";
  const isAdmin = currentUser?.name === "Admin";

  // Responsive card styling
  const tabStyle = (isActive) =>
    `flex flex-col items-center justify-center min-w-[120px] p-4 rounded-lg shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer
    ${isActive ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`;

  return (
    <Container>
      <div className="flex flex-col items-center justify-center gap-6 min-h-screen">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 justify-center pb-2">
          {(isStore || isProcurement || isAdmin) && (
            <div className={tabStyle(false)} onClick={() => navigate('/all-procures')}>
              <MdInventory size={32} className="mb-2" />
              <span className="text-sm font-semibold text-center">Material Required</span>
            </div>
          )}
          {(isStore || isProcurement || isAdmin) && (
            <div className={tabStyle(false)} onClick={() => navigate('/all-podone')}>
              <MdDoneAll size={32} className="mb-2" />
              <span className="text-sm font-semibold text-center">PO DONE</span>
            </div>
          )}
          {(isStore || isProcurement || isAdmin) && (
            <div className={tabStyle(false)} onClick={() => navigate('/all-inactiveprocures')}>
              <MdLocalShipping size={32} className="mb-2" />
              <span className="text-sm font-semibold text-center">Material Received</span>
            </div>
          )}
          {(isStore || isProcurement || isAdmin) && (
            <div className={tabStyle(false)} onClick={() => navigate('/all-pos')}>
              <MdShoppingCart size={32} className="mb-2" />
              <span className="text-sm font-semibold text-center">All POs</span>
            </div>
          )}
          {(isStore || isProcurement || isAdmin) && (
            <div className={tabStyle(false)} onClick={() => navigate('/add-po')}>
              <AiOutlinePlusCircle size={32} className="mb-2" />
              <span className="text-sm font-semibold text-center">Make PO</span>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Procurement;
