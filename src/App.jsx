
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ShoppingListDetails from "./pages/ShoppingListDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";

import ProtectedRoute from "./components/ProtectedRoute";

import ShoppingList from "./pages/ShoppingList";
import Templates from "./pages/Templates";

import ShoppingHistory from "./pages/ShoppingHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
  path="/shopping-lists"
  element={
    <ProtectedRoute>
      <ShoppingList />
    </ProtectedRoute>
  }
/>

<Route
  path="/shopping-lists/:listId"
  element={
    <ProtectedRoute>
      <ShoppingListDetails />
    </ProtectedRoute>
  }
/>

<Route
  path="/templates"
  element={
    <ProtectedRoute>
      <Templates />
    </ProtectedRoute>
  }
/>

<Route
  path="/shopping-history"
  element={
    <ProtectedRoute>
      <ShoppingHistory />
    </ProtectedRoute>
  }
/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
