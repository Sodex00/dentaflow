import React from "react";
import {createRoot} from "react-dom/client";
import Home from "../app/page";
import Admin from "../app/admin/page";
import "../app/globals.css";
import "./pages.css";
const isAdmin=window.location.pathname.replace(/\/$/,"").endsWith("/admin");
createRoot(document.getElementById("root")!).render(<React.StrictMode>{isAdmin?<Admin/>:<Home/>}</React.StrictMode>);
