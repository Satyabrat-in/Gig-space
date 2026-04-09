const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Project = require("./models/Project");

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected for Seeding"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

const seedDummyData = async () => {
  try {
    // 1. Create a dummy employer (so the projects have an owner)
    let employer = await User.findOne({ email: "dummyemployer@platform.com" });

    if (!employer) {
      // Note: the password string isn't hashed here, so this account shouldn't be used to log in. 
      // It's strictly for owning the dummy data to show freelancers.
      employer = await User.create({
        name: "Tech Solutions Inc.",
        email: "dummyemployer@platform.com",
        password: "dummy_password_unhashed",
        role: "employer",
        companyName: "Tech Solutions Hub",
      });
      console.log("👤 Dummy Employer created successfully.");
    }

    // 2. Define Dummy Projects
    const dummyProjects = [
      {
        title: "Build a Modern React E-Commerce Dashboard",
        description: "We are urgently looking for a skilled frontend developer to create a responsive admin dashboard for our e-commerce platform using React, Tailwind CSS, and Recharts.",
        budget: 65000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
        skillsRequired: ["React", "Tailwind CSS", "JavaScript"],
        category: "Web Development",
        employer: employer._id,
        status: "open"
      },
      {
        title: "Develop Cross-Platform Delivery App",
        description: "Seeking a talented mobile developer to build a cross-platform (iOS/Android) food delivery app. Experience with real-time location tracking is highly preferred.",
        budget: 150000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 3 months from now
        skillsRequired: ["React Native", "Firebase", "Google Maps API"],
        category: "Mobile Development",
        employer: employer._id,
        status: "open"
      },
      {
        title: "SaaS Landing Page Redesign (Figma)",
        description: "Our current SaaS landing page is outdated and suffers from a high bounce rate. We need a modern, high-converting Figma design. No coding required, just the UI/UX design files.",
        budget: 20000,
        deadline: new Date(new Date().setDate(new Date().getDate() + 14)), // 14 days from now
        skillsRequired: ["UI/UX Design", "Figma", "User Research"],
        category: "UI/UX Design",
        employer: employer._id,
        status: "open"
      },
      {
        title: "Digital Marketing Campaign for Local Startup",
        description: "Need an expert to manage our Google Ads and Facebook Ads for a 30-day aggressive campaign to drive local traffic to our boutique shop.",
        budget: 15000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        skillsRequired: ["Digital Marketing", "Google Ads", "SEO"],
        category: "Digital Marketing",
        employer: employer._id,
        status: "open"
      }
    ];

    // 3. Insert into the database
    await Project.insertMany(dummyProjects);
    console.log("🎉 Successfully nested 4 Dummy Projects!");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedDummyData();
