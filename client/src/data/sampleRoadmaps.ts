export type NodeState = "done" | "current" | "unlocked" | "locked";
export type RoadmapCategory = "tech" | "exam" | "school" | "skill";
export type LineColor = "coral" | "teal" | "violet" | "amber";

export type RoadmapNodeData = {
  slug: string;
  title: string;
  state: NodeState;
  estimatedHours: number;
};

export type RoadmapDetailData = {
  slug: string;
  lineCode: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedDurationHours: number;
  prerequisites: string[];
  careerOutcomes: string[];
  progressPercent: number;
  color: LineColor;
  nodes: RoadmapNodeData[];
};

function makeNodes(titles: { title: string; hours: number }[], startedCount: number): RoadmapNodeData[] {
  return titles.map((t, i) => {
    const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let state: NodeState = "locked";
    if (i < startedCount - 1) state = "done";
    else if (i === startedCount - 1) state = "current";
    else if (i === startedCount) state = "unlocked";
    return { slug, title: t.title, state, estimatedHours: t.hours };
  });
}

type RoadmapSeed = Omit<RoadmapDetailData, "nodes" | "progressPercent"> & {
  nodeSeeds: { title: string; hours: number }[];
  startedCount: number;
};

const seeds: RoadmapSeed[] = [
  {
    slug: "dsa", lineCode: "L1", title: "Data Structures & Algorithms", category: "tech", color: "coral",
    description: "The full line from programming basics to interview-ready problem solving. Every station builds on the one before it.",
    difficulty: "Beginner", estimatedDurationHours: 120,
    prerequisites: ["Basic programming in any language"],
    careerOutcomes: ["SDE interviews", "Competitive programming", "Placement coding rounds"],
    startedCount: 3,
    nodeSeeds: [
      { title: "Programming Basics", hours: 8 }, { title: "Complexity Analysis", hours: 4 },
      { title: "Arrays", hours: 10 }, { title: "Strings", hours: 8 }, { title: "Searching", hours: 6 },
      { title: "Sorting", hours: 8 }, { title: "Linked List", hours: 10 }, { title: "Stack", hours: 6 },
      { title: "Queue", hours: 6 }, { title: "Recursion", hours: 8 }, { title: "Trees", hours: 14 },
      { title: "Graphs", hours: 16 }, { title: "Dynamic Programming", hours: 18 }, { title: "Interview Problems", hours: 8 },
    ],
  },
  {
    slug: "full-stack", lineCode: "L2", title: "Full Stack Development", category: "tech", color: "teal",
    description: "HTML to a deployed full-stack project — one continuous line, no skipped fundamentals.",
    difficulty: "Beginner", estimatedDurationHours: 160,
    prerequisites: ["Basic computer literacy"],
    careerOutcomes: ["Full stack developer roles", "Freelance web projects", "Startup internships"],
    startedCount: 1,
    nodeSeeds: [
      { title: "HTML & CSS", hours: 14 }, { title: "JavaScript", hours: 24 }, { title: "Git & GitHub", hours: 8 },
      { title: "React", hours: 30 }, { title: "Node.js & Express", hours: 24 }, { title: "Databases", hours: 18 },
      { title: "Authentication & Deployment", hours: 20 }, { title: "Capstone Project", hours: 22 },
    ],
  },
  {
    slug: "python", lineCode: "L3", title: "Python", category: "tech", color: "violet",
    description: "From Python syntax to writing small real programs.",
    difficulty: "Beginner", estimatedDurationHours: 60,
    prerequisites: [], careerOutcomes: ["Automation scripting", "Data analysis foundations", "Backend with Django/Flask"],
    startedCount: 1,
    nodeSeeds: [
      { title: "Python Basics", hours: 8 }, { title: "Data Types & Control Flow", hours: 8 },
      { title: "Functions & Modules", hours: 8 }, { title: "OOP in Python", hours: 10 },
      { title: "File Handling", hours: 6 }, { title: "NumPy & Pandas", hours: 12 }, { title: "Mini Projects", hours: 8 },
    ],
  },
  {
    slug: "java-backend", lineCode: "L4", title: "Java Backend", category: "tech", color: "amber",
    description: "Core Java through to a deployed REST API with Spring Boot.",
    difficulty: "Intermediate", estimatedDurationHours: 90,
    prerequisites: ["Programming Basics"], careerOutcomes: ["Java backend developer roles", "Enterprise application roles"],
    startedCount: 1,
    nodeSeeds: [
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
    startedCount: 1,
    nodeSeeds: [
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
    startedCount: 1,
    nodeSeeds: [
      { title: "SQL Basics", hours: 4 }, { title: "Joins", hours: 5 }, { title: "Aggregation", hours: 4 },
      { title: "Subqueries", hours: 4 }, { title: "Indexes & Performance", hours: 4 }, { title: "Practice Problems", hours: 4 },
    ],
  },
  {
    slug: "git-github", lineCode: "L7", title: "Git & GitHub", category: "tech", color: "amber",
    description: "Version control fundamentals every developer needs.",
    difficulty: "Beginner", estimatedDurationHours: 12,
    prerequisites: [], careerOutcomes: ["Any development role"],
    startedCount: 1,
    nodeSeeds: [
      { title: "Git Basics", hours: 3 }, { title: "Branching & Merging", hours: 3 },
      { title: "Remote Repositories", hours: 2 }, { title: "Pull Requests", hours: 2 }, { title: "Collaboration Workflow", hours: 2 },
    ],
  },
  {
    slug: "aptitude-reasoning", lineCode: "L8", title: "Aptitude & Reasoning", category: "exam", color: "coral",
    description: "Quant and logical reasoning for placement and competitive exams.",
    difficulty: "Beginner", estimatedDurationHours: 45,
    prerequisites: [], careerOutcomes: ["Placement aptitude rounds", "SSC/Banking prelims"],
    startedCount: 1,
    nodeSeeds: [
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
    startedCount: 1,
    nodeSeeds: [
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
    startedCount: 1,
    nodeSeeds: [
      { title: "Static GK", hours: 6 }, { title: "Monthly Current Affairs", hours: 8 }, { title: "Government Schemes", hours: 4 },
      { title: "Sports & Awards", hours: 4 }, { title: "Science & Tech Updates", hours: 4 }, { title: "Revision Capsules", hours: 4 },
    ],
  },
  {
    slug: "placement-prep", lineCode: "L11", title: "Placement Preparation", category: "exam", color: "coral",
    description: "Everything between 'ready to apply' and 'offer letter.'",
    difficulty: "Intermediate", estimatedDurationHours: 80,
    prerequisites: ["DSA (recommended)"], careerOutcomes: ["Campus placements", "Off-campus interviews"],
    startedCount: 1,
    nodeSeeds: [
      { title: "Resume Building", hours: 6 }, { title: "Aptitude Refresher", hours: 12 }, { title: "Coding Round Prep", hours: 20 },
      { title: "Group Discussion", hours: 6 }, { title: "HR Interview", hours: 8 }, { title: "Company-wise Prep", hours: 28 },
    ],
  },
  {
    slug: "physics-11-12", lineCode: "L12", title: "Physics (Class 11–12)", category: "school", color: "teal",
    description: "NCERT-aligned physics, board and competitive-exam ready.",
    difficulty: "Intermediate", estimatedDurationHours: 100,
    prerequisites: ["Class 10 Science"], careerOutcomes: ["Board exams", "JEE/NEET foundation"],
    startedCount: 1,
    nodeSeeds: [
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
    startedCount: 1,
    nodeSeeds: [
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
    startedCount: 1,
    nodeSeeds: [
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
    startedCount: 1,
    nodeSeeds: [
      { title: "Grammar Basics", hours: 4 }, { title: "Vocabulary Building", hours: 3 }, { title: "Reading Comprehension", hours: 3 },
      { title: "Spoken English", hours: 5 }, { title: "Interview Communication", hours: 3 }, { title: "Email & Writing Skills", hours: 2 },
    ],
  },
];

export const roadmapsCatalog: RoadmapDetailData[] = seeds.map((s) => {
  const nodes = makeNodes(s.nodeSeeds, s.startedCount);
  const doneCount = nodes.filter((n) => n.state === "done").length;
  const progressPercent = Math.round((doneCount / nodes.length) * 100);
  const { nodeSeeds, startedCount, ...rest } = s;
  return { ...rest, nodes, progressPercent };
});

export function getRoadmap(slug: string): RoadmapDetailData | undefined {
  return roadmapsCatalog.find((r) => r.slug === slug);
}

export function getRoadmapNode(roadmapSlug: string, nodeSlug: string) {
  const roadmap = getRoadmap(roadmapSlug);
  const node = roadmap?.nodes.find((n) => n.slug === nodeSlug);
  return roadmap && node ? { roadmap, node } : undefined;
}

// ---- Topic-level curated content ----

export type ResourceTag = "recommended" | "alternative" | "quick" | "deep_dive" | "hindi";
export type ResourceType = "video" | "article" | "practice";

export type ResourceData = {
  id: string;
  type: ResourceType;
  tag: ResourceTag;
  title: string;
  source: string;
  language: "English" | "Hindi" | "Hinglish";
  durationMinutes?: number;
  videoId?: string; // present for playable video resources — metadata only, no bytes stored
};

export type LessonStep = { title: string; videoId?: string };

export type TopicDetailData = {
  slug: string;
  roadmapSlug: string;
  roadmapTitle: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  prerequisites: string[];
  whatYouWillLearn: string[];
  lessons: LessonStep[];
  resources: ResourceData[];
};

// Only "Arrays" in the DSA line is fully curated for this demo build.
// Every other topic renders through the generic template below until admin curation lands (Phase 6).
export const curatedTopics: Record<string, TopicDetailData> = {
  "dsa/arrays": {
    slug: "arrays",
    roadmapSlug: "dsa",
    roadmapTitle: "Data Structures & Algorithms",
    title: "Arrays",
    difficulty: "Beginner",
    estimatedHours: 10,
    prerequisites: ["Programming Basics"],
    whatYouWillLearn: [
      "Array fundamentals and memory layout",
      "Traversal and in-place updates",
      "Linear and binary searching",
      "Insertion and deletion",
      "Prefix sums",
      "Two pointer technique",
      "Sliding window",
    ],
    lessons: [
      { title: "Array fundamentals", videoId: "rL8X2mlNHPM" },
      { title: "Traversal", videoId: "rL8X2mlNHPM" },
      { title: "Searching", videoId: "rL8X2mlNHPM" },
      { title: "Prefix sum", videoId: "rL8X2mlNHPM" },
      { title: "Two pointer", videoId: "rL8X2mlNHPM" },
      { title: "Sliding window", videoId: "rL8X2mlNHPM" },
    ],
    resources: [
      { id: "r1", type: "video", tag: "recommended", title: "Arrays — complete beginner lesson", source: "freeCodeCamp", language: "English", durationMinutes: 42, videoId: "rL8X2mlNHPM" },
      { id: "r2", type: "video", tag: "hindi", title: "Arrays in DSA — poori playlist", source: "Apna College — Sigma Batch", language: "Hinglish", durationMinutes: 58, videoId: "rL8X2mlNHPM" },
      { id: "r3", type: "video", tag: "alternative", title: "Arrays deep dive with visualizations", source: "CS Dojo", language: "English", durationMinutes: 35, videoId: "rL8X2mlNHPM" },
      { id: "r4", type: "video", tag: "quick", title: "Arrays in 10 minutes — revision", source: "Take U Forward", language: "Hinglish", durationMinutes: 11, videoId: "rL8X2mlNHPM" },
      { id: "r5", type: "article", tag: "deep_dive", title: "Array data structure — full reference", source: "GeeksforGeeks", language: "English" },
      { id: "r6", type: "practice", tag: "recommended", title: "20 array practice problems (Easy → Hard)", source: "LearnPath Practice", language: "English" },
    ],
  },
};

export function getTopicData(roadmapSlug: string, nodeSlug: string) {
  const found = getRoadmapNode(roadmapSlug, nodeSlug);
  if (!found) return undefined;

  const key = `${roadmapSlug}/${nodeSlug}`;
  if (curatedTopics[key]) {
    return { data: curatedTopics[key], nodeState: found.node.state, isCurated: true as const };
  }

  // Generic fallback so every topic still renders real, distinct content —
  // just without hand-picked resources yet.
  const generic: TopicDetailData = {
    slug: nodeSlug,
    roadmapSlug,
    roadmapTitle: found.roadmap.title,
    title: found.node.title,
    difficulty: found.roadmap.difficulty,
    estimatedHours: found.node.estimatedHours,
    prerequisites: found.roadmap.nodes[0]?.slug === nodeSlug ? [] : [`Previous stations on ${found.roadmap.title}`],
    whatYouWillLearn: [`Core concepts of ${found.node.title}`, "Worked examples", "Common mistakes to avoid", "Practice problems"],
    lessons: [{ title: "Introduction" }, { title: "Core concept" }, { title: "Worked examples" }, { title: "Practice" }],
    resources: [],
  };
  return { data: generic, nodeState: found.node.state, isCurated: false as const };
}

/**
 * Returns just the structural teaching content (lessons + what-you'll-learn)
 * for a topic, independent of live roadmap/resource edits made in the admin
 * panel. Resources are owned separately by the admin store so curation can
 * evolve without needing this static content to change too.
 */
export function getStaticTopicContent(roadmapSlug: string, nodeSlug: string, nodeTitle: string) {
  const key = `${roadmapSlug}/${nodeSlug}`;
  const curated = curatedTopics[key];
  if (curated) {
    return { whatYouWillLearn: curated.whatYouWillLearn, lessons: curated.lessons, prerequisites: curated.prerequisites };
  }
  return {
    whatYouWillLearn: [`Core concepts of ${nodeTitle}`, "Worked examples", "Common mistakes to avoid", "Practice problems"],
    lessons: [{ title: "Introduction" }, { title: "Core concept" }, { title: "Worked examples" }, { title: "Practice" }] as LessonStep[],
    prerequisites: [] as string[],
  };
}
