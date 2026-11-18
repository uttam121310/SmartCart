
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function Templates() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = async () => {
    try {
      const ref = collection(
        db,
        "users",
        user.uid,
        "templates"
      );

      const snapshot = await getDocs(ref);

      setTemplates(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );
    } catch (error) {
      console.error(error);
      alert("Unable to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [user.uid]);

  const createListFromTemplate = async (template) => {
    try {
      const listRef = collection(
        db,
        "users",
        user.uid,
        "shoppingLists"
      );

      const newItems = template.items.map((item) => ({
        id: crypto.randomUUID(),
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        purchased: false,
        actualPrice: null,
      }));

      const newList = await addDoc(listRef, {
        name: template.name,
        items: newItems,
        createdAt: serverTimestamp(),
        completedAt: null,
      });

      alert("Shopping list created successfully!");

      navigate(`/shopping-lists/${newList.id}`);
    } catch (error) {
      console.error(error);
      alert("Unable to create shopping list");
    }
  };

  if (loading) return <p>Loading templates...</p>;

  return (
    <div>
      <h1>Shopping Templates</h1>

      <Link to="/shopping-lists">
        Back to Shopping Lists
      </Link>

      <hr />

      {templates.length === 0 ? (
        <p>No templates available yet.</p>
      ) : (
        templates.map((template) => (
          <div key={template.id}>
            <h3>{template.name}</h3>

            <p>
              {template.items.length} Items
            </p>

            <button
              onClick={() =>
                createListFromTemplate(template)
              }
            >
              Use Template
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Templates;
