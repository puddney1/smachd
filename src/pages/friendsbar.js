import {
  getSourceUrl,
  getSolidDataset,
  getThing,
  getThingAll,
  getUrlAll,
  removeThing,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
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
  Divider,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { sortByAttribute } from "../utils";
import { url } from "rdf-namespaces/dist/as";

function FriendsBar(props) {
  const { session } = useSession();
  const [friendsList, setFriendsList] = React.useState(); //holds friends dataset location
  const [friendsDisplay, setFriendsDisplay] = React.useState([]); // holds processed data arrays to be mapped

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
    })();
  }, [session, props.addFriends]);

  useEffect(() => {
    getFriends();
  }, [friendsList]);

  // Gets Friends from /smachd/friends/index.ttl,
  // maps content into array and sets to state.
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

    friendsArray.sort(sortByAttribute("fn")); //sorts by Full Name
    setFriendsDisplay(friendsArray);
    props.passToApp(friendsArray); // sends back to app.js to be retreived by other components
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

  //shortens url for mapping
  function urlConvert(url) {
    let x = new URL(url);
    let result = x.origin;
    return result;
  }

  // used for mapping items for display
  const display = (item) => (
    <Accordion key={item.uri}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{item.fn}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          webid:{" "}
          <Typography
            variant="caption"
            sx={{ width: 200, maxWidth: { md: 220 } }}
          >
            {urlConvert(item.webid)}
          </Typography>
        </Typography>
        <Divider sx={{ marginBottom: 1, marginTop: 1 }} />
        <Typography>Date Added: {dateConvert(item.date)}</Typography>
      </AccordionDetails>
      <Box sx={{ display: "flex", justifyContent: "flex-end", padding: 2 }}>
        <Button value={item.uri} onClick={deleteFriend} variant="outlined">
          Delete
        </Button>
      </Box>
    </Accordion>
  );

  /// Removes a friend from the dataset,
  // input is the uri value set on each name.
  async function deleteFriend(e) {
    const uri = e.target.value;
    if (window.confirm("Are you sure you want to delete?")) {
      const friendIndex = getSourceUrl(friendsList);
      const removeFriend = removeThing(friendsList, uri);
      const updateList = await saveSolidDatasetAt(friendIndex, removeFriend, {
        fetch: session.fetch,
      });

      setFriendsList(updateList); //update list
    }
  }

  // Display Section //

  if (friendsDisplay.length > 0) {
    return (
      <Box
        sx={{
          paddingLeft: 0.5,
          width: "99%",
          maxWidth: { lg: 300, md: 200 },
          float: "left",
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2, marginTop: 3 }}>
          Friends
        </Typography>
        {friendsDisplay.map(display)}
        {/* <Button onClick={getFriends}>refresh</Button>  // used for testing */}
      </Box>
    );
  }
  if (friendsDisplay.length == 0) {
    return (
      <div>
        <h2>Loading </h2>
        <CircularProgress />
      </div>
    );
  } else {
    setTimeout(getFriends, 1000);
    return (
      <Box
        sx={{
          paddingLeft: 0.5,
          width: "100%",
          maxWidth: { md: 200 },
          float: "left",
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2, marginTop: 3 }}>
          Friends
        </Typography>
        No Friends to display.
        <Button onClick={getFriends}>refresh</Button>
      </Box>
    );
  }
}

export default FriendsBar;
