const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;
const JWT_SECRET = "nunnari_academy_secret_key_2024"; // In production, use env variable

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── In-Memory Database (simulates a real DB) ────────────────────────────────
const db = {
  organizations: [
    {
      id: "org-001",
      name: "Nunnari Academy",
      email: "admin@nunnari.com",
      password: bcrypt.hashSync("admin123", 10),
      industry: "Education",
      location: "Tamil Nadu, India",
      phone: "+91 98765 43210",
      createdAt: new Date("2024-01-01").toISOString(),
    },
    {
      id: "org-002",
      name: "TechCorp Solutions",
      email: "info@techcorp.com",
      password: bcrypt.hashSync("tech456", 10),
      industry: "Technology",
      location: "Chennai, India",
      phone: "+91 98765 11111",
      createdAt: new Date("2024-02-15").toISOString(),
    },
  ],
  employees: [
    { id: "emp-001", orgId: "org-001", name: "Arjun Kumar", role: "Instructor", dept: "Engineering", salary: 55000 },
    { id: "emp-002", orgId: "org-001", name: "Priya Sharma", role: "Admin", dept: "Operations", salary: 45000 },
    { id: "emp-003", orgId: "org-002", name: "Rahul Mehta", role: "Developer", dept: "Tech", salary: 70000 },
  ],
};

// ─── JWT Middleware (Auth Guard) ──────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "❌ Access denied. No token provided. Please login first.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "❌ Invalid or expired token. Please login again.",
    });
  }
};

// ════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES (No token required)
// ════════════════════════════════════════════════════════════════════

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Nunnari Academy – Full Stack JWT API is running!",
    version: "1.0.0",
    endpoints: {
      public: ["POST /api/auth/register", "POST /api/auth/login", "GET /api/organizations"],
      protected: ["GET /api/profile", "GET /api/dashboard", "GET /api/employees", "PUT /api/organizations/:id", "DELETE /api/organizations/:id"],
    },
  });
});

// ─── REGISTER ────────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, industry, location, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    const existing = db.organizations.find((o) => o.email === email);
    if (existing) {
      return res.status(409).json({ success: false, message: "Organization with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newOrg = {
      id: `org-${uuidv4().slice(0, 6)}`,
      name,
      email,
      password: hashedPassword,
      industry: industry || "General",
      location: location || "India",
      phone: phone || "",
      createdAt: new Date().toISOString(),
    };

    db.organizations.push(newOrg);

    const { password: _, ...orgData } = newOrg;
    res.status(201).json({ success: true, message: "✅ Organization registered successfully!", data: orgData });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
});

// ─── LOGIN (Returns JWT Token) ────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const org = db.organizations.find((o) => o.email === email);
    if (!org) {
      return res.status(401).json({ success: false, message: "❌ Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, org.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "❌ Invalid credentials." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: org.id, email: org.email, name: org.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...orgData } = org;
    res.json({
      success: true,
      message: `✅ Welcome back, ${org.name}!`,
      token,
      expiresIn: "24h",
      organization: orgData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// ─── GET ALL ORGANIZATIONS (Public) ──────────────────────────────────────────
app.get("/api/organizations", (req, res) => {
  const publicList = db.organizations.map(({ password, ...org }) => org);
  res.json({ success: true, count: publicList.length, data: publicList });
});

// ════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES (Token required — Bearer Token)
// ════════════════════════════════════════════════════════════════════

// ─── PROFILE (Protected) ─────────────────────────────────────────────────────
app.get("/api/profile", authenticateToken, (req, res) => {
  const org = db.organizations.find((o) => o.id === req.user.id);
  if (!org) return res.status(404).json({ success: false, message: "Organization not found." });

  const { password, ...profile } = org;
  res.json({
    success: true,
    message: "✅ Profile fetched successfully (Protected Route)",
    data: profile,
  });
});

// ─── DASHBOARD (Protected) ───────────────────────────────────────────────────
app.get("/api/dashboard", authenticateToken, (req, res) => {
  const orgEmployees = db.employees.filter((e) => e.orgId === req.user.id);
  const totalSalary = orgEmployees.reduce((sum, e) => sum + e.salary, 0);

  res.json({
    success: true,
    message: "✅ Dashboard data (Protected Route)",
    data: {
      organization: req.user.name,
      stats: {
        totalEmployees: orgEmployees.length,
        totalSalaryBudget: totalSalary,
        departments: [...new Set(orgEmployees.map((e) => e.dept))],
      },
      employees: orgEmployees,
      lastLogin: new Date().toISOString(),
    },
  });
});

// ─── GET EMPLOYEES (Protected) ───────────────────────────────────────────────
app.get("/api/employees", authenticateToken, (req, res) => {
  const orgEmployees = db.employees.filter((e) => e.orgId === req.user.id);
  res.json({ success: true, count: orgEmployees.length, data: orgEmployees });
});

// ─── UPDATE ORGANIZATION (Protected) — Task 1: Update API ───────────────────
app.put("/api/organizations/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  // Only allow updating own organization
  if (id !== req.user.id) {
    return res.status(403).json({ success: false, message: "❌ You can only update your own organization." });
  }

  const orgIndex = db.organizations.findIndex((o) => o.id === id);
  if (orgIndex === -1) {
    return res.status(404).json({ success: false, message: "Organization not found." });
  }

  const { name, industry, location, phone } = req.body;
  const updatedOrg = {
    ...db.organizations[orgIndex],
    ...(name && { name }),
    ...(industry && { industry }),
    ...(location && { location }),
    ...(phone && { phone }),
    updatedAt: new Date().toISOString(),
  };

  db.organizations[orgIndex] = updatedOrg;
  const { password, ...responseData } = updatedOrg;

  res.json({
    success: true,
    message: "✅ Organization updated successfully! (UI → Backend → DB → Response → UI)",
    data: responseData,
  });
});

// ─── ADD EMPLOYEE (Protected) ─────────────────────────────────────────────────
app.post("/api/employees", authenticateToken, (req, res) => {
  const { name, role, dept, salary } = req.body;
  if (!name || !role || !dept) {
    return res.status(400).json({ success: false, message: "Name, role, and dept are required." });
  }

  const newEmployee = {
    id: `emp-${uuidv4().slice(0, 6)}`,
    orgId: req.user.id,
    name,
    role,
    dept,
    salary: salary || 0,
  };

  db.employees.push(newEmployee);
  res.status(201).json({ success: true, message: "✅ Employee added successfully!", data: newEmployee });
});

// ─── DELETE ORGANIZATION (Protected) ─────────────────────────────────────────
app.delete("/api/organizations/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  if (id !== req.user.id) {
    return res.status(403).json({ success: false, message: "❌ You can only delete your own organization." });
  }

  db.organizations = db.organizations.filter((o) => o.id !== id);
  res.json({ success: true, message: "✅ Organization deleted successfully." });
});

// ─── TOKEN VERIFY UTILITY ─────────────────────────────────────────────────────
app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ success: true, message: "✅ Token is valid!", user: req.user });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Test credentials:`);
  console.log(`   Email: admin@nunnari.com | Password: admin123`);
  console.log(`   Email: info@techcorp.com | Password: tech456\n`);
});
