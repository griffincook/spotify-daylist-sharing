"use client";

import { useEffect, useState } from "react";
import { getAllPlaylists, getGroup, updatePlaylist } from "./firebase";
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

export function GroupDaylists({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  const [groupDaylists, setGroupDaylists] = useState<any>([]);
  const [myDaylist, setMyDaylist] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  const toast = useToast();

  const getAllDaylists = async () => {
    if (!groupId || Array.isArray(groupId)) return;
    try {
      // TODO dynamically set groupId from url
      const allDaylists = await getAllPlaylists(groupId);
      const daylist = allDaylists[0];
      daylist.description = daylist.daylistDescription.replace(
        /<\/?a[^>]*>/g,
        ""
      );
      setGroupDaylists(allDaylists);
    } catch (error) {
      console.error("Error fetching top tracks", error);
    }
  };

  useEffect(() => {
    getAllDaylists();
  }, [groupId]);

  const saveMyDaylistToGroup = async () => {
    try {
      await updatePlaylist(myDaylist.id, {
        daylistName: myDaylist.name,
        daylistDescription: myDaylist.description,
        updatedAt: new Date(),
      });
      await getAllDaylists();
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
      <Heading size="lg">{groupName}</Heading>
      {groupDaylists.map((daylist: any) => (
        <VStack alignItems={"flex-start"} my={6} key={daylist.id}>
          <Divider />
          <Heading size="md">{daylist.username}'s Daylist</Heading>

          <p>{daylist.daylistDescription.replace(/<\/?a[^>]*>/g, "")}</p>

          <iframe
            style={{ borderRadius: "12px" }}
            src={`https://open.spotify.com/embed/playlist/${daylist.id}?utm_source=generator`}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </VStack>
      ))}
    </Container>
  );
}
