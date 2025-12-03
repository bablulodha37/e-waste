🌱 EcoSaathi – Sustainable E-Waste Management Platform

EcoSaathi is a full-stack web application designed to promote responsible e-waste recycling, connect users with certified pickup partners, and provide admins with a powerful dashboard for managing users, requests, issues, and pickup personnel.

This platform supports secure data destruction, OTP-based verification, real-time tracking, and automated email notifications.

📌 Features Overview
👤 Users

Register & Login

Submit detailed e-waste pickup requests

Upload device photos (1–5 images)

Real-time pickup tracking (via Google Maps)

View request history

Download eco-certificate after 10 successful pickups

File support tickets & chat with support

Reset password via OTP

Update profile & upload profile picture

🚛 Pickup Persons

Login with email & password

See assigned requests

Update live GPS location

Complete pickups using OTP verification

Receive email notifications when assigned

🛠️ Admin Panel

Manage all users (verify/reject)

Manage pickup requests (approve, schedule, assign pickup partner, complete)

Add/update/delete pickup persons

View issue tickets & reply

Dashboard analytics: users, requests, graph view

Auto-generate emails:

Welcome mail

OTP mail

Request updates

Assignment notifications

Issue replies

Certificate eligibility

🧩 Tech Stack
Backend

Java 17

Spring Boot

Spring MVC

Spring Security

Spring Data JPA

MySQL

BCrypt Password Encoder

JavaMail Sender (for email notifications)

Frontend

React.js

Axios

Recharts (graphs)

HTML2PDF.js (certificate generator)

Other Integrations

OpenStreetMap Nominatim API (Address autocomplete)

Google Maps Direction API (Live tracking URL)

📂 Project Structure
Backend (Spring Boot)
src/
 └── main/java/com/lodha/EcoSaathi
        ├── Config/         # Security, file storage, data loader
        ├── Controller/     # User, Admin, Pickup, Auth, Chatbot
        ├── Service/        # Business logic
        ├── Repository/     # JPA Repositories
        ├── Entity/         # Models (User, Request, Issue, PickupPerson)

Frontend (React)
src/
 ├── components/
 │      ├── AddressAutocomplete.js
 │      ├── Admin.js
 │      ├── ChatBot.js
 │      ├── CertificateGenerator.js
 │      ├── RequestManagement.js
 │      ├── IssueManagement.js
 │      ├── PickupPersonManagement.js
 │      ├── PhotoPreviewModal.js
 │      ├── PickupOTPVerify.js
 │      ├── UserSupport.js
 ├── css/
 │      ├── Home.css
 │      ├── Login.css
 │      ├── Certificate.css
 │      ├── ChatBot.css
 │      ├── UserSupport.css
 │      └── etc…
 ├── pages/
 ├── api.js

⚙️ Backend Setup
1. Clone the Project
git clone https://github.com/yourusername/ecosaathi.git
cd ecosaathi

2. Configure MySQL

Create a database:

CREATE DATABASE ecosaathi;

3. Configure application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecosaathi
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD

file.upload-dir=uploads/

app.mail.sender=your-email@gmail.com
app.mail.sender-name=EcoSaathi
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

4. Run Backend
mvn spring-boot:run


A default admin account will auto-generate:
Email: admin@ecosaathi.com

Password: Admin@123

🖥️ Frontend Setup (React)
1. Install Dependencies
npm install

2. Start Development Server
npm start

3. Access the App

User Panel → http://localhost:3000

Admin Panel → http://localhost:3000/admin

Pickup Dashboard → http://localhost:3000/pickup-dashboard/:id

📧 Email Notifications Included

User Welcome Email

Pickup Person Welcome Email

Forgot Password OTP

Request Submitted

Request Approved

Request Scheduled

Request Completed

Issue Reply / Issue Closed

Pickup Assignment with vehicle details

🔒 Security

Spring Security configuration

BCrypt password encryption

OTP-based request verification

Role-based access (USER, ADMIN, PICKUP_PERSON)

🎖️ Certificate Generator

Auto-unlocks after 10 completed pickups

User can download PDF

Beautiful, professional certificate layout

🗺️ Live Tracking

Pickup person updates GPS →
User gets a Google Maps navigation link with live coordinates.

💬 Support Chat System

Ticket creation

Real-time conversation

Status updates (OPEN, WAITING_FOR_USER, RESOLVED, CLOSED)

📦 Photo Upload

Upload up to 5 images per request

Preview with zoom & drag modal

🤖 EcoSaathi AI Chatbot

Integrated bot on the website

Helps users with navigation, FAQs, request flow

📄 License

MIT License

🤝 Contributing

Pull requests are welcome!
Please open an issue first to discuss the change.

📞 Contact

Developer: Bablu Lodha
📧 Email → bablulodha37@gmail.com