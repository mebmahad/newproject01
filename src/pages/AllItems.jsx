import React, { useEffect, useState } from "react";
import { Container, ItemCard, Button } from "../components";
import service from "../appwrite/config";
import { useNavigate } from "react-router-dom";

const AllItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleItemClick = () => navigate('/add-item');

  useEffect(() => {
    const fetchItems = async () => {
      try {
          const response = await service.getItems();
          setItems(response?.documents || []);
      } catch {
          setError("Failed to fetch items.");
          setItems([]);
      } finally {
          setLoading(false);
      }
  };

    fetchItems();
  }, []);

  if (loading) return <div className="text-center mt-10 text-lg">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <Container className="bg-gray-50 p-6 rounded-md shadow-lg">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Items</h2>
          <Button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={handleItemClick}>
            Add Item
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item.$id} {...item} className="bg-white p-4 rounded shadow-md hover:shadow-lg" />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default AllItems;
