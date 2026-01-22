import React from "react";
import { motion } from "framer-motion";
import { User, Clock, CheckCircle2 } from "lucide-react";

/**
 * TableCard Component - Displays a single table with its status
 * @param {Object} table - Table data object
 * @param {Function} onAssignWaiter - Callback when assign waiter button is clicked
 * @param {Function} onViewOrders - Callback when view orders button is clicked
 * @param {Function} onReleaseTable - Callback when release table button is clicked
 */
const TableCard = ({ table, onAssignWaiter, onViewOrders, onReleaseTable }) => {
  const isAvailable = table.work_status === "AVAILABLE";
  const isOccupied = table.work_status === "OCCUPIED";

  const getStatusColor = () => {
    if (isAvailable) return "bg-green-100 text-green-800 border-green-300";
    if (isOccupied) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getCardBorderColor = () => {
    if (isAvailable) return "border-green-200 hover:border-green-400";
    if (isOccupied) return "border-amber-200 hover:border-amber-400";
    return "border-gray-200 hover:border-gray-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-white border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all ${getCardBorderColor()}`}
    >
      {/* Status Badge */}
      <div className="absolute -top-3 -right-3">
        <span
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-md ${getStatusColor()}`}
        >
          {isAvailable ? (
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
            isAvailable
              ? "bg-green-50 border-4 border-green-300"
              : "bg-amber-50 border-4 border-amber-300"
          }`}
        >
          <span className="text-3xl font-bold text-gray-800">
            {table.number}
          </span>
        </div>
      </div>

      {/* Table Info */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Table #{table.number}
        </h3>
        {table.assign_waiter ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Waiter ID: {table.assign_waiter}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400">No waiter assigned</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {isAvailable && (
          <button
            onClick={() => onAssignWaiter(table)}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
          >
            Assign to Me
          </button>
        )}

        {isOccupied && (
          <>
            <button
              onClick={() => onViewOrders(table)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-yellow-700 shadow-md hover:shadow-lg transition-all"
            >
              View Orders
            </button>
            <button
              onClick={() => onReleaseTable(table)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              Release Table
            </button>
          </>
        )}
      </div>

      {/* Table Details */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-semibold">Status:</span>{" "}
            <span className={isAvailable ? "text-green-600" : "text-amber-600"}>
              {table.status}
            </span>
          </div>
          <div>
            <span className="font-semibold">ID:</span> {table.id}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TableCard;
