# ♻️ EcoSaathi – Smart E-Waste Management Platform

EcoSaathi is a full-stack platform designed to simplify and digitize e-waste pickup management.  
It connects **Users**, **Pickup Agents**, and **Admins** through an automated system featuring:

- Automated request handling  
- Live pickup tracking  
- OTP-based verification  
- AI Chatbot  
- Issue/Ticket management  
- Certificate generation  
- Email notifications  
- Admin dashboard  

---

## 🌍 Vision
To create a cleaner and greener environment by making e-waste recycling simple, accessible, and transparent.

---

# 🚀 Features

## 👤 **User Features**
✔ Register & Login  
✔ Submit e-waste pickup requests with images  
✔ Track request status  
✔ Upload profile picture  
✔ Auto-generated OTP for secure handover  
✔ View completed request stats  
✔ Download Eco-Certificate after 10 completed pickups  
✔ Raise support tickets & chat with admin  
✔ Live pickup tracking (Google Maps direction)

---

## 🛠️ **Admin Features**
✔ Manage all users (verify / reject)  
✔ Manage pickup requests (approve, reject, schedule, complete)  
✔ Assign Pickup Person  
✔ Add/Edit/Delete Pickup Persons  
✔ View platform analytics  
✔ Issue management (reply, close ticket)  
✔ Dashboard stats + Line graph  
✔ Auto-email notifications for every important action  
✔ Auto Admin creation on first app run  

---

## 🚛 **Pickup Person App**
✔ Login via email/password  
✔ View assigned requests  
✔ Update live location  
✔ Mark request completed using OTP  
✔ View pickup details  
✔ Simple clean UI  

---

## 🤖 AI ChatBot  
✔ Smart automated replies  
✔ Page-aware bot  
✔ User-aware bot  
✔ Simple REST API: `/api/bot/chat`

---

## ✉ Email Notification System
Uses **JavaMailSender** to send rich HTML templates for:

- Welcome Email  
- Request Submitted  
- Request Status Updates  
- Pickup Person account onboarding  
- Password reset OTP  
- Issue reply and closure  

Asynchronous sending via `@Async`.

---

## 🧾 Certificate Generator (HTML → PDF)
✔ Beautiful certificate template  
✔ Uses **html2pdf.js**  
✔ Unlock after completing 10 pickups  
✔ Auto user name, date, count  

---

## 🎟 Advanced Support / Ticket System
✔ Users can raise issues  
✔ Chat-like conversation panel  
✔ Admin/Users both can reply  
✔ Email updates on each reply  
✔ Ticket statuses: `OPEN`, `WAITING_FOR_USER`, `RESOLVED`, `CLOSED`

---

# 🏗 Tech Stack

## Backend (Spring Boot)
- Java 17  
- Spring Boot  
- Spring Security  
- JPA / Hibernate  
- MySQL  
- Java Mail Sender  
- Lombok  
- Docker-ready structure  

## Frontend (React)
- React 18  
- Axios  
- React Router  
- Recharts  
- HTML2PDF.js  
- Custom UI with CSS  

---

# 📁 Folder Structure (Important)

```
EcoSaathi/
 ├── backend/
 │    ├── Config/
 │    ├── Controller/
 │    ├── Entity/
 │    ├── Service/
 │    ├── Repository/
 │    ├── application.properties
 │    └── EcoSaathiApplication.java
 │
 └── frontend/
      ├── src/components/
      ├── src/css/
      ├── src/pages/
      ├── public/
      └── package.json
```

---

# ⚙ Backend Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourname/EcoSaathi.git
cd EcoSaathi/backend
```

### 2. Configure MySQL
Create DB:
```sql
CREATE DATABASE ecosaathi;
```

### 3. Configure `application.properties`
```
spring.datasource.url=jdbc:mysql://localhost:3306/ecosaathi
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

file.upload-dir=uploads

app.mail.sender=your-email@gmail.com
app.mail.sender-name=EcoSaathi
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 4. Run Backend
```bash
mvn spring-boot:run
```

---

# 🖥 Frontend Setup

### 1. Install packages
```bash
cd ../frontend
npm install
```

### 2. Start React app
```bash
npm start
```

Frontend URL: `http://localhost:3000`  
Backend URL: `http://localhost:8080`

---

# 🔑 API Endpoints (Short Overview)

## User Auth (`/api/auth`)
- POST `/register`
- POST `/login`
- POST `/forgot-password`
- POST `/reset-password`
- POST `/user/{id}/request`
- GET  `/user/{id}/stats`
- POST `/user/{id}/profile-picture`

## Admin (`/api/admin`)
User Management  
Pickup Person Management  
Request Management  
Issue Management  

## Pickup Person (`/api/pickup`)
- POST `/login`
- GET `/id/requests`
- PUT `/request/complete/{id}`  

## Issue System (`/api/issues`)
- POST `/create/user/{id}`
- GET `/user/{id}`
- POST `/{issueId}/reply`
- GET `/{issueId}`  

---

# 🗺 Live Tracking
Uses a Google Maps formatted URL:
```
https://www.google.com/maps/dir/?api=1&origin=USER_LOCATION&destination=PICKUP_PERSON_LAT_LNG
```

---

# 🎨 UI Features
- Modern animated home page  
- Admin dashboard with graphs  
- Certificates  
- Chatbot  
- Ticket system  
- OTP screens  
- Photo zoom modal  
- Clean responsive UI  

---

# 📸 Screenshots  
(Add your screenshots later)

```
![Dashboard](screenshots/dashboard.png)
![Requests](screenshots/requests.png)
![Certificate](screenshots/certificate.png)
![Chat](screenshots/chat.png)
```

---

# 🧩 Future Enhancements
- Mobile app  
- Push notifications  
- Real-time live tracking (WebSockets)  
- Reward system  
- Route optimization  

---

# 🤝 Contributing
Pull requests are welcome!  
For major changes, open an issue first.

---

# 📜 License
This project is **Open Source** under the **MIT License**.

---

# ❤️ Credits
Developed by **Bablu Lodha**  
Made with passion for a cleaner planet! 🌍♻️

