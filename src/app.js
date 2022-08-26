import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Snackbar,
  Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import * as React from "react";
import Menu from "./pages/menu";
import Login from "./auth/login";
import FriendsBar from "./pages/friendsbar";
import AddFriend from "./components/AddFriend";
import NewPost from "./components/NewPost";
import { useSession, CombinedDataProvider } from "@inrupt/solid-ui-react";

const drawerWidth = 240;
const mainWidth = 300; // number should be half of required size

function App(props) {
  // Application variables //
  const { window } = props;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [friendsOpen, setFriendsOpen] = React.useState(false);
  const [addFriendsOpen, setAddFriendsOpen] = React.useState(false);
  const [newPostOpen, setNewPostOpen] = React.useState(false);
  const [friendsList, setFriendsList] = React.useState([]);
  const [alertMessage, setAlertMessage] = React.useState();
  const [severity, setSeverity] = React.useState();
  const [openAlert, setOpenAlert] = React.useState(false);

  const passToApp = (data) => {
    setFriendsList(data);
  };

  const alertToggle = () => {
    setOpenAlert(!openAlert);
  };

  const menuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const friendsToggle = () => {
    setFriendsOpen(!friendsOpen);
  };

  const addFriends = () => {
    setAddFriendsOpen(!addFriendsOpen);
  };

  const newPost = () => {
    setNewPostOpen(!newPostOpen);
  };

  const menu = (
    <div>
      <Menu />
    </div>
  );

  const friends = (
    <div>
      <FriendsBar passToApp={passToApp} addFriends={addFriendsOpen} />
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  //Solid

  const { session } = useSession();

  if (session.info.isLoggedIn == false) {
    return <Login />;
  }

  return (
    <CombinedDataProvider
      datasetUrl={session.info.webId}
      thingUrl={session.info.webId}
    >
      {addFriendsOpen && (
        <AddFriend
          addFriendsOpen={addFriendsOpen}
          addFriends={addFriends}
          friendsList={friendsList}
          alertToggle={alertToggle}
          setAlertMessage={setAlertMessage}
          setSeverity={setSeverity}
        />
      )}
      {newPostOpen && (
        <NewPost
          newPostOpen={newPostOpen}
          newPost={newPost}
          friendsList={friendsList}
          alertToggle={alertToggle}
          setAlertMessage={setAlertMessage}
          setSeverity={setSeverity}
        />
      )}
      <Snackbar open={openAlert} autoHideDuration={6000} onClose={alertToggle}>
        <Alert severity={severity}>{alertMessage}</Alert>
      </Snackbar>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            display: { md: "none" },
            width: { sm: `calc(100% - ${drawerWidth}px` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar sx={{ display: { md: "none" } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={menuToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              color="inherit"
              edge="end"
              onClick={friendsToggle}
              sx={{ ml: "auto", display: { md: "none" } }}
            >
              <PeopleIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{
            width: { md: `calc(50vw - ${mainWidth}px)` },
            flexShrink: { sm: 0 },
          }}
        >
          <Drawer
            container={container}
            variant="temporary"
            open={menuOpen}
            onClose={menuToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {menu}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: `calc(50vw - ${mainWidth}px)`,
              },
            }}
            open
          >
            {menu}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar sx={{ display: { md: "none" } }} />
          <div id="main"></div>

          <Typography paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Rhoncus
            dolor purus non enim praesent elementum facilisis leo vel. Risus at
            ultrices mi tempus imperdiet. Semper risus in hendrerit gravida
            rutrum quisque non tellus. Convallis convallis tellus id interdum
            velit laoreet id donec ultrices. Odio morbi quis commodo odio aenean
            sed adipiscing. Amet nisl suscipit adipiscing bibendum est ultricies
            integer quis. Cursus euismod quis viverra nibh cras. Metus vulputate
            eu scelerisque felis imperdiet proin fermentum leo. Mauris commodo
            quis imperdiet massa tincidunt. Cras tincidunt lobortis feugiat
            vivamus at augue. At augue eget arcu dictum varius duis at
            consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem
            donec massa sapien faucibus et molestie ac.
          </Typography>
        </Box>
        <Box
          component="nav"
          sx={{
            position: "right",
            width: { md: `calc(50vw - ${mainWidth}px)` },
            flexShrink: { sm: 0 },
          }}
        >
          <Drawer
            anchor="right"
            container={container}
            variant="temporary"
            open={friendsOpen}
            onClose={friendsToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {friends}
          </Drawer>
          <Drawer
            anchor="right"
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: `calc(50vw - ${mainWidth}px)`,
              },
            }}
            open
          >
            {friends}
          </Drawer>
        </Box>
        <SpeedDial
          ariaLabel="Speeddial"
          icon={<SpeedDialIcon />}
          sx={{ zIndex: "modal", position: "fixed", bottom: 20, right: 20 }}
        >
          <SpeedDialAction
            key="New Post"
            icon={<PostAddIcon />}
            tooltipTitle={
              <div style={{ width: 55, fontSize: 12 }}>New Post</div>
            }
            tooltipOpen
            onClick={newPost}
          />
          <SpeedDialAction
            key="Add Friend"
            icon={<PersonAddIcon />}
            tooltipTitle={
              <div style={{ width: 60, fontSize: 12 }}>Add Friend</div>
            }
            tooltipPlacement="left"
            tooltipOpen
            onClick={addFriends}
          />
        </SpeedDial>
      </Box>
    </CombinedDataProvider>
  );
}

export default App;
