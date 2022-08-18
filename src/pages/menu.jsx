import { LogoutButton, Text } from "@inrupt/solid-ui-react";
import React from "react";
import { ReactComponent as Logo } from ".././images/logoweb.svg";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

function Menu() {
  return (
    <Box sx={{ width: "100%", maxWidth: { md: 200 }, float: "right" }}>
      <Logo
        style={{ maxWidth: "200", margin: 30, fill: "skyblue", float: "right" }}
      />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <AccountBoxIcon />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <LogoutButton redirectUrl={window.location.href}>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                secondary={
                  <Text
                    properties={[
                      "http://xmlns.com/foaf/0.1/name",
                      "http://www.w3.org/2006/vcard/ns#fn",
                    ]}
                  />
                }
              />
            </ListItemButton>
          </ListItem>
        </LogoutButton>
      </List>
    </Box>
  );
}

export default Menu;
