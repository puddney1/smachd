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
  Divider,
  MenuItem,
  ListItemText,
  Select,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Text, useSession } from "@inrupt/solid-ui-react";
import {
  getSolidDataset,
  getThing,
  getUrlAll,
  saveFileInContainer,
  getSourceUrl,
  addStringNoLocale,
  createThing,
  addUrl,
  addDatetime,
  saveSolidDatasetAt,
  setThing,
  overwriteFile,
} from "@inrupt/solid-client";
import { getOrCreateDataset, generateAcl } from "../utils";
import { schema, cal } from "rdf-namespaces";
import { Box } from "@mui/system";

export default function NewPost(props) {
  const handleClose = props.newPost;
  const { session } = useSession();
  const [content, setContent] = React.useState();
  const [postsList, setPostsList] = React.useState();
  const [url, setUrl] = React.useState();
  const [imageVideo, setImageVideo] = React.useState([]); //used to setting local locations of images/video to upload
  const friends = props.friendsList;
  const [acl, setACL] = React.useState([]);
  const [checkedName, setCheckedName] = React.useState([]);
  const [chips, setChips] = React.useState();

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
      setUrl(postsList);

      //selects all names in friends for ACL
      let tempFriends = [];
      for (let x in friends) {
        //console.log(friends[x].webid);
        tempFriends.push(friends[x].fn);
      }
      setCheckedName(tempFriends);
    })();
  }, [session]);

  useEffect(() => {
    //updates ACL list when changed
    let tempAcl = [];
    for (let x in checkedName) {
      for (let y in friends) {
        if (checkedName[x] == friends[y].fn) {
          tempAcl.push(friends[y].webid);
        }
      }
    }
    //console.log(tempAcl);
    setACL(tempAcl);
  }, [checkedName]);

  useEffect(() => {}, [imageVideo]);

  /// handle Alerts ///
  function handleAlert(message, severity) {
    props.setAlertMessage(message);
    props.setSeverity(severity);
    props.alertToggle();
  }

  /// Content section ///
  function handleContent(e) {
    setContent(e.target.value);
  }

  /// Image-video upload section ///
  function handleIVChange(e, delIndex) {
    const fileList = imageVideo;
    let fileNames = [];
    fileList.forEach((file) => fileNames.push(file.name));
    //console.log(fileNames);

    let inputList = Array.from(e.target.files);
    if (fileList.length == 0) {
      inputList.forEach((item) => fileList.push(item));
    } else {
      inputList.forEach((item) => {
        let search = fileNames.includes(item.name);
        //console.log(search);

        if (!search) {
          fileList.push(item);
        }
      });
    }
    console.log(fileList);
    setImageVideo(fileList);
    setChips(chipDisplay(fileList));
  }

  function chipDisplay(fileList) {
    return fileList.map((item, index) => (
      <Chip
        key={index}
        value={index}
        label={item.name}
        onDelete={handleFileDelete}
        size="small"
        sx={{ margin: 0.5 }}
      />
    ));
  }

  function handleFileDelete(e) {
    const fileList = imageVideo;
    fileList.splice(e.target.value, 1);
    setImageVideo(fileList);
    setChips(chipDisplay(fileList));
    console.log(fileList);
  }

  async function placeFileInContainer(file, targetContainerURL) {
    try {
      let reader = new FileReader();
      //reader.readAsDataURL(file);
      reader.onloadend = function () {
        console.log("RESULT: ", reader.result);
      };
      const savedFile = await saveFileInContainer(
        targetContainerURL, // Container URL
        file, // File
        {
          slug: file.name.replace(/(\.\w+)+$/, ""),
          contentType: file.type,
          fetch: session.fetch,
        }
      );
      console.log(`File saved at ${getSourceUrl(savedFile)}`);
      return getSourceUrl(savedFile);
    } catch (error) {
      console.error(error);
      return "error";
    }
  }

  /// ACL section ///
  const displayAclControls = (item) => (
    <MenuItem key={item.uri} value={item.fn}>
      <ListItemText primary={item.fn} />
    </MenuItem>
  );

  function handleACL(e) {
    setCheckedName(e.target.value);
    //useEffect[checkedName] is called to update ACL list
  }

  /// Upload Post Section ///
  async function handleSubmit() {
    props.newPost(); // close dialog
    handleAlert("Uploading", "info");
    const date = new Date(); // for upload folder
    console.log(date);
    const folder = date.getTime(); // sets unique upload folder
    const uploadDir = url + folder + "/";
    let continueUpload = true;
    let errorMessage;

    /// Create Dataset ///
    const dataset = await getOrCreateDataset(uploadDir, session.fetch);
    //console.log(dataset);
    if (dataset == undefined) {
      continueUpload = false;
      errorMessage = "Failed to create dataset";
    }

    /// Upload Images //
    let ivUrls = [];
    let uploadGo = true;
    //console.log(imageVideo);
    if (imageVideo != undefined) {
      //skips if no images/video
      while (uploadGo == true) {
        for (let x = 0; x < imageVideo.length; x++) {
          const upload = await placeFileInContainer(imageVideo[x], uploadDir);
          if (upload != "error") {
            ivUrls.push(upload);
            //console.log(ivUrls);
          }
          if (upload == "error") {
            uploadGo = false;
            continueUpload = false;
            errorMessage = `Failed to upload file`;
          }
          uploadGo = false;
          //console.log("upload stopped");
        }
      }
    }

    /// Create and Set Thing  //
    if (continueUpload == true) {
      const addContent = addStringNoLocale(createThing(), schema.text, content);
      let addImageVideo;
      console.log(ivUrls);
      if (ivUrls.length == 0) {
        console.log("called null");
        let value = "none";
        addImageVideo = addStringNoLocale(addContent, schema.url, value);
      } else {
        addImageVideo = addStringNoLocale(addContent, schema.url, ivUrls[0]);
        for (let x = 1; x < ivUrls.length; x++) {
          addImageVideo = addStringNoLocale(
            addImageVideo,
            schema.url,
            ivUrls[x]
          );
        }
      }

      //console.log(addImageVideo);
      const addDate = addDatetime(addImageVideo, cal.created, date);
      //console.log(addDatetime);
      const setPost = setThing(dataset, addDate);
      const postContentIndex = getSourceUrl(dataset);
      const writePost = await saveSolidDatasetAt(postContentIndex, setPost, {
        fetch: session.fetch,
      });
      //console.log(writePost);
      if (writePost == null) {
        continueUpload = false;
        errorMessage = "Failed to write post file";
      }
    }
    /// Set ACL ///
    if (continueUpload == true) {
      const file = uploadDir + ".acl";
      let makeAcl = new Blob([generateAcl(acl)], { type: "plain/text" });
      //console.log(makeAcl);
      const writeAcl = await overwriteFile(file, makeAcl, {
        contentType: "text/turtle",
        fetch: session.fetch,
      });
      //console.log(writeAcl);
      if (writeAcl == null) {
        continueUpload = false;
        errorMessage = "Failed to write acl";
      }
    }

    /// Write directory reference to Posts (/posts/index.ttl) ///
    const reference = addStringNoLocale(
      createThing(),
      schema.url,
      `${uploadDir}index.ttl`
    );
    const setIndex = setThing(postsList, reference);
    console.log(reference);
    const postsIndex = getSourceUrl(postsList);
    const writeIndex = await saveSolidDatasetAt(postsIndex, setIndex, {
      fetch: session.fetch,
    });
    if (writeIndex == null) {
      continueUpload = false;
      errorMessage = "Failed to write index";
    } else {
      errorMessage = "Post completed!!";
    }

    console.log(errorMessage);
    handleAlert(errorMessage, "success");
  }

  /// Display Input Dialog ///
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
              onChange={handleContent}
            />
          </DialogContent>
          <Divider />

          <Button
            variant="contained"
            component="label"
            color="primary"
            sx={{ marginLeft: 3, marginRight: 3, marginTop: 1 }}
          >
            {" "}
            <AddIcon /> Upload images/videos
            <input
              type="file"
              accept="image/*, video/*"
              multiple
              hidden
              onChange={handleIVChange}
            />
          </Button>

          <DialogContent>{chips}</DialogContent>
          <Divider />
          <DialogContent>
            <Typography>Access Control:</Typography>
            <Select
              multiple
              value={checkedName}
              onChange={handleACL}
              renderValue={(selected) => {
                if (selected.length == friends.length) {
                  return "All Users";
                } else {
                  selected.sort();
                  return selected.join(", ");
                }
              }}
              sx={{ width: 300 }}
            >
              {friends.map(displayAclControls)}
            </Select>
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
