import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

function App() {
  // State for products and form data
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    selectedProduct: '',
    decorationType: '',
    customDecoration: '',
    quantity: 1,
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
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#2c5530' }}>Yatta Golf - Custom Product Order</h1>
      
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        
        {/* Product Selection Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c5530', borderBottom: '2px solid #2c5530', paddingBottom: '5px' }}>Product Selection</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <button 
              type="button" 
              onClick={fetchProducts} 
              disabled={loading}
              style={{ 
                padding: '10px 15px', 
                backgroundColor: '#2c5530', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Loading...' : 'Refresh Products'}
            </button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Product:</label>
            <select
              name="selectedProduct"
              value={formData.selectedProduct}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
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
            <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px', marginBottom: '15px' }}>
              <strong>{selectedProductDetails.name}</strong> - ${selectedProductDetails.price}
              <p style={{ margin: '5px 0', color: '#666' }}>{selectedProductDetails.description}</p>
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              style={{ width: '100px', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
              required
            />
          </div>
        </section>

        {/* Decoration Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c5530', borderBottom: '2px solid #2c5530', paddingBottom: '5px' }}>Decoration Options</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Decoration Type:</label>
            <select
              name="decorationType"
              value={formData.decorationType}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
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
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                {formData.decorationType === 'custom' ? 'Custom Design Description:' : 'Decoration Details:'}
              </label>
              <textarea
                name="customDecoration"
                value={formData.customDecoration}
                onChange={handleInputChange}
                placeholder="Describe your decoration requirements, text, logo details, etc."
                style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd', resize: 'vertical', minHeight: '80px' }}
              />
            </div>
          )}
        </section>

        {/* Customer Information Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c5530', borderBottom: '2px solid #2c5530', paddingBottom: '5px' }}>Customer Information</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Full Name:</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          </div>
        </section>

        {/* Delivery Address Section */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c5530', borderBottom: '2px solid #2c5530', paddingBottom: '5px' }}>Delivery Address</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Street Address:</label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City:</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>State/Province:</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ZIP/Postal Code:</label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Country:</label>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                placeholder="e.g., United States"
                style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
            </div>
          </div>
        </section>

        {/* Special Instructions */}
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#2c5530', borderBottom: '2px solid #2c5530', paddingBottom: '5px' }}>Special Instructions</h2>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleInputChange}
            placeholder="Any special delivery instructions or additional notes..."
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ddd', resize: 'vertical', minHeight: '100px' }}
          />
        </section>

        {/* Submit Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#2c5530',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1a3d1f'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2c5530'}
          >
            Submit Order
          </button>
        </div>
      </form>
    </div>
  );
}