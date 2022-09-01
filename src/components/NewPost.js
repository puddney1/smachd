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
  addDatetime,
  saveSolidDatasetAt,
  setThing,
  overwriteFile,
  getProfileAll,
} from "@inrupt/solid-client";
import { getOrCreateDataset, generateAcl } from "../utils";
import { schema, cal, vcard } from "rdf-namespaces";

export default function NewPost(props) {
  const handleClose = props.newPost;
  const { session } = useSession();
  const [content, setContent] = React.useState(); //hold content
  const [postsList, setPostsList] = React.useState(); //holds
  const [url, setUrl] = React.useState(); //holds url used in handleSubmit
  const [imageVideo, setImageVideo] = React.useState([]); //holds local locations of images/video to upload
  const friends = props.friendsList;
  const [acl, setACL] = React.useState([]); // holds the acl list
  const [checkedName, setCheckedName] = React.useState([]); //holds list of names for <Select> in dialog
  //const [chips, setChips] = React.useState(); // Disabled due to Images not working

  useEffect(() => {
    if (!session) return;
    // Loads or creates /smached/posts/index.ttl
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

      //selects all names in friends for ACL control
      let tempFriends = [];
      for (let x in friends) {
        //console.log(friends[x].webid);
        tempFriends.push(friends[x].fn);
      }
      setCheckedName(tempFriends);

      // selects all webids from friends and updates acl for
      // /smachd/posts/index.ttl so all webids can access it
      let masterAcl = [];
      for (let x in friends) {
        //console.log(friends[x].webid);
        masterAcl.push(friends[x].webid);
      }
      const file = postsList + ".acl";
      let makeAcl = new Blob([generateAcl(masterAcl)], { type: "plain/text" });
      //console.log(makeAcl);
      const writeFile = await overwriteFile(file, makeAcl, {
        contentType: "text/turtle",
        fetch: session.fetch,
      });
      console.log(masterAcl);
      console.log(writeFile);
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
    setACL(tempAcl);
  }, [checkedName]);

  /// handle Alerts ///
  function handleAlert(message, severity) {
    props.setAlertMessage(message);
    props.setSeverity(severity);
    props.alertToggle();
  }

  /// Content section ///

  // Sets content to state
  function handleContent(e) {
    setContent(e.target.value);
  }

  /// Image-video upload section ///
  {
    /*
  // Adds unique files to imageVideo State
  function handleIVChange(e) {
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

  // Called at end of handleIVChange, maps values to Mui <Chip>
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

  // Called when delete pressed on a <Chip>, 
  //removes file from imageVideo State
  function handleFileDelete(e) {
    const fileList = imageVideo;
    fileList.splice(e.target.value, 1);
    setImageVideo(fileList);
    setChips(chipDisplay(fileList));
    console.log(fileList);
  }

  // Uploads files to a container when handleSubmit called 
  async function placeFileInContainer(file, targetContainerURL) {
    try {
      let reader = new FileReader();
      //reader.readAsDataURL(file);
      reader.onloadend = function () {
        console.log("RESULT: ", reader.result);
      };
      const savedFile = await saveFileInContainer(
        targetContainerURL,
        file,
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
*/
  }

  /// ACL section ///

  // called when mapping friends
  const displayAclControls = (item) => (
    <MenuItem key={item.uri} value={item.fn}>
      <ListItemText primary={item.fn} />
    </MenuItem>
  );

  // onChange(), useEffect[checkedName] is called to update ACL list
  function handleACL(e) {
    setCheckedName(e.target.value);
  }

  /// Upload Post Section ///
  async function handleSubmit() {
    props.newPost(); // close dialog
    handleAlert("Uploading", "info"); //notification
    const date = new Date(); // for upload folder
    const folder = date.getTime(); // sets unique upload folder
    const uploadDir = url + folder + "/";
    let continueUpload = true; //Boolean to stop upload on errors
    let errorMessage;

    // gets users name and webid to add to post
    const getName = await getProfileAll(session.info.webId);
    const name = await getName.webIdProfile.graphs.default[session.info.webId][
      "predicates"
    ]["http://xmlns.com/foaf/0.1/name"]["literals"][
      "http://www.w3.org/2001/XMLSchema#string"
    ][0];
    //console.log(name);

    /// Create Dataset ///
    const dataset = await getOrCreateDataset(uploadDir, session.fetch);

    /// Handle Errors
    if (dataset == undefined) {
      continueUpload = false;
      errorMessage = "Failed to create dataset";
      handleAlert(errorMessage, "error");
    }

    //*** Disabled due to not being able to get files to work ***//

    /// Upload Images ///
    /*let ivUrls = [];
    let uploadGo = true;
    //console.log(imageVideo);
    if (imageVideo.length != 0) {
      //skips if no images/video
      while (uploadGo == true) {
        for (let x = 0; x < imageVideo.length; x++) {
          const upload = await placeFileInContainer(imageVideo[x], uploadDir);
          if (upload != "error") {
            ivUrls.push(upload);
            console.log(ivUrls);
          }
          if (upload == "error") {
            uploadGo = false;
            continueUpload = false;
            errorMessage = `Failed to upload file`;
          }
          uploadGo = false;
          console.log("upload stopped");
        }
      }
    }*/

    /// Create and Set Thing  ///
    if (continueUpload == true) {
      const addName = addStringNoLocale(createThing(), vcard.fn, name);
      const addWebid = addStringNoLocale(
        addName,
        vcard.url,
        session.info.webId
      );
      const addContent = addStringNoLocale(addWebid, schema.text, content);
      let addImageVideo;
      //console.log(ivUrls);
      //if (ivUrls.length == 0) {
      //console.log("called null");
      let value = "none";
      addImageVideo = addStringNoLocale(addContent, schema.url, value);
      {
        /// *** Lines just above and below disables due to files not working ***
        /*}} else {
        addImageVideo = addStringNoLocale(addContent, schema.url, ivUrls[0]);
        for (let x = 1; x < ivUrls.length; x++) {
          addImageVideo = addStringNoLocale(
            addImageVideo,
            schema.url,
            ivUrls[x]
          );
        }
      }*/
      }

      const addDate = addDatetime(addImageVideo, cal.created, date);
      const setPost = setThing(dataset, addDate);
      const postContentIndex = getSourceUrl(dataset);
      const writePost = await saveSolidDatasetAt(postContentIndex, setPost, {
        fetch: session.fetch,
      });
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
      /// *** Disabled due to not being able to get files working ***
      /*for (let x in ivUrls) {
        const file = ivUrls[x] + ".acl";
        await overwriteFile(file, makeAcl, {
          contentType: "text/turtle",
          fetch: session.fetch,
        });
      }*/

      /// Handle Errors
      if (writeAcl == null) {
        continueUpload = false;
        errorMessage = "Failed to write acl";
        handleAlert(errorMessage, "error");
      }
    }
    //console.log(writeAcl);

    /// Write directory reference to Posts (/posts/index.ttl) ///
    const reference = addStringNoLocale(
      createThing(),
      schema.url,
      `${uploadDir}index.ttl`
    );
    const setIndex = setThing(postsList, reference);
    const postsIndex = getSourceUrl(postsList);
    const writeIndex = await saveSolidDatasetAt(postsIndex, setIndex, {
      fetch: session.fetch,
    });

    /// Handle Errors
    if (writeIndex == null) {
      continueUpload = false;
      errorMessage = "Failed to write index";
      handleAlert(errorMessage, "error");
    } else {
      errorMessage = "Post completed!!";
      handleAlert(errorMessage, "success");
    }
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
          {/* *** Disabled due to not getting files working ***
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
              */}
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
