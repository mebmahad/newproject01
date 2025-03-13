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

  const handleItemClick = () => navigate("/add-item");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const queries = [];

        // Use Query.search for partial matching or Query.equal for exact matches
        if (filters.Item) {
          queries.push(Query.search("Item", filters.Item)); // Search for Item field
        }
        if (filters.Head) {
          queries.push(Query.search("Head", filters.Head)); // Search for Head field
        }

        // For Location filter, use Query.equal for exact match (or Query.search if indexed)
        if (filters.Location) {
          const normalizedLocation = filters.Location.trim().toLowerCase();  // Normalize input
          queries.push(Query.equal("Location", normalizedLocation)); // Exact match on Location field
          // Alternatively, if you have full-text indexing set up, use:
          // queries.push(Query.search("Location", normalizedLocation)); 
        }

        // If no filters are applied, fetch all items (limit to 100)
        if (queries.length === 0) {
          queries.push(Query.limit(100)); // Optionally limit to 100 items
        }

        console.log("Queries being executed:", queries);

        // Fetch items from service
        const response = await service.getItems(queries);

        console.log("Fetched items:", response); // Log the response to check data

        setItems(response?.documents || []);
      } catch (error) {
        console.error("Error fetching items:", error);
        setItems([]); // Reset items on error
        setError("There was an error fetching the items.");
      }
    };

    fetchItems();
  }, [filters]); // Dependency on filters to refetch items when they change

  return (
    <Container className="bg-gray-50 p-6 rounded-md shadow-lg">
      <Button onClick={() => navigate('/store')} className="mb-4">
                ← Back to Store
            </Button>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Items</h2>
          <Button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleItemClick}
          >
            Add Item
          </Button>
        </div>

        {/* Filters Section */}
        <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Filters</h2>

          {/* Item Filter */}
          <DynamicInput
            label="Item Name"
            value={filters.Item}
            onChange={(e) => setFilters({ ...filters, Item: e.target.value })}
            className="mb-4"
          />

          {/* Head Filter */}
          <DynamicInput
            label="Head"
            value={filters.Head}
            onChange={(e) => setFilters({ ...filters, Head: e.target.value })}
            className="mb-4"
          />

          {/* Location Filter */}
          <DynamicInput
            label="Location"
            value={filters.Location}
            onChange={(e) => setFilters({ ...filters, Location: e.target.value })}
            className="mb-4"
          />
        </div>

        {/* Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : items.length ? (
            items.map((item) => (
              <ItemCard
                key={item.$id}
                {...item}
                className="bg-white p-4 rounded shadow-md hover:shadow-lg"
              />
            ))
          ) : (
            <p className="text-gray-500 text-center">No items available</p>
          )}
        </div>
      </div>
    </Container>
  );
};

export default AllItems;
