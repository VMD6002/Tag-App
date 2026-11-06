// Must be the FIRST import of every real mock page: the extension creates storage-backed atoms
// while its modules load, which needs the WXT `storage` global to exist already.
import { installStorageGlobals, seedStorage } from "../stubs";

installStorageGlobals();
seedStorage({ currentUser: "DEFAULT", userList: ["DEFAULT", "Guest profile"] });
