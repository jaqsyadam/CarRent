🚗 CarRent - Car Sharing and Rental Platform
CarRent is a robust car-sharing and rental platform designed to streamline the process of booking, managing, and tracking car rentals. This platform supports both customers and administrators with powerful features for smooth operations.

Group SE-2318
Team Members:
-Zhansaya Serikkali
-Yerassyl Bekessov

🎯 Project Goals
Seamless Car Rental Process: Provide an intuitive interface for customers to search, book, and manage car rentals easily.
Advanced Admin Management: Allow administrators to oversee bookings, manage users, and generate detailed reports for better business insights.
Scalable Architecture: Ensure the system is optimized for performance, handling large volumes of bookings and users effectively.
Secure Data Handling: Implement secure authentication, authorization, and data encryption for safe user interactions.

⚙️ Core Features
🚀 For Customers:
User Registration & Authentication: Secure sign-up, login, password recovery, and OTP verification.
Car Listings with Filters: Advanced search and filter options based on brand, engine, transmission, drive type, and price range.
Booking Management: Book, view, modify, or cancel reservations with ease.
Payment Integration: Secure payment processing with history tracking.
Booking History: Access to past bookings and payment records.

🔐 For Admins:
Dashboard Access: Manage cars, bookings, payments, and users from a centralized dashboard.
Advanced Data Reporting: Generate insightful reports using aggregation pipelines (revenue per user, bookings per status, etc.).
Automated Cleanup: Scheduled tasks to clean expired bookings and failed payments.

🗂️ Tech Stack
Backend: Node.js, Express.js
Database: MongoDB (with Mongoose ODM)
Frontend: HTML, CSS, JavaScript (vanilla JS)
Authentication: JWT-based secure auth with OTP verification
Task Scheduler: Node-Cron for scheduled operations
Deployment: Render

🛠️ Key Functionalities
📊 Advanced Data Operations:
CRUD Operations: Robust Create, Read, Update, and Delete operations for bookings, cars, and payments.
Advanced Update & Deletion:
Update booking status using both userId and bookingId.
Auto-deletion of expired bookings and failed payments older than 30 days.
Aggregation Pipelines:
Total revenue reports by user.
Count of cars per brand.
Booking reports based on status.
Compound Indexing for Optimization:
Optimized MongoDB queries using compound indexes for faster data retrieval.
⏰ Automated Cron Jobs:
Daily cleanup of old bookings and failed payments to ensure database performance.
