import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './components/auth/LoginPage';

function AuthGate() {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 text-amber-700">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AuthGate />
      </AppProvider>
    </ThemeProvider>
  );
}
