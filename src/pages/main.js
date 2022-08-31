import React, { useEffect } from "react";
import { useSession } from "@inrupt/solid-ui-react";
import {
  getSolidDataset,
  getThingAll,
  getStringNoLocale,
} from "@inrupt/solid-client";
import { getOrCreateDataset, sortByAttribute } from "../utils";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  CardHeader,
  Divider,
  Tooltip,
  IconButton,
  CardActions,
  Avatar,
  Fab,
} from "@mui/material";
import { cal, schema, vcard } from "rdf-namespaces";
import MoreVert from "@mui/icons-material/MoreVert";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddCommentIcon from "@mui/icons-material/AddComment";

export default function Main(props) {
  const { session } = useSession();
  const [indexUrls, setIndexUrls] = React.useState(); //holds friends /smachd/posts location
  const [displayList, setDisplayList] = React.useState([]); // holds processed arrays of data to be mapped for display
  const [loading, setLoading] = React.useState(true); //used to hold displaying items until displayList has been filled
  const [posts, setPosts] = React.useState();
  let friends = props.friendsList;

  useEffect(() => {
    getUrls();
  }, [friends]);

  useEffect(() => {
    setLoading(false);
  }, [posts]);

  // Gets webids from friends and creates array of urls to /smachd/posts
  // then sets to state (indexUrls).
  function getUrls() {
    setLoading(true); // for recalls
    let list = [];
    let myWebid = new URL(session.info.webId);
    list.push(myWebid.origin + "/smachd/posts/");
    //console.log(friends);
    if (friends.length != 0) {
      friends.forEach((item) => {
        let webid = new URL(item.webid);
        //console.log(webid.origin);
        list.push(webid.origin + "/smachd/posts/");
      });
    }
    setIndexUrls(list);
    getPosts();
  }

  // Gets Array of posts from each indexUrl, called once indexUrls is set
  async function getPosts() {
    let posts = [];
    for (let url in indexUrls) {
      let index = await getOrCreateDataset(indexUrls[url], session.fetch);
      let postArray = index ? getThingAll(index) : [];
      postArray.map((item) => posts.push(getStringNoLocale(item, schema.url)));
    }
    // Calls each post index in posts to retreive content,
    //waits until completed to prevent server flood
    (async function () {
      for (let x in posts) {
        await getDetails(posts[x], session.fetch);
      }
      let set = displayPosts(displayList);
      setPosts(set);
    })();
  }

  // Receives a post index and maps the data contained to an array,
  // then sets in displayList
  async function getDetails(postIndex, fetch) {
    try {
      //console.log("Getting information from " + postIndex);
      let x = await getSolidDataset(postIndex, { fetch });
      const postThings = x ? getThingAll(x) : [];
      const array = postThings.map((x) => {
        return {
          uri: x.url,
          name: x["predicates"][vcard.fn]["literals"][
            "http://www.w3.org/2001/XMLSchema#string"
          ][0],
          webid:
            x["predicates"][vcard.url]["literals"][
              "http://www.w3.org/2001/XMLSchema#string"
            ][0],
          content:
            x["predicates"][schema.text]["literals"][
              "http://www.w3.org/2001/XMLSchema#string"
            ][0],
          //left in even though files are not working, has no impact on function
          files:
            x["predicates"][schema.url]["literals"][
              "http://www.w3.org/2001/XMLSchema#string"
            ],
          date: x["predicates"][cal.created]["literals"][
            "http://www.w3.org/2001/XMLSchema#dateTime"
          ][0],
        };
      });

      // Sets mapped data to state
      const list = displayList;
      if (list.length == 0) {
        list.push(array[0]);
      } else {
        let search = false;

        for (let x in list) {
          // prevents same information being listed on refresh
          if (list[x].uri == array[0].uri) {
            search = true;
          }
        }

        if (!search) {
          list.push(array[0]);
        }
      }
      list.sort(sortByAttribute("date"));
      list.reverse();
      setDisplayList(list);
    } catch (error) {
      //console.log(error);
    }
  }

  /// *** Disabled due to files not working *** ///
  {
    /*
  // Processes array of files set in each post so it can be mapped
  async function getFiles(displayList) {
    for (let x in displayList) {
      //console.log(displayList[x]);
      for (let y in displayList[x].files) {
        //console.log(displayList[x].files[y]);
        console.log(displayList[x].files[y]);
        const file = await getFileWithAcl(displayList[x].files[y], {
          session: session.fetch,
        });
        console.log(file);
      }
    }
  }
*/
  }

  //converts date for mapping
  function dateConvert(date) {
    let x = new Date(date);
    let day = x.getDay();
    let month = x.getMonth();
    let year = x.getFullYear();
    let result = day + "/" + month + "/" + year;
    return result;
  }

  //used to get letters for the avatar from a name
  function avatarFromName(name) {
    let result = name.substring(0, 1);
    return result;
  }

  // maps displaylist data to <Card>'s for display
  function displayPosts(array) {
    return array.map((item) => (
      <Card
        key={item.uri}
        raised={true}
        sx={{ maxWidth: "100%", marginBottom: 2 }}
      >
        <CardHeader
          title={item.name}
          subheader={dateConvert(item.date)}
          action={
            <IconButton>
              <Tooltip title="not implemented yet">
                <MoreVert />
              </Tooltip>
            </IconButton>
          }
          avatar={
            <Tooltip title={item.webid}>
              <Avatar>{avatarFromName(item.name)}</Avatar>
            </Tooltip>
          }
        />
        <Divider variant="middle" sx={{ width: "90%" }} />
        <CardContent>
          <Typography variant="body2">{item.content}</Typography>
        </CardContent>
        <CardActions>
          <Tooltip title="not implemented yet">
            <Button variant="contained" size="small">
              <FavoriteIcon sx={{ fontSize: 14, marginRight: 1 }} />
              <Typography variant="button">Like</Typography>
            </Button>
          </Tooltip>
          <Tooltip title="not implemented yet">
            <Button variant="contained" size="small">
              <AddCommentIcon sx={{ fontSize: 14, marginRight: 1 }} />
              <Typography variant="button">Comment</Typography>
            </Button>
          </Tooltip>
        </CardActions>
      </Card>
    ));
  }

  /// Display Section ///

  if (loading) {
    return (
      <div>
        <h2>Loading </h2>
        <CircularProgress />
      </div>
    );
  }
  if (displayList.length == 0) {
    return (
      <Box>
        <h2>No Posts</h2>
        <Divider sx={{ marginTop: 3, marginBottom: 3 }} />
        <Fab variant="extended" size="medium" onClick={getUrls} color="primary">
          Refresh
        </Fab>
      </Box>
    );
  } else {
    return (
      <Box>
        {posts}
        <Divider sx={{ marginTop: 3, marginBottom: 3 }} />
        <Fab variant="extended" size="medium" onClick={getUrls} color="primary">
          Refresh
        </Fab>
      </Box>
    );
  }
}
