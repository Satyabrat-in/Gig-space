const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({origin : ["https://gig-space-bay.vercel.app", "http://localhost:5173"]}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/reviews",      require("./routes/reviewRoutes"));
app.use("/api/escrow",       require("./routes/escrowRoutes"));
app.use("/api/search",       require("./routes/searchRoutes"));
app.use("/api/invitations",  require("./routes/invitationRoutes"));


// Base route
app.get("/", (req, res) => {
  res.send("Freelancing Platform API Running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));