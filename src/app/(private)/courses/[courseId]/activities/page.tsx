"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Fab, Collapse, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useParams, useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as activitiesService from "@/services/activitiesService";
import type { Activity, Category } from "@/types";
import { getLanguageIcon } from "@/utils/icons";
import { hasPermission } from "@/utils/permissions";

export default function ActivitiesPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const state = useAppState();
  const permissions = (state.permissions as string[]) || [];
  const canManage = hasPermission(permissions, "activity_manage");

  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      activitiesService.getAll(courseId),
      activitiesService.getCategories(courseId),
    ]).then(([acts, cats]) => {
      setActivities(acts);
      setCategories(cats);
      setExpandedCategories(new Set(cats.map((c: Category) => c.id)));
    }).finally(() => setLoading(false));
  }, [courseId]);

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS": return "success";
      case "FAILURE": case "ERROR": return "error";
      case "PENDING": case "PROCESSING": return "warning";
      default: return "default";
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  const grouped = categories.map((cat) => ({
    ...cat,
    activities: activities.filter((a) => a.category_id === cat.id),
  }));

  const uncategorized = activities.filter((a) => !categories.some((c) => c.id === a.category_id));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Activities</Typography>
        {canManage && (
          <Fab color="primary" size="small" onClick={() => router.push(`/courses/${courseId}/activity/create`)}>
            <AddIcon />
          </Fab>
        )}
      </Box>

      {grouped.map((cat) => (
        <Box key={cat.id} sx={{ mb: 3 }}>
          <Button
            onClick={() => toggleCategory(cat.id)}
            startIcon={expandedCategories.has(cat.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: 1, textTransform: "none" }}
          >
            <Typography variant="h6">{cat.name}</Typography>
            {cat.description ? <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>— {cat.description}</Typography> : null}
          </Button>

          <Collapse in={expandedCategories.has(cat.id)}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Language</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Points</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cat.activities.map((activity) => (
                    <TableRow key={activity.id} hover sx={{ cursor: "pointer" }} onClick={() => router.push(`/courses/${courseId}/activities/${activity.id}`)}>
                      <TableCell>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getLanguageIcon(activity.language)} alt={activity.language} width={24} height={24} />
                      </TableCell>
                      <TableCell>{activity.name}</TableCell>
                      <TableCell>{activity.points}</TableCell>
                      <TableCell>
                        {activity.submission_status && (
                          <Chip label={activity.submission_status} color={getStatusColor(activity.submission_status) as "success" | "error" | "warning" | "default"} size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {canManage && (
                          <Button size="small" onClick={(e) => { e.stopPropagation(); router.push(`/courses/${courseId}/activities/${activity.id}/edit`); }}>
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {cat.activities.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">No activities in this category</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </Box>
      ))}

      {uncategorized.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Uncategorized</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {uncategorized.map((activity) => (
                  <TableRow key={activity.id} hover sx={{ cursor: "pointer" }} onClick={() => router.push(`/courses/${courseId}/activities/${activity.id}`)}>
                    <TableCell>{activity.name}</TableCell>
                    <TableCell>{activity.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
