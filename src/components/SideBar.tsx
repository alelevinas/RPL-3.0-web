"use client";

import React from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter, useParams } from "next/navigation";
import { hasPermission } from "@/utils/permissions";

const DRAWER_WIDTH = 240;

type Props = {
  open: boolean;
  onClose: () => void;
  permissions?: string[];
};

export default function SideBar({ open, onClose, permissions = [] }: Props) {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  if (!courseId) return null;

  const canEdit = hasPermission(permissions, "course_edit");
  const canManageUsers = hasPermission(permissions, "user_manage");

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{ width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          <ListItemButton onClick={() => navigate("/courses")}>
            <ListItemIcon><ArrowBackIcon /></ListItemIcon>
            <ListItemText primary="All Courses" />
          </ListItemButton>
          <Divider />
          <ListItemButton onClick={() => navigate(`/courses/${courseId}/dashboard`)}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton onClick={() => navigate(`/courses/${courseId}/activities`)}>
            <ListItemIcon><AssignmentIcon /></ListItemIcon>
            <ListItemText primary="Activities" />
          </ListItemButton>
          {canManageUsers && (
            <ListItemButton onClick={() => navigate(`/courses/${courseId}/students`)}>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Students" />
            </ListItemButton>
          )}
          {canEdit && (
            <ListItemButton onClick={() => navigate(`/courses/${courseId}/edit`)}>
              <ListItemIcon><EditIcon /></ListItemIcon>
              <ListItemText primary="Edit Course" />
            </ListItemButton>
          )}
        </List>
      </Box>
    </Drawer>
  );
}
