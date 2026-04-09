const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Project = require("./models/Project");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected for Seeding"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

const seedDummyData = async () => {
  try {
    try {
      await Project.collection.dropIndex("name_1");
      console.log("Cleaned up old 'name_1' index from Projects collection.");
    } catch (e) {
      // Ignore
    }

    let employer = await User.findOne({ email: "dummyemployer@platform.com" });
    if (!employer) {
      employer = await User.create({
        name: "Tech Solutions Inc.",
        email: "dummyemployer@platform.com",
        password: "dummy_password_unhashed",
        role: "employer",
        companyName: "Tech Solutions Hub",
      });
      console.log("👤 Dummy Employer created successfully.");
    }

    const dummyProjects = [
      {
        title: "Build a Modern React E-Commerce Dashboard",
        description: "We are urgently looking for a skilled frontend developer to create a responsive admin dashboard for our e-commerce platform using React, Tailwind CSS, and Recharts.",
        budget: 65000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)), 
        skillsRequired: ["React", "Tailwind CSS", "JavaScript"],
        category: "Web Development",
        employer: employer._id,
        status: "open"
      },
      {
        title: "Develop Cross-Platform Delivery App",
        description: "Seeking a talented mobile developer to build a cross-platform (iOS/Android) food delivery app. Experience with real-time location tracking is highly preferred.",
        budget: 150000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)), 
        skillsRequired: ["React Native", "Firebase", "Google Maps API"],
        category: "Mobile Development",
        employer: employer._id,
        status: "open"
      },
      {
        title: "SaaS Landing Page Redesign (Figma)",
        description: "Our current SaaS landing page is outdated and suffers from a high bounce rate. We need a modern, high-converting Figma design. No coding required, just the UI/UX design files.",
        budget: 20000,
        deadline: new Date(new Date().setDate(new Date().getDate() + 14)), 
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
      },
      {
        title: "Data Pipeline & Business Intelligence Dashboard",
        description: "Looking for a Data Scientist/Data Engineer to build a robust data pipeline in Python and set up a PowerBI dashboard for visualizing our monthly sales metrics.",
        budget: 80000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        skillsRequired: ["Python", "SQL", "PowerBI", "Data Analysis"],
        category: "Data Science",
        employer: employer._id,
        status: "open"
      },
      {
        title: "Technical Writer for Engineering Blog",
        description: "We need an experienced technical content writer to produce 4 high-quality blog posts (approx. 1500 words each) covering modern web architecture and microservices.",
        budget: 10000,
        deadline: new Date(new Date().setDate(new Date().getDate() + 20)),
        skillsRequired: ["Content Writing", "Technical Writing", "SEO"],
        category: "Content Writing",
        employer: employer._id,
        status: "open"
      },
      {
        title: "Node.js REST API for Marketplace",
        description: "Build a scalable Node.js/Express backend API for our upcoming marketplace. Must implement JWT authentication, MongoDB schemas, and payment gateway webhooks.",
        budget: 90000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        skillsRequired: ["Node.js", "Express", "MongoDB", "Backend Architecture"],
        category: "Web Development",
        employer: employer._id,
        status: "open"
      },
      {
        title: "Fitness & Calorie Tracker App",
        description: "Develop a native Android app using Kotlin for tracking daily calories and fitness goals. Must integrate with local storage and provide chart visualizations.",
        budget: 120000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 4)),
        skillsRequired: ["Android", "Kotlin", "Mobile UI"],
        category: "Mobile Development",
        employer: employer._id,
        status: "open"
      },
      {
        title: "AI Chatbot Integration for Support Portal",
        description: "Looking for someone to integrate an OpenAI-based chatbot into our existing customer support portal to automate basic query resolution.",
        budget: 45000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        skillsRequired: ["OpenAI API", "Python", "Chatbots"],
        category: "Data Science",
        employer: employer._id,
        status: "open"
      },
      {
        title: "Brand Identity and Logo Suite",
        description: "Need a complete brand identity package including a modern logo, typography guidelines, and color palette for a new eco-friendly apparel brand.",
        budget: 35000,
        deadline: new Date(new Date().setDate(new Date().getDate() + 15)),
        skillsRequired: ["Graphic Design", "Illustrator", "Branding"],
        category: "UI/UX Design",
        employer: employer._id,
        status: "open"
      }
    ];

    let inserted = 0;
    for (const project of dummyProjects) {
      try {
        await Project.create(project);
        inserted++;
      } catch (err) {
        if (err.code === 11000) {
          console.warn(`⚠️ Skipped duplicate project: ${project.title}`);
        } else {
          console.error(`❌ Failed to insert ${project.title}:`, err.message);
        }
      }
    }
    
    console.log(`🎉 Successfully seeded ${inserted} Dummy Projects!`);
    process.exit();
  } catch (error) {
    console.error("❌ Fatal Error seeding data:", error);
    process.exit(1);
  }
};

seedDummyData();
