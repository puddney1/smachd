import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
} from "@mui/material";
import { useSession } from "@inrupt/solid-ui-react/";
import {
  getSolidDataset,
  getUrlAll,
  getThing,
  addStringNoLocale,
  createThing,
  saveSolidDatasetAt,
  getSourceUrl,
  addDatetime,
  setThing,
  getProfileAll,
} from "@inrupt/solid-client";
import { getOrCreateDataset } from "../utils";
import { foaf, vcard, cal } from "rdf-namespaces";

export default function AddFriend(props) {
  const handleClose = props.addFriends;
  const [webid, setWebid] = useState(); //holds input
  const [friendsList, setFriendsList] = React.useState(); //holds friends dataset location
  const { session } = useSession();
  const [alert, setAlert] = React.useState();
  const friends = props.friendsList;

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
  }, [session, alert]);

  /// sets the input to state
  function handleChange(e) {
    setWebid(e.target.value);
    setAlert("");
  }
  /// Alert Section ///
  function handleAlert(message, severity) {
    props.setAlertMessage(message);
    props.setSeverity(severity);
    props.alertToggle();
  }

  // Gets name from a profile, also checks if friend exists & handles errors
  // (ie. if it doesnt get name, webid is wrong or try to add yourself).
  // Called during handleSubmit
  async function doesFriendExist(index) {
    try {
      //Check if webid has already been added
      const existsCheck = checkForWebId();

      if (existsCheck == true) {
        handleAlert("webid has already been added.", "error");
        return "error";
      }

      // if webid is not users, get the name of the user
      if (webid != session.info.webId) {
        const friendExist = await getProfileAll(webid);
        //console.log(friendExist);
        const name = await friendExist.webIdProfile.graphs.default[webid][
          "predicates"
        ]["http://xmlns.com/foaf/0.1/name"]["literals"][
          "http://www.w3.org/2001/XMLSchema#string"
        ][0];
        return name;
      } else {
        handleAlert("You cannot add yourself.", "error");
        return "error";
      }
    } catch (error) {
      console.log("error: " + error.statusCode);
      handleAlert("Please check webid and try again.", "error");
      return "error";
    }
  }

  /// called in doesFriendExist, checks if a friend has already been added
  function checkForWebId() {
    let value = false;
    for (let x in friends) {
      if (webid == friends[x].webid) {
        value = true;
      }
    }
    return value;
  }

  /// Handles adding user to /smachd/friends/index.ttl
  async function handleSubmit() {
    const friendIndex = getSourceUrl(friendsList);
    const friend = await doesFriendExist(friendIndex);

    if (friend != "error") {
      const date = new Date();
      const addWebId = addStringNoLocale(createThing(), vcard.url, webid);
      const addName = addStringNoLocale(addWebId, vcard.fn, friend);
      const addDate = addDatetime(addName, cal.created, date);
      const setFriend = setThing(friendsList, addDate);
      await saveSolidDatasetAt(friendIndex, setFriend, {
        fetch: session.fetch,
      });
      handleAlert(`${friend} has been added.`, "success");
      props.addFriends();
    }
  }

  /// Display Section ///
  return (
    <div>
      <Dialog open={props.addFriendsOpen} onClose={handleClose}>
        <FormControl>
          <DialogTitle>Add a friend</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter webid:</DialogContentText>
            <TextField
              autoFocus
              label="webid"
              margin="dense"
              id="webid-input"
              type="text"
              helperText="Example: https://profilename.provider.com/profile/card#me"
              fullWidth
              onChange={handleChange}
            />
            {alert}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              cancel
            </Button>
            <Button onClick={handleSubmit} color="primary" autoFocus>
              ok
            </Button>
          </DialogActions>
        </FormControl>
      </Dialog>
    </div>
  );
}
