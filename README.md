# Service Request Portal (SRP)

A modern, full-stack Service Request Portal built with the MERN (MongoDB, Express, React, Node.js) stack. This application is designed to streamline service request management for organizations, featuring role-based dashboards, ticket tracking, and real-time communication.

## 🚀 Features

- **User Authentication**: Secure authentication using JWT and bcrypt.
- **Role-Based Access Control**:
  - **Admin**: Full system control, user management, and advanced analytics.
  - **Manager**: Oversees requests, assigns technicians, and tracks performance.
  - **Technician**: Manages assigned tickets and updates progress.
  - **Customer**: Submits and tracks their own service requests.
- **Ticket Management**:
  - Unique ticket number generation.
  - Priority levels (Low, Medium, High, Urgent).
  - Status tracking (Open, In Progress, Resolved, Pending, Closed).
  - File/Image uploads for request clarity.
- **Real-Time Updates**: Integration with Socket.io for live notifications and status changes.
- **Modern UI**: Professional design using React, Tailwind CSS, Framer Motion, and Chart.js for data visualization.
- **Analytics Dashboard**: Comprehensive metrics including ticket counts, resolution times, and team performance.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, TanStack Query, Framer Motion, Chart.js.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (with Mongoose).
- **Other**: JWT, Socket.io, Multer (for file uploads).

## 📁 Project Structure

```text
SRP-Project/
├── client/          # React frontend (Vite)
├── server/          # Node.js/Express backend
└── README.md        # Project documentation
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd SRP-Project
   ```

2. **Configure Environment Variables**:
   - Create a `.env` file in the `server/` directory and add:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

3. **Install Dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

### Running Locally

1. **Start the Backend**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

## 🌐 Deployment

The application is configured for deployment on platforms like Render or Vercel.
- **Backend**: Deploy the `server/` folder to Render.
- **Frontend**: Deploy the `client/` folder to Vercel/Netlify or Render.

## 📄 License

This project is licensed under the ISC License.
