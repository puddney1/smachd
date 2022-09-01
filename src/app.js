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
import Main from "./pages/main";
import { ReactComponent as Logo } from "./images/logoweb.svg";

const drawerWidth = 270;
const mainWidth = 300; // number should be half of required size

function App(props) {
  // Application variables //
  const { window } = props;
  const [menuOpen, setMenuOpen] = React.useState(false); //state for loading menu on mobile devices
  const [friendsOpen, setFriendsOpen] = React.useState(false); //state for loading friends sidebar on mobile devices
  const [addFriendsOpen, setAddFriendsOpen] = React.useState(false); // state for toggling add Friends
  const [newPostOpen, setNewPostOpen] = React.useState(false); // state for toggling new post
  const [friendsList, setFriendsList] = React.useState([]); // holds list of friends to be passed to components
  const [alertMessage, setAlertMessage] = React.useState(); //holds message for alert
  const [severity, setSeverity] = React.useState(); // holds type of alert (success, warning, error, info)
  const [openAlert, setOpenAlert] = React.useState(false); // state for toggling alert

  // callback to set friends list
  const passToApp = (data) => {
    setFriendsList(data);
  };

  // callback to toggle alert
  const alertToggle = () => {
    setOpenAlert(!openAlert);
  };

  // toggle menu when on mobile device
  const menuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  // toggle friends sidebar when on mobile device
  const friendsToggle = () => {
    setFriendsOpen(!friendsOpen);
  };

  // toggle add friends dialog
  const addFriends = () => {
    setAddFriendsOpen(!addFriendsOpen);
  };

  // toggle new post dialog
  const newPost = () => {
    setNewPostOpen(!newPostOpen);
  };

  /// Section to hold components and their props to be called in return
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

  const main = (
    <Main
      friendsList={friendsList}
      alertToggle={alertToggle}
      setAlertMessage={setAlertMessage}
      setSeverity={setSeverity}
    />
  );

  // sets container for display of sidebar components on mobile devices
  const container =
    window !== undefined ? () => window().document.body : undefined;

  /// Display Section ///

  // Check in logged into Solid, calls <login> if false
  const { session } = useSession();

  if (session.info.isLoggedIn == false) {
    return <Login />;
  }

  // Display content
  return (
    <CombinedDataProvider // Provides session access to a Solid Pod
      datasetUrl={session.info.webId}
      thingUrl={session.info.webId}
    >
      {/* Displays add friend component when toggled */}
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

      {/* Displays new post component when toggled */}
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

      {/* Displays alert when toggled */}
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
            <Logo
              style={{
                maxHeight: 25,
                marginRight: 200,
                fill: "skyblue",
              }}
            />
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
          <Drawer // This drawer loads when on mobile device
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
          <Drawer // This drawer loads when on desktop device
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

        <Box // loads on all screens
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar sx={{ display: { md: "none" } }} />
          <div id="main">{main}</div>
        </Box>
        <Box
          component="nav"
          sx={{
            position: "right",
            width: { md: `calc(50vw - ${mainWidth}px)` },
            flexShrink: { sm: 0 },
          }}
        >
          <Drawer // This drawer loads when on mobile device
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
          <Drawer // This drawer loads when on desktop device
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

        {/* Holds buttons for toggling add Friends and New Post */}
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
