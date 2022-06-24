import { AppBar, Box, CssBaseline, Drawer, IconButton, Toolbar, Typography, Fab} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import * as React from 'react';
import Menu from "./pages/menu";
import Login from "./auth/login";
import { useSession } from "@inrupt/solid-ui-react";



const drawerWidth = 240;
const mainWidth = 300; // number should be half of required size

function App(props) {
    // Application variables //
    const { window } = props;
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [friendsOpen, setFriendsOpen] = React.useState(false);

    const menuToggle = () => {
        setMenuOpen(!menuOpen);
    };

    const friendsToggle = () => {
        setFriendsOpen(!friendsOpen);
    };

    const menu = (
        <div>
           <Menu />
        </div>
    )

    const friends = (
        <div>
            friends
        </div>
    )

    const container = window !== undefined ? () => window().document.body: undefined;

    //Solid

    const { session } = useSession();

    if (session.info.isLoggedIn == false) {
        return (
            <Login />
        )
    }
    
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
            position="fixed"
            sx={{
                display: {md: 'none'},
                width: { sm: `calc(100% - ${drawerWidth}px`},
                ml: { sm: `${drawerWidth}px` },
            }}>
                <Toolbar
                sx={{ display: {md: 'none'}}}>
                    <IconButton
                    color="inherit"
                    edge="start"
                    onClick={menuToggle}
                    sx={{ mr: 2, display: {md: 'none'} }}
                    >
                       <MenuIcon /> 
                    </IconButton>
                    <IconButton
                    color="inherit"
                    edge="end"
                    onClick={friendsToggle}
                    sx={{ ml: 'auto', display: {md: 'none'} }}
                    >
                       <PeopleIcon /> 
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box
            component="nav"
            sx={{ width: { md: `calc(50vw - ${mainWidth}px)` }, flexShrink: { sm: 0 }}}
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
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                >
                    {menu}
                </Drawer>
                <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: `calc(50vw - ${mainWidth}px)` },
                }}
                open
                >
                    {menu}
                </Drawer>
            </Box>
            
            <Box
            component="main"
            sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)`  }}}
            >
                <Toolbar
                 sx={{ display: {md: 'none'}}}
                 />
                <Typography paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
          enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
          imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
          Convallis convallis tellus id interdum velit laoreet id donec ultrices.
          Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
          adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
          nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
          leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
          feugiat vivamus at augue. At augue eget arcu dictum varius duis at
          consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
          sapien faucibus et molestie ac.
               </Typography>
               
            </Box>
            <Box
            component="nav"
            sx={{ position: 'right', width: { md: `calc(50vw - ${mainWidth}px)` }, flexShrink: { sm: 0 }}}
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
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                >
                    {friends}
                </Drawer>
                <Drawer
                anchor="right"
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: `calc(50vw - ${mainWidth}px)` },
                }}
                open
                >
                    {friends}
                </Drawer>
            </Box>
            <Fab
               size="large" 
               color="primary" 
               aria-label="add"
               sx={{ zIndex: 'modal', position: 'fixed', bottom: 16, right: 16,}}>
                    <AddIcon />
                </Fab>
        </Box>
    );
        }

export default App;