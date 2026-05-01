import Navbar from "@/components/Navbar";
import React from "react";

const HomeLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <main>
      {" "}
      <Navbar />
      {children}
    </main>
  );
};

export default HomeLayout;
