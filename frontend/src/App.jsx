import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://skillgraph-y5uy.onrender.com";

function App() {
  const [student, setStudent] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check backend connection
        const connectionResponse = await fetch(`${API_URL}/`);
        const connectionData = await connectionResponse.json();

        if (connectionData.success !== true) {
          setConnected(false);
          return;
        }

        setConnected(true);

        // Get student
        const studentResponse = await fetch(
          `${API_URL}/api/students`
        );

        if (!studentResponse.ok) {
          throw new Error("Failed to fetch student data");
        }

        const studentData = await studentResponse.json();

        if (studentData.length > 0) {
          setStudent(studentData[0]);
        }

        // Get recommendations
        const recommendationResponse = await fetch(
          `${API_URL}/api/recommendations`
        );

        if (!recommendationResponse.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const recommendationData =
          await recommendationResponse.json();

        setRecommendations(recommendationData);
      } catch (error) {
        console.error("SkillGraph error:", error);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>

        <h2>Loading SkillGraph...</h2>

        <p>
          Fetching your skills and job recommendations.
        </p>
      </div>
    );
  }

  // Backend disconnected
  if (!connected) {
    return (
      <div className="connection-error">
        <div className="error-icon">⚠️</div>

        <h2>SkillGraph Backend Disconnected</h2>

        <p>
          We couldn't connect to the SkillGraph backend.
          Please try again in a few seconds.
        </p>

        <button onClick={() => window.location.reload()}>
          Retry Connection
        </button>
      </div>
    );
  }

  const job = recommendations[0];

  const userSkills = student?.skills || [];
  const requiredSkills = job?.requiredSkills || [];
  const matchedSkills = job?.matchedSkills || [];
  const missingSkills = job?.missingSkills || [];
  const matchPercentage = job?.matchPercentage || 0;

  return (
    <div className="app">

      {/* HEADER */}
      <header className="main-header">

        <div className="brand">

          <div className="brand-logo">
            <span className="logo-dot dot-1"></span>
            <span className="logo-dot dot-2"></span>
            <span className="logo-dot dot-3"></span>

            <span className="logo-line line-1"></span>
            <span className="logo-line line-2"></span>
          </div>

          <div className="brand-text">
            <h1>SkillGraph</h1>
            <p>Skill &amp; Job Matching Platform</p>
          </div>

        </div>

        <div className="connection-status">
          <span className="connection-dot"></span>

          {connected ? "Connected" : "Disconnected"}
        </div>

      </header>

      {/* PROFILE */}
      <section className="profile-card">

        <div className="profile-left">

          <div className="profile-avatar">
            👤
          </div>

          <div className="profile-info">

            <h2>
              {student?.name || "Student"}
            </h2>

            <p>
              {student?.email || "No email available"}
            </p>

          </div>

        </div>

        <div className="career-goal">

          <div className="goal-icon">
            🎯
          </div>

          <div className="goal-content">

            <span>
              Career Goal
            </span>

            <strong>
              {job?.jobTitle || "Career Goal"}
            </strong>

          </div>

        </div>

      </section>

      {/* DASHBOARD */}
      <main className="dashboard-grid">

        {/* LEFT CARD - MY SKILLS */}
        <section className="dashboard-card skills-card">

          <div className="dashboard-card-header">

            <div className="header-icon">
              💻
            </div>

            <div className="header-text">

              <h2>
                My Skills
              </h2>

              <p>
                Skills currently available in your profile
              </p>

            </div>

            <div className="count-badge">
              {userSkills.length} Skills
            </div>

          </div>

          <div className="skill-cards">

            {userSkills.length > 0 ? (

              userSkills.map((skill, index) => {

                let icon = "💻";

                if (skill.toLowerCase() === "python") {
                  icon = "🐍";
                } else if (skill.toLowerCase() === "sql") {
                  icon = "🗄️";
                } else if (skill.toLowerCase() === "excel") {
                  icon = "📊";
                } else if (skill.toLowerCase() === "power bi") {
                  icon = "📊";
                }

                return (
                  <div
                    className="skill-item"
                    key={index}
                  >

                    <div className="skill-item-left">

                      <span className="skill-symbol">
                        {icon}
                      </span>

                      <span className="skill-name">
                        {skill}
                      </span>

                    </div>

                    <div className="skill-check">
                      ✓
                    </div>

                  </div>
                );
              })

            ) : (

              <div className="no-data">
                No skills available.
              </div>

            )}

          </div>

          {/* Skill Strength */}
          <div className="skill-strength">

            <h3>
              Skill Strength
            </h3>

            <div className="strength-value">
              {matchPercentage}%
            </div>

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${matchPercentage}%`,
                }}
              ></div>

            </div>

          </div>

          {/* Skill Areas */}
          <div className="skill-areas">

            <h3>
              Skill Areas
            </h3>

            <div className="area-list">

              <span>Data Analysis</span>
              <span>Databases</span>
              <span>Excel</span>
              <span>Python</span>

            </div>

          </div>

        </section>

        {/* RIGHT CARD - JOB RECOMMENDATION */}
        <section className="dashboard-card recommendation-card">

          <div className="dashboard-card-header">

            <div className="header-icon">
              💼
            </div>

            <div className="header-text">

              <h2>
                Job Recommendation
              </h2>

              <p>
                Based on your skill graph
              </p>

            </div>

            {job && (
              <div className="match-header-badge">
                {matchPercentage}% Match
              </div>
            )}

          </div>

          {job ? (

            <>

              {/* Job Highlight */}
              <div className="job-highlight">

                <div className="job-icon">
                  📊
                </div>

                <div className="job-details">

                  <h3>
                    {job.jobTitle}
                  </h3>

                  <p>
                    Recommended for you
                  </p>

                </div>

                <div className="job-match">
                  {matchPercentage}% Match
                </div>

              </div>

              {/* Required Skills */}
              <div className="required-section">

                <h3>
                  Required Skills
                </h3>

                <div className="required-skills">

                  {requiredSkills.map((skill, index) => {

                    const isMatched =
                      matchedSkills.includes(skill);

                    return (
                      <span
                        key={index}
                        className={
                          isMatched
                            ? "required-skill matched"
                            : "required-skill missing"
                        }
                      >
                        {isMatched ? "✓" : "⚠"}{" "}
                        {skill}
                      </span>
                    );

                  })}

                </div>

              </div>

              {/* Match Statistics */}
              <div className="match-stats">

                <div className="match-stat matched-stat">

                  <div className="stat-icon">
                    ✓
                  </div>

                  <div className="stat-content">

                    <strong>
                      {matchedSkills.length} /{" "}
                      {requiredSkills.length}
                    </strong>

                    <span>
                      Matching Skills
                    </span>

                  </div>

                </div>

                <div className="match-stat missing-stat">

                  <div className="stat-icon">
                    !
                  </div>

                  <div className="stat-content">

                    <strong>
                      {missingSkills.length}
                    </strong>

                    <span>
                      Skills to Learn
                    </span>

                  </div>

                </div>

              </div>

              {/* Skill Gap Recommendation */}
              {missingSkills.length > 0 && (

                <div className="recommendation-box">

                  <div className="recommendation-icon">
                    💡
                  </div>

                  <div className="recommendation-content">

                    <strong>
                      Recommendation:
                    </strong>

                    <p>
                      Learn{" "}
                      {missingSkills.join(", ")}{" "}
                      to improve your job match.
                    </p>

                  </div>

                  <div className="recommendation-arrow">
                    →
                  </div>

                </div>

              )}

            </>

          ) : (

            <div className="no-data">
              No job recommendations available.
            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default App;