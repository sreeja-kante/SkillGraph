require("dotenv").config();

const express = require("express");
const neo4j = require("neo4j-driver");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(
    process.env.COGNODB_USERNAME,
    process.env.COGNODB_PASSWORD
  )
);

// Test database connection
app.get("/", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      "RETURN 'SkillGraph database connected successfully!' AS message"
    );

    res.json({
      success: true,
      message: result.records[0].get("message"),
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Could not connect to CognoDB",
    });
  } finally {
    await session.close();
  }
});

// Create sample SkillGraph data
app.post("/api/seed", async (req, res) => {
  const session = driver.session();

  try {
    await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);

    await session.run(`
      CREATE
      (s:Student {
        name: "Sreeja",
        email: "sreeja@example.com"
      }),

      (python:Skill {name: "Python"}),
      (sql:Skill {name: "SQL"}),
      (excel:Skill {name: "Excel"}),
      (powerbi:Skill {name: "Power BI"}),

      (job:Job {
        title: "Data Analyst"
      }),

      (company:Company {
        name: "Tech Analytics"
      }),

      (s)-[:HAS_SKILL]->(python),
      (s)-[:HAS_SKILL]->(sql),
      (s)-[:HAS_SKILL]->(excel),

      (job)-[:REQUIRES]->(python),
      (job)-[:REQUIRES]->(sql),
      (job)-[:REQUIRES]->(excel),
      (job)-[:REQUIRES]->(powerbi),

      (job)-[:OFFERED_BY]->(company)
    `);

    res.json({
      success: true,
      message: "Sample SkillGraph data created successfully!",
    });
  } catch (error) {
    console.error("Seed error:", error);

    res.status(500).json({
      success: false,
      message: "Could not create sample data",
    });
  } finally {
    await session.close();
  }
});

// Get all students
app.get("/api/students", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (s:Student)
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(skill:Skill)
      RETURN s.name AS name,
             s.email AS email,
             collect(skill.name) AS skills
    `);

    const students = result.records.map((record) => ({
      name: record.get("name"),
      email: record.get("email"),
      skills: record.get("skills"),
    }));

    res.json(students);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Could not fetch students",
    });
  } finally {
    await session.close();
  }
});

// Get job recommendations
app.get("/api/recommendations", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (s:Student {name: "Sreeja"})-[:HAS_SKILL]->(studentSkill:Skill)
      WITH s, collect(studentSkill.name) AS studentSkills

      MATCH (job:Job)-[:REQUIRES]->(requiredSkill:Skill)
      WITH job, studentSkills, collect(requiredSkill.name) AS requiredSkills

      RETURN
        job.title AS jobTitle,
        studentSkills,
        requiredSkills
    `);

    const recommendations = result.records.map((record) => {
      const jobTitle = record.get("jobTitle");
      const studentSkills = record.get("studentSkills");
      const requiredSkills = record.get("requiredSkills");

      const matchedSkills = requiredSkills.filter((skill) =>
        studentSkills.includes(skill)
      );

      const missingSkills = requiredSkills.filter(
  (skill) => !matchedSkills.includes(skill)
);

      const matchPercentage =
        requiredSkills.length > 0
          ? Math.round(
              (matchedSkills.length / requiredSkills.length) * 100
            )
          : 0;

      return {
        jobTitle,
        studentSkills,
        requiredSkills,
        matchedSkills,
        missingSkills,
        matchPercentage,
      };
    });

    res.json(recommendations);
  } catch (error) {
    console.error("Recommendation error:", error);

    res.status(500).json({
      message: "Could not generate recommendations",
      error: error.message,
    });
  } finally {
    await session.close();
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SkillGraph backend running on port ${PORT}`);
})