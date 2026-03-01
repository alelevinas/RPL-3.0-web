"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as coursesService from "@/services/coursesService";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const courseId = Number(params.courseId);
  const state = useAppState();

  useEffect(() => {
    if (!courseId) return;
    coursesService.get(courseId).then((c) => state.set("course", c)).catch(() => {});
    coursesService.getPermissions(courseId).then((p) => state.set("permissions", p)).catch(() => {});
  }, [courseId]);

  return <>{children}</>;
}
