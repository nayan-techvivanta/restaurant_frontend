class BluetoothPrinter {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isPrinting = false;
    this.serviceUUID = "000018f0-0000-1000-8000-00805f9b34fb";
    this.initAutoReconnect();
  }

  //   openBluetoothSettings() {
  //     if (navigator.userAgent.includes("Windows")) {
  //       window.location.href = "ms-settings:bluetooth";
  //     } else {
  //       alert("Please open Bluetooth settings manually on your device.");
  //     }
  //   }
  openBluetoothSettings() {
    const ua = navigator.userAgent;

    if (ua.includes("Windows")) {
      window.location.href = "ms-settings:bluetooth";
      return;
    }

    if (ua.includes("Mac")) {
      alert(
        "Bluetooth is OFF.\n\n" +
          "Please turn it ON manually:\n" +
          "System Settings → Bluetooth\n\n" +
          "Shortcut: Command (⌘) + Space → type 'Bluetooth'"
      );
      return;
    }

    // 📱 Other devices
    alert("Please enable Bluetooth from your device settings.");
  }

  openPrinterSettings() {
    if (navigator.userAgent.includes("Windows")) {
      window.location.href = "ms-settings:printers";
    } else {
      alert("Please open Printer settings manually on your device.");
    }
  }
  //   async checkBluetoothState() {
  //     if (!navigator.bluetooth) {
  //       throw new Error("Web Bluetooth API not supported");
  //     }

  //     return true;
  //   }
  async checkBluetoothState() {
    if (!navigator.bluetooth) {
      throw new Error("Bluetooth not supported in this browser");
    }

    const available = await navigator.bluetooth.getAvailability();

    if (!available) {
      this.openBluetoothSettings();

      throw new Error(
        "Bluetooth is OFF. Please turn it ON from system settings."
      );
    }

    return true;
  }

  async connect() {
    try {
      const reconnected = await this.reconnect();
      if (reconnected) return true;

      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.serviceUUID],
      });

      localStorage.setItem("printerID", this.device.id);

      return await this.connectDevice(this.device);
    } catch (error) {
      console.error("❌ Connection failed:", error);

      if (
        error.name === "NotFoundError" ||
        error.message?.includes("Bluetooth")
      ) {
        this.openBluetoothSettings();

        throw new Error(
          "Bluetooth is OFF. Please turn it ON from system settings."
        );
      }

      throw error;
    }
  }
  // async connect() {
  //   try {
  //     await this.checkBluetoothState();

  //     const reconnected = await this.reconnect();
  //     if (reconnected) return true;

  //     this.device = await navigator.bluetooth.requestDevice({
  //       acceptAllDevices: true,
  //       optionalServices: [this.serviceUUID],
  //     });

  //     localStorage.setItem("printerID", this.device.id);

  //     return await this.connectDevice(this.device);
  //   } catch (error) {
  //     console.error("❌ Connection failed:", error);

  //     if (error.message?.includes("Bluetooth is OFF")) {
  //       this.openBluetoothSettings();
  //       throw error;
  //     }

  //     if (error.name === "NotFoundError") {
  //       throw new Error("Printer selection cancelled by user.");
  //     }

  //     throw error;
  //   }
  // }

  extractMacAddress(deviceId) {
    const macRegex =
      /[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}/i;
    return deviceId.match(macRegex)?.[0].toUpperCase() || null;
  }

  // async reconnect() {
  //   if (this.isConnected()) return true;

  //   const savedPrinterId = localStorage.getItem("printerID");
  //   if (!savedPrinterId) return false;

  //   try {
  //     if (navigator.bluetooth.getDevices) {
  //       const devices = await navigator.bluetooth.getDevices([
  //         this.serviceUUID,
  //       ]);
  //       const savedDevice = devices.find((d) => d.id === savedPrinterId);
  //       if (savedDevice) {
  //         this.device = savedDevice;
  //         return await this.connectDevice(savedDevice);
  //       }
  //     }

  //     if (this.device && !this.device.gatt.connected) {
  //       return await this.connectDevice(this.device);
  //     }
  //     return false;
  //   } catch (error) {
  //     console.error("Reconnect failed:", error);
  //     return false;
  //   }
  // }
  async reconnect() {
    if (this.isConnected()) return true;

    const savedPrinterId = localStorage.getItem("printerID");
    if (!savedPrinterId) return false;

    try {
      if (navigator.bluetooth.getDevices) {
        const devices = await navigator.bluetooth.getDevices([
          this.serviceUUID,
        ]);
        const savedDevice = devices.find((d) => d.id === savedPrinterId);
        if (savedDevice && !savedDevice.gatt.connected) {
          this.device = savedDevice;
          await new Promise((resolve) => setTimeout(resolve, 500));
          return await this.connectDevice(savedDevice);
        }
      }

      if (this.device && !this.device.gatt.connected) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return await this.connectDevice(this.device);
      }

      return false;
    } catch (error) {
      console.error("Reconnect failed:", error);
      if (error.name === "NetworkError" || error.name === "NotFoundError") {
        localStorage.removeItem("printerID");
      }
      return false;
    }
  }

  async connectDevice(device) {
    try {
      this.device = device;
      this.device.addEventListener(
        "gattserverdisconnected",
        this.onDisconnected.bind(this)
      );
      this.server = await this.device.gatt.connect();

      const service = await this.server.getPrimaryService(this.serviceUUID);
      const characteristics = await service.getCharacteristics();

      this.characteristic =
        characteristics.find((c) => c.properties.writeWithoutResponse) ||
        characteristics.find((c) => c.properties.write);

      if (!this.characteristic) {
        throw new Error("No writable characteristic found");
      }

      console.log("✅ Connected:", this.device.name);
      return true;
    } catch (error) {
      console.error("❌ Connect failed:", error);
      this.disconnect();
      return false;
    }
  }

  onDisconnected() {
    console.warn("🔌 Disconnected");
    this.device = null;
    this.server = null;
    this.characteristic = null;
  }

  isConnected() {
    return this.device && this.device.gatt?.connected && !!this.characteristic;
  }

  disconnect() {
    if (this.server) this.server.disconnect();
    this.onDisconnected();
  }

  initAutoReconnect() {
    const savedPrinterId = localStorage.getItem("printerID");
    if (savedPrinterId) {
      setTimeout(() => this.autoReconnectOnLoad(), 1000);
    }
  }

  async autoReconnectOnLoad() {
    try {
      await this.checkBluetoothState();
      await this.reconnect();
    } catch (error) {
      console.error("Auto-reconnect failed:", error);
    }
  }

  async print(data) {
    if (!this.isConnected()) {
      const connected = await this.connect();
      if (!connected) return false;
    }

    try {
      this.isPrinting = true;
      await this.sendDataInChunks(data);
      return true;
    } catch (error) {
      console.error("Print failed:", error);
      return false;
    } finally {
      this.isPrinting = false;
    }
  }

  async sendDataInChunks(data) {
    const CHUNK_SIZE = 128;
    const DELAY = 30;
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = new Uint8Array(data.slice(i, i + CHUNK_SIZE));
      await this.characteristic.writeValue(chunk);
      await new Promise((resolve) => setTimeout(resolve, DELAY));
    }
  }
}

export const bluetoothPrinter = new BluetoothPrinter();
