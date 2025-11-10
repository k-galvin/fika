"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/ui/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  acceptFriendRequest,
  denyFriendRequest,
  unfriendUser,
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
      return;
    }

    const { data: existing } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existing && existing.status === "denied") {
      return;
    }

    const { error } = await supabase
      .from("friendships")
      .insert([{ user_id: user.id, friend_id: friendId, status: "pending" }]);

    if (error) {
      console.error("Error adding friend:", error);
    } else {
      setFriendships((prev) => ({ ...prev, [friendId]: "pending" }));
    }
  };

  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    const fetchIncomingRequests = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("friendships")
        .select(
          `
        user_id,
        status,
        profiles:user_id (id, username),
        friend:friend_id (id, username)
      `
        )
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching incoming requests:", error);
      } else {
        const flattened =
          data?.map((d) => ({
            ...d,
            profiles: Array.isArray(d.profiles) ? d.profiles[0] : d.profiles,
            friend: Array.isArray(d.friend) ? d.friend[0] : d.friend,
          })) ?? [];

        setIncomingRequests(flattened);
      }
    };

    fetchIncomingRequests();
  }, []);

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
  }, []);

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
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Friends</CardTitle>
      </CardHeader>
      <CardContent>
        <SearchBar placeholder="Search for friends..." />

        {/* Friend Requests */}
        {incomingRequests.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Friend Requests
            </h3>
            <ul className="space-y-2">
              {incomingRequests.map((req) => (
                <li
                  key={req.user_id}
                  className="flex items-center justify-between border rounded-lg p-2 hover:bg-gray-50 transition"
                >
                  <p className="text-sm">
                    @{req.profiles?.username || "Unknown"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
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
                      variant="outline"
                      size="sm"
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

        {loading && <p className="mt-3 text-sm text-gray-500">Searching...</p>}

        {!loading && results.length > 0 && (
          <ul className="mt-4 space-y-2">
            {results.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 border rounded-lg p-2 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    {user.username && (
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => addFriend(user.id)}
                  disabled={
                    friendships[user.id] === "pending" ||
                    friendships[user.id] === "friends"
                  }
                >
                  {friendships[user.id] === "pending"
                    ? "Request Sent"
                    : friendships[user.id] === "friends"
                    ? "Friends"
                    : "Add Friend"}
                </Button>
              </li>
            ))}
          </ul>
        )}

        {!loading && results.length === 0 && searchQuery.length >= 2 && (
          <p className="mt-3 text-sm text-gray-500">No users found.</p>
        )}

        {/* Friends List */}
        {friends.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Your Friends
            </h3>
            <ul className="space-y-2">
              {friends.map((friend) => (
                <li
                  key={friend.id}
                  className="flex items-center justify-between border rounded-lg p-2 hover:bg-gray-50 transition"
                >
                  <Link
                    href={`/friend/${friend.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    @{friend.username}
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
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
