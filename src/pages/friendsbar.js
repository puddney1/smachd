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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function FriendsBar(props) {
  const { session } = useSession();
  const updateFriends = props.updateFriends;
  const [friendsList, setFriendsList] = React.useState();
  const [friendsDisplay, setFriendsDisplay] = React.useState();

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
      setFriendsList(fList);
      if (fList.length != 0) {
        await getFriends();
      }
    })();
  }, [updateFriends, session]);

  async function getFriends() {
    const friendThings = friendsList ? getThingAll(friendsList) : [];
    console.log(friendThings);
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
    console.log(friendsArray);
    setFriendsDisplay(friendsArray);
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
    const friendIndex = getSourceUrl(friendsList);
    const removeFriend = removeThing(friendsList, uri);
    const updateList = await saveSolidDatasetAt(friendIndex, removeFriend, {
      fetch: session.fetch,
    });
    console.log(updateList);
    setFriendsList(updateList);
    await getFriends();
  }

  if (friendsDisplay != 0) {
    return (
      <Box
        sx={{
          paddingLeft: 0.1,
          width: "100%",
          maxWidth: { md: 300 },
          float: "left",
        }}
      >
        <h1>Friends</h1>
        {friendsDisplay.map(display)}
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          paddingLeft: 2,
          width: "100%",
          maxWidth: { md: 200 },
          float: "left",
        }}
      >
        <h1>Friends</h1>
        No Friends to display.
      </Box>
    );
  }
}

export default FriendsBar;
