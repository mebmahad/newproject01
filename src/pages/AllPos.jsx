import React, { useEffect, useState, useCallback } from "react";
import { Container, PoCard } from "../components";
import service from "../appwrite/config";

const AllPos = () => {
  const [pos, setPos] = useState([]);
  const [filteredPos, setFilteredPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [vendorFilter, setVendorFilter] = useState("");
  const [ponoFilter, setPonoFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");

  const fetchPos = useCallback(async () => {
    if (!hasMore) return;

    setLoading(true);
    try {
      const response = await service.getPos({ page, limit: 10 });

      if (response && response.documents.length > 0) {
        const parsedPos = response.documents.map((po) => ({
          ...po,
          Items: typeof po.Items === "string" ? JSON.parse(po.Items) : po.Items || [],
        }));
        setPos((prevPos) => {
          const existingIds = new Set(prevPos.map((po) => po.$id));
          const uniquePos = parsedPos.filter((po) => !existingIds.has(po.$id));
          return [...prevPos, ...uniquePos];
        });

        setHasMore(response.documents.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching pos:", error);
      setError("Failed to fetch purchase orders.");
    } finally {
      setLoading(false);
    }
  }, [page, hasMore]);

  // Filter logic
  useEffect(() => {
    const filtered = pos.filter((po) => {
      const matchesVendor = vendorFilter
        ? po.VendorName?.toLowerCase().includes(vendorFilter.toLowerCase())
        : true;
      const matchesPono = ponoFilter
        ? po.pono?.toLowerCase().includes(ponoFilter.toLowerCase())
        : true;
      const matchesAmount = amountFilter
        ? parseFloat(po.totalamountwithgst) >= parseFloat(amountFilter)
        : true;
      return matchesVendor && matchesPono && matchesAmount;
    });
    setFilteredPos(filtered);
  }, [vendorFilter, ponoFilter, amountFilter, pos]);

  useEffect(() => {
    fetchPos();
  }, [page, fetchPos]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  if (loading && pos.length === 0) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container>
      <div className="flex flex-col gap-6">
        {/* Heading */}
        <h2 className="text-2xl font-extrabold text-gray-800">Purchase Orders</h2>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Filter by Vendor Name"
            className="border p-2 rounded w-1/3"
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by PONO"
            className="border p-2 rounded w-1/3"
            value={ponoFilter}
            onChange={(e) => setPonoFilter(e.target.value)}
          />
          <input
            type="number"
            placeholder="Filter by Minimum Amount"
            className="border p-2 rounded w-1/3"
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
          />
        </div>

        {/* Purchase Orders List */}
        <div
          className="space-y-4 overflow-y-auto h-[75vh] border rounded-lg p-4 bg-white shadow-inner"
          onScroll={handleScroll}
        >
          {filteredPos.map((po) => (
            <div key={po.$id}>
              <PoCard
                id={po.$id}
                pono={po.pono}
                vendorname={po.VendorName}
                totalamountwithgst={po.totalamountwithgst}
              />
            </div>
          ))}
          {loading && <div className="text-center text-gray-500">Loading more...</div>}
        </div>
      </div>
    </Container>
  );
};

export default AllPos;
