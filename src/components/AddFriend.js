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
  Alert,
  AlertTitle,
  Snackbar,
} from "@mui/material";
import {
  CombinedDataProvider,
  useSession,
  useDataset,
  Value,
} from "@inrupt/solid-ui-react/";
import {
  getSolidDataset,
  getUrlAll,
  getThing,
  addStringNoLocale,
  createThing,
  saveSolidDatasetAt,
  getSourceUrl,
  addDatetime,
  addUrl,
  setThing,
  getProfileAll,
  getStringNoLocale,
  getThingAll,
} from "@inrupt/solid-client";
import { getOrCreateDataset } from "../utils";
import { foaf, vcard, cal } from "rdf-namespaces";

export default function AddFriend(props) {
  const handleClose = props.addFriends;
  const updateFriends = props.updateFriends;
  const [webid, setWebid] = useState();
  const [friendsList, setFriendsList] = React.useState();
  const { session } = useSession();
  const [alert, setAlert] = React.useState();

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
  }, [session]);

  function handleChange(e) {
    setWebid(e.target.value);
    setAlert("");
  }

  const alertError = (alertMessage) => (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      {alertMessage}
    </Alert>
  );

  const alertSuccess = (friend) => (
    <Alert severity="success">
      <AlertTitle>Success</AlertTitle>
      {friend} has been added.
    </Alert>
  );

  async function doesFriendExist(index) {
    // Gets name from a profile, also checks if friend exists & handles errors
    // (ie. if it doesnt get name, webid is wrong or try to add yourself)
    try {
      const fetch = session.fetch;
      const getDataset = await getSolidDataset(index, { fetch });
      const checkifexists = getThingAll(getDataset);
      const existsCheck = checkForWebId(checkifexists);
      console.log(existsCheck);

      if (existsCheck == true) {
        setAlert(alertError("webid has already been added."));
        return "error";
      }

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
        setAlert(alertError("You cannot add yourself."));
      }
    } catch (error) {
      console.log("error: " + error.statusCode);
      setAlert(alertError("Please check webid and try again."));
      return "error";
    }
  }

  function checkForWebId(friends) {
    const list = friends;
    //console.log(list);
    for (let x = 0; x < list.length; x = x + 1) {
      if (
        webid ==
        list[x]["predicates"][vcard.url]["literals"][
          "http://www.w3.org/2001/XMLSchema#string"
        ][0]
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  async function handleSubmit() {
    const friendIndex = getSourceUrl(friendsList);
    const friend = await doesFriendExist(friendIndex);

    if (friend != "error") {
      const date = new Date();
      const dateConvert = date.toDateString();
      const addWebId = addStringNoLocale(createThing(), vcard.url, webid);
      const addName = addStringNoLocale(addWebId, vcard.fn, friend);
      const addDate = addDatetime(addName, cal.created, date);
      const addRequest = setThing(friendsList, addDate);
      await saveSolidDatasetAt(friendIndex, addRequest, {
        fetch: session.fetch,
      });

      setAlert(alertSuccess(friend));
    }
  }

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
              id="name"
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
