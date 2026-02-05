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
  TableProperties,
  RefreshCw,
  User,
} from "lucide-react";
import { FaUtensils } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";
import { MdOutlineFastfood } from "react-icons/md";
import { IoRestaurantOutline } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  // Add these new states
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [selectedMainItem, setSelectedMainItem] = useState(null);
  const [extraItemsForMainItem, setExtraItemsForMainItem] = useState([]);
  const [limit] = useState(1000);

  // TABLE MANAGEMENT STATES
  const [userData, setUserData] = useState(null);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTableSelection, setShowTableSelection] = useState(true); // Show tables first for TABLE restaurants
  const [currentTableOrder, setCurrentTableOrder] = useState(null); // Track current active order for the table
  const [tableOrders, setTableOrders] = useState([]); // Store all orders for the current table

  // POSTPAID MANAGEMENT STATES
  const [activePostpaidOrders, setActivePostpaidOrders] = useState([]);
  const [loadingPostpaidOrders, setLoadingPostpaidOrders] = useState(false);

  const primaryColor = "#F5C857";
  const primaryLight = "#FEF6E6";
  const primaryDark = "#D4A63A";

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/user/");
        if (response.data?.data) {
          setUserData(response.data.data);

          // If restaurant type is TABLE, fetch tables and check for existing assignment
          if (response.data.data.restaurant?.type === "TABLE") {
            await checkExistingTableAssignment(response.data.data.user?.id);
          } else if (response.data.data.restaurant?.type === "POSTPAID") {
            // For POSTPAID, fetch active orders
            await fetchActivePostpaidOrders();
            setShowTableSelection(true); // Show order selection screen
          } else {
            // For QSR (Prepaid), skip table selection
            setShowTableSelection(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Check if user already has a table assigned and restore it
  const checkExistingTableAssignment = async (userId) => {
    try {
      setLoadingTables(true);
      const response = await axiosInstance.get(
        "/api/v1/table/all?page=1&limit=100",
      );

      if (response.data.success && response.data.data) {
        setTables(response.data.data);

        // Just load tables - user can manually click their assigned table to resume
        // No automatic redirection
      }
    } catch (error) {
      console.error("Error checking table assignment:", error);
    } finally {
      setLoadingTables(false);
    }
  };

  // Fetch all tables for TABLE restaurants
  const fetchTables = async () => {
    try {
      setLoadingTables(true);
      const response = await axiosInstance.get(
        "/api/v1/table/all?page=1&limit=100",
      );

      if (response.data.success && response.data.data) {
        setTables(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to fetch tables. Please try again.");
    } finally {
      setLoadingTables(false);
    }
  };

  // Fetch orders for a specific table
  const fetchTableOrders = async (tableId) => {
    try {
      console.log(`Fetching orders for table ${tableId}...`);
      // Add timestamp to prevent caching
      const response = await axiosInstance.get(
        `/api/v1/order/verify/${tableId}?_t=${new Date().getTime()}`,
      );

      console.log("Fetch orders response:", response.data);

      if (response.data?.has_orders && response.data.data?.orders?.length > 0) {
        // DEBUG: Log the statuses of items to verify backend response
        const newOrders = response.data.data.orders;
        newOrders.forEach((o) => {
          o.single_items?.forEach((i) =>
            console.log(`Item ${i.item_id} status: ${i.status}`),
          );
        });

        // Store all orders for displaying
        setTableOrders(newOrders);

        // Find the first pending order
        const pendingOrder = response.data.data.orders.find(
          (order) =>
            order.status !== "COMPLETED" && order.status !== "CANCELLED",
        );

        if (pendingOrder) {
          // Set current table order for adding more items
          setCurrentTableOrder({
            id: pendingOrder.id,
            token: pendingOrder.token,
            grand_total: pendingOrder.grand_total,
          });
        }
      } else {
        // Clear orders if none found
        setTableOrders([]);
      }
    } catch (error) {
      console.error("Error fetching table orders:", error);
      // Don't show error toast, just continue without existing order
      setTableOrders([]);
    }
  };

  // Fetch active orders for POSTPAID
  const fetchActivePostpaidOrders = async () => {
    try {
      setLoadingPostpaidOrders(true);
      // Fetch recent orders
      const response = await axiosInstance.get(
        "/api/v1/order/all?limit=100&status=PLACED",
      );
      if (response.data?.data) {
        // Filter for non-completed orders
        const active = response.data.data.filter(
          (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED",
        );
        setActivePostpaidOrders(active);
      }
    } catch (error) {
      console.error("Error fetching postpaid orders:", error);
    } finally {
      setLoadingPostpaidOrders(false);
    }
  };

  // Select a postpaid order
  const handlePostpaidOrderSelect = async (order) => {
    try {
      // Set current order
      setCurrentTableOrder({
        id: order.id,
        token: order.token,
        grand_total: order.grand_total,
      });

      // Fetch full details for this order to populate items
      const response = await axiosInstance.get(`/api/v1/order/${order.id}`);
      if (response.data?.data) {
        setTableOrders([response.data.data]); // Set as single table order for compatibility
        setShowTableSelection(false); // Go to main view
      }
    } catch (error) {
      console.error("Error selecting order:", error);
      toast.error("Failed to load order details");
    }
  };

  // Settle Postpaid Order
  const handleSettleOrder = async () => {
    if (!currentTableOrder) return;

    const confirmed = window.confirm(
      `Are you sure you want to settle Order #${currentTableOrder.token}? This will mark it as PAID and COMPLETED.`,
    );

    if (!confirmed) return;

    try {
      const response = await axiosInstance.put("/api/v1/order/complete", {
        order_id: currentTableOrder.id,
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Order settled successfully!");

        // Clear state
        setOrderItems([]);
        setOrderNotes("");
        setCurrentTableOrder(null);
        setTableOrders([]);

        // Go back to list and refresh
        setShowTableSelection(true);
        fetchActivePostpaidOrders();
      }
    } catch (error) {
      console.error("Error settling order:", error);
      toast.error(error.response?.data?.message || "Failed to settle order");
    }
  };

  const handleCancelOrder = async () => {
    if (!currentTableOrder) return;

    if (
      !window.confirm(
        "Are you sure you want to CANCEL this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await axiosInstance.put("/api/v1/order/cancel", {
        order_id: currentTableOrder.id,
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Order cancelled successfully");

        // Reset state
        setOrderItems([]);
        setOrderNotes("");
        setCurrentTableOrder(null);
        setTableOrders([]);

        // Refresh list
        if (userData?.restaurant?.type === "POSTPAID") {
          setShowTableSelection(true); // Go back to list
          fetchActivePostpaidOrders();
        } else {
          // For TABLE - Navigate back to table grid
          setSelectedTable(null); // Clear selected table
          setShowTableSelection(true); // Show grid
          fetchTables(); // Refresh grid status
        }
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  // Assign waiter to selected table
  const handleTableSelect = async (table) => {
    // Check if table is already assigned to current user
    if (
      table.assign_waiter === userData?.user?.id &&
      table.work_status === "OCCUPIED"
    ) {
      // Just resume this table without calling API
      setSelectedTable(table);
      setShowTableSelection(false);

      // Check for existing orders
      await fetchTableOrders(table.id);
      return;
    }

    // Otherwise, assign waiter to table
    try {
      const response = await axiosInstance.post("/api/v1/table/assign-waiter", {
        table_id: table.id.toString(),
      });

      if (response.data.success) {
        setSelectedTable(response.data.data);
        setShowTableSelection(false); // Hide table selection, show menu
        toast.success(`Assigned to Table #${response.data.data.number}`);

        // Check for existing orders on this table
        await fetchTableOrders(response.data.data.id);
      }
    } catch (error) {
      console.error("Error assigning waiter:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to assign table. Please try again.",
      );
    }
  };

  // Go back to table selection without releasing table
  const handleBackToTables = () => {
    setShowTableSelection(true);
    // Don't clear selectedTable - keep it assigned

    // For POSTPAID, refresh active orders list
    if (userData?.restaurant?.type === "POSTPAID") {
      fetchActivePostpaidOrders();
    }
  };

  // Print invoice for current table
  const handlePrintInvoice = async () => {
    if (!selectedTable || !currentTableOrder) {
      toast.warning("No active order to print");
      return;
    }

    try {
      // Fetch detailed order information
      const response = await axiosInstance.get(
        `/api/v1/order/${currentTableOrder.id}`,
      );

      if (response.data?.data) {
        const orderDetails = response.data.data;

        // Filter out CANCELLED items and format for receipt
        const validSingleItems = (orderDetails.single_items || [])
          .filter((item) => item.status !== "CANCELLED")
          .map((item) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
            total: item.total_price,
            notes: item.notes,
            extra: item.extra
              ? item.extra.map((ex) => ({
                  name: ex.name,
                  quantity: ex.quantity,
                  price: ex.unit_price || ex.price,
                }))
              : [],
          }));

        const validComboItems = (orderDetails.combo_items || [])
          .filter((item) => item.status !== "CANCELLED")
          .map((item) => ({
            name: item.combo_name,
            quantity: item.quantity,
            price: item.unit_price,
            total: item.total_price,
            notes: item.notes,
            extra: [], // Combos usually don't have separate extras structure the same way
          }));

        const combinedItems = [...validSingleItems, ...validComboItems];

        // Navigate to print receipt page with detailed order data
        const orderData = {
          id: orderDetails.id,
          token: orderDetails.token,
          status: orderDetails.status,

          grand_total: orderDetails.grand_total,
          notes: orderDetails.notes,
          created_at: orderDetails.created_at,
          restaurant: orderDetails.restaurant,
          items: combinedItems, // Pass unified items array
          tableNumber: selectedTable.number,
        };

        const encodedData = encodeURIComponent(JSON.stringify(orderData));
        window.open(
          `/print-receipt?token=${orderDetails.token}&data=${encodedData}`,
          "_blank",
        );

        toast.success("Invoice opened for printing");
      } else {
        toast.warning("No order details found");
      }
    } catch (error) {
      console.error("Error fetching order details for invoice:", error);
      toast.error("Failed to load invoice. Please try again.");
    }
  };

  // Release table / Clear State
  const handleReleaseTable = async () => {
    // If POSTPAID, just clear state
    if (userData?.restaurant?.type === "POSTPAID") {
      setSelectedTable(null);
      setCurrentTableOrder(null);
      setOrderItems([]);
      setOrderNotes("");
      setShowTableSelection(true);
      fetchActivePostpaidOrders();
      return;
    }

    if (!selectedTable) return;

    const confirmed = window.confirm(
      `Are you sure you want to release Table #${selectedTable.number}? All orders will be marked as completed.`,
    );

    if (!confirmed) return;

    try {
      const response = await axiosInstance.post("/api/v1/table/release", {
        table_id: selectedTable.id.toString(),
      });

      if (response.data.success) {
        toast.success(`Table #${selectedTable.number} released successfully`);
        setSelectedTable(null);
        setCurrentTableOrder(null); // Clear current order
        setOrderItems([]);
        setOrderNotes("");
        setShowTableSelection(true); // Show table selection again
        fetchTables(); // Refresh table list
      }
    } catch (error) {
      console.error("Error releasing table:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to release table. Please try again.",
      );
    }
  };

  // Update Item Status
  const updateItemStatus = async (orderId, itemId, newStatus, tableId) => {
    try {
      const response = await axiosInstance.put("/api/v1/order/status", {
        order_id: orderId,
        item_id: itemId,
        status: newStatus,
      });

      toast.success(`Item status updated to ${newStatus}`);

      console.log(
        "Status updated. Waiting 500ms then refreshing for table:",
        tableId || selectedTable?.id,
      );

      // Refresh orders with a small delay to ensure DB update is reflected
      setTimeout(async () => {
        const tid = tableId || selectedTable?.id;
        if (tid && userData?.restaurant?.type === "TABLE") {
          await fetchTableOrders(tid);
          fetchTables();
        } else if (userData?.restaurant?.type === "POSTPAID") {
          await fetchActivePostpaidOrders();
          // Refresh specifics for this order
          try {
            const updatedOrder = await axiosInstance.get(
              `/api/v1/order/${orderId}`,
            );
            if (updatedOrder.data?.data) {
              setTableOrders([updatedOrder.data.data]);
            }
          } catch (e) {
            console.error("Failed to refresh order details", e);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error updating item status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update item status.",
      );
    }
  };

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
        `/api/v1/search/?${params.toString()}`,
      );

      if (response.data?.data) {
        const allItems = response.data.data;

        const uniqueCategories = [
          { id: "all", name: "All Items", icon: FaUtensils },
          ...Array.from(
            new Set(allItems.map((item) => item.category_name).filter(Boolean)),
          ).map((catName) => ({
            id: `cat_${catName?.toLowerCase().replace(/\s+/g, "_")}`,
            name: catName,
            icon: FaUtensils,
          })),
        ];
        setCategories(uniqueCategories);

        setFoodItems(allItems);

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
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      } else {
        return [
          ...prev,
          {
            ...item,
            quantity: 1,
            itemId: item.id,
            itemNotes: item.itemNotes || "",
            extra: [],
          },
        ];
      }
    });
  };

  const openExtraModal = (mainItem) => {
    setSelectedMainItem(mainItem);
    setExtraItemsForMainItem(mainItem.extra || []);
    setShowExtraModal(true);
  };

  const closeExtraModal = () => {
    setShowExtraModal(false);
    setSelectedMainItem(null);
    setExtraItemsForMainItem([]);
  };

  const addExtraToMainItem = (extraItem) => {
    setExtraItemsForMainItem((prev) => {
      const exists = prev.find((i) => i.id === extraItem.id);
      if (exists) {
        return prev.map((i) =>
          i.id === extraItem.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      } else {
        return [
          ...prev,
          {
            ...extraItem,
            quantity: 1,
            itemId: extraItem.id,
          },
        ];
      }
    });
  };

  const updateExtraQuantity = (extraItemId, change) => {
    setExtraItemsForMainItem((prev) =>
      prev
        .map((item) => {
          if (item.id === extraItemId || item.itemId === extraItemId) {
            const newQuantity = item.quantity + change;
            if (newQuantity < 1) {
              return null;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const removeExtraFromMainItem = (extraItemId) => {
    setExtraItemsForMainItem((prev) =>
      prev.filter(
        (item) => item.id !== extraItemId && item.itemId !== extraItemId,
      ),
    );
  };

  const saveExtraItems = () => {
    if (selectedMainItem) {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.id === selectedMainItem.id
            ? { ...item, extra: extraItemsForMainItem }
            : item,
        ),
      );
    }
    closeExtraModal();
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
        .filter(Boolean),
    );
  };

  const removeFromOrder = (itemId) => {
    setOrderItems((prev) =>
      prev.filter((item) => item.id !== itemId && item.itemId !== itemId),
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

  // const calculateSubtotal = () => {
  //   return orderItems.reduce(
  //     (total, item) => total + (item.price || 0) * (item.quantity || 1),
  //     0
  //   );
  // };

  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => {
      const mainItemTotal = (item.price || 0) * (item.quantity || 1);
      const extraTotal = item.extra
        ? item.extra.reduce(
            (extraSum, extra) =>
              extraSum + (extra.price || 0) * (extra.quantity || 1),
            0,
          ) * (item.quantity || 1)
        : 0;
      return total + mainItemTotal + extraTotal;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const navigate = useNavigate();

  // Handle New Postpaid Order
  const handleNewPostpaidOrder = () => {
    setCurrentTableOrder(null);
    setOrderItems([]);
    setShowTableSelection(false);
  };

  // Print & Confirm Flow
  const confirmOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Please add items to your order");
      return;
    }

    // For TABLE type restaurants, check if table is selected
    const isTableRestaurant = userData?.restaurant?.type === "TABLE";
    if (isTableRestaurant && !selectedTable) {
      toast.error("Please select a table first");
      return;
    }

    try {
      setPlacingOrder(true);

      const products = orderItems
        .filter((item) => item.item_type === "PRODUCT")
        .map((item) => ({
          product_id: item.id,
          quantity: item.quantity || 1,
          extra:
            item.extra && item.extra.length > 0
              ? item.extra.map((extra) => ({
                  product_id: extra.id,
                  quantity: extra.quantity || 1,
                }))
              : null,
        }));

      const combos = orderItems
        .filter((item) => item.item_type === "COMBO")
        .map((item) => ({
          combo_id: item.id,
          quantity: item.quantity || 1,
        }));

      // Check if we're adding to existing order or creating new one
      // Check if we're adding to existing order or creating new one
      if (
        currentTableOrder &&
        (isTableRestaurant || userData?.restaurant?.type === "POSTPAID")
      ) {
        // Add items to existing order
        const payload = {
          order_id: currentTableOrder.id,
          ...(products.length > 0 && { items: products }),
          ...(combos.length > 0 && { combos }),
        };

        const response = await axiosInstance.put(
          "/api/v1/order/add-items",
          payload,
        );

        if (response.data?.data) {
          toast.success(
            `Items added to order! New total: ₹${response.data.data.new_grand_total}`,
          );

          // Clear order items after adding
          setOrderItems([]);
          setOrderNotes("");

          // Update current table order with new total
          setCurrentTableOrder({
            ...currentTableOrder,
            grand_total: response.data.data.new_grand_total,
          });

          // Refresh orders list to show updated order
          if (isTableRestaurant && selectedTable) {
            await fetchTableOrders(selectedTable.id);
          } else if (userData?.restaurant?.type === "POSTPAID") {
            await fetchActivePostpaidOrders();
            // Refresh specifics for this order
            const updatedOrder = await axiosInstance.get(
              `/api/v1/order/${currentTableOrder.id}`,
            );
            if (updatedOrder.data?.data) {
              setTableOrders([updatedOrder.data.data]);
            }
          }
        }
      } else {
        // Create new order
        const payload = {
          ...(products.length > 0 && { items: products }),
          ...(combos.length > 0 && { combos }),
          ...(orderNotes?.trim() && { notes: orderNotes.trim() }),
        };

        // Add table-specific fields for TABLE restaurants
        if (isTableRestaurant && selectedTable) {
          payload.order_type = "TABLE";
          payload.table_id = selectedTable.id;
          // payload.payment_status = "PENDING";
        }

        // Call order API using axiosInstance
        const response = await axiosInstance.post("/api/v1/order/add", payload);

        if (response.data?.data) {
          const token = response.data.data.token;
          const orderId = response.data.data.id;

          setGeneratedToken(token);
          setShowOrderSuccess(true);

          // Store current table order for future additions
          if (
            (isTableRestaurant && selectedTable) ||
            userData?.restaurant?.type === "POSTPAID"
          ) {
            setCurrentTableOrder({
              id: orderId,
              token: token,
              grand_total: response.data.data.grand_total,
            });

            // Refresh orders list to show new order
            if (isTableRestaurant && selectedTable) {
              await fetchTableOrders(selectedTable.id);
            } else {
              await fetchActivePostpaidOrders();
              // Refresh specifics for this newly created order
              const updatedOrder = await axiosInstance.get(
                `/api/v1/order/${orderId}`,
              );
              if (updatedOrder.data?.data) {
                setTableOrders([updatedOrder.data.data]);
              }
            }
          }

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
              extra: item.extra || [],
            })),
            combos: orderItems
              .filter((item) => item.item_type === "COMBO")
              .map((combo) => ({
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
            timestamp:
              response.data.data.created_at || new Date().toLocaleString(),
            tableNumber: selectedTable?.number || null,
          };

          const encodedData = encodeURIComponent(JSON.stringify(orderData));

          // For TABLE/POSTPAID messages
          if (isTableRestaurant || userData?.restaurant?.type === "POSTPAID") {
            // Just clear the order items after success
            setTimeout(() => {
              setOrderItems([]);
              setOrderNotes("");
              setShowOrderSuccess(false);
            }, 2000);
          } else {
            // For QSR (Prepaid), auto-navigate to print
            setTimeout(() => {
              navigate(`/print-receipt?token=${token}&data=${encodedData}`);
            }, 1500);
          }

          sendToKitchen(token);

          // Reset after success
          // setTimeout(() => {
          //   setOrderItems([]);
          //   setOrderNotes("");
          //   setShowOrderSuccess(false);
          // }, 5000); // Moved to navigation logic
        }
      }
    } catch (error) {
      console.error("Order API Failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(errorMessage);
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
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

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
                    Order ID:{" "}
                    <span className="font-bold text-yellow-300">
                      #{generatedToken}
                    </span>{" "}
                    sent to kitchen
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

      {/* Selection Screen (Table or Active Orders) */}
      {showTableSelection ? (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  {userData?.restaurant?.type === "POSTPAID" ? (
                    <>
                      <Clock className="w-8 h-8 text-amber-500" />
                      Active Orders
                    </>
                  ) : (
                    <>
                      <TableProperties className="w-8 h-8 text-amber-500" />
                      Select a Table
                    </>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {userData?.restaurant?.type === "POSTPAID"
                    ? "Select an existing order to modify or start a new one"
                    : "Choose a table to start taking orders"}
                </p>
              </div>
              <button
                onClick={
                  userData?.restaurant?.type === "POSTPAID"
                    ? fetchActivePostpaidOrders
                    : fetchTables
                }
                disabled={loadingTables || loadingPostpaidOrders}
                className="px-4 py-2 bg-white border-2 border-amber-200 text-gray-700 font-semibold rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-all flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loadingTables || loadingPostpaidOrders ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </motion.div>

          {/* Content Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {loadingTables || loadingPostpaidOrders ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : userData?.restaurant?.type === "POSTPAID" ? (
              /* POSTPAID - Active Orders Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* New Order Card */}
                <div
                  onClick={handleNewPostpaidOrder}
                  // className="bg-white rounded-2xl p-6 shadow-sm border-2 border-dashed border-amber-300 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:border-amber-500 transition-all min-h-[200px]"
                  className="bg-white rounded-2xl p-6 shadow-sm border-2 border-dashed border-amber-300 
             flex flex-col items-center justify-center cursor-pointer 
             hover:shadow-md hover:border-amber-500 
              transition-colors duration-200 
             min-h-[200px]"
                >
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">New Order</h3>
                  <p className="text-gray-500">Start fresh order</p>
                </div>

                {/* Active Orders List */}
                {activePostpaidOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handlePostpaidOrderSelect(order)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all min-h-[200px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                          Token #{order.token}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                          <span className="text-gray-600 text-sm">Status</span>
                          <span
                            className={`text-sm font-bold ${
                              order.status === "READY"
                                ? "text-green-600"
                                : order.status === "PREPARING"
                                  ? "text-amber-600"
                                  : "text-blue-600"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                          <span className="text-gray-600 text-sm">Items</span>
                          <span className="font-semibold text-gray-800">
                            {(order.single_items?.length || 0) +
                              (order.combo_items?.length || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                      <div className="text-xs text-gray-400">Total Amount</div>
                      <div className="font-bold text-2xl text-gray-900">
                        ₹{order.grand_total}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* TABLE - Tables Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables.map((table) => (
                  <motion.div
                    key={table.id}
                    whileHover={{
                      scale:
                        table.assign_waiter === userData?.user?.id ||
                        table.work_status === "AVAILABLE"
                          ? 1.02
                          : 1,
                    }}
                    className={`relative bg-white border-2 rounded-2xl p-6 shadow-lg transition-all ${
                      table.assign_waiter === userData?.user?.id
                        ? "border-blue-400 hover:border-blue-500 cursor-pointer hover:shadow-xl"
                        : table.work_status === "AVAILABLE"
                          ? "border-green-200 hover:border-green-400 cursor-pointer hover:shadow-xl"
                          : "border-gray-300 opacity-60 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (
                        table.assign_waiter === userData?.user?.id ||
                        table.work_status === "AVAILABLE"
                      ) {
                        handleTableSelect(table);
                      }
                    }}
                  >
                    {/* Status Badge */}
                    <div className="absolute -top-3 -right-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-md ${
                          table.work_status === "AVAILABLE"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                      >
                        {table.work_status === "AVAILABLE" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            AVAILABLE
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            OCCUPIED
                          </>
                        )}
                      </span>
                    </div>

                    {/* Table Number */}
                    <div className="flex items-center justify-center mb-4">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center ${
                          table.work_status === "AVAILABLE"
                            ? "bg-green-50 border-4 border-green-300"
                            : "bg-gray-50 border-4 border-gray-300"
                        }`}
                      >
                        <span className="text-3xl font-bold text-gray-800">
                          {table.number}
                        </span>
                      </div>
                    </div>

                    {/* Table Info */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Table #{table.number}
                      </h3>
                      {table.assign_waiter === userData?.user?.id ? (
                        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-green-600">
                          <User className="w-4 h-4" />
                          <span>Your Table</span>
                        </div>
                      ) : table.assign_waiter ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>Occupied</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">
                          Click to assign
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        <>
          {/* Info Banner - Table or Order */}
          {(selectedTable ||
            (currentTableOrder &&
              userData?.restaurant?.type === "POSTPAID")) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 mr-96"
            >
              <div className="rounded-xl p-4 border-2 bg-green-50 border-green-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TableProperties className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">
                      {userData?.restaurant?.type === "TABLE"
                        ? `Table #${selectedTable.number} - Active`
                        : `Order #${currentTableOrder.token} - Active`}
                    </p>
                    {currentTableOrder ? (
                      <p className="text-sm text-green-700">
                        Total: ₹{currentTableOrder.grand_total}
                      </p>
                    ) : (
                      <p className="text-sm text-green-700">
                        Ready to take first order
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBackToTables}
                    className="px-4 py-2 bg-linear-to-r from-amber-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-yellow-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Back to List
                  </button>
                  {/* <button
                    onClick={handlePrintInvoice}
                    className="px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Invoice
                  </button> */}
                  {/* Cancel Button - Available for both TABLE and POSTPAID if order exists */}
                  {currentTableOrder && (
                    <button
                      onClick={handleCancelOrder}
                      className="px-4 py-2 bg-linear-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      Cancel Order
                    </button>
                  )}
                  {userData?.restaurant?.type === "POSTPAID" ? (
                    <button
                      onClick={handleSettleOrder}
                      disabled={tableOrders.some(
                        (order) =>
                          order.status !== "COMPLETED" &&
                          (order.single_items || [])
                            .concat(order.combo_items || [])
                            .some(
                              (item) =>
                                !["DELIVERED", "CANCELLED"].includes(
                                  item.status,
                                ),
                            ),
                      )}
                      className={`px-4 py-2 bg-linear-to-r text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all ${
                        tableOrders.some(
                          (order) =>
                            order.status !== "COMPLETED" &&
                            (order.single_items || [])
                              .concat(order.combo_items || [])
                              .some(
                                (item) =>
                                  !["DELIVERED", "CANCELLED"].includes(
                                    item.status,
                                  ),
                              ),
                        )
                          ? "from-gray-400 to-gray-500 cursor-not-allowed"
                          : "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      }`}
                    >
                      Settle Order
                    </button>
                  ) : (
                    <button
                      onClick={handleReleaseTable}
                      disabled={tableOrders.some(
                        (order) =>
                          order.status !== "COMPLETED" &&
                          (order.single_items || [])
                            .concat(order.combo_items || [])
                            .some(
                              (item) =>
                                !["DELIVERED", "CANCELLED"].includes(
                                  item.status,
                                ),
                            ),
                      )}
                      className={`px-4 py-2 bg-linear-to-r text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all ${
                        tableOrders.some(
                          (order) =>
                            order.status !== "COMPLETED" &&
                            (order.single_items || [])
                              .concat(order.combo_items || [])
                              .some(
                                (item) =>
                                  !["DELIVERED", "CANCELLED"].includes(
                                    item.status,
                                  ),
                              ),
                        )
                          ? "from-gray-400 to-gray-500 cursor-not-allowed"
                          : "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      }`}
                    >
                      Release Table
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Section - Show orders for the selected table or postpaid order */}
          {(selectedTable ||
            (currentTableOrder && userData?.restaurant?.type === "POSTPAID")) &&
            tableOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <ChefHat className="w-6 h-6 text-blue-600" />
                      Active Orders{" "}
                      {userData?.restaurant?.type === "TABLE" && selectedTable
                        ? `for Table #${selectedTable.number}`
                        : ""}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                      {tableOrders.length} Order
                      {tableOrders.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {tableOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 rounded-lg p-4 border-gray-300 bg-gray-50"
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-white border-2 border-current rounded-lg px-3 py-1">
                              <span className="text-lg font-bold text-gray-900">
                                {/* Show Table No if Table Restaurant, else Token */}
                                {order.restaurant?.type === "TABLE" &&
                                selectedTable?.number ? (
                                  <>Table: {selectedTable.number}</>
                                ) : (
                                  <>Token: #{order.token}</>
                                )}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Order ID: {order.id}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                order.status === "PLACED"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "PREPARING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "READY"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "SERVED"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              Order Status : {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2 mb-3">
                          {order.single_items &&
                            order.single_items.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                  Items:
                                </h4>
                                {order.single_items.map((item, idx) => (
                                  <div
                                    key={item.item_id || idx}
                                    className="flex items-center justify-between bg-white rounded-lg p-2 mb-2 border border-gray-200"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">
                                          {item.product_name}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            item.status === "PENDING"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : item.status === "PREPARING"
                                                ? "bg-blue-100 text-blue-800"
                                                : item.status === "READY"
                                                  ? "bg-green-100 text-green-800"
                                                  : item.status === "CANCELLED"
                                                    ? "bg-red-100 text-red-800"
                                                    : item.status ===
                                                        "DELIVERED"
                                                      ? "bg-gray-100 text-gray-800"
                                                      : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {item.status}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        ₹{item.price} × {item.quantity}
                                      </p>
                                      {item.notes && (
                                        <p className="text-xs text-gray-600 italic mt-1">
                                          Note: {item.notes}
                                        </p>
                                      )}
                                      {item.extra && item.extra.length > 0 && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          Extras: {item.extra.length} item(s)
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                      {item.status === "PENDING" && (
                                        <button
                                          onClick={() =>
                                            updateItemStatus(
                                              order.id,
                                              item.item_id,
                                              "CANCELLED",
                                              selectedTable?.id,
                                            )
                                          }
                                          className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                      {item.status === "READY" ||
                                      ((userData?.restaurant?.type ===
                                        "TABLE" ||
                                        userData?.restaurant?.type ===
                                          "POSTPAID") &&
                                        !["DELIVERED", "CANCELLED"].includes(
                                          item.status,
                                        )) ? (
                                        <button
                                          onClick={() =>
                                            updateItemStatus(
                                              order.id,
                                              item.item_id,
                                              "DELIVERED",
                                              selectedTable?.id,
                                            )
                                          }
                                          className="px-2 py-1 text-xs font-bold text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
                                        >
                                          Delivered
                                        </button>
                                      ) : null}
                                      <p className="font-bold text-gray-900">
                                        ₹{item.total}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          {order.combo_items &&
                            order.combo_items.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                  Combos:
                                </h4>
                                {order.combo_items.map((combo, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between bg-white rounded-lg p-2 mb-2 border border-orange-200"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">
                                          {combo.combo_name}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                            combo.status === "PENDING"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : combo.status === "PREPARING" ||
                                                  combo.status === "COOKING"
                                                ? "bg-blue-100 text-blue-800"
                                                : combo.status === "READY"
                                                  ? "bg-green-100 text-green-800"
                                                  : combo.status === "CANCELLED"
                                                    ? "bg-red-100 text-red-800"
                                                    : combo.status ===
                                                        "DELIVERED"
                                                      ? "bg-gray-100 text-gray-800"
                                                      : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {combo.status || "PENDING"}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        ₹{combo.price} × {combo.quantity}
                                      </p>
                                      {combo.notes && (
                                        <p className="text-xs text-gray-600 italic mt-1">
                                          Note: {combo.notes}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                      {(!combo.status ||
                                        combo.status === "PENDING") && (
                                        <button
                                          onClick={() =>
                                            updateItemStatus(
                                              order.id,
                                              combo.item_id,
                                              "CANCELLED",
                                              selectedTable?.id,
                                            )
                                          }
                                          className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                      {combo.status === "READY" ||
                                      ((userData?.restaurant?.type ===
                                        "TABLE" ||
                                        userData?.restaurant?.type ===
                                          "POSTPAID") &&
                                        !["DELIVERED", "CANCELLED"].includes(
                                          combo.status,
                                        )) ? (
                                        <button
                                          onClick={() =>
                                            updateItemStatus(
                                              order.id,
                                              combo.item_id,
                                              "DELIVERED",
                                              selectedTable?.id,
                                            )
                                          }
                                          className="px-2 py-1 text-xs font-bold text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
                                        >
                                          Delivered
                                        </button>
                                      ) : null}
                                      <p className="font-bold text-gray-900">
                                        ₹{combo.total}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>

                        {/* Order Total */}
                        <div className="pt-3 border-t-2 border-dashed border-gray-300">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              Grand Total:
                            </span>
                            <span className="text-2xl font-bold text-green-600">
                              ₹{order.grand_total}
                            </span>
                          </div>
                          {order.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              Order Note: {order.notes}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

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
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${
                        itemType === type
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
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        selectedCategory === category.id
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
                          className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-amber-300 transition-all duration-300"
                        >
                          {/* Image Preview */}
                          <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                            {item.image ? (
                              <img
                                src={`${import.meta.env.VITE_IMAGE_BASE_URL}/${
                                  item.image
                                }`}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}

                            {/* Fallback / Placeholder (shown if no image or error) */}
                            <div
                              className={`w-full h-full flex items-center justify-center bg-amber-50 text-amber-300 ${item.image ? "hidden" : "flex"}`}
                            >
                              {item.item_type === "COMBO" ? (
                                <MdOutlineFastfood size={48} />
                              ) : (
                                <IoRestaurantOutline size={48} />
                              )}
                            </div>

                            {/* Category Badge */}
                            {item.category_name && (
                              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                                {item.category_name}
                              </div>
                            )}
                            {/* SKU Badge */}
                            {item.sku && (
                              <div className="absolute top-2 left-2 bg-[#F5C857] text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                {item.sku}
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#D4A63A] line-clamp-1">
                                {item.name}
                              </h3>
                            </div>

                            {item.item_type === "COMBO" && (
                              <div className="mb-2">
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                  Save {item.savings_percentage}%
                                </span>
                              </div>
                            )}

                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                              {item.details
                                ? "Combo Deal - Multiple items"
                                : item.description ||
                                  "Delicious vegetarian dish"}
                            </p>

                            <div className="flex justify-between items-center mt-auto">
                              <div className="flex items-center gap-4">
                                <div className="text-xl font-bold text-gray-900">
                                  ₹{item.price}
                                </div>
                              </div>
                              <button
                                onClick={() => addToOrder(item)}
                                className="px-4 py-2 bg-[#F5C857] text-white font-semibold rounded-xl hover:bg-[#d4a63a] hover:shadow-lg transform active:scale-95 transition-all flex items-center gap-2"
                              >
                                <Plus className="w-5 h-5" />
                                Add
                              </button>
                            </div>
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
                              className={`p-2 rounded-lg ${
                                currentPage === 1
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
                                    className={`w-10 h-10 rounded-lg font-medium ${
                                      currentPage === pageNum
                                        ? "bg-[#F5C857] text-white"
                                        : "text-gray-700 hover:bg-amber-50"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              },
                            )}

                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className={`p-2 rounded-lg ${
                                currentPage === totalPages
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
                            2,
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
                                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                    item.item_type === "COMBO"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {item.item_type === "COMBO"
                                    ? "Combo"
                                    : "Product"}
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
                                        (d) =>
                                          `${d.quantity} × ${d.product_name}`,
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
                          {item.item_type === "PRODUCT" && (
                            <button
                              onClick={() => openExtraModal(item)}
                              className="w-full mb-3 px-3 py-2 
      bg-yellow-50 
      border-2 border-dashed border-yellow-400 
      text-yellow-700 text-sm rounded-lg 
      hover:bg-yellow-100 
      transition-all 
      flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4 text-yellow-600" />
                              Add Extra Items
                              {item.extra && item.extra.length > 0 && (
                                <span className="bg-yellow-400 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                  {item.extra.length} extras
                                </span>
                              )}
                            </button>
                          )}

                          {/* Extras List */}
                          {item.extra && item.extra.length > 0 && (
                            <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-yellow-800">
                                  Extras:
                                </span>

                                <button
                                  onClick={() => openExtraModal(item)}
                                  className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                                >
                                  Edit
                                </button>
                              </div>

                              <div className="space-y-1 max-h-20 overflow-y-auto">
                                {item.extra.map((extra) => (
                                  <div
                                    key={extra.id}
                                    className="flex justify-between items-center 
                                   text-md text-yellow-600 
                                  bg-white 
                                  px-2 py-1 
                                  rounded 
                                  border border-yellow-100"
                                  >
                                    <span>
                                      {extra.name} × {extra.quantity}
                                    </span>
                                    <span className="font-semibold">
                                      ₹{(extra.price || 0) * extra.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                {/* Order Summary */}
                {orderItems.length > 0 && (
                  <div className="p-6 bg-linear-to-b from-amber-50/50 to-transparent border-t border-amber-100">
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center ">
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
                        className={`w-full px-6 py-4 font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                          placingOrder
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
            {/* Extra Items Modal - NEW */}
            <AnimatePresence>
              {showExtraModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 mt-7"
                  onClick={closeExtraModal}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="bg-linear-to-r from-yellow-400 to-yellow-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-xl">
                            <Plus className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              Add Extra Items
                            </h3>
                            <p className="text-yellow-100">
                              {selectedMainItem?.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={closeExtraModal}
                          className="p-2 hover:bg-white/20 rounded-xl transition-all"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                      {loadingFood ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                          <p className="mt-2 text-gray-500">
                            Loading extra items...
                          </p>
                        </div>
                      ) : foodItems.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">
                            No extra items available
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {foodItems
                            .filter(
                              (foodItem) => foodItem.item_type === "PRODUCT",
                            )
                            .map((extraItem) => (
                              <div
                                key={extraItem.id}
                                className="group relative 
                      bg-linear-to-b from-white to-yellow-50 
                      border-2 border-yellow-100 
                      rounded-xl p-4 
                      hover:shadow-lg hover:border-yellow-300 
                      transition-all cursor-pointer"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                                      {extraItem.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 mb-2">
                                      {extraItem.description || "Extra item"}
                                    </p>
                                    <div className="text-lg font-bold text-yellow-600">
                                      ₹{extraItem.price}
                                    </div>
                                  </div>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center justify-between pt-2 border-t border-yellow-100">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        updateExtraQuantity(extraItem.id, -1)
                                      }
                                      className="w-8 h-8 rounded-full 
                            bg-yellow-50 
                            border border-yellow-200 
                            flex items-center justify-center 
                            hover:bg-yellow-100 
                            transition-colors 
                            text-yellow-700"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>

                                    <span className="w-8 text-center font-bold text-lg text-gray-900">
                                      {extraItemsForMainItem.find(
                                        (e) => e.id === extraItem.id,
                                      )?.quantity || 0}
                                    </span>

                                    <button
                                      onClick={() =>
                                        addExtraToMainItem(extraItem)
                                      }
                                      className="w-8 h-8 rounded-full 
                            bg-linear-to-r from-yellow-400 to-yellow-500 
                            text-white 
                            flex items-center justify-center 
                            hover:shadow-md 
                            transition-all"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 bg-yellow-50 border-t border-yellow-200 flex gap-3 justify-end">
                      <button
                        onClick={closeExtraModal}
                        className="px-6 py-3 
              border border-gray-300 
              text-gray-700 
              rounded-xl 
              hover:bg-gray-100 
              transition-all font-medium"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={saveExtraItems}
                        className="px-6 py-3 
              bg-linear-to-r from-yellow-400 to-yellow-500 
              text-white 
              rounded-xl 
              hover:shadow-lg hover:scale-[1.02] 
              transition-all 
              font-semibold 
              flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Add item
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
                © {new Date().getFullYear()} Restaurant Vivanta • Made with ❤️
                for vegetarian food lovers
              </div>
            </div>
          </motion.footer>
        </>
      )}
    </div>
  );
}
