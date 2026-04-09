const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Project = require("./models/Project");
const Application = require("./models/Application");
const Escrow = require("./models/Escrow");
const Review = require("./models/Review");
const Invitation = require("./models/Invitation");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected for Extra Seeding"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

const seedExtraData = async () => {
  try {
    const employer = await User.findOne({ role: "employer" });
    const freelancer = await User.findOne({ role: "freelancer" });

    if (!employer || !freelancer) {
      console.log("❌ Cannot seed extra data. Please ensure at least 1 employer and 1 freelancer user exists.");
      process.exit();
    }

    const projects = await Project.find({ employer: employer._id }).limit(4);
    if (projects.length < 4) {
      console.log("❌ Need at least 4 projects owned by the employer to seed fully.");
      process.exit();
    }

    // 1. Applications (Pending)
    // Freelancer applies to Project 0 and 1
    const app1 = await Application.create({
      project: projects[0]._id,
      freelancer: freelancer._id,
      coverLetter: "I have over 5 years of experience with these exact requirements. I'm ready to start immediately.",
      bidAmount: projects[0].budget * 0.9,
      estimatedDays: 14,
      status: "pending"
    });
    
    // Project 1
    const app2 = await Application.create({
      project: projects[1]._id,
      freelancer: freelancer._id,
      coverLetter: "I recently completed a very similar project and can leverage that experience to deliver this quickly.",
      bidAmount: projects[1].budget,
      estimatedDays: 30,
      status: "pending"
    });
    
    // Increment application counts
    projects[0].totalApplications += 1;
    projects[1].totalApplications += 1;
    await projects[0].save();
    await projects[1].save();
    console.log("📝 Seeded 2 Pending Applications");

    // 2. In-Progress Project & Escrow
    // Approve Freelancer for Project 2
    projects[2].status = "in-progress";
    projects[2].assignedFreelancer = freelancer._id;
    projects[2].totalApplications += 1;
    await projects[2].save();

    await Application.create({
      project: projects[2]._id,
      freelancer: freelancer._id,
      coverLetter: "I would love to tackle this.",
      bidAmount: projects[2].budget,
      estimatedDays: 20,
      status: "accepted"
    });

    await Escrow.create({
      project: projects[2]._id,
      employer: employer._id,
      freelancer: freelancer._id,
      amount: projects[2].budget,
      status: "funded",
      transactions: [{
        action: "funded",
        performedBy: employer._id,
        note: `Employer funded ₹${projects[2].budget} via Seed`,
        date: new Date()
      }]
    });
    console.log("💸 Seeded In-Progress Project and Funded Escrow");

    // 3. Completed Project, Released Escrow & Review
    projects[3].status = "completed";
    projects[3].assignedFreelancer = freelancer._id;
    await projects[3].save();

    await Escrow.create({
      project: projects[3]._id,
      employer: employer._id,
      freelancer: freelancer._id,
      amount: projects[3].budget,
      status: "released",
      releasedAt: new Date(),
      transactions: [
        { action: "funded", performedBy: employer._id, date: new Date() },
        { action: "released", performedBy: employer._id, note: "Work Completed", date: new Date() }
      ]
    });

    const docReview = await Review.create({
      project: projects[3]._id,
      freelancer: freelancer._id,
      employer: employer._id,
      rating: 5,
      comment: "Absolutely outstanding work! Delivered everything ahead of schedule and the quality was top tier.",
      createdAt: new Date()
    });

    // Update freelancer rating
    freelancer.totalReviews += 1;
    freelancer.averageRating = 5.0;
    freelancer.experience = "Mid-Level";
    freelancer.bio = "Dedicated tech enthusiast and problem solver.";
    await freelancer.save();
    console.log("⭐ Seeded Completed Project, Released Escrow, and 5-Star Review");

    // 4. Invitation
    // Employer invites Freelancer to a random open project (if they have a 5th project, else just the 1st one)
    const extraProjects = await Project.find({ employer: employer._id, status: "open" });
    if (extraProjects.length > 0) {
      const inviteProj = extraProjects[extraProjects.length - 1]; // pick the last open one
      await Invitation.create({
        project: inviteProj._id,
        employer: employer._id,
        freelancer: freelancer._id,
        message: "Hey! We worked together previously and I loved what you did. I have a new gig I think you'd be perfect for.",
        status: "pending"
      });
      console.log("📩 Seeded 1 Invitation");
    }

    console.log("🎉 Successfully seeded Applications, Escrows, Reviews, and Invitations!");
    process.exit();
  } catch (error) {
    console.error("❌ Fatal Error seeding data:", error.message);
    process.exit(1);
  }
};

seedExtraData();
