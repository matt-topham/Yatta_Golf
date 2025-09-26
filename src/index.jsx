import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

function App() {
  // State for products and form data
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
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
    { value: 'heat-transfer', label: 'Heat Transfer' },
    { value: 'engraving', label: 'Engraving' },
    { value: 'custom', label: 'Custom Design' }
  ];

  // Decoration locations
  const decorationLocations = [
    { value: 'front-chest', label: 'Front Chest' },
    { value: 'front-center', label: 'Front Center' },
    { value: 'back-center', label: 'Back Center' },
    { value: 'back-upper', label: 'Back Upper' },
    { value: 'left-sleeve', label: 'Left Sleeve' },
    { value: 'right-sleeve', label: 'Right Sleeve' },
    { value: 'collar', label: 'Collar' },
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
      // Replace with your actual API endpoint
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // For demo purposes, setting mock data
      setProducts([
        { id: 1, name: 'Golf Polo Shirt', price: 45.99, description: 'Premium cotton golf polo' },
        { id: 2, name: 'Golf Cap', price: 25.99, description: 'Adjustable golf cap with UV protection' },
        { id: 3, name: 'Golf Towel', price: 15.99, description: 'Microfiber golf towel with clip' },
        { id: 4, name: 'Golf Balls Set', price: 35.99, description: 'Premium golf balls (dozen)' }
      ]);
    }
    setLoading(false);
  }

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
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.selectedProduct) {
      alert('Please select a product');
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

    // Submit form data (replace with actual API call)
    console.log('Form submitted:', formData);
    alert('Order submitted successfully!');
  };

  // Load products on component mount
  React.useEffect(() => {
    fetchProducts();
  }, []);

  const selectedProductDetails = products.find(p => p.id === parseInt(formData.selectedProduct));

  return (
    <div className="app-container">
      <h1 className="app-title">Yatta Golf - Custom Product Order</h1>
      
      <form onSubmit={handleSubmit} className="order-form">
        
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
            <select
              name="selectedProduct"
              value={formData.selectedProduct}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">-- Choose a Product --</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
          </div>

          {selectedProductDetails && (
            <div className="product-details">
              <strong>{selectedProductDetails.name}</strong> - ${selectedProductDetails.price}
              <p>{selectedProductDetails.description}</p>
            </div>
          )}

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

          {/* Product Sizes Section */}
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

        {/* Delivery Address Section */}
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