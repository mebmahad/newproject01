import React, { useEffect, useState } from "react";
import { Container, HeadCard, Button } from "../components";
import service from "../appwrite/config";
import { useNavigate } from "react-router-dom";

const AllHeads = () => {
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAddHeadClick = () => navigate('/add-head');

  useEffect(() => {
    const fetchHeads = async () => {
      try {
        const response = await service.getHeads();
        setHeads(response?.documents || []);
      } catch {
        setError("Failed to fetch heads.");
        setHeads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeads();
  }, []);

  if (loading) return <div className="text-center mt-10 text-lg">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <Container className="bg-gray-50 p-6 rounded-md shadow-lg">
      <Button onClick={() => navigate('/store')} className="mb-4">
                ← Back to Store
            </Button>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Heads</h2>
          <Button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={handleAddHeadClick}>
            Add Head
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {heads.slice(0, 150).map((head) => ( // Limit to max 150 entries
            <HeadCard key={head.$id} {...head} className="bg-white p-4 rounded shadow-md hover:shadow-lg" />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default AllHeads;
