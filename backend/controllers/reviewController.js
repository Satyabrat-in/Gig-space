const Review = require("../models/Review");
const Project = require("../models/Project");
const Application = require("../models/Application");
const User = require("../models/User");

// ─── ADD REVIEW (Employer only) ───────────────────────────────────────────────
// POST /api/reviews/add
// Employer can only review after project is completed
const addReview = async (req, res) => {
  try {
    const {
      projectId,
      rating,
      comment,
      communicationRating,
      qualityRating,
      timelinessRating,
    } = req.body;

    // 1. Validate required fields
    if (!projectId || !rating || !comment) {
      return res.status(400).json({ message: "projectId, rating and comment are required" });
    }

    // 2. Check rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // 3. Find the project
    const project = await Project.findById(projectId);
    if (!project || !project.isActive) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 4. Only the employer of this project can review
    if (project.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Only the project employer can add a review",
      });
    }

    // 5. Project must be completed to review
    if (project.status !== "completed") {
      return res.status(400).json({
        message: "You can only review after the project is completed",
      });
    }

    // 6. Get the assigned freelancer from project
    if (!project.assignedFreelancer) {
      return res.status(400).json({
        message: "No freelancer was assigned to this project",
      });
    }

    // 7. Check if review already exists
    const existingReview = await Review.findOne({
      project: projectId,
      employer: req.user.id,
    });
    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this project",
      });
    }

    // 8. Create the review
    const review = await Review.create({
      project: projectId,
      employer: req.user.id,                      // logged in employer
      freelancer: project.assignedFreelancer,      // from Project model
      rating,
      comment,
      communicationRating: communicationRating || null,
      qualityRating: qualityRating || null,
      timelinessRating: timelinessRating || null,
    });

    // 9. Update freelancer's averageRating and totalReviews in User model
    // This keeps User.averageRating always up to date
    const allReviews = await Review.find({
      freelancer: project.assignedFreelancer,
    });

    const totalReviews = allReviews.length;
    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await User.findByIdAndUpdate(project.assignedFreelancer, {
      averageRating: Math.round(averageRating * 10) / 10,  // round to 1 decimal
      totalReviews,
    });

    // 10. Populate response
    await review.populate("employer", "name companyName profilePicture");
    await review.populate("freelancer", "name email profilePicture");
    await review.populate("project", "title");

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    // Handle duplicate review error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this project",
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET ALL REVIEWS OF A FREELANCER (Public) ─────────────────────────────────
// GET /api/reviews/freelancer/:freelancerId
const getFreelancerReviews = async (req, res) => {
  try {
    // 1. Check if freelancer exists
    const freelancer = await User.findById(req.params.freelancerId);
    if (!freelancer || freelancer.role !== "freelancer") {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    // 2. Get all reviews for this freelancer
    const reviews = await Review.find({
      freelancer: req.params.freelancerId,
    })
      .populate("employer", "name companyName profilePicture")
      .populate("project", "title category")
      .sort({ createdAt: -1 });   // newest first

    // 3. Calculate rating stats
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // 4. Rating breakdown (how many 1★ 2★ 3★ 4★ 5★)
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      ratingBreakdown[r.rating]++;
    });

    res.status(200).json({
      freelancer: {
        id: freelancer._id,
        name: freelancer.name,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      },
      ratingBreakdown,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET REVIEW BY PROJECT (Public) ──────────────────────────────────────────
// GET /api/reviews/project/:projectId
const getReviewByProject = async (req, res) => {
  try {
    const review = await Review.findOne({ project: req.params.projectId })
      .populate("employer", "name companyName profilePicture")
      .populate("freelancer", "name profilePicture skills")
      .populate("project", "title category budget");

    if (!review) {
      return res.status(404).json({ message: "No review found for this project" });
    }

    res.status(200).json({ review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── UPDATE REVIEW (Employer only) ───────────────────────────────────────────
// PUT /api/reviews/update/:id
const updateReview = async (req, res) => {
  try {
    const { rating, comment, communicationRating, qualityRating, timelinessRating } =
      req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only the employer who wrote the review can update it
    if (review.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    if (comment)             review.comment = comment;
    if (communicationRating) review.communicationRating = communicationRating;
    if (qualityRating)       review.qualityRating = qualityRating;
    if (timelinessRating)    review.timelinessRating = timelinessRating;

    await review.save();

    // Recalculate freelancer's averageRating after update
    const allReviews = await Review.find({ freelancer: review.freelancer });
    const totalReviews = allReviews.length;
    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await User.findByIdAndUpdate(review.freelancer, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });

    await review.populate("employer", "name companyName profilePicture");
    await review.populate("freelancer", "name profilePicture");
    await review.populate("project", "title");

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── DELETE REVIEW (Employer only) ───────────────────────────────────────────
// DELETE /api/reviews/delete/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only employer who wrote review can delete
    if (review.employer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();

    // Recalculate freelancer's averageRating after deletion
    const allReviews = await Review.find({ freelancer: review.freelancer });
    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await User.findByIdAndUpdate(review.freelancer, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET MY GIVEN REVIEWS (Employer only) ─────────────────────────────────────
// GET /api/reviews/my-reviews
const getMyGivenReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ employer: req.user.id })
      .populate("freelancer", "name email profilePicture averageRating")
      .populate("project", "title category status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET MY RECEIVED REVIEWS (Freelancer only) ────────────────────────────────
// GET /api/reviews/received
const getMyReceivedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ freelancer: req.user.id })
      .populate("employer", "name companyName profilePicture")
      .populate("project", "title category budget")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    res.status(200).json({
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addReview,
  getFreelancerReviews,
  getReviewByProject,
  updateReview,
  deleteReview,
  getMyGivenReviews,
  getMyReceivedReviews,
};