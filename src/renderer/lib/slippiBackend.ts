import { ApolloClient, ApolloLink, gql, HttpLink, InMemoryCache } from "@apollo/client";
import { isDevelopment } from "@common/constants";
import { ipc_checkPlayKeyExists, ipc_removePlayKeyFile, ipc_storePlayKeyFile } from "@dolphin/ipc";
import type { PlayKey } from "@dolphin/types";
import electronLog from "electron-log";
import firebase from "firebase";
import type { GraphQLError } from "graphql";

const log = electronLog.scope("slippiBackend");

const httpLink = new HttpLink({ uri: process.env.SLIPPI_GRAPHQL_ENDPOINT });

const appVersion = __VERSION__;

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  name: "slippi-launcher",
  version: `${appVersion}${isDevelopment ? "-dev" : ""}`,
});

const getUserKeyQuery = gql`
  query getUserKeyQuery($fbUid: String) {
    getUser(fbUid: $fbUid) {
      displayName
      connectCode {
        code
      }
      private {
        playKey
      }
    }
    getLatestDolphin {
      version
    }
  }
`;

const renameUserMutation = gql`
  mutation RenameUser($fbUid: String!, $displayName: String!) {
    userRename(fbUid: $fbUid, displayName: $displayName) {
      displayName
    }
  }
`;

export const initNetplayMutation = gql`
  mutation InitNetplay($codeStart: String!) {
    userInitNetplay(codeStart: $codeStart) {
      fbUid
    }
  }
`;

const handleErrors = (errors: readonly GraphQLError[] | undefined) => {
  if (errors) {
    let errMsgs = "";
    errors.forEach((err) => {
      errMsgs += `${err.message}\n`;
    });
    throw new Error(errMsgs);
  }
};

// The firebase ID token expires after 1 hour so we will refresh it for actions that require it.
async function refreshFirebaseAuth(): Promise<firebase.User> {
  const user = firebase.auth().currentUser;
  if (!user) {
    throw new Error("User is not logged in.");
  }

  const token = await user.getIdToken();

  const authLink = new ApolloLink((operation, forward) => {
    // Use the setContext method to set the HTTP headers.
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    });

    // Call the next link in the middleware chain.
    return forward(operation);
  });
  client.setLink(authLink.concat(httpLink));

  return user;
}

export async function fetchPlayKey(): Promise<PlayKey | null> {
  const user = await refreshFirebaseAuth();

  const res = await client.query({
    query: getUserKeyQuery,
    variables: {
      fbUid: user.uid,
    },
    fetchPolicy: "network-only",
  });

  handleErrors(res.errors);

  const connectCode = res.data.getUser?.connectCode?.code;
  const playKey = res.data.getUser?.private?.playKey;
  const displayName = res.data.getUser?.displayName || "";
  if (!connectCode || !playKey) {
    // If we don't have a connect code or play key, return this as null such that logic that
    // handles it will cause the user to set them up.
    return null;
  }

  return {
    uid: user.uid,
    connectCode,
    playKey,
    displayName,
    latestVersion: res.data.getLatestDolphin?.version,
  };
}

export async function assertPlayKey(playKey: PlayKey) {
  const playKeyExistsResult = await ipc_checkPlayKeyExists.renderer!.trigger({ key: playKey });
  if (!playKeyExistsResult.result) {
    log.error("Error checking for play key.", playKeyExistsResult.errors);
    throw new Error("Error checking for play key");
  }

  if (playKeyExistsResult.result.exists) {
    return;
  }

  const storeResult = await ipc_storePlayKeyFile.renderer!.trigger({ key: playKey });
  if (!storeResult.result) {
    log.error("Error saving play key", storeResult.errors);
    throw new Error("Error saving play key");
  }
}

export async function deletePlayKey(): Promise<void> {
  const deleteResult = await ipc_removePlayKeyFile.renderer!.trigger({});
  if (!deleteResult.result) {
    log.error("Error deleting play key", deleteResult.errors);
    throw new Error("Error deleting play key");
  }
}

export async function changeDisplayName(name: string) {
  const user = await refreshFirebaseAuth();

  const res = await client.mutate({ mutation: renameUserMutation, variables: { fbUid: user.uid, displayName: name } });

  handleErrors(res.errors);

  if (res.data.userRename.displayName !== name) {
    throw new Error("Could not change name.");
  }

  await user.updateProfile({ displayName: name });
}

export async function initNetplay(codeStart: string): Promise<void> {
  await refreshFirebaseAuth();

  const res = await client.mutate({ mutation: initNetplayMutation, variables: { codeStart } });
  handleErrors(res.errors);
}
