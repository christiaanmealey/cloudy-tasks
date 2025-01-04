import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "react-oidc-context";

const redirectUri = window.location.hostname.includes("localhost")
  ? "http://localhost:5173"
  : "https://master.d24he5m38gfu16.amplifyapp.com";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_EIzuUHMMT",
  client_id: "7nnlrhka9rd7tjbgl91tn57mts",
  redirect_uri: redirectUri,
  response_type: "code",
  scope: "phone openid email",
};

createRoot(document.getElementById("root")!).render(
  <AuthProvider {...cognitoAuthConfig}>
    <App />
  </AuthProvider>
);
