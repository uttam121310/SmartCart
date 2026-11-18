
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function ShoppingList() {
  const { user } = useAuth();

  const [listName, setListName] = useState("");
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Load shopping lists
  const loadLists = async () => {
    try {
      const listRef = collection(
        db,
        "users",
        user.uid,
        "shoppingLists"
      );

      const q = query(
        listRef,
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const savedLists = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLists(savedLists);
    } catch (err) {
      setError("Unable to load shopping lists.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, [user.uid]);

  // Create shopping list
  const handleCreateList = async (e) => {
    e.preventDefault();

    if (!listName.trim()) {
      setError("Please enter a list name.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const listRef = collection(
        db,
        "users",
        user.uid,
        "shoppingLists"
      );

      await addDoc(listRef, {
        name: listName.trim(),
        items: [],
        createdAt: serverTimestamp(),
        completedAt: null,
      });

      setListName("");
      await loadLists();
    } catch (err) {
      setError("Unable to create shopping list.");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Save shopping list as template
  const handleSaveAsTemplate = async (list) => {
    try {
      const templateName = window.prompt(
        "Enter template name:",
        list.name
      );

      if (
        templateName === null ||
        !templateName.trim()
      ) {
        return;
      }

      const templateItems = (list.items || []).map(
        (item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
        })
      );

      const templatesRef = collection(
        db,
        "users",
        user.uid,
        "templates"
      );

      await addDoc(templatesRef, {
        name: templateName.trim(),
        items: templateItems,
        createdAt: serverTimestamp(),
      });

      alert("Template saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Unable to save template.");
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Just created";

    return timestamp.toDate().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div>
      <h1>My Shopping Lists</h1>

      <form onSubmit={handleCreateList}>
        <input
          type="text"
          placeholder="Enter shopping list name"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create List"}
        </button>
      </form>

      {error && <p>{error}</p>}

      <h2>Saved Lists</h2>

      {loading ? (
        <p>Loading lists...</p>
      ) : lists.length === 0 ? (
        <p>
          No shopping lists yet. Create your first list!
        </p>
      ) : (
        lists.map((list) => (
          <div key={list.id}>
            <Link
              to={`/shopping-lists/${list.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <h3>{list.name}</h3>

              <p>
                Created: {formatDate(list.createdAt)}
              </p>

              <p>
                Items: {list.items?.length || 0}
              </p>
            </Link>

            <button
              onClick={() => handleSaveAsTemplate(list)}
            >
              Save as Template
            </button>
          </div>
        ))
      )}

      <Link to="/">Back to Home</Link>
    </div>
  );
}

export default ShoppingList;
