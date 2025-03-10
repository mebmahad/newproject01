import React, { useEffect, useState } from "react";
import { Container, ProcureCard } from "../components";
import service from "../appwrite/config";
import authService from "../appwrite/auth";
import { Query } from "appwrite";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AllProcures = () => {
  const [procures, setProcures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    fetchCurrentUser();
  }, [authStatus]);

  useEffect(() => {
    const fetchProcures = async () => {
      setLoading(true);
      try {
        const queries = [Query.equal("status", "podone")];
        const response = await service.getProcures(queries);

        if (response && response.documents) {
          const parsedProcures = response.documents.map((procure) => ({
            ...procure,
            Items: procure.Items ? JSON.parse(procure.Items) : [],
          }));
          setProcures(parsedProcures);
        } else {
          setProcures([]);
        }
      } catch (error) {
        console.error("Error fetching procures:", error);
        setError("Failed to fetch procurements.");
        setProcures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProcures();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <div className="p-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <h2 className="text-lg font-bold mb-2">PO DONE</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6 mt-6">
          {procures.length > 0 ? (
            procures.map((procure) => (
              <div 
                key={procure.$id} 
                className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-4 hover:scale-105 transition transform duration-200"
              >
                <ProcureCard
                  id={procure.$id}
                  items={procure.Items}
                  post={procure.postId}
                />
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center col-span-full">
              There are no records available at this time.
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default AllProcures;
