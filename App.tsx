import { SafeAreaProvider } from "react-native-safe-area-context";
import { RecordingsScreen } from "./src/screens/RecordingsScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <RecordingsScreen />
    </SafeAreaProvider>
  );
}
