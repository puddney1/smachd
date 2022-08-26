import {
  getSourceUrl,
  getSolidDataset,
  getThing,
  getThingAll,
  getUrlAll,
  getUrl,
  removeThing,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import { Text, useSession } from "@inrupt/solid-ui-react";
import { cal, vcard } from "rdf-namespaces";
import React, { useEffect, useState } from "react";
import { getOrCreateDataset } from "../utils";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { sortByAttribute } from "../utils";

function FriendsBar(props) {
  const { session } = useSession();
  const [friendsList, setFriendsList] = React.useState();
  const [friendsDisplay, setFriendsDisplay] = React.useState([]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const profileDataset = await getSolidDataset(session.info.webId, {
        fetch: session.fetch,
      });
      const profileThing = getThing(profileDataset, session.info.webId);
      const podsUrls = getUrlAll(
        profileThing,
        "http://www.w3.org/ns/pim/space#storage"
      );
      const pod = podsUrls[0];
      const friendsList = `${pod}smachd/friends/`;
      const fList = await getOrCreateDataset(friendsList, session.fetch);
      //console.log(fList);
      setFriendsList(fList);
    })();
  }, [session, props.addFriends]);

  useEffect(() => {
    getFriends();
  }, [friendsList]);

  async function getFriends() {
    const friendThings = friendsList ? getThingAll(friendsList) : [];
    //console.log(friendThings);
    const friendsArray = friendThings.map((x) => {
      return {
        uri: x.url,
        fn: x["predicates"][vcard.fn]["literals"][
          "http://www.w3.org/2001/XMLSchema#string"
        ][0],
        webid:
          x["predicates"][vcard.url]["literals"][
            "http://www.w3.org/2001/XMLSchema#string"
          ][0],
        date: x["predicates"][cal.created]["literals"][
          "http://www.w3.org/2001/XMLSchema#dateTime"
        ][0],
      };
    });
    friendsArray.sort(sortByAttribute("fn"));
    setFriendsDisplay(friendsArray);
    props.passToApp(friendsArray);
  }

  const display = (item) => (
    <Accordion key={item.uri}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{item.fn}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>webid: </Typography>
        <Typography sx={{ fontSize: "0.8rem", maxWidth: { md: 300 } }}>
          {item.webid}
        </Typography>
        <Typography>Date Added:</Typography>
        <Typography>{item.date}</Typography>
        <Button value={item.uri} onClick={deleteFriend}>
          Delete
        </Button>
      </AccordionDetails>
    </Accordion>
  );

  async function deleteFriend(e) {
    const uri = e.target.value;
    if (window.confirm("Are you sure you want to delete?")) {
      const friendIndex = getSourceUrl(friendsList);
      const removeFriend = removeThing(friendsList, uri);
      const updateList = await saveSolidDatasetAt(friendIndex, removeFriend, {
        fetch: session.fetch,
      });
      //console.log(updateList);
      setFriendsList(updateList);
    }
  }

  if (friendsDisplay.length > 0) {
    return (
      <Box
        sx={{
          paddingLeft: 2,
          width: "100%",
          maxWidth: { md: 300 },
          float: "left",
        }}
      >
        <h2>Friends</h2>
        {friendsDisplay.map(display)}
        <Button onClick={getFriends}>refresh</Button>
      </Box>
    );
  } else {
    setTimeout(getFriends, 1000);
    return (
      <Box
        sx={{
          paddingLeft: 2,
          width: "100%",
          maxWidth: { md: 200 },
          float: "left",
        }}
      >
        <h2>Friends</h2>
        No Friends to display.
        <Button onClick={getFriends}>refresh</Button>
      </Box>
    );
  }
}

export default FriendsBar;
