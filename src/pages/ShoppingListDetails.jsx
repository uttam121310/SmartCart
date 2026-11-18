
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function ShoppingListDetails() {
  const { listId } = useParams();
  const { user } = useAuth();

  const [list, setList] = useState(null);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("Piece");

  const isCompleted = list?.status === "completed";

  const [loading, setLoading] = useState(true);

  const [deletedItem, setDeletedItem] = useState(null);

  const listRef = doc(
    db,
    "users",
    user.uid,
    "shoppingLists",
    listId
  );

  const loadList = async () => {
    try {
      const snapshot = await getDoc(listRef);

      if (snapshot.exists()) {
        setList({
          id: snapshot.id,
          ...snapshot.data(),
        });
      }
    } catch (error) {
      console.error(error);
      alert("Unable to load shopping list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [listId, user.uid]);

  const saveItems = async (updatedItems) => {
    await updateDoc(listRef, {
      items: updatedItems,
    });

    setList((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

 
const handleAddItem = async (e) => {
  e.preventDefault();

  if (isCompleted) {
    alert("This shopping list is already completed.");
    return;
  }

  if (!itemName.trim()) {
    alert("Please enter item name.");
    return;
  }

  if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }

  const newItem = {
    id: crypto.randomUUID(),
    name: itemName.trim(),
    quantity: Number(quantity),
    unit,
    purchased: false,
    actualPrice: null,
  };

  try {
    await saveItems([...(list.items || []), newItem]);

    setItemName("");
    setQuantity("1");
    setUnit("Piece");
  } catch (error) {
    console.error("Add item error:", error);
    alert("Unable to add item. Please try again.");
  }
};


  const handlePurchase = async (itemId, checked) => {
    if (isCompleted) {
  alert("Completed shopping cannot be modified.");
  return;
}
    const item = list.items.find(
      (item) => item.id === itemId
    );

    let actualPrice = item.actualPrice;

    if (checked) {
      const price = window.prompt(
        `Enter actual price for ${item.name}:`
      );

      if (price === null) return;

      if (price.trim() === "" || !Number.isFinite(Number(price)) || Number(price) < 0) {
        alert("Please enter a valid price");
        return;
      }

      actualPrice = Number(price);
    }

    const updatedItems = list.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            purchased: checked,
            actualPrice: checked ? actualPrice : null,
          }
        : item
    );

    await saveItems(updatedItems);
  };

  const handleEditItem = async (itemId) => {
    if (isCompleted) {
  alert("Completed shopping cannot be edited.");
  return;
}

    const item = list.items.find(
      (item) => item.id === itemId
    );

    const newName = window.prompt(
      "Edit item name:",
      item.name
    );

    if (newName === null || !newName.trim()) return;

    const updatedItems = list.items.map((item) =>
      item.id === itemId
        ? { ...item, name: newName.trim() }
        : item
    );

    await saveItems(updatedItems);
  };

 const handleDeleteItem = async (itemId) => {
    if (isCompleted) {
  alert("Completed shopping cannot be modified.");
  return;
}

  const itemToDelete = list.items.find(
    (item) => item.id === itemId
  );

  const updatedItems = list.items.filter(
    (item) => item.id !== itemId
  );

  await saveItems(updatedItems);

  setDeletedItem(itemToDelete);
};

const handleUndoDelete = async () => {
    if (isCompleted) {
  alert("Completed shopping cannot be modified.");
  return;
}

  if (!deletedItem) return;

  const updatedItems = [
    ...list.items,
    deletedItem,
  ];

  await saveItems(updatedItems);
  setDeletedItem(null);
};

  const items = list?.items || [];

  const purchasedItems = items.filter(
    (item) => item.purchased
  );


const handleCompleteShopping = async () => {
  if (purchasedItems.length === 0) {
    alert("Please purchase at least one item first.");
    return;
  }

  const confirmComplete = window.confirm(
    "Are you sure you want to complete this shopping?"
  );

  if (!confirmComplete) return;

  try {
    await updateDoc(listRef, {
      completedAt: new Date(),
      finalBill: totalBill,
      status: "completed",
    });

    alert("Shopping completed successfully!");
    await loadList();
  } catch (error) {
    console.error(error);
    alert("Unable to complete shopping.");
  }
};


  const totalBill = purchasedItems.reduce(
    (total, item) => total + (Number(item.actualPrice) || 0),
    0
  );

  const progress = items.length
    ? Math.round((purchasedItems.length / items.length) * 100)
    : 0;

  if (loading) return <p>Loading shopping list...</p>;

  if (!list) return <p>Shopping list not found.</p>;

  return (
    <div>
      <Link to="/shopping-lists">
        ← Back to Shopping Lists
      </Link>

      <h1>{list.name}</h1>
      {isCompleted && (
  <p>
    This shopping list is completed and is now read-only.
  </p>
)}

      <h2>Shopping Progress</h2>

      <p>
        {purchasedItems.length} / {items.length} Items Purchased
      </p>

      <progress value={progress} max="100" />

      <p>{progress}% Completed</p>

      <hr />

      <h2>Add Shopping Item</h2>

      <form onSubmit={handleAddItem}>
        <input
          type="text"
          placeholder="Enter item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        <input
          type="number"
          min="0.01"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option>Piece</option>
          <option>Kg</option>
          <option>Gram</option>
          <option>Litre</option>
          <option>ML</option>
          <option>Packet</option>
          <option>Dozen</option>
        </select>

        <button type="submit">Add Item</button>
      </form>

      <hr />

      <h2>Shopping Items</h2>

{deletedItem && (
  <div>
    <p>{deletedItem.name} deleted successfully.</p>

    <button onClick={handleUndoDelete}>
      Undo
    </button>
  </div>
)}

{items.length === 0 ? (

    
        <p>No items added yet.</p>
      ) : (
        items.map((item) => (
          <div key={item.id}>
            <input
              type="checkbox"
              checked={item.purchased}
              onChange={(e) =>
                handlePurchase(item.id, e.target.checked)
              }
            />

            <span>
              {item.name} - {item.quantity} {item.unit}
            </span>

            {item.purchased && (
              <p>
                Actual Price: ₹{item.actualPrice}
              </p>
            )}

            <button
              onClick={() => handleEditItem(item.id)}
            >
              Edit
            </button>

            <button
              onClick={() => handleDeleteItem(item.id)}
            >
              Delete
            </button>
          </div>
        ))
      )}

      <hr />

      <h2>Final Bill Summary</h2>
     {!isCompleted && (
  <button onClick={handleCompleteShopping}>
    Complete Shopping
  </button>
)}

      <h3>Purchased Items: {purchasedItems.length}</h3>

      <h2>Total Bill: ₹{totalBill.toFixed(2)}</h2>
    </div>

  );
}

export default ShoppingListDetails;
