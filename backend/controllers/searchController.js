const Project = require("../models/Project");
const User = require("../models/User");
const Application = require("../models/Application");

// ─── SEARCH PROJECTS / JOBS (Public) ─────────────────────────────────────────
// GET /api/search/jobs?keyword=&skill=&category=&minBudget=&maxBudget=&sort=
const searchJobs = async (req, res) => {
  try {
    const {
      keyword,     // search in title & description
      skill,       // filter by required skill
      category,    // filter by category
      minBudget,   // minimum budget
      maxBudget,   // maximum budget
      sort,        // newest | budget-high | budget-low | popular
      page = 1,    // pagination - current page
      limit = 10,  // pagination - results per page
    } = req.query;

    // ── Build Filter Object ───────────────────────────────────────
    const filter = {
      isActive: true,
      status: "open",       // only show open projects
    };

    // 1. Keyword search in title and description
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },        // case insensitive
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // 2. Filter by skill
    if (skill) {
      filter.skillsRequired = {
        $in: [new RegExp(skill, "i")],   // match skill case insensitively
      };
    }

    // 3. Filter by category
    if (category) {
      filter.category = category;
    }

    // 4. Filter by budget range
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }

    // ── Build Sort Object ─────────────────────────────────────────
    let sortOption = { createdAt: -1 };   // default: newest first

    if (sort === "budget-high")  sortOption = { budget: -1 };
    if (sort === "budget-low")   sortOption = { budget: 1 };
    if (sort === "popular")      sortOption = { totalApplications: -1 };
    if (sort === "newest")       sortOption = { createdAt: -1 };
    if (sort === "oldest")       sortOption = { createdAt: 1 };

    // ── Pagination ────────────────────────────────────────────────
    const pageNumber  = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip        = (pageNumber - 1) * limitNumber;

    // ── Execute Query ─────────────────────────────────────────────
    const [projects, totalCount] = await Promise.all([
      Project.find(filter)
        .populate("employer", "name companyName profilePicture averageRating")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber),
      Project.countDocuments(filter),
    ]);

    // ── Pagination Meta ───────────────────────────────────────────
    const totalPages  = Math.ceil(totalCount / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.status(200).json({
      success: true,
      query: { keyword, skill, category, minBudget, maxBudget, sort },
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage,
        hasPrevPage,
      },
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── SEARCH FREELANCERS (Public) ──────────────────────────────────────────────
// GET /api/search/freelancers?skill=&keyword=&minRating=&sort=
const searchFreelancers = async (req, res) => {
  try {
    const {
      skill,        // filter by skill
      keyword,      // search in name and bio
      minRating,    // minimum average rating
      sort,         // rating-high | rating-low | newest | most-reviews
      page  = 1,
      limit = 10,
    } = req.query;

    // ── Build Filter Object ───────────────────────────────────────
    const filter = {
      role: "freelancer",     // only freelancers
      isActive: true,
    };

    // 1. Keyword search in name and bio
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { bio:  { $regex: keyword, $options: "i" } },
      ];
    }

    // 2. Filter by skill
    if (skill) {
      filter.skills = {
        $in: [new RegExp(skill, "i")],
      };
    }

    // 3. Filter by minimum rating
    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }

    // ── Build Sort Object ─────────────────────────────────────────
    let sortOption = { averageRating: -1 };    // default: highest rated

    if (sort === "rating-high")    sortOption = { averageRating: -1 };
    if (sort === "rating-low")     sortOption = { averageRating: 1 };
    if (sort === "most-reviews")   sortOption = { totalReviews: -1 };
    if (sort === "newest")         sortOption = { createdAt: -1 };

    // ── Pagination ────────────────────────────────────────────────
    const pageNumber  = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip        = (pageNumber - 1) * limitNumber;

    // ── Execute Query ─────────────────────────────────────────────
    const [freelancers, totalCount] = await Promise.all([
      User.find(filter)
        .select("-password -isActive")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber),
      User.countDocuments(filter),
    ]);

    const totalPages  = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      success: true,
      query: { skill, keyword, minRating, sort },
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNumber,
        limit: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
      freelancers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GLOBAL SEARCH (Public) ───────────────────────────────────────────────────
// GET /api/search/all?keyword=
// Searches both projects and freelancers at once
const globalSearch = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    const searchRegex = new RegExp(keyword, "i");

    // Run both searches in parallel using Promise.all
    const [projects, freelancers] = await Promise.all([
      // Search in projects
      Project.find({
        isActive: true,
        status: "open",
        $or: [
          { title:       { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { skillsRequired: { $in: [searchRegex] } },
          { category:    { $regex: searchRegex } },
        ],
      })
        .populate("employer", "name companyName profilePicture")
        .sort({ createdAt: -1 })
        .limit(5),     // top 5 matching projects

      // Search in freelancers
      User.find({
        role: "freelancer",
        isActive: true,
        $or: [
          { name:   { $regex: searchRegex } },
          { bio:    { $regex: searchRegex } },
          { skills: { $in: [searchRegex] } },
        ],
      })
        .select("-password -isActive")
        .sort({ averageRating: -1 })
        .limit(5),     // top 5 matching freelancers
    ]);

    res.status(200).json({
      success: true,
      keyword,
      results: {
        projects: {
          count: projects.length,
          data: projects,
        },
        freelancers: {
          count: freelancers.length,
          data: freelancers,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET SKILL SUGGESTIONS (Public) ──────────────────────────────────────────
// GET /api/search/skills?keyword=
// Returns matching skills from all freelancer profiles
// Useful for autocomplete in frontend search bar
const getSkillSuggestions = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    // Get all skills from all freelancers
    const freelancers = await User.find({
      role: "freelancer",
      isActive: true,
      skills: { $exists: true, $ne: [] },
    }).select("skills");

    // Flatten all skills into one array and filter by keyword
    const allSkills = freelancers.flatMap((f) => f.skills);
    const uniqueSkills = [...new Set(allSkills)];   // remove duplicates
    const matchedSkills = uniqueSkills.filter((skill) =>
      skill.toLowerCase().includes(keyword.toLowerCase())
    );

    res.status(200).json({
      success: true,
      keyword,
      suggestions: matchedSkills.slice(0, 10),   // max 10 suggestions
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET CATEGORY STATS (Public) ─────────────────────────────────────────────
// GET /api/search/categories
// Returns count of open projects per category
// Useful for homepage category cards
const getCategoryStats = async (req, res) => {
  try {
    const categoryStats = await Project.aggregate([
      // Only count open and active projects
      { $match: { isActive: true, status: "open" } },

      // Group by category and count
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgBudget: { $avg: "$budget" },
        },
      },

      // Sort by count descending
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      categories: categoryStats.map((c) => ({
        category: c._id,
        totalProjects: c.count,
        averageBudget: Math.round(c.avgBudget),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── AI RECOMMENDATION (Freelancer only) ─────────────────────────────────────
// GET /api/search/recommendations
// Recommends jobs based on logged in freelancer's skills
// Simple keyword matching — no ML needed for college project
const getRecommendedJobs = async (req, res) => {
  try {
    // 1. Get logged in freelancer's skills from User model
    const freelancer = await User.findById(req.user.id).select("skills");

    if (!freelancer || freelancer.skills.length === 0) {
      return res.status(200).json({
        message: "Add skills to your profile to get recommendations",
        recommendations: [],
      });
    }

    const freelancerSkills = freelancer.skills;   // e.g. ["React", "Node.js"]

    // 2. Find projects that require any of freelancer's skills
    const recommendations = await Project.find({
      isActive: true,
      status: "open",
      skillsRequired: {
        $in: freelancerSkills.map((skill) => new RegExp(skill, "i")),
      },
    })
      .populate("employer", "name companyName profilePicture")
      .sort({ createdAt: -1 })
      .limit(10);

    // 3. Add matchScore to each project
    // matchScore = how many of freelancer's skills match project skills
    const recommendationsWithScore = recommendations.map((project) => {
      const projectSkills = project.skillsRequired.map((s) => s.toLowerCase());
      const freelancerSkillsLower = freelancerSkills.map((s) => s.toLowerCase());

      const matchedSkills = freelancerSkillsLower.filter((skill) =>
        projectSkills.some((ps) => ps.includes(skill) || skill.includes(ps))
      );

      return {
        ...project.toObject(),
        matchScore: matchedSkills.length,       // number of matched skills
        matchedSkills,                           // which skills matched
      };
    });

    // 4. Sort by matchScore — highest match first
    recommendationsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      freelancerSkills,
      count: recommendationsWithScore.length,
      recommendations: recommendationsWithScore,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  searchJobs,
  searchFreelancers,
  globalSearch,
  getSkillSuggestions,
  getCategoryStats,
  getRecommendedJobs,
};