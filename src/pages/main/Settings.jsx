import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Printer, 
  Save,
  Bell,
  Shield,
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Settings as SettingsIcon,
  Receipt,
  Volume2,
  Clock,
  Globe,
  Smartphone,
  Type,
  FileText,
  Maximize2,
  Eye,
  CheckSquare,
  Star
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile settings state
  const [profile, setProfile] = useState({
    name: "Restaurant Owner",
    email: "owner@restaurant.com",
    phone: "+1 234 567 890",
    notifications: true,
    twoFactorAuth: false,
    language: "en"
  });

  // Print settings state
  const [print, setPrint] = useState({
    printerType: "thermal",
    paperWidth: "80mm",
    autoPrint: true,
    copies: 1,
    header: "Thank you for dining with us!",
    footer: "Visit us again!",
    kitchenPrint: true,
    cashierPrint: true
  });

  // Kitchen settings state
  const [kitchen, setKitchen] = useState({
    displayOrders: true,
    soundAlerts: true,
    alertVolume: 70,
    autoClearCompleted: false,
    prepTime: 15,
    maxOrdersDisplay: 10,
    priorityEnabled: true
  });

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'print', icon: Printer, label: 'Print Settings' },
    { id: 'kitchen', icon: ChefHat, label: 'Kitchen Display' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Settings</h1>
              <p className="text-gray-600 mt-2">Manage your restaurant settings and preferences</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">Settings saved successfully!</span>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:w-1/4"
          >
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      variants={itemVariants}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === tab.id
                          ? 'bg-blue-50 text-yellow-400 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* Save Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:w-3/4"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <User className="w-6 h-6" />
                      Profile Settings
                    </h2>
                    <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <select
                          value={profile.language}
                          onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </motion.div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications & Security
                    </h3>
                    <div className="space-y-4">
                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Order Notifications</p>
                            <p className="text-sm text-gray-600">Receive alerts for new orders</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setProfile({ ...profile, notifications: !profile.notifications })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.notifications ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.notifications ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-600">Add an extra layer of security</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setProfile({ ...profile, twoFactorAuth: !profile.twoFactorAuth })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Print Settings */}
              {activeTab === 'print' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Printer className="w-6 h-6" />
                      Print Settings
                    </h2>
                    <p className="text-gray-600 mt-1">Configure your thermal printer and print preferences</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Printer Type
                      </label>
                      <select
                        value={print.printerType}
                        onChange={(e) => setPrint({ ...print, printerType: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        <option value="thermal">Thermal Printer</option>
                        <option value="laser">Laser Printer</option>
                        <option value="inkjet">Inkjet Printer</option>
                      </select>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paper Width
                      </label>
                      <select
                        value={print.paperWidth}
                        onChange={(e) => setPrint({ ...print, paperWidth: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        <option value="58mm">58mm</option>
                        <option value="80mm">80mm</option>
                        <option value="110mm">110mm</option>
                      </select>
                    </motion.div>

                    <motion.div variants={itemVariants} className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Receipt Header
                      </label>
                      <textarea
                        value={print.header}
                        onChange={(e) => setPrint({ ...print, header: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Enter custom header text for receipts"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="md:col-span-2">
                      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Receipt Footer
                      </label>
                      <textarea
                        value={print.footer}
                        onChange={(e) => setPrint({ ...print, footer: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Enter custom footer text for receipts"
                      />
                    </motion.div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      Print Options
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { id: 'autoPrint', label: 'Auto Print on Order', icon: CheckSquare, checked: print.autoPrint },
                        { id: 'kitchenPrint', label: 'Print in Kitchen', icon: ChefHat, checked: print.kitchenPrint },
                        { id: 'cashierPrint', label: 'Print at Cashier', icon: Printer, checked: print.cashierPrint },
                      ].map((option) => {
                        const Icon = option.icon;
                        return (
                          <motion.div
                            key={option.id}
                            variants={itemVariants}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-gray-600" />
                              <span className="text-gray-700">{option.label}</span>
                            </div>
                            <button
                              onClick={() => setPrint({ ...print, [option.id]: !option.checked })}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${option.checked ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${option.checked ? 'translate-x-5' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <motion.div variants={itemVariants} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Thermal Printer Tips</p>
                        <p className="text-yellow-400 text-sm mt-1">
                          Ensure your thermal printer is properly connected via USB or network. 
                          Test print settings regularly to prevent paper jams and ensure receipt clarity.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Kitchen Settings */}
              {activeTab === 'kitchen' && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <ChefHat className="w-6 h-6" />
                      Kitchen Display Settings
                    </h2>
                    <p className="text-gray-600 mt-1">Configure kitchen order display and alerts</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div variants={itemVariants}>
                      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Default Preparation Time (minutes)
                      </label>
                      <input
                        type="number"
                        value={kitchen.prepTime}
                        onChange={(e) => setKitchen({ ...kitchen, prepTime: parseInt(e.target.value) })}
                        min="5"
                        max="60"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Maximize2 className="w-4 h-4" />
                        Maximum Orders Displayed
                      </label>
                      <input
                        type="number"
                        value={kitchen.maxOrdersDisplay}
                        onChange={(e) => setKitchen({ ...kitchen, maxOrdersDisplay: parseInt(e.target.value) })}
                        min="5"
                        max="50"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="md:col-span-2">
                      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Alert Volume
                      </label>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={kitchen.alertVolume}
                          onChange={(e) => setKitchen({ ...kitchen, alertVolume: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>0%</span>
                          <span className="font-medium">{kitchen.alertVolume}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Display & Alert Options</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { id: 'displayOrders', label: 'Display Orders Live', icon: Eye, checked: kitchen.displayOrders },
                        { id: 'soundAlerts', label: 'Sound Alerts for New Orders', icon: Volume2, checked: kitchen.soundAlerts },
                        { id: 'autoClearCompleted', label: 'Auto Clear Completed Orders', icon: CheckSquare, checked: kitchen.autoClearCompleted },
                        { id: 'priorityEnabled', label: 'Enable Priority Orders', icon: Star, checked: kitchen.priorityEnabled },
                      ].map((option) => {
                        const Icon = option.icon;
                        return (
                          <motion.div
                            key={option.id}
                            variants={itemVariants}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-gray-600" />
                              <span className="text-gray-700">{option.label}</span>
                            </div>
                            <button
                              onClick={() => setKitchen({ ...kitchen, [option.id]: !option.checked })}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${option.checked ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${option.checked ? 'translate-x-5' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <motion.div variants={itemVariants} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Kitchen Display Best Practices</p>
                        <p className="text-amber-700 text-sm mt-1">
                          Keep the kitchen display visible to all staff. Regular audio tests ensure alerts are heard during busy hours.
                          Clear completed orders promptly to maintain an organized workflow.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}