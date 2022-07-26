import { getProfileAll } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";



function FriendsBar(props) {
  const { session } = useSession();

  const log = session.info.webId;

  return (
    console.log(getProfileAll(log))
  )
}

export default FriendsBar;
