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
import "./i18n"; // Initialize i18n
import "./index.scss";
import "./styles/rtl.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeContextProvider>
    <AuthContextProvider>
      <CurrencyProvider>
        <VisitsProvider>
          <FavoritesProvider>
            <RecommendationsProvider>
              <ChatContextProvider>
                <SocketContextProvider>
                  <App />
                </SocketContextProvider>
              </ChatContextProvider>
            </RecommendationsProvider>
          </FavoritesProvider>
        </VisitsProvider>
      </CurrencyProvider>
    </AuthContextProvider>
  </ThemeContextProvider>
);
