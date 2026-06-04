import { useState, useCallback } from "react";
import { useAtom } from "jotai";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currentUserAtom, userListAtom } from "../../atoms/user";
import { Trash2, UserPlus } from "lucide-react";

export default function Users() {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const [userList, setUserList] = useAtom(userListAtom);
  const [newUsername, setNewUsername] = useState("");

  const handleAddUser = useCallback(() => {
    const trimmed = newUsername.trim();
    if (!trimmed) {
      alert("Username cannot be empty");
      return;
    }
    if (userList.includes(trimmed)) {
      alert("User already exists");
      return;
    }
    setUserList([...userList, trimmed]);
    setNewUsername("");
  }, [newUsername, userList, setUserList]);

  const handleRemoveUser = useCallback((userToRemove: string) => {
    if (userList.length <= 1) {
      alert("Cannot remove the only user left");
      return;
    }

    // Double confirmation
    const firstConfirm = confirm(`Are you sure you want to remove user "${userToRemove}"?`);
    if (!firstConfirm) return;

    const secondConfirm = confirm(`WARNING: This will permanently delete settings scoped to "${userToRemove}" in this browser. Do you really want to proceed?`);
    if (!secondConfirm) return;

    // Execute removal
    const nextList = userList.filter((u) => u !== userToRemove);
    setUserList(nextList);

    // If we are removing the currently selected user, switch to another remaining user
    if (currentUser === userToRemove) {
      if (nextList.length > 0) {
        setCurrentUser(nextList[0]);
      }
    }
  }, [userList, currentUser, setCurrentUser, setUserList]);

  return (
    <section className="max-w-xs w-full grid gap-4">
      <h3 className="text-xl mb-1">User Management</h3>

      <div className="grid w-full items-center">
        <Label className="mb-2">Active User</Label>
        <Select value={currentUser} onValueChange={(val) => setCurrentUser(val)}>
          <SelectTrigger className="w-full">
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
      </div>

      <div className="grid w-full items-center">
        <Label className="mb-2">Add New User</Label>
        <div className="flex gap-2">
          <Input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Username..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddUser();
              }
            }}
          />
          <Button onClick={handleAddUser} size="icon" variant="outline">
            <UserPlus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid w-full items-center mt-2">
        <Label className="mb-2">All Users</Label>
        <div className="border border-border rounded-md p-2 space-y-1 max-h-36 overflow-y-auto">
          {userList.map((user) => (
            <div key={`user-list-${user}`} className="flex items-center justify-between py-1 px-2 hover:bg-muted/50 rounded-md transition-colors">
              <span className={`text-sm truncate mr-2 ${currentUser === user ? "font-semibold text-primary" : ""}`}>
                {user} {currentUser === user && "(Active)"}
              </span>
              {userList.length > 1 && (
                <Button
                  onClick={() => handleRemoveUser(user)}
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
