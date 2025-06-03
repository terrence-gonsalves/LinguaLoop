import Toast from 'react-native-toast-message';
import { AuthProvider as AuthContextProvider } from '../lib/auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      {children}
      <Toast />
    </AuthContextProvider>
  );
} 