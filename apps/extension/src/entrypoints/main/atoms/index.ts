import { ContentWebDataType } from "@tagapp/utils/types";
import { atomWithUserStorage } from "./user";

export const contentDataAtom = atomWithUserStorage<ContentWebDataType>(
  "contentData",
  {},
);
