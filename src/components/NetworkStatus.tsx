import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export const NetworkStatus = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <Alert variant="destructive" className="fixed top-4 right-4 w-auto z-50">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        You are offline. Some features may be limited.
      </AlertDescription>
    </Alert>
  );
};
