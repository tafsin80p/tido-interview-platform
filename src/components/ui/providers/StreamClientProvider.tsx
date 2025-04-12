"use client";

import { ReactNode, useEffect, useState } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import LoaderUI from "@/components/LoaderUi";
import { streamTokenProvider } from "@/actions/stream.actions";
import toast from "react-hot-toast";

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [streamVideoClient, setStreamVideoClient] = useState<StreamVideoClient>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    let client: StreamVideoClient | undefined;

    const initClient = async () => {
      try {
        client = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user: {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.id,
            image: user.imageUrl,
          },
          tokenProvider: streamTokenProvider,
        });

        await client.connectUser({ id: user.id });
        setStreamVideoClient(client);
      } catch (error) {
        console.error('Failed to initialize Stream client:', error);
        toast.error('Failed to initialize video client. Please try again.');
      }
    };

    initClient();

    return () => {
      if (client) {
        client.disconnectUser();
        setStreamVideoClient(undefined);
      }
    };
  }, [user, isLoaded]);

  if (!streamVideoClient) return <LoaderUI />;
  
  return <StreamVideo client={streamVideoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
