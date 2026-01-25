# 📍 APP GLOBAL STRUCTURE

## 🧭 Global Layout System

### 🔹 Mobile Layout (Primary)

- **Top App Bar**
  - Logo (left)
  - Profile avatar (right)
- **Bottom Navigation Bar**
  - Home
  - Explore
  - Exchanges (Dashboard)
  - Profile

### 🔹 Desktop Layout

- Top Navbar:
  - Logo
  - Browse
  - Sell
  - Exchanges
  - Profile
- Right-side profile dropdown

---

# 🏠 LANDING PAGE DESIGN ( / )

## ✅ Sections (In Exact Order)

### 1️⃣ Hero Section

- Big headline:

  **“Exchange Books. Save Money. Build Community.”**

- CTA Buttons:
  - Start Exchanging
  - Browse Books

- Background: Mesh gradient + glass card

---

### 2️⃣ How It Works (3 Steps)

**Card UI**

1. 📦 Donate a Book → Earn Credits
2. 💳 Use Credits → Get Another Book
3. 🔁 Repeat → Circular Economy

---

### 3️⃣ Feature Highlights Grid

- Credit System
- Instant Exchange
- Mobile PWA
- Community Driven
- Zero Cash Dependency

---

### 4️⃣ Community Stats Section

- Total Books Listed
- Total Exchanges
- Active Users
- Credits Circulating

Use animated counters.

---

### 5️⃣ Call to Action Section

Big centered card:

👉 “Join the Book Exchange Revolution”

Buttons:

- Sign Up
- Learn How It Works

---

### 6️⃣ Footer

- Terms
- Privacy
- Contact
- GitHub / LinkedIn
- PWA install badge

---

# 🔐 AUTH PAGES

## 🔑 LOGIN PAGE ( /login )

- Minimal centered card
- Fields:
  - Email
  - Password
- Buttons:
  - Login
  - Google OAuth (future)
- Redirect → Dashboard or Home

---

## 🆕 SIGNUP PAGE ( /signup )

### Step 1: Account

- Email
- Password

### Step 2: Profile Setup

- Username
- Profile Picture URL
- Bio

### Step 3: Initial Credits

- Show default credits (e.g., 10 starter credits)

---

# 📚 EXPLORE PAGE ( /browse )

## 🔹 Mobile UI

- 2-column grid cards
- Infinite scroll

## 🔹 Book Card UI

- Book Image
- Title
- Author
- Condition badge
- Credits required
- “View” button

---

## 🔍 Filters Panel

- Search by title/author
- Category
- Condition (New, Good, Worn)
- Credits range

---

# 📖 SINGLE BOOK PAGE ( /books/[id] )

## ✅ Layout Sections

### 1️⃣ Book Hero Card

- Big image
- Title
- Author
- Credits price badge

---

### 2️⃣ Book Details

- Condition
- Description
- Category
- Listed date

---

### 3️⃣ Seller Info Card

- Profile picture
- Username
- Sold count
- Rating (future feature)

---

### 4️⃣ Action Panel

- Buy With Credits Button
- Show user credits balance

---

# 🪙 SELL PAGE ( /sell )

## 🔹 New Listing Form

Fields:

- Book Title
- Author
- Category
- Condition
- Credits Price
- Image URL

Buttons:

- Submit
- Save Draft

---

## 🔹 Edit Mode

- Trigger: `/sell?edit=ID`
- Pre-filled form
- Update / Delete buttons

---

# 📊 DASHBOARD PAGE ( /exchanges )

**This is the CENTRAL HUB**

---

## 🧩 Tabs Layout

### 🔹 My Listings

- Books currently selling
- Status: Available / Sold

---

### 🔹 My Purchases

- Books bought
- Transaction date
- Credits spent

---

### 🔹 Sold Books

- Books sold
- Credits earned

---

# 👤 PROFILE PAGE ( /profile )

## 📱 Instagram-Style Layout

---

### 1️⃣ Profile Header

- Avatar
- Username
- Bio

---

### 2️⃣ Stats Bar

- Credits
- Posts
- Sold Count

---

### 3️⃣ Books Grid Gallery

- All listed books in visual grid
- Click → book detail

---

### 4️⃣ Settings Drawer (Slide Panel)

- Privacy Policy
- Terms
- Logout
- Edit Profile

---

# 👑 ADMIN DASHBOARD ( /admin )

## Restricted Route (Role-Based)

### Admin Panels:

- User Management
- Book Moderation
- Transactions Logs
- Credits Monitoring
- Ban/Remove Content

---

# 📘 HOW IT WORKS PAGE ( /how-it-works )

## Sections:

- Step-by-step explanation
- Credit system logic
- FAQs
-
