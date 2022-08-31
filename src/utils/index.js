import {
  createSolidDataset,
  getSolidDataset,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";

// Gets a Solid Dataset or creates a new Solid Dataset if it doesnt exist
export async function getOrCreateDataset(containerUri, fetch) {
  const indexUrl = `${containerUri}index.ttl`;
  try {
    const getOrCreate = await getSolidDataset(indexUrl, { fetch });
    //console.log("Try Returned: " + getOrCreate)
    return getOrCreate;
  } catch (error) {
    if (error.statusCode === 404) {
      const getOrCreate = await saveSolidDatasetAt(
        indexUrl,
        createSolidDataset(),
        {
          fetch,
        }
      );
      //console.log("Error Returned: " + getOrCreate);
      return getOrCreate;
    }
  }
}

// Array sorting helper
export function sortByAttribute(attribute) {
  return function (a, b) {
    if (a[attribute] > b[attribute]) return 1;
    else if (a[attribute] < b[attribute]) return -1;

    return 0;
  };
}

//Generates ACL content for uploading to a folder
export function generateAcl(webidArray) {
  // Process webids before generating acl
  const processedArray = [];
  if (webidArray.length != 0) {
    for (let x = 0; x < webidArray.length; x++) {
      let sliced = webidArray[x].slice(0, -2); //removes 'me' from end of webid
      processedArray.push({ webid: sliced, id: [x] });
    }
  }

  let header = `
@prefix : <#>.
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix priv: <./>.
@prefix c: </profile/card#>.\n`;
  if (processedArray.length != 0) {
    processedArray.forEach((item) => {
      header = header + "@prefix c" + item.id + ": <" + item.webid + `>.\n`;
    });
  }
  const controlReadWrite = `
:ControlReadWrite
  a acl:Authorization;
  acl:accessTo priv:;
  acl:agent c:me;
  acl:default priv:;
  acl:mode acl:Control, acl:Read, acl:Write.\n`;

  let ids = "";
  if (processedArray.length != 0) {
    for (let x = 0; x < processedArray.length; x++) {
      if (x != processedArray.length - 1) {
        ids = ids + `c` + processedArray[x].id + `:me, `;
      } else {
        ids = ids + `c` + processedArray[x].id + `:me`;
      }
    }
  }

  let read = `
:Read
  a acl:Authorization;
  acl:accessTo priv:;
  acl:agent ${ids};
  acl:default priv:;
  acl:mode acl:Read.
  `;

  if (processedArray.length == 0) {
    let processed = header + controlReadWrite;
    //console.log(processed);
    return processed;
  } else {
    let processed = header + controlReadWrite + read;
    //console.log(processed);
    return processed;
  }
}
