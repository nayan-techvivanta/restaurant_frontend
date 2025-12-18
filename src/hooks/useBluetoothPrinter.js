import { useState, useCallback } from "react";
import { bluetoothPrinter } from "../utils/BluetoothPrinter";

/**
 * Hook to manage Bluetooth Printer state
 */
export const useBluetoothPrinter = () => {
    const [isPrinting, setIsPrinting] = useState(false);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const connectPrinter = useCallback(async () => {
        try {
            setError(null);
            await bluetoothPrinter.connect();
            setIsConnected(true);
            return true;
        } catch (err) {
            setError("Failed to connect to printer");
            setIsConnected(false);
            return false;
        }
    }, []);

    const printReceipt = useCallback(async (orderData) => {
        try {
            setIsPrinting(true);
            setError(null);
            await bluetoothPrinter.print(orderData);
            setIsConnected(true); // If print succeeds, we entered assumed connected state or reconnected
            return true;
        } catch (err) {
            console.error(err);
            setError("Failed to print receipt. Check printer connection.");
            setIsConnected(bluetoothPrinter.isConnected());
            return false;
        } finally {
            setIsPrinting(false);
        }
    }, []);

    return {
        connectPrinter,
        printReceipt,
        isPrinting,
        isConnected,
        error,
    };
};
