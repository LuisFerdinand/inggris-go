import { SiteHeader } from "@/components/sidebar/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const ProgramCreatePage = () => {
  return (
    <>
      <SiteHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Program", href: "/dashboard/programs" },
          { label: "Create" },
        ]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 ">
            <div className="flex items-center gap-4">
              <Button asChild variant={"dashboard-outline"} size={"icon"}>
                <Link href={"/dashboard/programs"}>
                  <ArrowLeft className="size-4"></ArrowLeft>
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Create Program</h1>
            </div>
            <Card>
              <CardHeader>Basic Information</CardHeader>
              <CardDescription>
                Provide basic information about the course
              </CardDescription>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgramCreatePage;
