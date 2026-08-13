/**
 * One-time/idempotent seed script. Mirrors the roadmap catalog that shipped
 * in the frontend demo (client/src/data/sampleRoadmaps.ts) so the database
 * starts from the same 15 lines instead of empty.
 *
 * Run with: npm run seed   (inside /server, after MONGODB_URI is set)
 */
import { connectDB, disconnectDB } from "../config/db.js";
import { Roadmap } from "../models/Roadmap.js";
import { RoadmapNode } from "../models/RoadmapNode.js";
import { Resource } from "../models/Resource.js";

type Seed = {
  slug: string;
  lineCode: string;
  title: string;
  description: string;
  category: "tech" | "exam" | "school" | "skill";
  color: "coral" | "teal" | "violet" | "amber";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDurationHours: number;
  prerequisites: string[];
  careerOutcomes: string[];
  nodes: { title: string; hours: number }[];
};

const seeds: Seed[] = [
  {
    slug: "dsa", lineCode: "L1", title: "Data Structures & Algorithms", category: "tech", color: "coral",
    description: "The full line from programming basics to interview-ready problem solving.",
    difficulty: "Beginner", estimatedDurationHours: 120,
    prerequisites: ["Basic programming in any language"],
    careerOutcomes: ["SDE interviews", "Competitive programming", "Placement coding rounds"],
    nodes: [
      { title: "Programming Basics", hours: 8 }, { title: "Complexity Analysis", hours: 4 },
      { title: "Arrays", hours: 10 }, { title: "Strings", hours: 8 }, { title: "Searching", hours: 6 },
      { title: "Sorting", hours: 8 }, { title: "Linked List", hours: 10 }, { title: "Stack", hours: 6 },
      { title: "Queue", hours: 6 }, { title: "Recursion", hours: 8 }, { title: "Trees", hours: 14 },
      { title: "Graphs", hours: 16 }, { title: "Dynamic Programming", hours: 18 }, { title: "Interview Problems", hours: 8 },
    ],
  },
  {
    slug: "full-stack", lineCode: "L2", title: "Full Stack Development", category: "tech", color: "teal",
    description: "HTML to a deployed full-stack project — one continuous line.",
    difficulty: "Beginner", estimatedDurationHours: 160,
    prerequisites: ["Basic computer literacy"], careerOutcomes: ["Full stack developer roles", "Freelance web projects"],
    nodes: [
      { title: "HTML & CSS", hours: 14 }, { title: "JavaScript", hours: 24 }, { title: "Git & GitHub", hours: 8 },
      { title: "React", hours: 30 }, { title: "Node.js & Express", hours: 24 }, { title: "Databases", hours: 18 },
      { title: "Authentication & Deployment", hours: 20 }, { title: "Capstone Project", hours: 22 },
    ],
  },
  {
    slug: "python", lineCode: "L3", title: "Python", category: "tech", color: "violet",
    description: "From Python syntax to writing small real programs.",
    difficulty: "Beginner", estimatedDurationHours: 60,
    prerequisites: [], careerOutcomes: ["Automation scripting", "Data analysis foundations"],
    nodes: [
      { title: "Python Basics", hours: 8 }, { title: "Data Types & Control Flow", hours: 8 },
      { title: "Functions & Modules", hours: 8 }, { title: "OOP in Python", hours: 10 },
      { title: "File Handling", hours: 6 }, { title: "NumPy & Pandas", hours: 12 }, { title: "Mini Projects", hours: 8 },
    ],
  },
  {
    slug: "java-backend", lineCode: "L4", title: "Java Backend", category: "tech", color: "amber",
    description: "Core Java through to a deployed REST API with Spring Boot.",
    difficulty: "Intermediate", estimatedDurationHours: 90,
    prerequisites: ["Programming Basics"], careerOutcomes: ["Java backend developer roles"],
    nodes: [
      { title: "Java Basics", hours: 10 }, { title: "OOP", hours: 10 }, { title: "Collections", hours: 10 },
      { title: "Exception Handling", hours: 6 }, { title: "JDBC & Databases", hours: 12 },
      { title: "Spring Boot Basics", hours: 16 }, { title: "REST APIs", hours: 14 }, { title: "Deployment", hours: 12 },
    ],
  },
  {
    slug: "react", lineCode: "L5", title: "React", category: "tech", color: "teal",
    description: "Component thinking, hooks, and a shipped React project.",
    difficulty: "Intermediate", estimatedDurationHours: 50,
    prerequisites: ["JavaScript"], careerOutcomes: ["Frontend developer roles"],
    nodes: [
      { title: "JavaScript Essentials", hours: 8 }, { title: "JSX & Components", hours: 6 },
      { title: "Props & State", hours: 6 }, { title: "Hooks", hours: 10 }, { title: "Routing", hours: 6 },
      { title: "State Management", hours: 8 }, { title: "API Integration", hours: 6 }, { title: "Project", hours: 10 },
    ],
  },
  {
    slug: "sql", lineCode: "L6", title: "SQL", category: "tech", color: "violet",
    description: "Query real databases confidently, from basics to performance.",
    difficulty: "Beginner", estimatedDurationHours: 25,
    prerequisites: [], careerOutcomes: ["Backend roles", "Data analyst roles"],
    nodes: [
      { title: "SQL Basics", hours: 4 }, { title: "Joins", hours: 5 }, { title: "Aggregation", hours: 4 },
      { title: "Subqueries", hours: 4 }, { title: "Indexes & Performance", hours: 4 }, { title: "Practice Problems", hours: 4 },
    ],
  },
  {
    slug: "git-github", lineCode: "L7", title: "Git & GitHub", category: "tech", color: "amber",
    description: "Version control fundamentals every developer needs.",
    difficulty: "Beginner", estimatedDurationHours: 12,
    prerequisites: [], careerOutcomes: ["Any development role"],
    nodes: [
      { title: "Git Basics", hours: 3 }, { title: "Branching & Merging", hours: 3 },
      { title: "Remote Repositories", hours: 2 }, { title: "Pull Requests", hours: 2 }, { title: "Collaboration Workflow", hours: 2 },
    ],
  },
  {
    slug: "aptitude-reasoning", lineCode: "L8", title: "Aptitude & Reasoning", category: "exam", color: "coral",
    description: "Quant and logical reasoning for placement and competitive exams.",
    difficulty: "Beginner", estimatedDurationHours: 45,
    prerequisites: [], careerOutcomes: ["Placement aptitude rounds", "SSC/Banking prelims"],
    nodes: [
      { title: "Number System", hours: 6 }, { title: "Percentages & Ratios", hours: 6 }, { title: "Time & Work", hours: 6 },
      { title: "Logical Reasoning", hours: 8 }, { title: "Verbal Reasoning", hours: 6 },
      { title: "Data Interpretation", hours: 7 }, { title: "Mock Tests", hours: 6 },
    ],
  },
  {
    slug: "ssc-banking", lineCode: "L9", title: "SSC & Banking Prep", category: "exam", color: "violet",
    description: "A structured line through the SSC and banking exam syllabus.",
    difficulty: "Intermediate", estimatedDurationHours: 70,
    prerequisites: ["Aptitude & Reasoning (recommended)"], careerOutcomes: ["SSC CGL/CHSL", "Bank PO/Clerk"],
    nodes: [
      { title: "Quant Foundations", hours: 12 }, { title: "Reasoning", hours: 10 }, { title: "English Language", hours: 10 },
      { title: "General Awareness", hours: 10 }, { title: "Banking Awareness", hours: 8 },
      { title: "Previous Year Papers", hours: 10 }, { title: "Mock Tests", hours: 10 },
    ],
  },
  {
    slug: "gk-current-affairs", lineCode: "L10", title: "GK & Current Affairs", category: "exam", color: "amber",
    description: "Static GK plus a running current-affairs revision line.",
    difficulty: "Beginner", estimatedDurationHours: 30,
    prerequisites: [], careerOutcomes: ["All competitive exam GK sections"],
    nodes: [
      { title: "Static GK", hours: 6 }, { title: "Monthly Current Affairs", hours: 8 }, { title: "Government Schemes", hours: 4 },
      { title: "Sports & Awards", hours: 4 }, { title: "Science & Tech Updates", hours: 4 }, { title: "Revision Capsules", hours: 4 },
    ],
  },
  {
    slug: "placement-prep", lineCode: "L11", title: "Placement Preparation", category: "exam", color: "coral",
    description: "Everything between 'ready to apply' and 'offer letter.'",
    difficulty: "Intermediate", estimatedDurationHours: 80,
    prerequisites: ["DSA (recommended)"], careerOutcomes: ["Campus placements", "Off-campus interviews"],
    nodes: [
      { title: "Resume Building", hours: 6 }, { title: "Aptitude Refresher", hours: 12 }, { title: "Coding Round Prep", hours: 20 },
      { title: "Group Discussion", hours: 6 }, { title: "HR Interview", hours: 8 }, { title: "Company-wise Prep", hours: 28 },
    ],
  },
  {
    slug: "physics-11-12", lineCode: "L12", title: "Physics (Class 11–12)", category: "school", color: "teal",
    description: "NCERT-aligned physics, board and competitive-exam ready.",
    difficulty: "Intermediate", estimatedDurationHours: 100,
    prerequisites: ["Class 10 Science"], careerOutcomes: ["Board exams", "JEE/NEET foundation"],
    nodes: [
      { title: "Units & Measurements", hours: 6 }, { title: "Kinematics", hours: 12 }, { title: "Laws of Motion", hours: 12 },
      { title: "Work, Energy & Power", hours: 10 }, { title: "Electrostatics", hours: 14 },
      { title: "Current Electricity", hours: 12 }, { title: "Optics", hours: 14 }, { title: "Modern Physics", hours: 20 },
    ],
  },
  {
    slug: "chemistry-11-12", lineCode: "L13", title: "Chemistry (Class 11–12)", category: "school", color: "violet",
    description: "Physical, organic, and inorganic chemistry in one sequenced line.",
    difficulty: "Intermediate", estimatedDurationHours: 90,
    prerequisites: ["Class 10 Science"], careerOutcomes: ["Board exams", "JEE/NEET foundation"],
    nodes: [
      { title: "Atomic Structure", hours: 10 }, { title: "Chemical Bonding", hours: 14 }, { title: "States of Matter", hours: 10 },
      { title: "Thermodynamics", hours: 14 }, { title: "Equilibrium", hours: 14 },
      { title: "Organic Chemistry Basics", hours: 16 }, { title: "Periodic Table Trends", hours: 12 },
    ],
  },
  {
    slug: "maths-11-12", lineCode: "L14", title: "Maths (Class 11–12)", category: "school", color: "amber",
    description: "Algebra through calculus, built for boards and beyond.",
    difficulty: "Intermediate", estimatedDurationHours: 100,
    prerequisites: ["Class 10 Maths"], careerOutcomes: ["Board exams", "JEE foundation"],
    nodes: [
      { title: "Sets & Functions", hours: 8 }, { title: "Trigonometry", hours: 14 }, { title: "Algebra", hours: 16 },
      { title: "Coordinate Geometry", hours: 12 }, { title: "Calculus Basics", hours: 20 },
      { title: "Probability", hours: 10 }, { title: "Vectors & 3D", hours: 20 },
    ],
  },
  {
    slug: "english-communication", lineCode: "L15", title: "English & Communication", category: "skill", color: "teal",
    description: "Grammar, vocabulary, and speaking confidence for interviews and daily work.",
    difficulty: "Beginner", estimatedDurationHours: 20,
    prerequisites: [], careerOutcomes: ["Interview communication", "Workplace English"],
    nodes: [
      { title: "Grammar Basics", hours: 4 }, { title: "Vocabulary Building", hours: 3 }, { title: "Reading Comprehension", hours: 3 },
      { title: "Spoken English", hours: 5 }, { title: "Interview Communication", hours: 3 }, { title: "Email & Writing Skills", hours: 2 },
    ],
  },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function run() {
  await connectDB();
  console.log("🌱 Seeding roadmap catalog...");

  for (const seed of seeds) {
    const roadmap = await Roadmap.findOneAndUpdate(
      { slug: seed.slug },
      {
        slug: seed.slug,
        lineCode: seed.lineCode,
        title: seed.title,
        description: seed.description,
        category: seed.category,
        color: seed.color,
        difficulty: seed.difficulty,
        estimatedDurationHours: seed.estimatedDurationHours,
        prerequisites: seed.prerequisites,
        careerOutcomes: seed.careerOutcomes,
        isPublished: true,
      },
      { upsert: true, new: true }
    );

    for (let i = 0; i < seed.nodes.length; i++) {
      const n = seed.nodes[i];
      await RoadmapNode.findOneAndUpdate(
        { roadmapSlug: seed.slug, slug: slugify(n.title) },
        {
          roadmapId: roadmap._id,
          roadmapSlug: seed.slug,
          slug: slugify(n.title),
          title: n.title,
          estimatedHours: n.hours,
          order: i,
          isPublished: true,
        },
        { upsert: true }
      );
    }
    console.log(`  ✓ ${seed.title} (${seed.nodes.length} stations)`);
  }

  // Curated example resources for DSA → Arrays, matching the frontend demo.
  const dsa = await Roadmap.findOne({ slug: "dsa" });
  const arraysNode = dsa && (await RoadmapNode.findOne({ roadmapSlug: "dsa", slug: "arrays" }));
  if (arraysNode) {
    const existing = await Resource.countDocuments({ nodeId: arraysNode._id });
    if (existing === 0) {
      await Resource.insertMany([
        { nodeId: arraysNode._id, roadmapSlug: "dsa", nodeSlug: "arrays", type: "video", tag: "recommended", title: "Arrays — complete beginner lesson", source: "freeCodeCamp", language: "English", videoId: "rL8X2mlNHPM", durationMinutes: 42, order: 0 },
        { nodeId: arraysNode._id, roadmapSlug: "dsa", nodeSlug: "arrays", type: "video", tag: "hindi", title: "Arrays in DSA — poori playlist", source: "Apna College — Sigma Batch", language: "Hinglish", videoId: "rL8X2mlNHPM", durationMinutes: 58, order: 1 },
        { nodeId: arraysNode._id, roadmapSlug: "dsa", nodeSlug: "arrays", type: "video", tag: "alternative", title: "Arrays deep dive with visualizations", source: "CS Dojo", language: "English", videoId: "rL8X2mlNHPM", durationMinutes: 35, order: 2 },
        { nodeId: arraysNode._id, roadmapSlug: "dsa", nodeSlug: "arrays", type: "video", tag: "quick", title: "Arrays in 10 minutes — revision", source: "Take U Forward", language: "Hinglish", videoId: "rL8X2mlNHPM", durationMinutes: 11, order: 3 },
        { nodeId: arraysNode._id, roadmapSlug: "dsa", nodeSlug: "arrays", type: "article", tag: "deep_dive", title: "Array data structure — full reference", source: "GeeksforGeeks", language: "English", order: 4 },
        { nodeId: arraysNode._id, roadmapSlug: "dsa", nodeSlug: "arrays", type: "practice", tag: "recommended", title: "20 array practice problems (Easy → Hard)", source: "LearnPath Practice", language: "English", order: 5 },
      ]);
      console.log("  ✓ Seeded Arrays curated resources");
    }
  }

  console.log("✅ Seed complete.");
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
