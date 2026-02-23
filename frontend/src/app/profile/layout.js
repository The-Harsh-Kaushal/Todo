import React from "react";
import Navbar from "@/components/Navbar";

export default function layout({ children }) {
  
  return (
   <div>
    <Navbar/>
    {children}
   </div>
  );
}
