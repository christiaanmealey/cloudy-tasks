import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_5LowIYcn2",
  client_id: "4k9oe34nme624b04qc6m8v5meb",
  redirect_uri: "https://master.d24he5m38gfu16.amplifyapp.com",
  response_type: "code",
  scope: "email openid phone",
};

createRoot(document.getElementById("root")!).render(
  <AuthProvider {...cognitoAuthConfig}>
    <App />
  </AuthProvider>
);
