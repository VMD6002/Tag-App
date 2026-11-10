import { useAtom, useAtomValue } from "jotai";
import { Trash2, UserPlus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { confirm } from "@/components/craft/confirm-dialog";
import { SettingField } from "@/components/craft/Settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  currentUserAtom,
  effectiveUserAtom,
  userListAtom,
  useSetUrlUser,
} from "../../../atoms/user";

export default function Users() {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const setUrlUser = useSetUrlUser();
  const activeUser = useAtomValue(effectiveUserAtom);
  const [userList, setUserList] = useAtom(userListAtom);
  const [newUsername, setNewUsername] = useState("");

  const handleAddUser = useCallback(() => {
    const trimmed = newUsername.trim();
    if (!trimmed) {
      toast.warning("Enter a profile name");
      return;
    }
    if (userList.includes(trimmed)) {
      toast.warning("That profile already exists");
      return;
    }
    setUserList([...userList, trimmed]);
    setNewUsername("");
  }, [newUsername, userList, setUserList]);

  const handleRemoveUser = useCallback(
    async (userToRemove: string) => {
      if (userList.length <= 1) {
        toast.warning("You can't remove the only profile");
        return;
      }

      // Double confirmation
      const firstConfirm = await confirm.warning(
        `Remove the profile "${userToRemove}"?`,
      );
      if (!firstConfirm) return;

      const secondConfirm = await confirm.destructive(
        `This permanently deletes the library, tags and settings of "${userToRemove}" from this browser. Continue?`,
      );
      if (!secondConfirm) return;

      // Execute removal
      const snapshot = await storage.snapshot("local");
      const prefix = `${userToRemove}:`;
      await storage.removeItems(
        Object.keys(snapshot)
          .filter((k) => k.startsWith(prefix))
          .map((k) => `local:${k}` as const),
      );
      const nextList = userList.filter((u) => u !== userToRemove);
      setUserList(nextList);

      // Removing the stored or the shown profile: fall back to another remaining one
      if (currentUser === userToRemove) setCurrentUser(nextList[0]!);
      if (activeUser === userToRemove) setUrlUser(nextList[0]!);
    },
    [
      userList,
      currentUser,
      activeUser,
      setCurrentUser,
      setUrlUser,
      setUserList,
    ],
  );

  return (
    <>
      <SettingField
        label="Active profile"
        help="Each profile keeps its own library, tags and settings in this browser."
      >
        <Select
          value={activeUser}
          onValueChange={(val) => {
            if (!val) return;
            setCurrentUser(val);
            setUrlUser(val);
          }}
        >
          <SelectTrigger
            className="w-full max-w-xs"
            aria-label="Active profile"
          >
            <SelectValue placeholder="Select active user" />
          </SelectTrigger>
          <SelectContent className="max-w-sm min-w-0">
            <SelectGroup>
              {userList.map((user) => (
                <SelectItem key={`user-select-${user}`} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </SettingField>

      <SettingField
        label="Add a profile"
        htmlFor="new-profile-name"
        help="Create a separate set of data, for example one per person or purpose."
      >
        <div className="flex max-w-xs gap-2">
          <Input
            id="new-profile-name"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Profile name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddUser();
              }
            }}
          />
          <Button onClick={handleAddUser} variant="outline">
            <UserPlus />
            Add
          </Button>
        </div>
      </SettingField>

      <SettingField
        label="All profiles"
        help="Removing a profile permanently deletes its data from this browser."
      >
        <ul className="max-h-44 max-w-md divide-y overflow-y-auto border">
          {userList.map((user) => (
            <li
              key={`user-list-${user}`}
              className="flex items-center justify-between gap-2 py-1 pr-1 pl-3"
            >
              <span className="min-w-0 truncate text-sm">
                {user}
                {activeUser === user && (
                  <span className="ml-2 border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    Active
                  </span>
                )}
              </span>
              {userList.length > 1 && (
                <Button
                  onClick={() => handleRemoveUser(user)}
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove profile ${user}`}
                  title="Remove profile"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              )}
            </li>
          ))}
        </ul>
      </SettingField>
    </>
  );
}
