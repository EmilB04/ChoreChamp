import React from 'react';
import { Stack } from 'expo-router';

// This layout defines the navigation structure for all screens inside the (onboarding) folder.
// It hides the default navigation header and ensures each screen is stacked for smooth transitions.

export default function OnboardingLayout()
{ return <Stack screenOptions={{ headerShown: false }} />; }