Link - https://mealmate-xp8k.onrender.com/


# MealMate – Food Delivery Platform

MealMate is a full-stack MERN-based food delivery platform designed to connect customers, restaurant/shop owners, and delivery partners through a single real-time application.

## Architecture

The application follows a client-server architecture with a React frontend and a Node.js/Express backend. MongoDB is used for persistent data storage through Mongoose, while Socket.IO provides real-time communication for order updates, delivery assignments, and live delivery tracking.

```text
React Frontend
      │
      ├── React Router
      ├── Redux Toolkit
      ├── Axios
      └── Socket.IO Client
              │
              ▼
      Node.js + Express
              │
      ├── JWT Authentication
      ├── REST APIs
      ├── Controllers
      ├── Mongoose
      └── Socket.IO
              │
       ┌──────┴──────┐
       ▼             ▼
    MongoDB       Real-Time Events
       │             │
       ├── Users     ├── New Orders
       ├── Shops     ├── Status Updates
       ├── Items     ├── Assignments
       ├── Orders    └── Live Location
       └── Delivery Assignments
```

## User Roles

### Customer

* Register and login
* Browse nearby shops and food items
* Search food by name/category
* Add items to cart
* Place orders
* Pay using COD or Razorpay
* Track order status and delivery location
* Rate food items

### Shop Owner

* Create and manage a shop
* Add, edit and delete food items
* Receive new orders in real time
* Update order status
* Trigger delivery assignment

### Delivery Partner

* Receive nearby delivery assignments
* Accept delivery requests
* Share live location
* View current delivery
* Complete delivery using OTP verification
* View daily delivery statistics

## Core Technologies

**Frontend:** React.js, Redux Toolkit, React Router, Axios, Tailwind CSS, Leaflet, Socket.IO Client

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Socket.IO

**Third-Party Services:** Razorpay for online payments, Cloudinary for image storage, Resend for email OTPs, Firebase for Google authentication.

## Authentication

JWT-based authentication is implemented using HTTP-only cookies. Protected routes use authentication middleware to verify the token and attach the authenticated user's ID to the request.

## Order Management

A single customer order can contain items from multiple shops. During checkout, cart items are grouped by shop and stored as individual shop orders within the main order.

Order status follows:

`Pending → Preparing → Out of Delivery → Delivered`

## Real-Time Communication

Socket.IO is used where immediate updates are required:

* New order notifications to shop owners
* Order status updates to customers
* Delivery assignments to delivery partners
* Live delivery location updates

## Delivery Tracking

Customer delivery coordinates and delivery partner locations are stored using GeoJSON Point coordinates. MongoDB's 2dsphere indexing and geospatial queries are used to locate nearby delivery partners. Socket.IO broadcasts the delivery partner's live location to the tracking interface.

## Payment Flow

The platform supports Cash on Delivery and online payments through Razorpay. For online payments, the backend creates a Razorpay order and verifies the resulting payment before marking the MealMate order as paid.

## Image Management

Food and shop images are uploaded through Multer, temporarily stored on the server, uploaded to Cloudinary, and the resulting secure URL is stored in MongoDB.

## Security

* JWT authentication
* HTTP-only authentication cookie
* Password hashing with bcrypt
* Protected API routes
* Role-based application behavior
* CORS configuration
* OTP-based password reset
* OTP-based delivery verification

## Overall Flow

`Authentication → Location Detection → Shop Discovery → Food Selection → Cart → Checkout → Payment → Order Processing → Delivery Assignment → Live Tracking → OTP Verification → Delivery Completion`
