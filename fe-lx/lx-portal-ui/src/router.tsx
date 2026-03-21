import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { HomePage } from "@/pages/public/HomePage";
import { PostsPage } from "@/pages/public/PostsPage";
import { PostDetailPage } from "@/pages/public/PostDetailPage";
import { MembersPage } from "@/pages/public/MembersPage";
import { MemberDetailPage } from "@/pages/public/MemberDetailPage";
import { ActivitiesPage } from "@/pages/public/ActivitiesPage";
import { ActivityDetailPage } from "@/pages/public/ActivityDetailPage";
import { LoginPage } from "@/pages/public/LoginPage";
import { RegisterPage } from "@/pages/public/RegisterPage";
import { VerifyEmailPage } from "@/pages/public/VerifyEmailPage";
import { EmailVerifiedPage } from "@/pages/public/EmailVerifiedPage";
import { EmailVerifyFailedPage } from "@/pages/public/EmailVerifyFailedPage";
import { UnauthorizedPage } from "@/pages/public/UnauthorizedPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { PostsManagementPage } from "@/pages/dashboard/PostsManagementPage";
import { PostEditorPage } from "@/pages/dashboard/PostEditorPage";
import { MembersManagementPage } from "@/pages/dashboard/MembersManagementPage";
import { MemberEditorPage } from "@/pages/dashboard/MemberEditorPage";
import { ActivitiesManagementPage } from "@/pages/dashboard/ActivitiesManagementPage";
import { ActivityEditorPage } from "@/pages/dashboard/ActivityEditorPage";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";
import { MealSignUpPage } from "@/pages/public/MealSignUpPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/posts", element: <PostsPage /> },
      { path: "/posts/:slug", element: <PostDetailPage /> },
      { path: "/members", element: <MembersPage /> },
      { path: "/members/:id", element: <MemberDetailPage /> },
      { path: "/activities", element: <ActivitiesPage /> },
      { path: "/activities/:id", element: <ActivityDetailPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/email-verified", element: <EmailVerifiedPage /> },
      { path: "/email-verify-failed", element: <EmailVerifyFailedPage /> },
      { path: "/unauthorized", element: <UnauthorizedPage /> },
      { path: "/meal-sign-up", element: <MealSignUpPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          {
            element: <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]} />,
            children: [
              { path: "/dashboard/posts", element: <PostsManagementPage /> },
              { path: "/dashboard/posts/create", element: <PostEditorPage /> },
              {
                path: "/dashboard/posts/:id/edit",
                element: <PostEditorPage />,
              },
              {
                path: "/dashboard/activities",
                element: <ActivitiesManagementPage />,
              },
              {
                path: "/dashboard/activities/create",
                element: <ActivityEditorPage />,
              },
              {
                path: "/dashboard/activities/:id/edit",
                element: <ActivityEditorPage />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
              {
                path: "/dashboard/members",
                element: <MembersManagementPage />,
              },
              {
                path: "/dashboard/members/create",
                element: <MemberEditorPage />,
              },
              {
                path: "/dashboard/members/:id/edit",
                element: <MemberEditorPage />,
              },
            ],
          },
          { path: "/dashboard/profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
