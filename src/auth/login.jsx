import {
  SessionProvider,
  LoginButton,
  useSession,
} from "@inrupt/solid-ui-react";
import {
  Backdrop,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { ReactComponent as Logo } from ".././images/logoweb.svg";

function Login() {
  const { session } = useSession();
  const [idp, setIdp] = useState("Please Select..."); //sets value for solid address
  const [value, setValue] = useState("Please Select..."); //sets value for dropdown box

  function handleChange(event) {
    setValue(event.target.value);
    setIdp(event.target.value);
  }

  return (
    <Backdrop open>
      <Box sx={{ width: 240 }}>
        <Logo style={{ maxWidth: "200", fill: "skyblue", marginBottom: 40 }} />

        <Typography sx={{ color: "white" }}>
          Please select a Solid provider from the menu or input manually.
        </Typography>
        <FormControl sx={{ marginTop: 5 }}>
          <InputLabel id="solid-provider">Provider</InputLabel>
          <Select
            value={value}
            labelId="solid-provider"
            id="solid-provider"
            label="Provider"
            onChange={handleChange}
            sx={{ width: 240 }}
          >
            <MenuItem value={"Please Select..."}>
              <em>Please Select...</em>
            </MenuItem>
            <MenuItem value={"https://inrupt.net/"}>inrupt.net</MenuItem>
            <MenuItem value={"https://solidcommunity.net/"}>
              solidcommunity.net
            </MenuItem>
            <MenuItem value={"https://solidweb.org/"}>solidweb.org</MenuItem>
            <MenuItem value={"https://login.inrupt.com/"}>
              Inrupt PodSpaces (beta)
            </MenuItem>
          </Select>

          <TextField
            id="standard-basic"
            label="Manual Entry"
            variant="standard"
            onChange={(e) => setIdp(e.target.value)}
            sx={{ marginTop: 3 }}
          />

          <LoginButton
            oidcIssuer={idp}
            redirectUrl={window.location.href}
            onError={console.log(session.info)}
          >
            <Button
              size="large"
              fullWidth
              variant="contained"
              sx={{ marginTop: 3 }}
            >
              Login
            </Button>
          </LoginButton>
        </FormControl>
      </Box>
    </Backdrop>
  );
}

export default Login;
