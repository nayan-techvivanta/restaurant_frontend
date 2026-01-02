import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiDollarSign,
  FiStar,
  FiImage,
  FiPackage,
  FiSave,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiShoppingBag,
  FiPercent,
  FiTag,
} from "react-icons/fi";
import MenuIcon from "../../assets/images/Loginpage/logo.png";
import { FaIndianRupeeSign } from "react-icons/fa6";
import ComboIcon from "../../assets/images/comboicon.png";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Switch, FormControlLabel, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { MdCategory, MdFastfood, MdFoodBank } from "react-icons/md";
import axiosInstance from "../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialData = {
  categories: [],
  menuItems: [],
  combos: [],
};

const YellowSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#facc15",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#facc15",
  },
}));

export default function MenuManagement() {
  const [categories, setCategories] = useState([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryPagination, setCategoryPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [menuItems, setMenuItems] = useState([]);
  const [combos, setCombos] = useState([]);
  const [comboLoading, setComboLoading] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const [editComboId, setEditComboId] = useState(null);

  // Menu item form
  const [menuItemForm, setMenuItemForm] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    categoryId: "",
    isVegetarian: true,
    isAvailable: true,
  });
  const [editMenuItemId, setEditMenuItemId] = useState(null);

  const [menuLoading, setMenuLoading] = useState(false);
  const [menuPage, setMenuPage] = useState(1);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuPagination, setMenuPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });
  // Add this state near other loading states
  const [menuStatusLoading, setMenuStatusLoading] = useState({});

  const [comboForm, setComboForm] = useState({
    name: "",
    price: "",
    items: [],
  });
  const [comboPage, setComboPage] = useState(1);
  const [comboSearch, setComboSearch] = useState("");
  const [comboPagination, setComboPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });
  const [comboLoadingList, setComboLoadingList] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("menu_active_tab") || "categories";
  });

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedCombo, setExpandedCombo] = useState(null);

  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    fetchCategories(1, "");
  }, []);

  useEffect(() => {
    fetchCategories(categoryPage, categorySearch);
  }, [categoryPage, categorySearch]);
  const getCategoryNameById = (id) => {
    const cat = categories.find((c) => Number(c.id) === Number(id));
    return cat ? cat.name : "";
  };

  // const fetchCategories = async () => {
  //   try {
  //     const response = await axiosInstance.get("/api/v1/category/all");

  //     if (response.data?.data) {
  //       setCategories(response.data.data);
  //     }
  //   } catch (error) {
  //     console.error("Fetch categories error:", error);
  //     alert("Failed to load categories");
  //   }
  // };
  const fetchCategories = async (page = 1, search = "") => {
    try {
      setCategoryLoading(true);
      const params = new URLSearchParams({
        limit: 10,
        page: page.toString(),
        status: "ACTIVE",
        ...(search && { search }),
      });

      const response = await axiosInstance.get(
        `/api/v1/category/all?${params}`
      );

      if (response.data?.data) {
        setCategories(response.data.data);
      }

      if (response.data?.pagination) {
        setCategoryPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error("Failed to load categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "combos") {
      fetchCombos(comboPage, comboSearch);
    }
  }, [activeTab, comboPage, comboSearch]);

  useEffect(() => {
    localStorage.setItem("menu_active_tab", activeTab);
  }, [activeTab]);

  const menuFetched = useRef(false);

  // const fetchMenuItems = async (page = 1, search = "") => {
  //   if (menuFetched.current) return;
  //   menuFetched.current = true;

  //   try {
  //     setMenuLoading(true);

  //     const response = await axiosInstance.get(
  //       `api/v1/product/all?page=${page}&search=${search}`
  //     );

  //     if (response.data?.data) {
  //       const apiItems = response.data.data;

  //       const formattedItems = apiItems.map((item) => ({
  //         id: item.id,
  //         name: item.name,
  //         description: item.description,
  //         price: Number(item.price),
  //         sku: item.sku,
  //         categoryId: item.category_id,
  //         isVegetarian: item.type === "VEG",
  //         isAvailable: item.status === "ACTIVE",
  //         image: item.image || "",
  //         rating: 4.5,
  //       }));

  //       setMenuItems(formattedItems);

  //       if (response.data?.pagination) {
  //         setMenuPagination(response.data.pagination);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Fetch menu items error:", error);
  //     toast.error("Failed to load menu items");
  //   } finally {
  //     setMenuLoading(false);
  //   }
  // };
  const fetchMenuItems = async (
    page = 1,
    search = "",
    category = selectedCategory
  ) => {
    try {
      setMenuLoading(true);

      // Clear the refetch flag when search or category changes
      menuFetched.current = false;

      const params = new URLSearchParams({
        limit: "10",
        page: page.toString(),
        status: "ACTIVE", // Add status parameter
        ...(search && search.trim() && { search: search.trim() }),
        ...(category && category !== "all" && { categoryid: category }),
      });

      console.log("Fetching menu items with params:", params.toString()); // Debug log

      const response = await axiosInstance.get(`/api/v1/product/all?${params}`);

      if (response.data?.data) {
        const apiItems = response.data.data;
        const formattedItems = apiItems.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          sku: item.sku,
          categoryId: item.categoryid,
          isVegetarian: item.type === "VEG",
          isAvailable: item.status === "ACTIVE",
          image: item.image,
          rating: 4.5,
        }));
        setMenuItems(formattedItems);
      }

      if (response.data?.pagination) {
        setMenuPagination(response.data.pagination);
      }

      // Reset the fetch flag after successful fetch
      menuFetched.current = true;
    } catch (error) {
      console.error("Fetch menu items error:", error);
      toast.error("Failed to load menu items");
      menuFetched.current = false; // Reset on error
    } finally {
      setMenuLoading(false);
    }
  };

  const handleMenuSearchChange = (value) => {
    setMenuSearch(value);
    setMenuPage(1);
    menuFetched.current = false;
  };

  const handleCategoryFilterChange = (value) => {
    setSelectedCategory(value);
    setMenuPage(1);
    menuFetched.current = false;
  };

  useEffect(() => {
    if (["menu-items", "combos"].includes(activeTab)) {
      if (activeTab === "menu-items") {
        menuFetched.current = false;
      }
      fetchMenuItems(menuPage, menuSearch, selectedCategory);
    }
  }, [activeTab, menuPage, menuSearch, selectedCategory]);
  const fetchCombos = async (page = 1, search = "") => {
    try {
      setComboLoadingList(true);
      const response = await axiosInstance.get(
        `/api/v1/combo/?limit=10&page=${page}&status=ACTIVE&search=${search}`
      );

      if (response.data?.data) {
        setCombos(
          response.data.data.map((combo) => ({
            id: combo.id,
            name: combo.name,
            price: combo.price,
            status: combo.status,
            createdAt: combo.created_at,
            itemsCount: combo.itemsCount,
            originalPrice: combo.original_price,
            savingsPercentage: combo.savings_percentage,
            details: combo.details || [],
          }))
        );

        if (response.data?.pagination) {
          setComboPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error("Fetch combos error:", error);
      toast.error("Failed to load combos");
    } finally {
      setComboLoadingList(false);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const payload = {
        name: categoryName.trim(),
      };

      if (editCategoryId !== null) {
        await axiosInstance.put(
          `/api/v1/category/${Number(editCategoryId)}`,
          payload
        );
        toast.success("Category updated successfully!");
      } else {
        const response = await axiosInstance.post(
          "/api/v1/category/add",
          payload
        );

        const newCategoryId = response.data?.data?.id;

        setEditCategoryId(newCategoryId);

        toast.success("Category added successfully!");
      }

      setCategoryName("");
      setEditCategoryId(null);
      fetchCategories();
    } catch (error) {
      console.error("Category API error:", error);

      if (error.response) {
        toast.error(error.response.data?.message || "Something went wrong");
      } else {
        toast.error("Network error");
      }
    }
  };

  const handleEditCategory = (category) => {
    setCategoryName(category.name);
    setEditCategoryId(category.id);
  };
  // const handleToggleCategoryStatus = async (id, isActive) => {
  //   const status = isActive ? "ACTIVE" : "INACTIVE";

  //   try {
  //     setStatusLoading((prev) => ({ ...prev, [id]: true }));

  //     await axiosInstance.put(`/api/v1/category/status/${id}`, {
  //       status,
  //     });

  //     setCategories((prev) =>
  //       prev.map((cat) => (cat.id === id ? { ...cat, status } : cat))
  //     );

  //     toast.success(`Category ${status.toLowerCase()} successfully`);
  //   } catch (error) {
  //     console.error("Status API error:", error);
  //     toast.error("Failed to update category status");
  //   } finally {
  //     // stop loader
  //     setStatusLoading((prev) => ({ ...prev, [id]: false }));
  //   }
  // };
  const handleToggleCategoryStatus = async (id, isActive) => {
    const status = isActive ? "ACTIVE" : "INACTIVE";

    try {
      setStatusLoading((prev) => ({ ...prev, [id]: true }));

      await axiosInstance.put(`/api/v1/category/status/${id}`, {
        status,
      });

      fetchCategories(categoryPage, categorySearch);
      toast.success(`Category ${status.toLowerCase()}d successfully`);
    } catch (error) {
      console.error("Status API error:", error);
      toast.error("Failed to update category status");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleMenuStatus = async (id, isActive) => {
    const status = isActive ? "ACTIVE" : "INACTIVE";
    try {
      setMenuStatusLoading((prev) => ({ ...prev, [id]: true }));
      await axiosInstance.put(`/api/v1/product/status/${id}`, { status });
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isAvailable: isActive } : item
        )
      );
      toast.success(`Menu item ${status.toLowerCase()}d successfully`);
    } catch (error) {
      console.error("Status API error:", error);
      toast.error("Failed to update menu item status");
    } finally {
      setMenuStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteCategory = (id) => {
    if (
      window.confirm(
        "Delete this category? Menu items in this category will become uncategorized."
      )
    ) {
      setMenuItems(
        menuItems.map((item) =>
          item.categoryId === id ? { ...item, categoryId: "" } : item
        )
      );
      setCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const handleAddMenuItem = async () => {
    if (
      !menuItemForm.name.trim() ||
      !menuItemForm.price ||
      !menuItemForm.sku ||
      !menuItemForm.categoryId
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      let payload = {
        name: menuItemForm.name.trim(),
        type: menuItemForm.isVegetarian ? "VEG" : "NONVEG",
        price: Number(menuItemForm.price),
        sku: Number(menuItemForm.sku),
        category_id: Number(menuItemForm.categoryId),
        description: menuItemForm.description || "",
      };

      if (editMenuItemId) {
        payload = {
          ...payload,
          id: editMenuItemId,
        };

        await axiosInstance.put("/api/v1/product/update", payload);

        setMenuItems((prev) =>
          prev.map((item) =>
            item.id === editMenuItemId
              ? {
                  ...item,
                  ...payload,
                  categoryId: payload.category_id,
                  categoryName:
                    categories.find(
                      (c) => Number(c.id) === Number(payload.category_id)
                    )?.name || "",
                  isVegetarian: menuItemForm.isVegetarian,
                  isAvailable: menuItemForm.isAvailable,
                }
              : item
          )
        );

        toast.success("Menu item updated successfully!");
      } else {
        const response = await axiosInstance.post(
          "/api/v1/product/add",
          payload
        );

        if (response.data?.data) {
          const newItem = {
            id: response.data.data.id,
            ...payload,
            categoryId: payload.category_id,
            categoryName:
              categories.find(
                (c) => Number(c.id) === Number(payload.category_id)
              )?.name || "",
            isVegetarian: menuItemForm.isVegetarian,
            isAvailable: menuItemForm.isAvailable,
            createdAt: new Date().toISOString(),
            rating: 4.5,
          };

          setMenuItems((prev) => [...prev, newItem]);
          toast.success("Menu item added successfully!");
        }
      }

      resetMenuItemForm();
      setEditMenuItemId(null);
    } catch (error) {
      console.error("Product API error:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEditMenuItem = (item) => {
    setEditMenuItemId(item.id);

    setMenuItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      sku: item.sku?.toString() || "",
      categoryId: item.categoryId || "",
      isVegetarian: item.isVegetarian,
      isAvailable: item.isAvailable,
    });

    document
      .getElementById("menu-item-form")
      .scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteMenuItem = (id) => {
    if (window.confirm("Delete this menu item?")) {
      setMenuItems(menuItems.filter((item) => item.id !== id));
    }
  };

  const resetMenuItemForm = () => {
    setMenuItemForm({
      name: "",
      description: "",
      price: "",
      sku: "",
      categoryId: "",
      isVegetarian: true,
      isAvailable: true,
    });

    setEditMenuItemId(null);
  };

  const handleAddCombo = async () => {
    if (
      !comboForm.name.trim() ||
      !comboForm.price ||
      comboForm.items.length === 0
    ) {
      toast.error(
        "Please fill in all required fields and add at least one item!"
      );
      return;
    }

    setComboLoading(true);

    try {
      const itemsPayload = comboForm.items.map((item) => ({
        product_id: Number(item.id),
        quantity: Number(item.quantity),
      }));

      const payload = {
        id: editComboId, // ✅ only used for update
        name: comboForm.name.trim(),
        price: Number(comboForm.price),
        items: itemsPayload,
      };

      if (editComboId) {
        // 🔁 UPDATE
        await axiosInstance.put("/api/v1/combo/update", payload);
        toast.success("Combo updated successfully!");
      } else {
        // ➕ CREATE
        await axiosInstance.post("/api/v1/combo/add", {
          name: payload.name,
          price: payload.price,
          items: payload.items,
        });
        toast.success("Combo added successfully!");
      }

      fetchCombos(comboPage, comboSearch);
      resetComboForm();
      setEditComboId(null);
    } catch (error) {
      console.error("Combo API error:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setComboLoading(false);
    }
  };

  const handleEditCombo = (combo) => {
    setEditComboId(combo.id);

    setComboForm({
      name: combo.name || "",
      price: combo.price?.toString() || "",
      items: (combo.details || []).map((detail) => ({
        id: detail.product_id,
        name: detail.product_name,
        price: Number(detail.price || 0),
        quantity: Number(detail.quantity || 1),
      })),
    });

    document
      .getElementById("combo-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteCombo = (id) => {
    if (window.confirm("Delete this combo?")) {
      setCombos(combos.filter((combo) => combo.id !== id));
    }
  };

  const resetComboForm = () => {
    setComboForm({
      name: "",
      price: "",
      items: [],
    });
    setEditComboId(null);
  };

  const addItemToCombo = (item) => {
    if (!comboForm.items.find((i) => i.id === item.id)) {
      setComboForm({
        ...comboForm,
        items: [...comboForm.items, { ...item, quantity: 1 }],
      });
    }
  };

  const removeItemFromCombo = (itemId) => {
    setComboForm({
      ...comboForm,
      items: comboForm.items.filter((item) => item.id !== itemId),
    });
  };

  const updateComboItemQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeItemFromCombo(itemId);
      return;
    }

    setComboForm({
      ...comboForm,
      items: comboForm.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const filteredMenuItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.categoryId === selectedCategory);

  const calculateComboValue = (combo) => {
    const totalValue = combo.items.reduce((sum, item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.id);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);
    return totalValue.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <ToastContainer />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={MenuIcon}
                alt="Menu Icon"
                className="w-20 h-20 object-contain"
              />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Menu Management
              </h1>
            </div>

            <p className="text-gray-600 mt-2">
              Manage categories, menu items, and combo meals
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiPackage className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-xl font-bold text-gray-800">
                    {categories.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MdFastfood className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Menu Items</p>
                  <p className="text-xl font-bold text-gray-800">
                    {menuItems.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FiStar className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Combos</p>
                  <p className="text-xl font-bold text-gray-800">
                    {combos.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto mb-8 pb-2">
          {["categories", "menu-items", "combos"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab === "categories" && "📁 Categories"}
              {tab === "menu-items" && "🍔 Menu Items"}
              {tab === "combos" && "🎯 Combos"}
            </button>
          ))}
        </div>

        {/* Categories Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "categories" && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Add/Edit Category Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiPlus className="text-yellow-400" />
                  {editCategoryId ? "Edit Category" : "Add New Category"}
                </h2>

                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name (e.g., Snacks, Main Course)"
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddCategory}
                      className="bg-yellow-400 text-white px-6 py-3 rounded-xl hover:bg-yellow-500 transition flex items-center gap-2 font-medium"
                    >
                      <FiSave />
                      {editCategoryId ? "Update" : "Add Category"}
                    </button>

                    {editCategoryId && (
                      <button
                        onClick={() => {
                          setEditCategoryId(null);
                          setCategoryName("");
                        }}
                        className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition flex items-center gap-2 font-medium"
                      >
                        <FiX />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Food Categories ({categories.length})
                </h2>
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setCategoryPage(1);
                      }}
                      placeholder="Search categories..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                    />
                    <FiTag
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                  </div>
                </div>

                {categories.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <FiPackage size={64} className="mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      No categories added yet.
                    </p>
                    <p className="text-gray-400">
                      Add your first category to get started!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                      <motion.div
                        key={cat.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition relative p-5"
                      >
                        {/* Icon + Name */}
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gray-50 rounded-full shadow flex items-center justify-center">
                            <MdFoodBank size={28} className="text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800">
                              {cat.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {
                                menuItems.filter(
                                  (item) => item.categoryId === cat.id
                                ).length
                              }{" "}
                              items
                            </p>
                          </div>
                        </div>

                        {/* Status Switch + Loader */}
                        <div className="mt-4 flex items-center justify-between">
                          {statusLoading[cat.id] ? (
                            <CircularProgress size={20} />
                          ) : (
                            <FormControlLabel
                              control={
                                <YellowSwitch
                                  checked={cat.status === "ACTIVE"}
                                  onChange={(e) =>
                                    handleToggleCategoryStatus(
                                      cat.id,
                                      e.target.checked
                                    )
                                  }
                                />
                              }
                              label={
                                <span
                                  className={`text-sm font-medium ${
                                    cat.status === "ACTIVE"
                                      ? "text-yellow-500"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {cat.status === "ACTIVE"
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              }
                            />
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCategory(cat)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Menu Items Tab */}
          {activeTab === "menu-items" && (
            <motion.div
              key="menu-items"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Add/Edit Menu Item Form */}
              <div
                id="menu-item-form"
                className="bg-white rounded-2xl shadow-lg p-6  mx-auto"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <MdFastfood size={30} className="text-yellow-400" />
                  Add New Menu Item
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={menuItemForm.name}
                        onChange={(e) =>
                          setMenuItemForm({
                            ...menuItemForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., Margherita Pizza"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={menuItemForm.description}
                        onChange={(e) =>
                          setMenuItemForm({
                            ...menuItemForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your menu item..."
                        rows="3"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU (Custom Number) *
                      </label>
                      <input
                        type="number"
                        value={menuItemForm.sku}
                        onChange={(e) =>
                          setMenuItemForm({
                            ...menuItemForm,
                            sku: e.target.value,
                          })
                        }
                        placeholder="e.g., 1001"
                        min="1"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={menuItemForm.price}
                          onChange={(e) =>
                            setMenuItemForm({
                              ...menuItemForm,
                              price: e.target.value,
                            })
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="space-y-5 mt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={menuItemForm.categoryId}
                        onChange={(e) =>
                          setMenuItemForm({
                            ...menuItemForm,
                            categoryId: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* VEG / NON-VEG Switch */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-300 bg-white">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          Food Type
                        </span>

                        <span
                          className={`text-xs font-semibold mt-1 ${
                            menuItemForm.isVegetarian
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {menuItemForm.isVegetarian
                            ? "Vegetarian"
                            : "Non-Vegetarian"}
                        </span>
                      </div>

                      <Switch
                        checked={menuItemForm.isVegetarian}
                        onChange={(e) =>
                          setMenuItemForm({
                            ...menuItemForm,
                            isVegetarian: e.target.checked,
                          })
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#22c55e",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#22c55e",
                            },
                        }}
                      />
                    </div>

                    {/* ACTIVE / INACTIVE Switch */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-300 bg-white mt-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          Status
                        </span>

                        <span
                          className={`text-xs font-semibold mt-1 ${
                            menuItemForm.isAvailable
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {menuItemForm.isAvailable ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <YellowSwitch
                        checked={menuItemForm.isAvailable}
                        onChange={(e) =>
                          setMenuItemForm({
                            ...menuItemForm,
                            isAvailable: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mt-8 justify-end">
                  <button
                    onClick={handleAddMenuItem}
                    className="bg-yellow-400 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition flex items-center gap-2 font-medium"
                  >
                    <FiSave size={25} />
                    {editMenuItemId ? "Update Menu Item" : "Add Menu Item"}
                  </button>

                  <button
                    onClick={resetMenuItemForm}
                    className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl hover:bg-gray-300 transition flex items-center gap-2 font-medium"
                  >
                    <IoIosCloseCircleOutline size={25} />
                    Clear Form
                  </button>
                </div>
              </div>

              {/* Menu Items List */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Menu Items ({menuItems.length})
                    {menuLoading && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Loading...)
                      </span>
                    )}
                  </h2>

                  {/* <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setMenuPage(1);
                    }}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition md:w-auto w-full md:max-w-xs"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select> */}
                </div>
                <div className="relative w-full md:w-auto my-3.5">
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={menuSearch}
                    onChange={(e) => {
                      setMenuSearch(e.target.value);
                      setMenuPage(1);
                      menuFetched.current = false;
                    }}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                  />
                  <FiTag
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
                {menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <MdFastfood size={64} className="mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      No menu items added yet.
                    </p>
                    <p className="text-gray-400">
                      Add your first menu item to get started!
                    </p>
                  </div>
                ) : filteredMenuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No items found in this category.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {filteredMenuItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`rounded-xl border overflow-hidden transition-all group h-48 flex ${
                            !item.isAvailable
                              ? "bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed"
                              : "bg-white border-gray-200 hover:shadow-lg hover:border-yellow-300"
                          }`}
                        >
                          <div
                            className={`w-28 flex flex-col items-center justify-center p-4 relative transition-all ${
                              !item.isAvailable
                                ? "bg-gray-50"
                                : "bg-linear-to-b from-yellow-50 to-orange-50"
                            }`}
                          >
                            <MdFastfood
                              className={`text-4xl transition-all ${
                                !item.isAvailable
                                  ? "text-gray-300"
                                  : "text-yellow-500 group-hover:scale-110"
                              }`}
                            />

                            {/* Medium Badges */}
                            <div className="absolute top-3 right-3 flex flex-col gap-1 text-center">
                              {item.isVegetarian && (
                                <span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                                  Veg
                                </span>
                              )}
                              {!item.isAvailable && (
                                <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                                  INACTIVE
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Medium Content - Right Side */}
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                              <h3
                                className={`font-semibold text-base truncate leading-tight pr-4 ${
                                  !item.isAvailable
                                    ? "text-gray-500"
                                    : "text-gray-800"
                                }`}
                              >
                                {item.name}
                              </h3>
                              <div className="text-right shrink-0">
                                <p
                                  className={`font-bold text-xl ${
                                    !item.isAvailable
                                      ? "text-gray-400"
                                      : "text-gray-900"
                                  }`}
                                >
                                  ₹{item.price.toFixed(2)}
                                </p>
                                <div
                                  className={`flex items-center gap-1 text-sm mt-0.5 ${
                                    !item.isAvailable
                                      ? "text-gray-300"
                                      : "text-yellow-500"
                                  }`}
                                >
                                  <FiStar />
                                  <span>{item.rating || 4.5}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5 flex-1">
                              <p
                                className={`text-xs font-medium capitalize ${
                                  !item.isAvailable
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {getCategoryName(item.categoryId)}
                              </p>
                              <p
                                className={`text-sm line-clamp-2 leading-relaxed ${
                                  !item.isAvailable
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }`}
                              >
                                {item.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                {menuStatusLoading[item.id] ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <FormControlLabel
                                    className="m-0 p-0"
                                    control={
                                      <YellowSwitch
                                        size="small"
                                        checked={item.isAvailable}
                                        onChange={(e) =>
                                          handleToggleMenuStatus(
                                            item.id,
                                            e.target.checked
                                          )
                                        }
                                        disabled={menuStatusLoading[item.id]}
                                      />
                                    }
                                    label={
                                      <span
                                        className={`text-sm font-medium ${
                                          item.isAvailable
                                            ? "text-yellow-500"
                                            : "text-gray-400"
                                        }`}
                                      >
                                        {item.isAvailable
                                          ? "Active"
                                          : "Inactive"}
                                      </span>
                                    }
                                  />
                                )}
                              </div>

                              {/* Medium Actions */}
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() =>
                                    !item.isAvailable ||
                                    handleEditMenuItem(item)
                                  }
                                  disabled={!item.isAvailable}
                                  className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                                    !item.isAvailable
                                      ? "text-gray-400"
                                      : "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                  }`}
                                  title="Edit"
                                >
                                  <FiEdit2 size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    !item.isAvailable ||
                                    handleDeleteMenuItem(item.id)
                                  }
                                  disabled={!item.isAvailable}
                                  className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                                    !item.isAvailable
                                      ? "text-gray-400"
                                      : "text-red-600 hover:bg-red-50 hover:text-red-700"
                                  }`}
                                  title="Delete"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Combos Tab */}
          {activeTab === "combos" && (
            <motion.div
              key="combos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Add/Edit Combo Form */}
              <div
                id="combo-form"
                className="bg-white rounded-2xl shadow-xl p-6 border border-yellow-100"
              >
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-xl  flex items-center justify-center shadow-md">
                      <img
                        src={ComboIcon}
                        alt="Combo Icon"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Create Combo Deal
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Bundle items & offer special pricing
                      </p>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-linear-to-r from-yellow-400 via-yellow-300 to-yellow-100 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Combo Details & Menu Items */}
                  <div className="lg:col-span-2">
                    {/* Combo Basic Info */}
                    <div className="mb-8 p-5 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-6 bg-yellow-500 rounded-full"></div>
                        <h3 className="font-bold text-lg text-gray-800">
                          Combo Details
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <FiTag className="text-yellow-600" />
                            Combo Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={comboForm.name}
                              onChange={(e) =>
                                setComboForm({
                                  ...comboForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="e.g., Family Feast Combo"
                              className="w-full border border-yellow-300 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition bg-white"
                            />
                            <FiEdit2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                          </div>
                        </div>

                        <div>
                          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <FaIndianRupeeSign className="text-yellow-600" />
                            Combo Price <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <span className="text-yellow-600 font-bold">
                                ₹
                              </span>
                            </div>
                            <input
                              type="number"
                              value={comboForm.price}
                              onChange={(e) =>
                                setComboForm({
                                  ...comboForm,
                                  price: e.target.value,
                                })
                              }
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="w-full border border-yellow-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Available Items Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-6 bg-yellow-500 rounded-full"></div>
                          <h3 className="font-bold text-lg text-gray-800">
                            Menu Items
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                            {
                              menuItems.filter((item) => item.isAvailable)
                                .length
                            }{" "}
                            items
                          </span>
                          <span className="text-sm px-3 py-1 bg-yellow-500 text-white rounded-full font-medium">
                            {comboForm.items.length} selected
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems
                          .filter((item) => item.isAvailable)
                          .map((item) => {
                            const isAdded = comboForm.items.find(
                              (i) => i.id === item.id
                            );
                            const itemQuantity =
                              comboForm.items.find((i) => i.id === item.id)
                                ?.quantity || 0;

                            return (
                              <div
                                key={item.id}
                                className={`p-4 rounded-xl border transition-all duration-200 ${
                                  isAdded
                                    ? "border-yellow-500 bg-linear-to-r from-yellow-50 to-yellow-25 shadow-sm"
                                    : "border-yellow-200 bg-white hover:border-yellow-400 hover:shadow"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          isAdded
                                            ? "bg-yellow-500 animate-pulse"
                                            : "bg-gray-300"
                                        }`}
                                      ></div>
                                      <h4 className="font-semibold text-gray-800">
                                        {item.name}
                                      </h4>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                          Item
                                        </span>
                                        <span className="font-bold text-gray-900">
                                          ₹{item.price.toFixed(2)}
                                        </span>
                                      </div>

                                      {isAdded ? (
                                        <div className="flex items-center gap-3">
                                          <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg">
                                            <button
                                              onClick={() =>
                                                updateComboItemQuantity(
                                                  item.id,
                                                  itemQuantity - 1
                                                )
                                              }
                                              className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-yellow-50 text-gray-700"
                                            >
                                              -
                                            </button>
                                            <span className="font-bold text-yellow-800 min-w-6 text-center">
                                              {itemQuantity}
                                            </span>
                                            <button
                                              onClick={() =>
                                                updateComboItemQuantity(
                                                  item.id,
                                                  itemQuantity + 1
                                                )
                                              }
                                              className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-yellow-50 text-gray-700"
                                            >
                                              +
                                            </button>
                                          </div>
                                          <button
                                            onClick={() =>
                                              removeItemFromCombo(item.id)
                                            }
                                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                          >
                                            <FiTrash2 size={16} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => addItemToCombo(item)}
                                          className="px-4 py-2 bg-linear-to-r from-yellow-500 to-yellow-400 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 text-sm font-bold shadow-sm hover:shadow"
                                        >
                                          ADD
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {isAdded && (
                                  <div className="mt-4 pt-3 border-t border-yellow-200">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">
                                        Item Total:
                                      </span>
                                      <span className="font-bold text-yellow-700">
                                        ₹
                                        {(item.price * itemQuantity).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                        {menuItems.filter((item) => item.isAvailable).length ===
                          0 && (
                          <div className="col-span-2 py-12 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                              <FiPackage className="text-yellow-500 text-3xl" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-700 mb-2">
                              No items available
                            </h4>
                            <p className="text-gray-500">
                              Add menu items to create combos
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Combo Summary */}
                  <div>
                    <div className="sticky top-6">
                      {/* Summary Card */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-6 bg-yellow-500 rounded-full"></div>
                          <h3 className="font-bold text-lg text-gray-800">
                            Combo Summary
                          </h3>
                        </div>

                        {comboForm.items.length > 0 ? (
                          <div className="space-y-4">
                            {/* Savings Highlight Card */}
                            <div className="bg-linear-to-br from-yellow-500 to-yellow-400 rounded-2xl p-6 text-white shadow-lg">
                              <div className="text-center mb-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-2">
                                  <FiPercent className="text-white text-xl" />
                                </div>
                                <h4 className="font-bold text-lg">
                                  DEAL SAVINGS
                                </h4>
                              </div>

                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-yellow-100">
                                    Regular Price
                                  </span>
                                  <span className="text-lg font-bold">
                                    ₹{calculateComboValue(comboForm)}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-yellow-100">
                                    Combo Price
                                  </span>
                                  <span className="text-2xl font-bold">
                                    ₹{comboForm.price || "0.00"}
                                  </span>
                                </div>

                                <div className="pt-4 border-t border-yellow-300/30">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-yellow-100">
                                      You Save
                                    </span>
                                    <span className="text-xl font-bold">
                                      ₹
                                      {(
                                        calculateComboValue(comboForm) -
                                        (comboForm.price || 0)
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-white rounded-full transition-all duration-500"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          ((calculateComboValue(comboForm) -
                                            (comboForm.price || 0)) /
                                            calculateComboValue(comboForm)) *
                                            100
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <div className="text-center mt-2 text-yellow-100 text-sm">
                                    {(
                                      ((calculateComboValue(comboForm) -
                                        (comboForm.price || 0)) /
                                        calculateComboValue(comboForm)) *
                                      100
                                    ).toFixed(1)}
                                    % OFF
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Items Breakdown */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-gray-800">
                                  Selected Items
                                </h4>
                                <span className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-full">
                                  {comboForm.items.length} items
                                </span>
                              </div>

                              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {comboForm.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-100"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <p className="font-medium text-gray-800 truncate">
                                          {item.name}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1 text-sm">
                                        <span className="text-gray-600">
                                          ₹{item.price?.toFixed(2)} ×{" "}
                                          {item.quantity}
                                        </span>
                                        <span className="text-yellow-700 font-medium">
                                          = ₹
                                          {(item.price * item.quantity).toFixed(
                                            2
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        removeItemFromCombo(item.id)
                                      }
                                      className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 pt-4 border-t border-yellow-200">
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Items Total
                                    </span>
                                    <span className="font-bold">
                                      ₹{calculateComboValue(comboForm)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Discount Applied
                                    </span>
                                    <span className="font-bold text-green-600">
                                      -₹
                                      {(
                                        calculateComboValue(comboForm) -
                                        (comboForm.price || 0)
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-base font-bold pt-2 border-t border-yellow-200">
                                    <span className="text-gray-800">
                                      Final Price
                                    </span>
                                    <span className="text-yellow-700">
                                      ₹{comboForm.price || "0.00"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 border-2 border-dashed border-yellow-300 rounded-2xl bg-yellow-50">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                              <FiShoppingBag className="text-yellow-500 text-3xl" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-700 mb-2">
                              Combo Basket Empty
                            </h4>
                            <p className="text-gray-500 text-sm mb-4">
                              Add items to create an amazing deal
                            </p>
                            <div className="w-12 h-1 bg-linear-to-r from-yellow-400 to-yellow-300 rounded-full mx-auto"></div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleAddCombo}
                          disabled={
                            comboForm.items.length === 0 ||
                            !comboForm.name ||
                            !comboForm.price ||
                            comboLoading
                          }
                          className={`px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3
                   font-bold ${
                     comboForm.items.length === 0 ||
                     !comboForm.name ||
                     !comboForm.price ||
                     comboLoading
                       ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                       : editComboId
                       ? "bg-linear-to-r from-yellow-500 to-yellow-400 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                       : "bg-linear-to-r from-yellow-500 to-yellow-400 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                   }`}
                        >
                          {comboLoading ? (
                            <>
                              <CircularProgress
                                size={20}
                                sx={{ color: "white" }}
                              />
                              <span className="font-medium">
                                {editComboId ? "UPDATING..." : "SAVING..."}
                              </span>
                            </>
                          ) : (
                            <>
                              <FiSave className="text-lg" />
                              <span>
                                {editComboId
                                  ? "UPDATE COMBO DEAL"
                                  : "SAVE COMBO DEAL"}
                              </span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={resetComboForm}
                          className="px-6 py-4 rounded-xl border-2 border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-400 transition-colors flex items-center justify-center gap-3 font-medium"
                        >
                          <FiX />
                          CLEAR ALL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combos List */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Combo Meals ({combos.length})
                  </h2>

                  {/* Search & Pagination */}
                  <div className="flex gap-4 mt-4 md:mt-0">
                    <input
                      type="text"
                      placeholder="Search combos..."
                      value={comboSearch}
                      onChange={(e) => {
                        setComboSearch(e.target.value);
                        setComboPage(1);
                      }}
                      className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                    />
                    {comboPagination.totalPages > 1 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setComboPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={comboPage === 1}
                          className="px-3 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <span className="px-3 py-2 text-sm">
                          {comboPage} / {comboPagination.totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setComboPage((prev) =>
                              Math.min(comboPagination.totalPages, prev + 1)
                            )
                          }
                          disabled={comboPage === comboPagination.totalPages}
                          className="px-3 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {comboLoadingList ? (
                  <div className="flex justify-center py-12">
                    <CircularProgress />
                  </div>
                ) : combos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <FiStar size={64} className="mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      No combos added yet.
                    </p>
                    <p className="text-gray-400">
                      Create your first combo meal to attract customers!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {combos.map((combo) => (
                      <motion.div
                        key={combo.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:border-purple-300 transition"
                      >
                        {/* Combo Header */}
                        <div
                          className="p-5 cursor-pointer hover:bg-gray-100 transition"
                          onClick={() =>
                            setExpandedCombo(
                              expandedCombo === combo.id ? null : combo.id
                            )
                          }
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-linear-to-r from-yellow-500 to-yellow-400 rounded-lg flex items-center justify-center">
                                <img
                                  src={ComboIcon}
                                  alt={combo.name}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                              </div>
                              <div>
                                <h3 className="font-bold text-xl text-gray-800">
                                  {combo.name}
                                </h3>
                                <p className="text-gray-600 mt-1">
                                  {combo.itemsCount} items
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              {/* Price Section */}
                              <div className="flex items-center gap-4">
                                <div className="bg-yellow-50 px-4 py-3 rounded-xl text-center min-w-[110px]">
                                  <p className="font-extrabold text-3xl text-yellow-500">
                                    ₹{combo.price}
                                  </p>

                                  {combo.originalPrice && (
                                    <p className="text-sm text-gray-400 line-through">
                                      ₹{combo.originalPrice}
                                    </p>
                                  )}
                                </div>

                                {combo.savingsPercentage && (
                                  <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                                    Save {combo.savingsPercentage.toFixed(1)}%
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCombo(combo);
                                  }}
                                  className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                                  title="Edit Combo"
                                >
                                  <FiEdit2 size={18} />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCombo(combo.id);
                                  }}
                                  className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                                  title="Delete Combo"
                                >
                                  <FiTrash2 size={18} />
                                </button>

                                <button
                                  onClick={() =>
                                    setExpandedCombo(
                                      expandedCombo === combo.id
                                        ? null
                                        : combo.id
                                    )
                                  }
                                  className="p-3 rounded-full hover:bg-gray-100 transition"
                                  title="Expand"
                                >
                                  {expandedCombo === combo.id ? (
                                    <FiChevronUp
                                      className="text-gray-500"
                                      size={22}
                                    />
                                  ) : (
                                    <FiChevronDown
                                      className="text-gray-500"
                                      size={22}
                                    />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {expandedCombo === combo.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-gray-200 p-5">
                                <h4 className="font-bold text-lg text-gray-800 mb-4">
                                  Combo Contents
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {combo.details?.map((detail) => (
                                    <div
                                      key={detail.product_id}
                                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                                    >
                                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <MdFastfood className="text-gray-400" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-800">
                                          {detail.product_name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          ₹{detail.sku || "N/A"} x{" "}
                                          {detail.quantity}
                                        </p>
                                      </div>
                                      <div className="font-bold text-gray-800">
                                        ₹{(detail.sku || 0) * detail.quantity}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Combo Summary */}
                                <div className="mt-6 p-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-gray-600">
                                        Total Value
                                      </p>
                                      <p className="text-2xl font-bold text-gray-800">
                                        ₹{combo.originalPrice || 0}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-gray-600">You Save</p>
                                      <p className="text-2xl font-bold text-green-600">
                                        ₹
                                        {(
                                          combo.originalPrice - combo.price
                                        )?.toFixed(2) || 0}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
