import { useCallback, useEffect, useState } from "react";
import "./MyAddress.css";

import {
  addAddress,
  deleteAddress,
  getMyAddresses,
  updateAddress,
} from "../../api/address/addressApi";

function MyAddress() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const initialFormData = {
    houseNo: "",
    villageCity: "",
    district: "",
    state: "",
    pincode: "",
    isDefault: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  // ==========================================
  // NORMALIZE ADDRESS RESPONSE
  // ==========================================

  const normalizeAddress = (address) => ({
    id: address.addressId,
    houseNo: address.houseNo ?? "---",
    villageCity: address.villageCity ?? "---",
    district: address.district ?? "---",
    state: address.state ?? "---",
    pincode: address.pincode ?? "---",
    isDefault: Boolean(address.isDefault),
    icon: "location",
  });

  // ==========================================
  // FETCH ADDRESSES
  // ==========================================

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyAddresses();

      const data = Array.isArray(response)
        ? response
        : (response?.data ?? response?.addresses ?? []);

      setAddresses(data.map(normalizeAddress));
    } catch (err) {
      console.error("Failed to fetch addresses:", err);

      setError(err.response?.data?.message || "Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // ==========================================
  // HANDLE FORM INPUT
  // ==========================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==========================================
  // OPEN ADD ADDRESS FORM
  // ==========================================

  const handleOpenAddForm = () => {
    setEditingAddressId(null);
    setFormData(initialFormData);
    setError("");
    setShowForm(true);
  };

  // ==========================================
  // CLOSE FORM
  // ==========================================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAddressId(null);
    setFormData(initialFormData);
    setError("");
  };

  // ==========================================
  // EDIT ADDRESS
  // ==========================================

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);

    setFormData({
      houseNo: address.houseNo === "---" ? "" : address.houseNo,
      villageCity: address.villageCity === "---" ? "" : address.villageCity,
      district: address.district === "---" ? "" : address.district,
      state: address.state === "---" ? "" : address.state,
      pincode: address.pincode === "---" ? "" : address.pincode,
      isDefault: address.isDefault,
    });

    setError("");
    setShowForm(true);
  };

  // ==========================================
  // SAVE ADDRESS
  // ==========================================

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const addressData = {
        houseNo: formData.houseNo.trim(),
        villageCity: formData.villageCity.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        isDefault: formData.isDefault,
      };

      if (editingAddressId !== null) {
        await updateAddress(editingAddressId, addressData);
      } else {
        await addAddress(addressData);
      }

      handleCloseForm();
      await fetchAddresses();
    } catch (err) {
      console.error("Failed to save address:", err);

      setError(err.response?.data?.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE ADDRESS
  // ==========================================

  const handleDeleteAddress = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteAddress(id);

      setAddresses((current) => current.filter((address) => address.id !== id));
    } catch (err) {
      console.error("Failed to delete address:", err);

      setError(err.response?.data?.message || "Failed to delete address.");
    }
  };

  // ==========================================
  // SET DEFAULT ADDRESS
  // ==========================================

  const handleSetDefault = async (address) => {
    try {
      setError("");

      const addressData = {
        houseNo: address.houseNo === "---" ? "" : address.houseNo,
        villageCity: address.villageCity === "---" ? "" : address.villageCity,
        district: address.district === "---" ? "" : address.district,
        state: address.state === "---" ? "" : address.state,
        pincode: address.pincode === "---" ? "" : address.pincode,
        isDefault: true,
      };

      await updateAddress(address.id, addressData);

      await fetchAddresses();
    } catch (err) {
      console.error("Failed to set default address:", err);

      setError(
        err.response?.data?.message || "Failed to update the default address.",
      );
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="my-address-page">
      {/* PAGE HEADER */}

      <div className="my-address-header">
        <div>
          <h1>My Addresses</h1>
          <p>
            Manage your shipping addresses for a faster and easier checkout
            experience.
          </p>
        </div>

        <button
          type="button"
          className="add-address-btn"
          onClick={handleOpenAddForm}
        >
          <span>+</span>
          Add New Address
        </button>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <p role="alert" className="address-error">
          {error}
        </p>
      )}

      {/* ADD / EDIT ADDRESS FORM */}

      {showForm && (
        <div className="address-form-card">
          <div className="address-form-header">
            <div>
              <h2>
                {editingAddressId !== null ? "Edit Address" : "Add New Address"}
              </h2>

              <p>Enter your shipping address details.</p>
            </div>

            <button
              type="button"
              className="address-close-btn"
              onClick={handleCloseForm}
            >
              ×
            </button>
          </div>

          <form className="address-form" onSubmit={handleSaveAddress}>
            <div className="address-form-grid">
              <div className="address-field">
                <label>House Number</label>
                <input
                  type="text"
                  name="houseNo"
                  placeholder="Enter house number"
                  value={formData.houseNo}
                  onChange={handleInputChange}
                  maxLength={50}
                />
              </div>

              <div className="address-field">
                <label>Village / City</label>
                <input
                  type="text"
                  name="villageCity"
                  placeholder="Enter village or city"
                  value={formData.villageCity}
                  onChange={handleInputChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="address-field">
                <label>District</label>
                <input
                  type="text"
                  name="district"
                  placeholder="Enter district"
                  value={formData.district}
                  onChange={handleInputChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="address-field">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleInputChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="address-field">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="Enter 6-digit pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  maxLength={6}
                  pattern="[1-9][0-9]{5}"
                  title="Enter a valid 6-digit Indian pincode"
                  required
                />
              </div>
            </div>

            <div className="address-form-actions">
              <button
                type="button"
                className="address-cancel-btn"
                onClick={handleCloseForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="address-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingAddressId !== null
                    ? "Update Address"
                    : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADDRESS LIST */}

      <div className="address-list">
        {loading ? (
          <p>Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p>There is no address found!!</p>
        ) : (
          addresses.map((address) => (
            <div
              className={`address-card ${
                address.isDefault ? "default-address" : ""
              }`}
              key={address.id}
            >
              {/* ADDRESS ICON */}

              <div className="address-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="23"
                  height="23"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>

              {/* ADDRESS DETAILS */}

              <div className="address-details">
                <div className="address-name-row">
                  <h2>
                    {address.houseNo !== "---"
                      ? address.houseNo
                      : address.villageCity}
                  </h2>

                  {address.isDefault && (
                    <span className="default-address-badge">Default</span>
                  )}
                </div>

                <p>{address.villageCity}</p>
                <p>{address.district}</p>
                <p>{address.state}</p>
                <p>{address.pincode}</p>
              </div>

              {/* ADDRESS ACTIONS */}

              <div className="address-actions">
                <button
                  type="button"
                  className="edit-address-btn"
                  onClick={() => handleEditAddress(address)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                  </svg>
                  Edit
                </button>

                <button
                  type="button"
                  className="address-more-btn"
                  onClick={() => {
                    if (address.isDefault) {
                      handleDeleteAddress(address.id);
                    } else {
                      handleSetDefault(address);
                    }
                  }}
                  aria-label={
                    address.isDefault
                      ? "Delete address"
                      : "Set as default address"
                  }
                  title={
                    address.isDefault
                      ? "Delete address"
                      : "Set as default address"
                  }
                >
                  •••
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}

      <footer className="dashboard-footer">
        <p className="copyright">© 2026 eAuction. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default MyAddress;
