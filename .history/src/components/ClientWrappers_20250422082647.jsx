"use client";

import {
  ClientOnlyComponent,
  ResponsiveWrapper,
} from "@/components/ClientWrappers";
import ProfilePreview from "@/components/dashboard/ProfilePreview";
import Profile from "@/components/Profile";

// Example of a component that might have mobile issues
export default function UserProfilePage({ user, isPreview = false }) {
  // For components that should only render on the client
  if (isPreview) {
    return (
      <ClientOnlyComponent>
        <ProfilePreview user={user} />
      </ClientOnlyComponent>
    );
  }

  // For components that need responsive adaptation
  return (
    <ResponsiveWrapper>
      <Profile
        name={user.name}
        title={user.title}
        avatarUrl={user.avatar_url}
        location={user.location}
        availability={user.availability}
      />
    </ResponsiveWrapper>
  );
}
