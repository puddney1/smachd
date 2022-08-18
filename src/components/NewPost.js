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
  Divider,
  Input,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Text, useSession } from "@inrupt/solid-ui-react";
import { getSolidDataset, getThing, getUrlAll } from "@inrupt/solid-client";
import { getOrCreateDataset } from "../utils";

export default function NewPost(props) {
  const handleClose = props.newPost;
  const { session } = useSession();
  const [postsList, setPostsList] = React.useState();
  const [imageVideo, setImageVideo] = React.useState([]); //used to setting local locations of images/video to upload

  useEffect(() => {
    if (!session) return;
    (async () => {
      const postsDataset = await getSolidDataset(session.info.webId, {
        fetch: session.fetch,
      });
      const postsThing = getThing(postsDataset, session.info.webId);
      const podsUrls = getUrlAll(
        postsThing,
        "http://www.w3.org/ns/pim/space#storage"
      );
      const pod = podsUrls[0];
      const postsList = `${pod}smachd/posts/`;
      const pList = await getOrCreateDataset(postsList, session.fetch);
      setPostsList(pList);
    })();
  }, [session]);

  function handleIVChange(e) {
    const temp = imageVideo;
    temp.push(e.target.value);
    setImageVideo(temp);
    console.log(temp);
  }
  return (
    <div>
      <Dialog fullWidth open={props.newPostOpen} onClose={handleClose}>
        <FormControl>
          <DialogTitle>New Post</DialogTitle>
          <Divider />
          <DialogContent>
            <DialogContentText variant="subtitle2">
              <Text
                properties={[
                  "http://xmlns.com/foaf/0.1/name",
                  "http://www.w3.org/2006/vcard/ns#fn",
                ]}
              />
            </DialogContentText>
            <DialogContentText variant="subtitle2">
              {session.info.webId}
            </DialogContentText>
          </DialogContent>
          <DialogContent>
            <TextField
              id="content"
              multiline
              placeholder="What do you want to share?"
              type="text"
              fullWidth
            />
          </DialogContent>
          <Divider />
          <Button variant="contained" component="label" color="primary">
            {" "}
            <AddIcon /> Upload image/video
            <input type="file" multiple hidden onChange={handleIVChange} />
          </Button>
          <Divider />

          <DialogActions>
            <Button onClick={handleClose} color="primary">
              cancel
            </Button>
            <Button onClick={handleClose} color="primary" autoFocus>
              ok
            </Button>
          </DialogActions>
        </FormControl>
      </Dialog>
    </div>
  );
}
