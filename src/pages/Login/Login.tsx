import { useAuth } from "react-oidc-context";

function Login() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "7nnlrhka9rd7tjbgl91tn57mts";
    const logoutUri = "<logout uri>";
    const cognitoDomain =
      "https://us-east-2eizuuhmmt.auth.us-east-2.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <button onClick={() => auth.removeUser()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
}

export default Login;
