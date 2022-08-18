import {
    createSolidDataset,
    getSolidDataset,
    saveSolidDatasetAt,
  } from "@inrupt/solid-client";
  
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
        //console.log("Error Returned: " + getOrCreate)
        return getOrCreate;
      }
    }
  }