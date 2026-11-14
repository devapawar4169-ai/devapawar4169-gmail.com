export interface MathsChapter {
  title: string;
  summary: string;
  sampleQuestion: string;
}

export interface MathsClassLevel {
  grade: number;
  label: string;
  stageTitle: string;
  visualizer: "tables" | "algebra" | "trigonometry";
  chapters: MathsChapter[];
}

export const MATHS_CLASS_CURRICULUM: MathsClassLevel[] = [
  {
    grade: 1,
    label: "Class 1",
    stageTitle: "Numbers, Counting & Shapes",
    visualizer: "tables",
    chapters: [
      {
        title: "Numbers 1 to 100 & Place Value",
        summary: "Counting tens and ones using bundles and blocks.",
        sampleQuestion: "How many tens and ones are in 47?",
      },
      {
        title: "Fun Addition & Subtraction",
        summary: "Adding and taking away single and two-digit numbers.",
        sampleQuestion: "Riya has 12 mangoes and gets 7 more. How many mangoes in total?",
      },
      {
        title: "Basic Shapes Around Us",
        summary: "Circles, squares, triangles, and rectangles in daily objects.",
        sampleQuestion: "How many sides and corners does a triangle have?",
      },
    ],
  },
  {
    grade: 2,
    label: "Class 2",
    stageTitle: "Carry Addition, Skip Counting & Time",
    visualizer: "tables",
    chapters: [
      {
        title: "2-Digit Addition with Carry",
        summary: "Adding numbers up to 100 by regrouping tens.",
        sampleQuestion: "Add 38 + 27 step by step.",
      },
      {
        title: "Skip Counting & Intro to Tables",
        summary: "Counting by 2s, 5s, and 10s to build multiplication.",
        sampleQuestion: "What are 4 groups of 5 apples?",
      },
      {
        title: "Reading the Clock & Rupees",
        summary: "Telling half-past hours and counting coins and notes.",
        sampleQuestion: "If you buy a pencil for ₹12 and give ₹20, how much change do you get?",
      },
    ],
  },
  {
    grade: 3,
    label: "Class 3",
    stageTitle: "Multiplication Tables & Equal Sharing",
    visualizer: "tables",
    chapters: [
      {
        title: "Multiplication Tables (2 to 12)",
        summary: "Fast patterns and everyday multiplication word problems.",
        sampleQuestion: "Multiply 24 × 6 step by step.",
      },
      {
        title: "Division as Fair Sharing",
        summary: "Splitting objects into equal groups and finding remainders.",
        sampleQuestion: "Share 36 chocolates equally among 4 friends.",
      },
      {
        title: "Introduction to Fractions",
        summary: "Understanding halves (1/2), quarters (1/4), and thirds (1/3).",
        sampleQuestion: "If a pizza has 8 slices and you eat 3, what fraction is left?",
      },
    ],
  },
  {
    grade: 4,
    label: "Class 4",
    stageTitle: "Large Numbers, Factors & Perimeter",
    visualizer: "tables",
    chapters: [
      {
        title: "2-Digit Multiplication & Long Division",
        summary: "Multiplying and dividing 3-digit numbers cleanly.",
        sampleQuestion: "Divide 144 by 12 step by step.",
      },
      {
        title: "Factors & Multiples",
        summary: "Finding all factors of a number and common multiples.",
        sampleQuestion: "List all factors of 24.",
      },
      {
        title: "Perimeter of Squares & Rectangles",
        summary: "Measuring the total boundary length around shapes.",
        sampleQuestion: "Find the perimeter of a rectangle with length 9 cm and width 5 cm.",
      },
    ],
  },
  {
    grade: 5,
    label: "Class 5",
    stageTitle: "LCM, HCF, Decimals & Area",
    visualizer: "algebra",
    chapters: [
      {
        title: "HCF & LCM Methods",
        summary: "Prime factorization to find Highest Common Factor and LCM.",
        sampleQuestion: "Find the LCM and HCF of 12 and 18.",
      },
      {
        title: "Fractions & Decimals",
        summary: "Adding unlike fractions and converting to decimals.",
        sampleQuestion: "Add 2/3 + 1/4 step by step.",
      },
      {
        title: "Area & Volume Basics",
        summary: "Finding area of rectangles and volume of cubes.",
        sampleQuestion: "Find the area of a room 8 m long and 6 m wide.",
      },
    ],
  },
  {
    grade: 6,
    label: "Class 6",
    stageTitle: "Integers, Ratios & First Algebra",
    visualizer: "algebra",
    chapters: [
      {
        title: "Integers & Number Line",
        summary: "Adding and subtracting positive and negative numbers.",
        sampleQuestion: "Evaluate (-8) + 13 - (-4) step by step.",
      },
      {
        title: "Ratio & Proportion",
        summary: "Comparing quantities and solving unitary method problems.",
        sampleQuestion: "If 5 notebooks cost ₹125, how much do 8 notebooks cost?",
      },
      {
        title: "Basic Algebra Equations",
        summary: "Using letters like x to solve unknown values.",
        sampleQuestion: "Solve for x: 3x + 5 = 20",
      },
    ],
  },
  {
    grade: 7,
    label: "Class 7",
    stageTitle: "Linear Equations, Percentages & Triangles",
    visualizer: "algebra",
    chapters: [
      {
        title: "Simple Linear Equations",
        summary: "Balancing both sides to isolate the variable.",
        sampleQuestion: "Solve 4(x - 2) = 20 step by step.",
      },
      {
        title: "Percentage, Profit & Loss",
        summary: "Discounts, percentage increase, and simple interest.",
        sampleQuestion: "A ₹400 shirt has a 15% discount. What is the sale price?",
      },
      {
        title: "Triangles & Angle Sum Property",
        summary: "Finding missing angles inside triangles and parallel lines.",
        sampleQuestion: "Two angles of a triangle are 55° and 75°. Find the third angle.",
      },
    ],
  },
  {
    grade: 8,
    label: "Class 8",
    stageTitle: "Exponents, Algebraic Identities & Mensuration",
    visualizer: "algebra",
    chapters: [
      {
        title: "Algebraic Identities & Factorization",
        summary: "Expanding (a+b)^2, (a-b)^2, and a^2 - b^2.",
        sampleQuestion: "Expand and simplify (2x + 3)^2.",
      },
      {
        title: "Laws of Exponents & Powers",
        summary: "Multiplying powers, negative exponents, and scientific notation.",
        sampleQuestion: "Simplify (2^3 × 2^4) ÷ 2^5.",
      },
      {
        title: "Cylinder & Cuboid Surface Area",
        summary: "Calculating total surface area and volume of 3D solids.",
        sampleQuestion: "Find the volume of a cylinder with radius 7 cm and height 10 cm.",
      },
    ],
  },
  {
    grade: 9,
    label: "Class 9",
    stageTitle: "Polynomials, Coordinate Geometry & Heron's Formula",
    visualizer: "trigonometry",
    chapters: [
      {
        title: "Polynomials & Factor Theorem",
        summary: "Finding zeroes and factorizing quadratic polynomials.",
        sampleQuestion: "Factorize x^2 + 7x + 12 step by step.",
      },
      {
        title: "Linear Equations in Two Variables",
        summary: "Plotting lines on the Cartesian x-y plane.",
        sampleQuestion: "Find 3 solutions for the equation 2x + y = 8.",
      },
      {
        title: "Heron's Formula & Triangles",
        summary: "Calculating triangle area from three side lengths.",
        sampleQuestion: "Find the area of a triangle with sides 5 cm, 12 cm, and 13 cm.",
      },
    ],
  },
  {
    grade: 10,
    label: "Class 10",
    stageTitle: "Quadratics, Trigonometry & Board Prep",
    visualizer: "trigonometry",
    chapters: [
      {
        title: "Quadratic Equations",
        summary: "Solving ax^2 + bx + c = 0 by factoring and quadratic formula.",
        sampleQuestion: "Solve x^2 - 5x + 6 = 0 step by step.",
      },
      {
        title: "Introduction to Trigonometry",
        summary: "Understanding sin, cos, tan ratios and standard angles.",
        sampleQuestion: "Evaluate sin 30° + cos 60° - tan 45°.",
      },
      {
        title: "Arithmetic Progressions (AP)",
        summary: "Finding the nth term and sum of n terms in an AP.",
        sampleQuestion: "Find the 10th term of the AP: 3, 7, 11, 15, ...",
      },
      {
        title: "Statistics & Probability",
        summary: "Mean, median, mode of grouped data and probability events.",
        sampleQuestion: "Two coins are tossed together. What is the probability of getting at least one head?",
      },
    ],
  },
];
