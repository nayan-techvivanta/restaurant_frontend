import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Minus,
  X,
  Printer,
  ChefHat,
  Clock,
  AlertCircle,
  CheckCircle2,
  Leaf,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FaUtensils } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";
import { MdOutlineFastfood } from "react-icons/md";
import { IoRestaurantOutline } from "react-icons/io5";

export default function CreateOrder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [loadingFood, setLoadingFood] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [itemType, setItemType] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(100);


  const primaryColor = "#F5C857";
  const primaryLight = "#FEF6E6";
  const primaryDark = "#D4A63A";

  useEffect(() => {
    fetchAllData();
  }, [searchQuery, selectedCategory, currentPage, itemType]);

  const fetchAllData = async () => {
    try {
      setLoadingFood(true);
      setLoadingCategories(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        status: "ACTIVE",
        type: itemType,
      });

      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedCategory !== "all")
        params.append("category_id", selectedCategory);

      const response = await axiosInstance.get(
        `/api/v1/search/?${params.toString()}`
      );

      if (response.data?.data) {
        const allItems = response.data.data;

        // ✅ Extract UNIQUE categories from items
        const uniqueCategories = [
          { id: "all", name: "All Items", icon: FaUtensils },
          ...Array.from(
            new Set(allItems.map((item) => item.category_name).filter(Boolean))
          ).map((catName) => ({
            id: `cat_${catName?.toLowerCase().replace(/\s+/g, "_")}`,
            name: catName,
            icon: FaUtensils,
          })),
        ];
        setCategories(uniqueCategories);

        // ✅ Show ALL items (PRODUCT + COMBO) - Remove VEG filter
        setFoodItems(allItems);

        // Pagination
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalItems(response.data.pagination.total || 0);
        }
      }
    } catch (error) {
      console.error("Search API error:", error);
    } finally {
      setLoadingFood(false);
      setLoadingCategories(false);
    }
  };
  const handleItemTypeChange = (type) => {
    setItemType(type);
    setCurrentPage(1);
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);

      const foodSection = document.querySelector(".food-items-section");
      if (foodSection) {
        foodSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const addToOrder = (item) => {
    setOrderItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [
          ...prev,
          {
            ...item,
            quantity: 1,
            itemId: item.id,
            itemNotes: item.itemNotes || "",
          },
        ];
      }
    });
  };

  const updateQuantity = (itemId, change) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId || item.itemId === itemId) {
            const newQuantity = item.quantity + change;
            if (newQuantity < 1) {
              return null;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromOrder = (itemId) => {
    setOrderItems((prev) =>
      prev.filter((item) => item.id !== itemId && item.itemId !== itemId)
    );
  };

  // const updateItemNotes = (itemId, notes) => {
  //   setOrderItems((prev) =>
  //     prev.map((item) =>
  //       item.id === itemId || item.itemId === itemId
  //         ? { ...item, itemNotes: notes }
  //         : item
  //     )
  //   );
  // };

  const calculateSubtotal = () => {
    return orderItems.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 1),
      0
    );
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };


  //   const confirmOrder = async () => {
  //   if (orderItems.length === 0) {
  //     alert("Please add items to your order");
  //     return;
  //   }

  //   try {
  //     setPlacingOrder(true);

  //     const products = orderItems
  //       .filter((item) => item.item_type === "PRODUCT")
  //       .map((item) => ({
  //         product_id: item.id,
  //         quantity: item.quantity || 1,
  //       }));

  //     const combos = orderItems
  //       .filter((item) => item.item_type === "COMBO")
  //       .map((item) => ({
  //         combo_id: item.id,
  //         quantity: item.quantity || 1,
  //       }));

  //     // FINAL PAYLOAD FOR API
  //     const payload = {
  //       ...(products.length > 0 && { items: products }),
  //       ...(combos.length > 0 && { combos: combos }),
  //       notes: orderNotes || "", // ⭐ add global note
  //     };

  //     const response = await axiosInstance.post("/api/v1/order/add", payload);

  //     if (response.data?.data) {
  //       // Use token from API response instead of generating random
  //       const token = response.data.data.token;

  //       setGeneratedToken(token);
  //       setShowOrderSuccess(true);

  //       // Prepare order data for receipt
  //       const orderData = {
  //         token: token,
  //         orderId: response.data.data.id, // Add order ID from API
  //         items: response.data.data.items.map((item) => ({
  //           name: item.name,
  //           quantity: item.quantity,
  //           price: item.price,
  //           type: item.type,
  //           total: item.price * item.quantity,
  //         })),
  //         combos: orderItems.filter(item => item.item_type === "COMBO").map(combo => ({
  //           name: combo.name,
  //           quantity: combo.quantity,
  //           price: combo.price,
  //           details: combo.details,
  //         })),
  //         subtotal: calculateSubtotal(),
  //         grand_total: response.data.data.grand_total, 
  //         notes: response.data.data.notes || orderNotes,
  //         restaurant: response.data.data.restaurant,
  //         status: response.data.data.status,
  //         timestamp: response.data.data.created_at,
  //         originalItems: orderItems.map((item) => ({
  //           ...item,
  //           price: item.price || 0,
  //           quantity: item.quantity || 1,
  //         })),
  //       };

  //       const printUrl = `/print-receipt?token=${token}&data=${encodeURIComponent(
  //         JSON.stringify(orderData)
  //       )}`;

  //       window.open(printUrl, "_blank");

  //       sendToKitchen(token);

  //       setTimeout(() => {
  //         setOrderItems([]);
  //         setOrderNotes("");
  //         setShowOrderSuccess(false);
  //       }, 5000);
  //     }
  //   } catch (error) {
  //     console.error("Order API Failed:", error);
  //     alert("Failed to place order. Please try again.");
  //   } finally {
  //     setPlacingOrder(false);
  //   }
  // };  
  const navigate = useNavigate();

  // Print & Confirm Flow
  const confirmOrder = async () => {
    if (orderItems.length === 0) {
      alert("Please add items to your order");
      return;
    }

    try {
      setPlacingOrder(true);

      const products = orderItems
        .filter((item) => item.item_type === "PRODUCT")
        .map((item) => ({
          product_id: item.id,
          quantity: item.quantity || 1,
        }));

      const combos = orderItems
        .filter((item) => item.item_type === "COMBO")
        .map((item) => ({
          combo_id: item.id,
          quantity: item.quantity || 1,
        }));

      const payload = {
        ...(products.length > 0 && { items: products }),
        ...(combos.length > 0 && { combos }),
        ...(orderNotes?.trim() && { notes: orderNotes.trim() }),
      };

      // 1. Call order API
      const response = await axiosInstance.post("/api/v1/order/add", payload);

      if (response.data?.data) {
        const token = response.data.data.token;
        const orderId = response.data.data.id;

        setGeneratedToken(token);
        setShowOrderSuccess(true);

        // 2. Prepare order data
        const orderData = {
          id: orderId,
          token: token,
          items: orderItems.map((item) => ({
            name: item.name,
            quantity: item.quantity || 1,
            price: item.price || 0,
            type: item.item_type || "PRODUCT",
            itemNotes: item.itemNotes || "",
          })),
          combos: orderItems
            .filter(item => item.item_type === "COMBO")
            .map(combo => ({
              name: combo.name,
              quantity: combo.quantity || 1,
              price: combo.price || 0,
              details: combo.details || [],
            })),
          subtotal: calculateSubtotal(),
          total: calculateTotal(),
          grand_total: response.data.data.grand_total || calculateTotal(),
          notes: response.data.data.notes || orderNotes,
          restaurant: response.data.data.restaurant || "Vivanta",
          status: response.data.data.status || "PLACED",
          timestamp: response.data.data.created_at || new Date().toLocaleString(),
        };


        const encodedData = encodeURIComponent(JSON.stringify(orderData));

        setTimeout(() => {
          navigate(`/print-receipt?token=${token}&data=${encodedData}`);
        }, 1500);

        sendToKitchen(token);

        // Reset after success
        // setTimeout(() => {
        //   setOrderItems([]);
        //   setOrderNotes("");
        //   setShowOrderSuccess(false);
        // }, 5000); // Moved to navigation logic
      }
    } catch (error) {
      console.error("Order API Failed:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };
  const sendToKitchen = (token) => {
    console.log(`Order #${token} sent to kitchen`);
  };

  const clearOrder = () => {
    setOrderItems([]);
    setOrderNotes("");
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Success Toast */}
      <AnimatePresence>
        {showOrderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl p-6 text-white">
              <div className="flex items-center">
                <div className="shrink-0 bg-white/20 p-3 rounded-full">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-lg">
                    Order #{generatedToken} Confirmed!
                  </h3>
                  <p className="text-sm opacity-90">
                    Order ID: <span className="font-bold text-yellow-300">
                      #{generatedToken}
                    </span> sent to kitchen
                  </p>
                  <p className="text-xs mt-1 opacity-80">
                    Status: PLACED • Preparing your delicious veg meal...
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderSuccess(false)}
                  className="text-white hover:text-yellow-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-amber-100 p-4 md:p-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search vegetarian delights... (Paneer, Biryani, Desserts)"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-14 pr-4 py-4 border border-amber-100 rounded-xl focus:ring-2 focus:ring-[#F5C857] focus:border-[#F5C857] outline-none transition-all bg-amber-50/50 placeholder-gray-400"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {foodItems.length} of {totalItems} items
                </span>
                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Categories + Item Type Section */}
          <motion.div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            </div>

            <div className="flex gap-2 mb-6">
              {["ALL", "PRODUCT", "COMBO"].map((type) => (
                <motion.button
                  key={type}
                  onClick={() => handleItemTypeChange(type)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${itemType === type
                    ? "bg-yellow-500/10 text-[#F5C857] border-[#F5C857] shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-yellow-500 hover:text-yellow-500"
                    }`}
                >
                  {type === "COMBO"
                    ? "🍽️ Combo"
                    : type === "PRODUCT"
                      ? "🍛 Product"
                      : "📦 All"}
                </motion.button>
              ))}
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${selectedCategory === category.id
                    ? "bg-yellow-500/10 text-[#F5C857] border-[#F5C857] shadow-md"
                    : "bg-white text-gray-700 border-gray-200 hover:border-yellow-500 hover:text-yellow-500"
                    }`}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Food Items Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-amber-100 p-4 md:p-6 food-items-section"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Vegetarian Menu
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-gray-600 text-sm">
                  • {totalItems} total items
                </span>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-500">Pure Veg</span>
                  </div>
                </div>
              </div>
            </div>

            {loadingFood ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5C857]"></div>
                <p className="mt-2 text-gray-500">Loading menu items...</p>
              </div>
            ) : foodItems.length === 0 ? (
              <div className="text-center py-10">
                <div className="relative">
                  <div className="w-20 h-20 bg-linear-to-r from-amber-100 to-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <IoRestaurantOutline className="w-10 h-10 text-amber-400" />
                  </div>
                </div>
                <p className="text-gray-500 font-medium">No items found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "Try selecting a different category"}
                </p>
                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {foodItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="group relative bg-linear-to-b from-white to-amber-50 border-2 border-amber-100 rounded-2xl p-5 hover:shadow-2xl hover:border-[#F5C857]"
                    >
                      {/* Category Badge */}
                      {item.category_name && (
                        <div className="absolute -top-2 -right-2 bg-linear-to-r from-gray-600 to-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {item.category_name}
                        </div>
                      )}

                      {item.sku && (
                        <div className="absolute -top-3 -left-2 bg-linear-to-r from-yellow-500 to-yellow-600 text-white rounded-full shadow-lg px-2 py-1.5 flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {item.sku}
                          </span>
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#D4A63A]">
                            {item.name}
                          </h3>
                          {item.item_type === "COMBO" && (
                            <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              Save {item.savings_percentage}%
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {item.details
                            ? "Combo Deal - Multiple items"
                            : item.description || "Delicious vegetarian dish"}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-[#F5C857]">
                            ₹{item.price}
                            {/* {item.market_price && (
                              <span className="text-sm text-gray-400 line-through ml-2">
                                ₹{item.market_price}
                              </span>
                            )} */}
                          </div>
                        </div>
                        <button
                          onClick={() => addToOrder(item)}
                          className="px-4 py-2 bg-linear-to-r from-[#F5C857] to-[#F8D775] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * limit + 1} to{" "}
                        {Math.min(currentPage * limit, totalItems)} of{" "}
                        {totalItems} items
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg ${currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                            }`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum
                                  ? "bg-[#F5C857] text-white"
                                  : "text-gray-700 hover:bg-amber-50"
                                  }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg ${currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                            }`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="sticky top-24 bg-linear-to-b from-white to-amber-50 rounded-2xl shadow-2xl border-2 border-amber-100 overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-linear-to-r from-[#F5C857] via-[#F8D775] to-[#F5C857] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <div className="flex justify-between items-center text-white mb-2">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <MdOutlineFastfood className="w-6 h-6" />
                    </div>
                    Your Order
                  </h2>
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-amber-100">
                  {orderItems.length === 0
                    ? "Add Delicious Food Items to begin"
                    : `${orderItems.length} items • ₹${calculateTotal().toFixed(
                      2
                    )}`}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
              {orderItems.length === 0 ? (
                <div className="text-center py-10">
                  <div className="relative">
                    <div className="w-20 h-20 bg-linear-to-r from-amber-100 to-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <IoRestaurantOutline className="w-10 h-10 text-amber-400" />
                    </div>
                  </div>
                  <p className="text-gray-500 font-medium">
                    Your order is empty
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Explore our vegetarian menu above
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {orderItems.map((item) => (
                    <motion.div
                      key={item.id || item.itemId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-white border border-amber-100 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Top row */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">
                              {item.name}
                            </h4>

                            <span
                              className={`text-xs px-2 py-1 rounded-full font-semibold ${item.item_type === "COMBO"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                                }`}
                            >
                              {item.item_type === "COMBO" ? "Combo" : "Product"}
                            </span>

                            {item.item_type === "COMBO" &&
                              item.savings_percentage && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                  Save {item.savings_percentage}%
                                </span>
                              )}
                          </div>

                          <p className="text-sm text-gray-600">
                            ₹{item.price} each
                          </p>

                          {item.item_type === "COMBO" &&
                            item.details &&
                            item.details.length > 0 && (
                              <p className="mt-1 text-xs text-gray-500">
                                Includes:{" "}
                                {item.details
                                  .map(
                                    (d) => `${d.quantity} × ${d.product_name}`
                                  )
                                  .join(", ")}
                              </p>
                            )}
                        </div>

                        <button
                          onClick={() =>
                            removeFromOrder(item.id || item.itemId)
                          }
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateQuantity(item.id || item.itemId, -1)
                            }
                            className="w-10 h-10 rounded-full bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 flex items-center justify-center hover:bg-amber-100 transition-colors"
                          >
                            <Minus className="w-5 h-5 text-amber-600" />
                          </button>

                          <span className="w-12 text-center font-bold text-xl text-gray-900">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id || item.itemId, 1)
                            }
                            className="w-10 h-10 rounded-full bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 flex items-center justify-center hover:bg-amber-100 transition-colors"
                          >
                            <Plus className="w-5 h-5 text-amber-600" />
                          </button>
                        </div>

                        <div className="font-bold text-2xl text-[#F5C857]">
                          ₹{(item.price || 0) * (item.quantity || 1)}
                        </div>
                      </div>



                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Order Summary */}
            {orderItems.length > 0 && (
              <div className="p-6 bg-linear-to-b from-amber-50/50 to-transparent border-t border-amber-100">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-amber-100">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold text-gray-900">
                      ₹{calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xl font-bold text-gray-900">
                      Total Amount
                    </span>
                    <span className="text-3xl font-bold text-[#F5C857]">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
                {/* Global Order Notes */}
                <div className="mt-4">
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Add Notes for Order (Optional)
                  </label>

                  <textarea
                    placeholder="e.g. make this dish extra spicy"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-4 py-3 text-sm border-2 border-amber-200 rounded-xl 
               focus:ring-2 focus:ring-[#F5C857] focus:border-[#F5C857] 
               outline-none bg-amber-50/40 placeholder-gray-400 
               transition-all resize-none h-24"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={confirmOrder}
                    disabled={placingOrder}
                    className={`w-full px-6 py-4 font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ${placingOrder
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-linear-to-r from-[#F5C857] to-[#F8D775] text-white hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                      }`}
                  >
                    {/* <CheckCircle2 className="w-6 h-6" /> */}
                    {placingOrder
                      ? "Placing Order..."
                      : "CONFIRM & GENERATE RECEIPT"}
                  </button>

                  <button
                    onClick={clearOrder}
                    className="w-full px-6 py-4 bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-xl hover:shadow-lg hover:bg-gray-300 transition-all duration-300"
                  >
                    Clear Order
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 pt-6 border-t border-amber-200"
      >
        <div className="text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-3">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <Leaf className="w-5 h-5" />
              100% Pure Vegetarian Restaurant
            </div>
            <div className="text-amber-600">•</div>
            <div className="flex items-center gap-2 text-amber-700 font-medium">
              <Star className="w-5 h-5" />
              Certified Fresh Ingredients
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Need assistance? Contact kitchen manager at extension 101 • All
            orders are tracked in real-time
          </p>
          <div className="mt-4 text-xs text-gray-500">
            © {new Date().getFullYear()} Restaurant Vivanta • Made with ❤️ for
            vegetarian food lovers
          </div>
        </div>
      </motion.footer>
    </div>
  );
}