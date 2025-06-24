import { AuthProvider as AuthContextProvider } from '@/lib/auth-context';
import Toast from 'react-native-toast-message';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      {children}
      <Toast />
    </AuthContextProvider>
  );
} 