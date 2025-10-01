import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

function App() {
  // State for products and form data
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [isWholesaleMode, setIsWholesaleMode] = React.useState(false);
  const [productionLocation, setProductionLocation] = React.useState('local'); // 'local' or 'overseas'
  const [productSearch, setProductSearch] = React.useState('');
  const [showProductDropdown, setShowProductDropdown] = React.useState(false);
  const [filteredProducts, setFilteredProducts] = React.useState([]);
  const [formData, setFormData] = React.useState({
    productionLocation: 'local',
    nickname: '',
    dueDate: '',
    selectedProduct: '',
    decorationType: '',
    customDecoration: '',
    decorationLocation: '',
    decorationSize: '',
    decorationFile: null,
    quantity: 1,
    sizes: {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      '2XL': 0
    },
    customerName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    specialInstructions: ''
  });

  // Decoration options
  const decorationTypes = [
    { value: 'embroidery', label: 'Embroidery' },
    { value: 'screen-print', label: 'Screen Print' },
    { value: 'DTF', label: 'DTF (Direct to Film)' },
    { value: 'DTG', label: 'DTG (Direct to Garment)' },
  ];

  // Decoration locations
  const decorationLocations = [
    { value: 'left-chest', label: 'Left Chest' },
    { value: 'right-chest', label: 'Right Chest' },
    { value: 'front-center', label: 'Front Center' },
    { value: 'back-center', label: 'Back Center' },
    { value: 'back-upper', label: 'Back Upper' },
    { value: 'left-sleeve', label: 'Left Sleeve' },
    { value: 'right-sleeve', label: 'Right Sleeve' },
    //{ value: 'collar', label: 'Collar' },
    { value: 'pocket', label: 'Pocket Area' }
  ];

  // Decoration sizes
  const decorationSizes = [
    { value: 'small', label: 'Small (2" x 2")' },
    { value: 'medium', label: 'Medium (4" x 4")' },
    { value: 'large', label: 'Large (6" x 6")' }
  ];

  // Fetch products from API
  async function fetchProducts() {
    setLoading(true);
    try {
      // Fetch from CSV file
      const response = await fetch('/Yatta_Data(Sheet2).csv');
      const csvText = await response.text();
      
      // Parse CSV data
      const lines = csvText.split('\n');
      
      // Convert CSV to product objects
      const csvProducts = lines.slice(1)
        .filter(line => line.trim()) // Remove empty lines
        .map((line, index) => {
          const values = line.split(',');
          return {
            id: index + 1,
            name: values[0] ? values[0].trim() : `Product ${index + 1}`,
          };
        });
      
      setProducts(csvProducts);
    } catch (error) {
      console.error('Error fetching products from CSV:', error);
      // Fallback to mock data if CSV fails
      setProducts([
        { id: 1, name: 'Golf Polo Shirt', price: 45.99, description: 'Premium cotton golf polo' },
        { id: 2, name: 'Golf Cap', price: 25.99, description: 'Adjustable golf cap with UV protection' },
        { id: 3, name: 'Golf Towel', price: 15.99, description: 'Microfiber golf towel with clip' },
        { id: 4, name: 'Golf Balls Set', price: 35.99, description: 'Premium golf balls (dozen)' }
      ]);
    }
    setLoading(false);
  }

  // Toggle production location
  const toggleProductionLocation = () => {
    const newLocation = productionLocation === 'local' ? 'overseas' : 'local';
    setProductionLocation(newLocation);
    setFormData(prev => ({
      ...prev,
      productionLocation: newLocation
    }));
  };

  // Handle product search
  const handleProductSearch = (e) => {
    const searchValue = e.target.value;
    setProductSearch(searchValue);
    setShowProductDropdown(true);
    
    // Filter products based on search
    if (searchValue.trim() === '') {
      setFilteredProducts(products.slice(0, 10)); // Show first 10 when empty
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchValue.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
      setFilteredProducts(filtered);
    }
  };

  // Handle product selection from dropdown
  const handleProductSelect = (product) => {
    setFormData(prev => ({ ...prev, selectedProduct: product.id }));
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('sizes.')) {
      const sizeField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        sizes: {
          ...prev.sizes,
          [sizeField]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.selectedProduct) {
      alert('Please select a product');
      return;
    }

    if (!formData.dueDate) {
      alert('Please select a due date');
      return;
    }

    // Validate due date is at least 2 weeks from today
    const selectedDate = new Date(formData.dueDate);
    const minDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    if (selectedDate < minDate) {
      alert('Due date must be at least 2 weeks from today. Please select a later date.');
      return;
    }
    
    if (!formData.customerName || !formData.email) {
      alert('Please fill in your name and email');
      return;
    }
    
    if (!formData.address.street || !formData.address.city || !formData.address.zipCode) {
      alert('Please fill in your delivery address');
      return;
    }

    // Validate decoration fields if decoration is selected
    if (formData.decorationType && (!formData.decorationLocation || !formData.decorationSize)) {
      alert('Please complete all decoration fields (location and size)');
      return;
    }

    // Create order object
    const order = {
      orderId: `YG-${Date.now()}`,
      productionLocation: formData.productionLocation,
      nickname: formData.nickname,
      dueDate: formData.dueDate,
      timestamp: new Date().toISOString(),
      customer: {
        name: formData.customerName,
        email: formData.email,
        phone: formData.phone || null
      },
      product: {
        id: formData.selectedProduct,
        name: selectedProductDetails?.name || '',
        //price: selectedProductDetails?.price || 0,
        //description: selectedProductDetails?.description || ''
      },
      quantity: {
        total: formData.quantity,
        sizes: formData.sizes,
        totalBySizes: Object.values(formData.sizes).reduce((sum, qty) => sum + qty, 0)
      },
      decoration: formData.decorationType ? {
        type: formData.decorationType,
        location: formData.decorationLocation,
        size: formData.decorationSize,
        details: formData.customDecoration,
        fileName: formData.decorationFile?.name || null,
        fileSize: formData.decorationFile?.size || null,
        fileType: formData.decorationFile?.type || null
      } : null,
      shipping: {
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          country: formData.address.country
        },
        specialInstructions: formData.specialInstructions || null
      },
      status: 'pending',
      //totalAmount: calculateTotal()
    };

    try {
      // Create and download JSON file
      const jsonString = JSON.stringify(order, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${order.orderId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log to console for development
      console.log('Order created:', order);
      
      alert('Order submitted successfully! Your order file has been downloaded.');
      
      // Reset form after successful submission
      setFormData({
        productionLocation: 'local',
        nickname: '',
        dueDate: '',
        selectedProduct: '',
        decorationType: '',
        customDecoration: '',
        decorationLocation: '',
        decorationSize: '',
        decorationFile: null,
        quantity: 1,
        sizes: {
          XS: 0,
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
          '2XL': 0
        },
        customerName: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        specialInstructions: ''
      });

    } catch (error) {
      console.error('Error creating order:', error);
      alert('There was an error submitting your order. Please try again.');
    }
  };

  // Toggle between single quantity and wholesale mode
  const toggleWholesaleMode = () => {
    setIsWholesaleMode(!isWholesaleMode);
    // Reset quantities when switching modes
    if (!isWholesaleMode) {
      // Switching to wholesale mode - reset single quantity
      setFormData(prev => ({
        ...prev,
        quantity: 1
      }));
    } else {
      // Switching to single mode - reset sizes
      setFormData(prev => ({
        ...prev,
        sizes: {
          XS: 0,
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
          '2XL': 0
        }
      }));
    }
  };

  // Calculate total amount (basic calculation)
  const calculateTotal = () => {
    if (!selectedProductDetails) return 0;
    
    const basePrice = selectedProductDetails.price;
    const totalQuantity = isWholesaleMode 
      ? Object.values(formData.sizes).reduce((sum, qty) => sum + qty, 0)
      : formData.quantity;
    
    let total = basePrice * totalQuantity;
    
    // Add decoration cost (example pricing)
    if (formData.decorationType) {
      const decorationCosts = {
        'embroidery': 5.00,
        'screen-print': 3.00,
        'heat-transfer': 4.00,
        'engraving': 6.00,
        'custom': 8.00
      };
      
      const decorationCost = decorationCosts[formData.decorationType] || 0;
      total += decorationCost * totalQuantity;
    }
    
    return parseFloat(total.toFixed(2));
  };

  // Load products on component mount
  React.useEffect(() => {
    fetchProducts();
  }, []);

  // Update filtered products when products change
  React.useEffect(() => {
    setFilteredProducts(products.slice(0, 10));
  }, [products]);

  // Handle clicking outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.searchable-select-container')) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedProductDetails = products.find(p => p.id === parseInt(formData.selectedProduct));

  return (
    <div className="app-container">
      <h1 className="app-title">Yatta Golf - Custom Product Order</h1>
      
      <form onSubmit={handleSubmit} className="order-form">
        {/* Production Location Section */}
        <section className="section">
          <h2 className="section-title">Production Location</h2>
          <div className="form-group">
            <div className="production-location-toggle">
              <button
                type="button"
                onClick={toggleProductionLocation}
                className={`toggle-btn production-toggle ${productionLocation}`}
              >
                <span className={`toggle-option ${productionLocation === 'local' ? 'active' : ''}`}>
                  🇺🇸 Local Production
                </span>
                <span className={`toggle-option ${productionLocation === 'overseas' ? 'active' : ''}`}>
                  🌍 Overseas Production
                </span>
              </button>
            </div>
            {/* <div className="production-info">
              {productionLocation === 'local' ? (
                <p className="production-description">
                  <strong>Local Production:</strong> Faster turnaround times, premium quality control, and support for domestic manufacturing.
                </p>
              ) : (
                <p className="production-description">
                  <strong>Overseas Production:</strong> Cost-effective solution for larger orders with extended lead times.
                </p>
              )}
            </div> */}
          </div>
        </section>

        {/* Nickname Section */}
        <section className="section">
          <h2 className="section-title">Order Nickname</h2>
          <div className="form-group">
            <label className="form-label">Nickname:</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              placeholder="e.g., John's Golf Order"
              className="form-input"
            />
          </div>
        </section>

        {/* Due Date Section */}
        <section className="section">
          <h2 className="section-title">Due Date</h2>
          <div className="form-group">
            <label className="form-label">Required Completion Date:</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              min={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              className="form-input"
              required
            />
            <div className="due-date-disclaimer">
              <strong>⚠️ Important:</strong> All orders require a minimum of <strong>two weeks</strong> lead time. 
              Please select a date that is at least 14 days from today's date to ensure proper processing and delivery.
            </div>
          </div>
        </section>

        {/* Product Selection Section */}
        <section className="section">
          <h2 className="section-title">Product Selection</h2>
          
          <div className="form-group refresh-btn">
            <button 
              type="button" 
              onClick={fetchProducts} 
              disabled={loading}
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Loading...' : 'Refresh Products'}
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Select Product:</label>
            <div className="searchable-select-container">
              <input
                type="text"
                value={productSearch}
                onChange={handleProductSearch}
                onFocus={() => setShowProductDropdown(true)}
                placeholder="Type to search products..."
                className="form-input searchable-input"
                autoComplete="off"
              />
              {showProductDropdown && filteredProducts.length > 0 && (
                <div className="custom-dropdown">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="dropdown-item"
                      onClick={() => handleProductSelect(product)}
                    >
                      {product.name}
                    </div>
                  ))}
                  {productSearch && filteredProducts.length === 0 && (
                    <div className="dropdown-item no-results">
                      No products found matching "{productSearch}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedProductDetails && (
            <div className="product-details">
              <strong>{selectedProductDetails.name}</strong>
              <p>{selectedProductDetails.description}</p>
            </div>
          )}

          {/* Quantity Mode Toggle */}
          {/* <div className="form-group">
            <div className="quantity-mode-toggle">
              <label className="form-label">Order Type:</label>
              <button
                type="button"
                onClick={toggleWholesaleMode}
                className={`toggle-btn ${isWholesaleMode ? 'wholesale' : 'single'}`}
              >
                <span className={`toggle-option ${!isWholesaleMode ? 'active' : ''}`}>
                  Single Quantity
                </span>
                <span className={`toggle-option ${isWholesaleMode ? 'active' : ''}`}>
                  Wholesale Sizes
                </span>
              </button>
            </div>
          </div> */}

          {/* Single Quantity Mode */}
          {/* {!isWholesaleMode && (
            <div className="form-group">
              <label className="form-label">Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                className="form-input quantity-input"
                required
              />
            </div>
          )} */}

          {/* Wholesale Sizes Mode */}
          {/* {isWholesaleMode && ( */}
            <div className="form-group">
              <label className="form-label">Product Sizes (Wholesale Orders):</label>
              <div className="sizes-grid">
                {Object.keys(formData.sizes).map(size => (
                  <div key={size} className="size-input-group">
                    <label className="size-label">{size}:</label>
                    <input
                      type="number"
                      name={`sizes.${size}`}
                      value={formData.sizes[size]}
                      onChange={handleInputChange}
                      min="0"
                      className="form-input size-input"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <div className="total-quantity">
                Total Units: {Object.values(formData.sizes).reduce((sum, qty) => sum + qty, 0)}
              </div>
            </div>
          {/* )} */}
        </section>

        {/* Decoration Section */}
        <section className="section">
          <h2 className="section-title">Decoration Options</h2>
          
          <div className="form-group">
            <label className="form-label">Decoration Type:</label>
            <select
              name="decorationType"
              value={formData.decorationType}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">-- No Decoration --</option>
              {decorationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {formData.decorationType && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Decoration Location:</label>
                  <select
                    name="decorationLocation"
                    value={formData.decorationLocation}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Select Location --</option>
                    {decorationLocations.map(location => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Decoration Size:</label>
                  <select
                    name="decorationSize"
                    value={formData.decorationSize}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Select Size --</option>
                    {decorationSizes.map(size => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Upload Design File:</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    name="decorationFile"
                    onChange={handleInputChange}
                    className="file-input"
                    accept="image/*,.pdf,.ai,.eps,.svg"
                    id="decoration-file"
                  />
                  <label htmlFor="decoration-file" className="file-input-label">
                    {formData.decorationFile ? formData.decorationFile.name : 'Choose File...'}
                  </label>
                  <div className="file-help-text">
                    Accepted formats: JPG, PNG, PDF, AI, EPS, SVG (Max 10MB)
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {formData.decorationType === 'custom' ? 'Custom Design Description:' : 'Decoration Details:'}
                </label>
                <textarea
                  name="customDecoration"
                  value={formData.customDecoration}
                  onChange={handleInputChange}
                  placeholder="Describe your decoration requirements, text, logo details, colors, etc."
                  className="form-textarea"
                />
              </div>
            </>
          )}
        </section>

        {/* Customer Information Section */}
        <section className="section">
          <h2 className="section-title">Customer Information</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name:</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* <div className="form-group">
            <label className="form-label">Phone Number:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
            />
          </div> */}
        </section>

        {/* Delivery Address Section for Local */}
        {productionLocation === 'local' && (
          <section className="section">
            <h2 className="section-title">Delivery Address</h2>
            
            <div className="form-group">
              <label className="form-label">Street Address:</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">City:</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">State/Province:</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ZIP/Postal Code:</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country:</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  placeholder="e.g., United States"
                  className="form-input"
                />
              </div>
            </div>
          </section>
        )}

        {/* Delivery Address Section for Overseas */}
        {productionLocation === 'overseas' ? (
        <section className="section">
          <h2 className="section-title">Delivery Method</h2>

          <div className="form-group">
            <label className="form-label">Select Delivery Method:</label>
            <select
              name="deliveryMethod"
              value={formData.deliveryMethod}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select a delivery method</option>
              <option value="Yatta">Deliver to Yatta</option>
              <option value="Client">Ship directly to client</option>
              <option value="Truwear">Hold at Truwear</option>
            </select>
          </div>
        </section>
        ) : null}

        {/* Special Instructions */}
        <section className="section">
          <h2 className="section-title">Special Instructions</h2>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleInputChange}
            placeholder="Any special delivery instructions or additional notes..."
            className="form-textarea large"
          />
        </section>

        {/* Submit Button */}
        <div className="submit-container">
          <button
            type="submit"
            className="submit-btn"
          >
            Submit Order
          </button>
        </div>
      </form>
    </div>
  );
}