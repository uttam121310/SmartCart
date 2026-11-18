
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    templates: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;

      try {
        const listsRef = collection(
          db,
          "users",
          user.uid,
          "shoppingLists"
        );

        const templatesRef = collection(
          db,
          "users",
          user.uid,
          "templates"
        );

        const [listsSnapshot, templatesSnapshot] = await Promise.all([
          getDocs(listsRef),
          getDocs(templatesRef),
        ]);

        const lists = listsSnapshot.docs.map((doc) => doc.data());

        const completed = lists.filter(
          (list) => list.status === "completed"
        ).length;

        setStats({
          total: lists.length,
          active: lists.length - completed,
          completed,
          templates: templatesSnapshot.size,
        });
      } catch (error) {
        console.error("Dashboard loading failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const firstName = user?.displayName?.split(" ")[0] || "User";

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <Link to="/" className="brand">
          <span className="brand-icon">S</span>
          <span>Smart<span>Cart</span></span>
        </Link>

        <p className="sidebar-label">MENU</p>

        <nav className="sidebar-nav">
          <Link to="/" className="nav-link active">
            <span>▦</span> Dashboard
          </Link>

          <Link to="/shopping-lists" className="nav-link">
            <span>☷</span> Shopping Lists
          </Link>

          <Link to="/templates" className="nav-link">
            <span>▤</span> Templates
          </Link>

          <Link to="/shopping-history" className="nav-link">
            <span>◷</span> Shopping History
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="profile-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <strong>{user?.displayName || "User"}</strong>
              <span>SmartCart User</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="dashboard-main">

        <header className="dashboard-topbar">
          <div>
            <p className="topbar-label">YOUR SHOPPING SPACE</p>
            <h2>Dashboard</h2>
          </div>

          <div className="topbar-user">
            <div className="profile-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <span>{firstName}</span>
          </div>
        </header>

        {/* Welcome Section */}
        <section className="welcome-banner">
          <div>
            <p className="welcome-small">WELCOME BACK</p>
            <h1>Hello, {firstName}! 👋</h1>
            <p>
              Ready to make your shopping smarter and easier?
            </p>

            <Link to="/shopping-lists" className="primary-link">
              View Shopping Lists <span>→</span>
            </Link>
          </div>

          <div className="welcome-illustration">
            🛒
          </div>
        </section>

        {/* Statistics */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Your Overview</h2>
              <p>Here is your shopping activity at a glance.</p>
            </div>
          </div>

          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon teal">☷</div>
              <p>Total Shopping Lists</p>
              <h3>{loading ? "..." : stats.total}</h3>
              <span>All your lists</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">🛍</div>
              <p>Active Shopping</p>
              <h3>{loading ? "..." : stats.active}</h3>
              <span>Lists in progress</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">✓</div>
              <p>Completed Shopping</p>
              <h3>{loading ? "..." : stats.completed}</h3>
              <span>Successfully completed</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">▤</div>
              <p>Saved Templates</p>
              <h3>{loading ? "..." : stats.templates}</h3>
              <span>Ready to reuse</span>
            </div>

          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Everything you need, just one click away.</p>
            </div>
          </div>

          <div className="quick-actions">

            <Link to="/shopping-lists" className="action-card">
              <div className="action-icon">＋</div>
              <div>
                <h3>Shopping Lists</h3>
                <p>Create and manage your shopping lists.</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>

            <Link to="/templates" className="action-card">
              <div className="action-icon purple">▤</div>
              <div>
                <h3>Templates</h3>
                <p>Reuse your saved shopping templates.</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>

            <Link to="/shopping-history" className="action-card">
              <div className="action-icon orange">◷</div>
              <div>
                <h3>Shopping History</h3>
                <p>Check your previously completed shopping.</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>

          </div>
        </section>

        <footer className="dashboard-footer">
          <p>© 2026 SmartCart. Make shopping smarter.</p>
        </footer>

      </main>
    </div>
  );
}

export default Home;
