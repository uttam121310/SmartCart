
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function ShoppingHistory() {
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadHistory = async () => {
      try {
        const ref = collection(
          db,
          "users",
          user.uid,
          "shoppingLists"
        );

        const q = query(
          ref,
          where("status", "==", "completed")
        );

        const snapshot = await getDocs(q);

        const completedLists = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        completedLists.sort((a, b) => {
          const dateA = a.completedAt?.toDate
            ? a.completedAt.toDate().getTime()
            : 0;

          const dateB = b.completedAt?.toDate
            ? b.completedAt.toDate().getTime()
            : 0;

          return dateB - dateA;
        });

        if (isActive) {
          setHistory(completedLists);
        }
      } catch (err) {
        console.error("History loading error:", err);

        if (isActive) {
          setError(err.message || "Unable to load history.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    if (user?.uid) {
      loadHistory();
    }

    return () => {
      isActive = false;
    };
  }, [user]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Date unavailable";

    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <p>Loading shopping history...</p>;
  }

  return (
    <div>
      <h1>Shopping History</h1>

      <Link to="/">Back to Dashboard</Link>

      <hr />

      {error && (
        <p>
          History Error: {error}
        </p>
      )}

      {!error && history.length === 0 && (
        <p>No completed shopping found.</p>
      )}

      {history.map((list) => (
        <div key={list.id}>
          <h3>{list.name}</h3>

          <p>
            Completed: {formatDate(list.completedAt)}
          </p>

          <p>
            Purchased Items:{" "}
            {list.items?.filter((item) => item.purchased).length || 0}
          </p>

          <h3>
            Final Bill: ₹
            {Number(list.finalBill || 0).toFixed(2)}
          </h3>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default ShoppingHistory;
