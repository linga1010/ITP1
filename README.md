
# 🌸 VK AURA — MERN Stack Project

**VK AURA** is a comprehensive online Hindu spiritual shopping and priest service booking platform built using the MERN Stack (MongoDB, Express.js, React.js, Node.js). It offers a smooth, secure, and user-friendly experience for purchasing temple products, booking rituals with priests, managing profiles, uploading profile images, and receiving real-time email notifications.

---

## 🚀 Tech Stack

| Layer        | Technologies Used                     |
|--------------|----------------------------------------|
| Frontend     | React.js                              |
| Backend      | Node.js, Express.js                   |
| Database     | MongoDB Atlas                         |
| Authentication | JWT, bcrypt                        |
| Image Upload | Cloudinary                            |
| Email Service| Nodemailer (Gmail SMTP)               |

---

## 📚 Core Features

### 🔐 User Management
- User registration with profile image upload
- Secure login using JWT
- View and update profile (name, phone, address, image)
- Change or reset password via OTP email
- Delete account with password confirmation

### 🛒 Temple Product Store
- Browse and purchase temple products (pooja items, diyas, idols, etc.)
- Place and track orders
- View order history

### 📖 Priest Booking Services
- Book priests for various rituals (e.g., Griha Pravesh, Marriage)
- Manage service bookings

### 🖥️ Admin Dashboard
- Manage all registered users
- Prevent self-deletion for admins
- Manage priest data and services
- View user orders and bookings

### ☁️ Cloud-Based Image Upload
- Upload and store profile images via Cloudinary

### 📧 Email Notifications
- OTP-based verification and password reset
- Confirmation emails for bookings and purchases
- Managed via 5 dedicated Nodemailer files

---

## 🔄 How to Replace My Details With Yours

This project is pre-configured with sample MongoDB, Cloudinary, and Email credentials.  
To use the project with **your own data**, update the following files:

---

### ✅ MongoDB Configuration

Update the MongoDB URI in **both** of the following files:

```
📁 backend/.env  
📁 backend/src/.env
```

**Example format:**
```env
MONGO_URL=your_mongodb_connection_string
```

> ⚠️ Both `.env` files must contain the **same URI**.

---

### ✅ Email Configuration (Nodemailer)

Navigate to:

```
📁 backend/utils/
```

Update the following files with your own email and **App Password**:
- `emailService.js`
- `sendDeletionEmail.js`
- `sendPrayerEmail.js`
- `sendStatusUpdateEmail.js`
- `sendSurveyEmail.js`

**Replace this block in each file:**
```js
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password"
  }
});
```

> ⚠️ Use an [App Password](https://myaccount.google.com/apppasswords) instead of your Gmail login password.

---

### ✅ Cloudinary Configuration (Frontend)

Edit this file:

```
📁 frontend/src/pages/EditProfile.jsx
```

Replace these values:
```js
const cloudName = "your_cloud_name";
const uploadPreset = "your_upload_preset";
```

> ⚠️ These values are hardcoded — no `.env` file is needed for the frontend.

---

### ✅ Cloudinary Configuration (Backend)

Edit the file:

```
📁 backend/config/cloudinary.js
```

Replace the default configuration:
```js
cloudinary.config({
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret',
});
```

You can get these from your Cloudinary dashboard:  
🔗 https://cloudinary.com/console

> ⚠️ Never share your `api_secret` publicly.

---

## 👑 Make a New Admin (Manual Method)

If you want to give admin access to a new user:

1. Sign up a new account via the app.
2. Go to your **MongoDB Atlas** user collection.
3. Locate the new user’s document.
4. Change their `role` from:
```json
"role": "user"
```
to:
```json
"role": "admin"
```

> ⚠️ Only do this if you're comfortable modifying the database directly.

---

## 🧪 Demo Mode (Use Default Settings)

To preview the app without editing anything:

1. Clone the repository.
2. Run `npm install` in both `backend/` and `frontend/`.
3. Use the existing MongoDB, Email, and Cloudinary configurations already present.
4. The app will show **real data** and send email notifications to the default address.

> ⚠️ This mode is for **demo/testing only**. Do not use it for production.

---

## 🔐 Demo Admin Login

To access the Admin Panel in demo mode, use the following credentials:

```
📧 Email: skajanan2022@gmail.com 
🔑 Password: Kaja@123
```

This account has full admin rights.  
Use it to explore all backend features like user, booking, and priest management.

---

## 📦 How to Run the Project

### 1️⃣ Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### 2️⃣ Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

Use VS Code split terminal (`Ctrl + ~`, then `Ctrl + Shift + 5`) to run both at once.

---

## 📝 Final Notes
- ✅ `.env` files are already created — just replace the values.
- ✅ You must update **all 5 email files** in `backend/utils/`.
- ✅ Frontend Cloudinary config is hardcoded in `EditProfile.jsx`.
- ❌ Do not change folder structure or filenames — the project is structured intentionally for clean separation of concerns.

## 👨‍💻 Contributors

Built and maintained by:
- [Lingajan](https://github.com/linga1010)
- [Tharshikan](https://github.com/tharshihecker)
- [Kajanan](https://github.com/Kaja-Code)

## 📝 License
This project is licensed under the MIT License.
