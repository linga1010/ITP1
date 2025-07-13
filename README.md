🌸 VK AURA — MERN STACK PROJECT
VK AURA is a fully-featured online Hindu spiritual shopping and service booking platform built with the MERN Stack (MongoDB, Express, React, Node.js). It offers a seamless experience for users to shop for temple products, book priests for rituals, manage profiles, and handle secure authentication, cloud-based image uploads, and automated email services.

📚 Features and Functionalities
🔐 User Management
User Registration with image upload
Secure Login with JWT authentication
Profile view & edit (name, phone, address, image)
Password change and forgot password via OTP email
Account deletion with password confirmation

🛒 Temple Product Store
View temple product listings
Place orders for items like pooja samagri, diyas, idols, etc.
View order history

📖 Book Priest Services
Book priests for rituals (Griha Pravesh, Satyanarayan, Marriage, etc.)
View and manage booked services


🖥️ Admin Dashboard
View and manage users (cannot delete own admin account)
Manage registered priests and their service details
View all user bookings and order records
☁️ Cloud Image Upload
Users can upload profile images via Cloudinary integration


📧 Email Services
OTP verification for password reset and signup
Email confirmations for orders and bookings
Managed via 4 independent Nodemailer configs


📦 Tech Stack
Frontend: React.js
Backend: Node.js, Express.js
Database: MongoDB Atlas
Authentication: JWT, bcrypt
Image Upload: Cloudinary
Email: Nodemailer (Gmail SMTP)
