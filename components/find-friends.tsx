"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/ui/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import {
  acceptFriendRequest,
  denyFriendRequest,
  unfriendUser,
  sendFriendRequest,
  unsendFriendRequest,
} from "@/app/actions";

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
}

interface FriendRequest {
  user_id: string;
  status: string;
  profiles?: { id: string; username: string };
  friend?: { id: string; username: string };
}

interface Friend {
  id: string;
  username: string;
}

export function FindFriends() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, role")
        .ilike("username", `%${searchQuery}%`);

      if (error) {
        console.error("Error fetching profiles:", error);
        setResults([]);
        setLoading(false);
        return;
      }

      const filteredProfiles = (data || []).filter((p) => p.id !== user.id);
      setResults(filteredProfiles);

      setLoading(false);
    };

    fetchProfiles();
  }, [searchQuery, supabase]);

  const [friendships, setFriendships] = useState<Record<string, string>>({});

  const addFriend = async (friendId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not logged in.");
      return;
    }

    // Call the server action
    const result = await sendFriendRequest(friendId);

    if (result.success) {
      setFriendships((prev) => ({ ...prev, [friendId]: "pending" }));
      fetchPendingRequests(); // Call to re-fetch all pending requests
    } else {
      console.error("Error adding friend:", result.message);
    }
  };

  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);

  const fetchPendingRequests = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Incoming Requests
    const { data: incomingData, error: incomingError } = await supabase
      .from("friendships")
      .select(
        `
        user_id,
        status,
        profiles:user_id (id, username),
        friend:friend_id (id, username)
      `
      )
      .eq("friend_id", user.id)
      .eq("status", "pending");

    if (incomingError) {
      console.error("Error fetching incoming requests:", incomingError);
    } else {
      const flattened =
        incomingData?.map((d) => ({
          ...d,
          profiles: Array.isArray(d.profiles) ? d.profiles[0] : d.profiles,
          friend: Array.isArray(d.friend) ? d.friend[0] : d.friend,
        })) ?? [];
      setIncomingRequests(flattened);
    }
  }, [supabase, setIncomingRequests]);

  useEffect(() => {
    fetchPendingRequests();
  }, [supabase, fetchPendingRequests]);

  useEffect(() => {
    const loadFriendships = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("friendships")
        .select("user_id, friend_id, status")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) {
        console.error("Error loading friendships:", error);
        return;
      }

      const statusMap: Record<string, string> = {};
      data?.forEach((f) => {
        const friendId = f.user_id === user.id ? f.friend_id : f.user_id;
        statusMap[friendId] = f.status;
      });

      setFriendships(statusMap);
    };

    loadFriendships();
  }, [supabase]);

  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("friendships")
        .select(
          `
        user_id,
        friend_id,
        profiles:user_id (id, username),
        friend:friend_id (id, username)
      `
        )
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "friends");

      if (error) {
        console.error("Error fetching friends:", error);
        return;
      }

      const list = data
        ?.map((f) => {
          const rawFriend =
            f.user_id === user.id
              ? Array.isArray(f.friend)
                ? f.friend[0]
                : f.friend
              : Array.isArray(f.profiles)
              ? f.profiles[0]
              : f.profiles;

          if (!rawFriend) return null;
          return { id: rawFriend.id, username: rawFriend.username };
        })
        .filter(Boolean) as Friend[];

      setFriends(list);
    };

    fetchFriends();
  }, [supabase]);

  return (
    <Card className="handwritten-border !border-primary/10 bg-secondary/10 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="font-kate text-2xl text-primary/80">Social Connections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SearchBar placeholder="Find other cafe lovers..." />

        {loading && <p className="mt-3 font-kate italic text-sm text-primary/40">Searching...</p>}

        {!loading && results.length > 0 && (
          <ul className="mt-4 space-y-2">
            {results.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 bg-background/40 border border-primary/5 rounded-xl p-3 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 font-kate">
                  <div className="bg-primary/5 p-1.5 rounded-full">
                    <UserIcon className="size-4 text-primary/60" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">{user.username}</p>
                    <p className="text-[10px] uppercase tracking-widest text-primary/40">@{user.username}</p>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    if (friendships[user.id] === "pending") {
                      const result = await unsendFriendRequest(user.id);
                      if (result.success) {
                        setFriendships((prev) => {
                          const copy = { ...prev };
                          delete copy[user.id];
                          return copy;
                        });
                      }
                    } else if (friendships[user.id] !== "friends") {
                      addFriend(user.id);
                    }
                  }}
                  variant="ghost"
                  className="font-kate font-bold text-xs handwritten-border !border-primary/10"
                  disabled={friendships[user.id] === "friends"}
                >
                  {friendships[user.id] === "pending"
                    ? "Cancel"
                    : friendships[user.id] === "friends"
                    ? "Friends"
                    : "Add"}
                </Button>
              </li>
            ))}
          </ul>
        )}

        {!loading && results.length === 0 && searchQuery.length >= 2 && (
          <p className="mt-3 font-kate italic text-sm text-primary/40">No coffee lovers found by that name.</p>
        )}

        {/* Friend Requests */}
        {incomingRequests.length > 0 && (
          <div className="mt-4 border-t border-primary/5 pt-4">
            <h3 className="font-kate font-bold text-xs uppercase tracking-widest text-primary/40 mb-3">
              Incoming Requests
            </h3>
            <ul className="space-y-2">
              {incomingRequests.map((req) => (
                <li
                  key={req.user_id}
                  className="flex items-center justify-between bg-accent/5 border border-accent/10 rounded-xl p-3"
                >
                  <p className="font-kate font-bold text-primary">
                    @{req.profiles?.username || "Unknown"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-kate font-bold text-xs bg-accent/10 text-accent hover:bg-accent/20"
                      onClick={async () => {
                        const result = await acceptFriendRequest(req.user_id);
                        if (result.success) {
                          setIncomingRequests((prev) =>
                            prev.filter((r) => r.user_id !== req.user_id)
                          );
                          setFriendships((prev) => ({
                            ...(prev || {}),
                            [req.user_id]: "friends",
                          }));
                          setFriends((prev) => [
                            ...prev,
                            {
                              id: req.user_id,
                              username: req.profiles?.username || "Unknown",
                            },
                          ]);
                        }
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-kate font-bold text-xs hover:bg-destructive/5 text-destructive/60"
                      onClick={async () => {
                        const result = await denyFriendRequest(req.user_id);
                        if (result.success) {
                          setIncomingRequests((prev) =>
                            prev.filter((r) => r.user_id !== req.user_id)
                          );
                          setFriendships((prev) => {
                            const copy = { ...prev };
                            delete copy[req.user_id];
                            return copy;
                          });
                        }
                      }}
                    >
                      Deny
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Friends List */}
        {friends.length > 0 && (
          <div className="mt-6 border-t border-primary/5 pt-4">
            <h3 className="font-kate font-bold text-xs uppercase tracking-widest text-primary/40 mb-3">
              Your Circle
            </h3>
            <ul className="space-y-2">
              {friends.map((friend) => (
                <li
                  key={friend.id}
                  className="flex items-center justify-between bg-background/40 border border-primary/5 rounded-xl p-3"
                >
                  <Link
                    href={`/friend/${friend.id}`}
                    className="font-kate font-bold text-primary hover:underline decoration-primary/20 underline-offset-4"
                  >
                    @{friend.username}
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-kate font-bold text-[10px] uppercase tracking-tighter text-primary/40 hover:text-destructive hover:bg-destructive/5"
                    onClick={async () => {
                      const result = await unfriendUser(friend.id);

                      if (result.success) {
                        setFriends((prev) =>
                          prev.filter((f) => f.id !== friend.id)
                        );
                        setFriendships((prev) => {
                          const copy = { ...prev };
                          delete copy[friend.id];
                          return copy;
                        });
                      } else {
                        console.error(result.message);
                      }
                    }}
                  >
                    Unfriend
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
