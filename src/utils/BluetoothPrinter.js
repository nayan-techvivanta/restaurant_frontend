class BluetoothPrinter {
    constructor() {
        this.device = null;
        this.server = null;
        this.characteristic = null;
        this.isPrinting = false;

        // Generic ESC-POS BLE Service
        this.serviceUUID = "000018f0-0000-1000-8000-00805f9b34fb";
    }

    async connect() {
        try {
            console.log("Requesting Bluetooth Printer...");

            this.device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [this.serviceUUID],
            });

            localStorage.setItem("printerID", this.device.id);

            return await this.connectDevice(this.device);
        } catch (error) {
            console.error("Bluetooth Connection Error:", error);
            return false;
        }
    }

    async connectDevice(device) {
        try {
            this.device = device;
            console.log("Device selected:", this.device.name);

            this.device.addEventListener(
                "gattserverdisconnected",
                this.onDisconnected.bind(this)
            );

            this.server = await this.device.gatt.connect();
            console.log("GATT Server connected");

            const service = await this.server.getPrimaryService(this.serviceUUID);
            const characteristics = await service.getCharacteristics();

            this.characteristic =
                characteristics.find((c) => c.properties.writeWithoutResponse) ||
                characteristics.find((c) => c.properties.write);

            if (!this.characteristic) {
                throw new Error("No writable characteristic found");
            }

            console.log("Printer Ready:", this.device.name);
            return true;
        } catch (error) {
            console.error("GATT Connection Error:", error);
            return false;
        }
    }

    // ✅ Fixed reconnect for unsupported getDevices()
    async reconnect() {
        if (this.isConnected()) return true;

        // Only attempt reconnect if device is still in memory
        if (this.device) {
            console.log("Attempting reconnect to known device...");
            try {
                return await this.connectDevice(this.device);
            } catch (error) {
                console.error("Reconnect to known device failed:", error);
                this.device = null;
            }
        }

        console.warn(
            "Auto-reconnect not available in this browser. Please select the printer manually."
        );
        return false;
    }

    onDisconnected() {
        console.warn("Printer disconnected");
        this.device = null;
        this.server = null;
        this.characteristic = null;
    }

    isConnected() {
        return this.device && this.device.gatt.connected && !!this.characteristic;
    }

    async print(data) {
        if (!data) {
            console.error("No data to print");
            return false;
        }
        if (this.isPrinting) return false;

        if (!this.isConnected()) {
            console.log("Printer not connected. Trying auto-reconnect...");

            let connected = await this.reconnect();
            if (!connected) {
                console.log("Auto-reconnect failed. Requesting pairing...");
                connected = await this.connect();
            }

            if (!connected) return false;
        }

        try {
            this.isPrinting = true;
            console.log("Printing bytes:", data.length);

            await this.sendDataInChunks(data);

            console.log("Print completed");
            return true;
        } catch (error) {
            console.error("Print Failed:", error);
            return false;
        } finally {
            this.isPrinting = false;
        }
    }

    async sendDataInChunks(data) {
        const CHUNK_SIZE = 128;
        const DELAY = 30;

        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE);
            const buffer = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
            await this.characteristic.writeValue(buffer);
            await new Promise((resolve) => setTimeout(resolve, DELAY));
        }
    }
}

export const bluetoothPrinter = new BluetoothPrinter();
