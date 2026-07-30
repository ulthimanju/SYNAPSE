import React from 'react';
import { AuthLayout } from '../layouts/AuthLayout';
import { LoginCard } from '../components/auth/LoginCard';

export const Login = () => {
  return (
    <AuthLayout>
      <LoginCard />
    </AuthLayout>
  );
};
