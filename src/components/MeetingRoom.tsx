import {
  CallControls,
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import { LayoutListIcon, LoaderIcon, UsersIcon, CopyIcon, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import EndCallButton from "./EndCallButton";
import CodeEditor from "./CodeEditor";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const call = useCall();
  const participants = useParticipants();
  const [isCopied, setIsCopied] = useState(false);

  const callingState = useCallCallingState();

  const handleCopyId = async () => {
    if (call) {
      await navigator.clipboard.writeText(call.id);
      setIsCopied(true);
      toast.success("Meeting ID copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (callingState !== CallingState.JOINED || !call) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoaderIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      {/* TOP BAR */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">{call.id}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleCopyId}
            >
              {isCopied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <p className="text-sm text-muted-foreground">
              {participants.length} {participants.length === 1 ? "person" : "people"} in call
            </p>
          </div>
        </div>
        <EndCallButton />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={35} minSize={25} maxSize={100} className="relative">
              {/* VIDEO LAYOUT */}
              <motion.div 
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  {layout === "grid" ? (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PaginatedGridLayout />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="speaker"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SpeakerLayout />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* PARTICIPANTS LIST OVERLAY */}
                <AnimatePresence>
                  {showParticipants && (
                    <motion.div
                      initial={{ opacity: 0, x: "100%" }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: "100%" }}
                      transition={{ type: "spring", damping: 20 }}
                      className="absolute right-0 top-0 h-full w-[300px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                    >
                      <CallParticipantsList onClose={() => setShowParticipants(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* VIDEO CONTROLS */}
              <motion.div 
                className="absolute bottom-4 left-0 right-0"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 flex-wrap justify-center px-4">
                    <CallControls onLeave={() => router.push("/")} />

                    <motion.div 
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size="icon" className="size-10">
                              <LayoutListIcon className="size-4" />
                            </Button>
                          </motion.div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => setLayout("grid")}
                            className={cn(
                              "cursor-pointer transition-colors",
                              layout === "grid" && "bg-primary/10"
                            )}
                          >
                            Grid View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setLayout("speaker")}
                            className={cn(
                              "cursor-pointer transition-colors",
                              layout === "speaker" && "bg-primary/10"
                            )}
                          >
                            Speaker View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="icon"
                          className={cn(
                            "size-10 transition-colors",
                            showParticipants && "bg-primary/10"
                          )}
                          onClick={() => setShowParticipants(!showParticipants)}
                        >
                          <UsersIcon className="size-4" />
                        </Button>
                      </motion.div>

                      <EndCallButton />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={65} minSize={25}>
              <CodeEditor />
            </ResizablePanel>
          </ResizablePanelGroup>
        </motion.div>
      </div>
    </div>
  );
}

export default MeetingRoom;