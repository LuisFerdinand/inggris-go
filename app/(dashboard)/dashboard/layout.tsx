import { BRAND } from "@/constants/brand";
import React from "react";

const DashboardLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return <main>{children}</main>;
};

export default DashboardLayout;
