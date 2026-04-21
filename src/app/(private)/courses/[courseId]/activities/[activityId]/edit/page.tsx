"use client";

import { useParams } from "next/navigation";
import ActivityEditor from "@/components/ActivityEditor";

export default function EditActivityPage() {
  const params = useParams();
  return (
    <ActivityEditor
      courseId={Number(params.courseId)}
      activityId={Number(params.activityId)}
    />
  );
}
