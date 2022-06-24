import { SessionProvider, LoginButton, useSession, } from "@inrupt/solid-ui-react";
import { Button } from "@mui/material"
import { useState } from "react";


function Login() {
  const { session } = useSession();
  const [idp, setIdp] = useState("https://inrupt.net");
  return (
              <LoginButton
                oidcIssuer={idp}
                redirectUrl={window.location.href}
                onError={console.log(session.info)}
              >
              <Button>Login</Button>
              </LoginButton>
      )
    }

export default Login;