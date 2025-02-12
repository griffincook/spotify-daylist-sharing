"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";
import { getAllGroups, getAllPlaylists, updatePlaylist } from "./firebase";
import {
  Box,
  Button,
  Container,
  Divider,
  HStack,
  Heading,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { GroupDaylists } from "./GroupDaylists";

export default function Home() {
  const [allGroups, setAllGroups] = useState<any>([]);
  const [myDaylist, setMyDaylist] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const searchParams = useSearchParams();

  const accessToken = searchParams.get("access_token");

  const toast = useToast();

  const getMyDaylistFromSpotify = async (
    url = "https://api.spotify.com/v1/me/playlists"
  ): Promise<any> => {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      const daylist = data.items.find((playlist: any) =>
        playlist.name.includes("daylist •")
      );

      if (daylist) {
        return daylist;
      } else if (data.next) {
        return getMyDaylistFromSpotify(data.next);
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching playlists from Spotify", error);
    }
  };

  useEffect(() => {
    const asyncWrapper = async () => {
      if (accessToken) {
        try {
          const myDaylist = await getMyDaylistFromSpotify();
          setMyDaylist(myDaylist);
        } catch (error) {
          console.error("Error fetching my daylist", error);
        }
      }
    };

    asyncWrapper();
  }, [accessToken]);

  const getGroups = async () => {
    try {
      // TODO dynamically set groupId from url
      const _allGroups = await getAllGroups();

      setAllGroups(_allGroups);
    } catch (error) {
      console.error("Error fetching top tracks", error);
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  const saveMyDaylistToGroup = async () => {
    try {
      await updatePlaylist(myDaylist.id, {
        daylistName: myDaylist.name,
        daylistDescription: myDaylist.description,
        updatedAt: new Date(),
        groupId: selectedGroup.id,
      });
      setIsSaved(true);
      toast({
        title: "Daylist saved to group",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving daylist to group", error);
      toast({
        title: "Error saving daylist to group",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="xl">
      <Box my={16}>
        {!accessToken && (
          <Button as="a" href="http://localhost:8888/login">
            Fetch My Daylist
          </Button>
        )}
      </Box>

      {myDaylist && (
        <VStack alignItems={"flex-start"}>
          <HStack>
            <Heading size="md">My Daylist</Heading>
            {selectedGroup &&
              (!isSaved ? (
                <Button onClick={saveMyDaylistToGroup}>
                  Save to {selectedGroup.name}
                </Button>
              ) : (
                <Button disabled>Saved</Button>
              ))}
          </HStack>

          <p>{myDaylist.description.replace(/<\/?a[^>]*>/g, "")}</p>
          <iframe
            style={{ borderRadius: "12px" }}
            src={`https://open.spotify.com/embed/playlist/${myDaylist.id}?utm_source=generator`}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </VStack>
      )}

      <Box mt={16}>
        {selectedGroup ? (
          <VStack alignItems={"flex-start"}>
            <Button onClick={() => setSelectedGroup(null)}>Back</Button>
            <GroupDaylists
              groupId={selectedGroup.id}
              groupName={selectedGroup.name}
            />
          </VStack>
        ) : allGroups ? (
          <VStack alignItems={"flex-start"}>
            <Heading size="md">Select a group</Heading>
            <Divider />
            {allGroups.map((group: any) => (
              <Button key={group.id} onClick={() => setSelectedGroup(group)}>
                {group.name}
              </Button>
            ))}
          </VStack>
        ) : (
          "loading..."
        )}
      </Box>
    </Container>
  );
}
