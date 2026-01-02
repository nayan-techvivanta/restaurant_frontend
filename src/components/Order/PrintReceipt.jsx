import React, { useEffect, useState } from "react";
import { Printer, ArrowLeft, Bluetooth } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { bluetoothPrinter } from "../../utils/BluetoothPrinter";
import { generateReceipt } from "../../utils/receiptGenerator";

const PrintReceipt = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");

    if (data) {
      try {
        setOrderData(JSON.parse(decodeURIComponent(data)));
      } catch {
        console.error("Invalid order data");
      }
    }
    setLoading(false);
  }, []);

  const handlePrint = async () => {
    if (!orderData || printing) return;

    try {
      setPrinting(true);

      const buffer = await generateReceipt(orderData);
      const success = await bluetoothPrinter.print(buffer);

      if (success) {
        alert("Receipt printed successfully");
        navigate("/create_order");
      } else {
        alert("Printing failed");
      }
    } catch (err) {
      console.error(err);
      alert("Printer error");
    } finally {
      setPrinting(false);
    }
  };

  const handleBack = () => navigate("/create_order");

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );

  if (!orderData)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        No Data
      </div>
    );

  const restaurant = orderData.restaurant || {};

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      {/* ===== RECEIPT PREVIEW (UI ONLY) ===== */}
      <div className="max-w-sm mx-auto bg-white text-black p-4 text-sm font-mono rounded-md">
        <div className="text-center">
          <h1 className="text-xl font-bold">{restaurant.name || "VIVANTA"}</h1>
          <p className="text-xs">PURE VEG RESTAURANT</p>
          <p className="text-xs">{restaurant.address}</p>
          <p className="text-xs">
            {restaurant.city}, {restaurant.state}
          </p>

          <div className="border-b border-dashed border-black my-2"></div>

          <p className="font-bold">TOKEN : {orderData.token}</p>
          <p className="text-xs">
            {new Date(orderData.created_at).toLocaleString()}
          </p>
        </div>

        <div className="border-b border-dashed border-black my-2"></div>

        {orderData.items?.map((item, i) => (
          <div key={i} className="mb-3">
            {/* MAIN ITEM */}
            <div className="font-bold text-center">{item.name}</div>

            <div className="flex justify-between text-xs">
              <span>
                {item.quantity} x {item.price}
              </span>
              <span>{item.quantity * item.price}</span>
            </div>

            {item.notes && (
              <div className="text-xs italic text-gray-600 text-center">
                ({item.notes})
              </div>
            )}

            {/* ===== EXTRAS ===== */}
            {item.extra && item.extra.length > 0 && (
              <div className="mt-1 ml-2 text-xs">
                {item.extra.map((extra, idx) => (
                  <div key={idx} className="mb-1">
                    <div className="font-bold text-center">+ {extra.name}</div>

                    <div className="flex justify-between pl-4">
                      <span>
                        {extra.quantity} x {extra.price}
                      </span>
                      <span>{extra.quantity * extra.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="border-b border-dashed border-black my-2"></div>

        <div className="flex justify-between font-bold text-lg">
          <span>TOTAL</span>
          <span>{orderData.grand_total}</span>
        </div>

        <div className="border-b border-dashed border-black my-2"></div>

        <div className="text-center text-xs mt-3">
          <p>THANK YOU</p>
          <p>VISIT AGAIN</p>
        </div>
      </div>

      {/* ===== CONTROLS ===== */}
      <div className="max-w-sm mx-auto mt-6 space-y-3">
        <button
          onClick={handlePrint}
          disabled={printing}
          className="w-full flex items-center justify-center gap-2 bg-green-600 py-4 rounded-lg font-bold text-lg hover:bg-green-500 disabled:opacity-50"
        >
          <Printer size={20} />
          {printing ? "PRINTING..." : "PRINT RECEIPT"}
        </button>

        <button
          onClick={handleBack}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <ArrowLeft size={18} />
          BACK
        </button>
      </div>
    </div>
  );
};

export default PrintReceipt;
