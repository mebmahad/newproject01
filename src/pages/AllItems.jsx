import React, { useEffect, useState } from "react";
import { Container, ItemCard, Button } from "../components";
import service from "../appwrite/config";
import { useNavigate } from "react-router-dom";
import DynamicInput from "../components/DynamicInput";
import { Query } from "appwrite";

const AllItems = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ Item: "", Head: "", Location: "" });
  const navigate = useNavigate();

  const handleItemClick = () => navigate('/add-item');

  useEffect(() => {
    const fetchItems = async () => {
        try {
            const queries = [];
            if (filters.Item) queries.push(Query.equal("Item", filters.Item));
            if (filters.Head) queries.push(Query.equal("Head", filters.Head));
            if (filters.Location) queries.push(Query.equal("Location", filters.Location));

            const response = await service.getItems(queries);
            setItems(response?.documents || []);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setItems([]);
        }
    };

    fetchItems();
}, [filters]);

  return (
    <Container className="bg-gray-50 p-6 rounded-md shadow-lg">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Items</h2>
          <Button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={handleItemClick}>
            Add Item
          </Button>
        </div>
        {/* Filters Section */}
        <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4">
                    <br />
                    <br />
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Filters</h2>
                    <DynamicInput
                        label="Item Name"
                        value={filters.Item}
                        onChange={(e) => setFilters({ ...filters, Item: e.target.value })}
                        className="mb-4"
                    />
                    <DynamicInput
                        label="Head"
                        value={filters.Head}
                        onChange={(e) => setFilters({ ...filters, Head: e.target.value })}
                    />
                    <DynamicInput
                        label="Location"
                        value={filters.Location}
                        onChange={(e) => setFilters({ ...filters, Location: e.target.value })}
                    />
                </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.length ? (
            items.map((item) => (
            <ItemCard key={item.$id} {...item} className="bg-white p-4 rounded shadow-md hover:shadow-lg" />
          ))) : (
            <p className="text-gray-500 text-center">No Items available</p>
        )}
        </div>
      </div>
    </Container>
  );
};

export default AllItems;
