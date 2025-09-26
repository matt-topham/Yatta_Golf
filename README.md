# Yatta Golf - Custom Product Order Form

A React-based web application for ordering custom golf products with personalized decoration options and delivery management.

## 🏌️ Purpose

Yatta Golf is a web form application designed to streamline the process of ordering custom golf merchandise. The application allows customers to:

- Browse and select from available golf products (polos, caps, towels, golf balls, etc.)
- Choose from various decoration options (embroidery, screen printing, heat transfer, engraving, custom designs)
- Provide detailed customization specifications
- Enter customer information and delivery address
- Submit complete orders with special instructions

This form is perfect for golf tournaments, corporate events, golf shops, or any business offering customized golf merchandise.

## ✨ Features

### Product Management
- **Dynamic Product Loading**: Fetches product catalog from backend API
- **Product Selection**: Dropdown menu with product names and prices
- **Product Details**: Displays description and pricing information
- **Quantity Selection**: Allows customers to specify order quantities

### Customization Options
- **Decoration Types**: Multiple decoration methods available
  - Embroidery
  - Screen Print
  - Heat Transfer
  - Engraving
  - Custom Design
- **Custom Specifications**: Text area for detailed decoration requirements
- **Flexible Options**: Decoration is optional for standard products

### Customer Information
- **Contact Details**: Name, email, and phone collection
- **Order Management**: Complete customer information for order tracking
- **Communication**: Email for order updates and confirmations

### Delivery Management
- **Complete Address Form**: Street, city, state, ZIP, country
- **Special Instructions**: Additional delivery notes and requirements
- **Address Validation**: Required fields ensure complete delivery information

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Form Validation**: Client-side validation with user-friendly error messages
- **Loading States**: Visual feedback during API calls
- **Professional Styling**: Golf-themed color scheme with clean, modern design

## 🚀 Getting Started

### Prerequisites

Before running this application, make sure you have the following installed on your machine:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/matt-topham/Yatta_Golf.git
   cd Yatta_Golf
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install additional dependencies** (if not already included):
   ```bash
   npm install react react-dom
   ```

### Running the Application

#### Option 1: Development Server (Recommended)

If you have a build tool like Vite or Create React App configured:

```bash
npm start
# or
npm run dev
```

#### Option 2: Simple HTTP Server

For a quick setup without a build tool:

1. **Install a simple HTTP server**:
   ```bash
   npm install -g http-server
   ```

2. **Create an HTML file** (`public/index.html`):
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Yatta Golf - Custom Orders</title>
       <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
       <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
       <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
   </head>
   <body>
       <div id="root"></div>
       <script type="text/babel" src="../src/index.jsx"></script>
   </body>
   </html>
   ```

3. **Start the server**:
   ```bash
   http-server -p 3000
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

#### Option 3: Using a Bundler (esbuild)

Since you already have esbuild in your terminal history:

1. **Install esbuild** (if not already installed):
   ```bash
   npm install --save-dev esbuild
   ```

2. **Create a build script** in your `package.json`:
   ```json
   {
     "scripts": {
       "build": "esbuild src/index.jsx --bundle --outfile=dist/bundle.js --format=esm",
       "dev": "esbuild src/index.jsx --bundle --outfile=dist/bundle.js --format=esm --watch --servedir=public"
     }
   }
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

### Configuration

#### Backend API Integration

To connect to your backend API:

1. **Update the API endpoint** in `src/index.jsx`:
   ```javascript
   // Replace this line in the fetchProducts function:
   const response = await fetch('/api/products');
   
   // With your actual API endpoint:
   const response = await fetch('https://your-api-domain.com/api/products');
   ```

2. **Configure CORS** on your backend to allow requests from your frontend domain.

3. **Update the form submission** in the `handleSubmit` function to send data to your backend.

#### Environment Variables

Create a `.env` file in the root directory for environment-specific settings:

```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENVIRONMENT=development
```

## 📁 Project Structure

```
Yatta_Golf/
├── src/
│   └── index.jsx          # Main React component and application logic
├── public/               
│   └── index.html         # HTML template (if using)
├── dist/                  # Built files (generated)
├── package.json           # Project dependencies and scripts
├── README.md              # This file
└── .env                   # Environment variables (create if needed)
```

## 🛠️ Development

### Adding New Features

1. **New Product Fields**: Modify the `formData` state in `src/index.jsx`
2. **Additional Decoration Types**: Update the `decorationTypes` array
3. **Form Validation**: Enhance the validation logic in `handleSubmit`
4. **Styling**: Modify the inline styles or add a CSS file

### API Integration

The application expects your backend API to return product data in this format:

```json
[
  {
    "id": 1,
    "name": "Golf Polo Shirt",
    "price": 45.99,
    "description": "Premium cotton golf polo"
  }
]
```

### Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting service (Netlify, Vercel, AWS S3, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📧 Support

For questions or support, please contact the development team or create an issue in the repository.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Golfing! 🏌️‍♂️**

