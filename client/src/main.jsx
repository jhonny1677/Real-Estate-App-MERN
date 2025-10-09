import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/AuthContext";
import { ChatContextProvider } from "./context/ChatContext";
import { SocketContextProvider } from "./context/SocketContext";
import { ThemeContextProvider } from "./context/ThemeContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { RecommendationsProvider } from "./context/RecommendationsContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { VisitsProvider } from "./context/VisitsContext";
import { ClerkProvider } from "@clerk/clerk-react";
import "./i18n";
import "./index.scss";
import "./styles/rtl.scss";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const Providers = ({ children }) => (
  <ThemeContextProvider>
    <AuthContextProvider>
      <CurrencyProvider>
        <VisitsProvider>
          <FavoritesProvider>
            <RecommendationsProvider>
              <ChatContextProvider>
                <SocketContextProvider>
                  {children}
                </SocketContextProvider>
              </ChatContextProvider>
            </RecommendationsProvider>
          </FavoritesProvider>
        </VisitsProvider>
      </CurrencyProvider>
    </AuthContextProvider>
  </ThemeContextProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  CLERK_KEY
    ? (
      <ClerkProvider
        publishableKey={CLERK_KEY}
        signInUrl="/login"
        signUpUrl="/register"
        fallbackRedirectUrl="/sync-user"
      >
        <Providers><App /></Providers>
      </ClerkProvider>
    )
    : <Providers><App /></Providers>
);
