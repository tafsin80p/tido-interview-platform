import {
  CallControls,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import { LayoutListIcon, LoaderIcon, UsersIcon, CopyIcon, CheckIcon, SearchIcon, MicIcon, Code2Icon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import EndCallButton from "./EndCallButton";
import CodeEditor from "./CodeEditor";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const call = useCall();
  const participants = useParticipants();
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const callingState = useCallCallingState();

  const handleCopyId = async () => {
    if (call) {
      await navigator.clipboard.writeText(call.id);
      setIsCopied(true);
      toast.success("Meeting ID copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const filteredParticipants = participants.filter((participant) =>
    participant.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg w-full sm:w-auto">
            <p className="text-sm font-medium truncate">{call.id}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
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
            <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
            <p className="text-sm text-muted-foreground">
              {participants.length} {participants.length === 1 ? "person" : "people"} in call
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant={showParticipants ? "secondary" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <UsersIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Participants</span>
          </Button>
          <EndCallButton />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 relative">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel 
              defaultSize={showCodeEditor ? 35 : 100} 
              minSize={25} 
              maxSize={100} 
              className="relative"
            >
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
                      className="h-full"
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
                      className="h-full"
                    >
                      <SpeakerLayout />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* VIDEO CONTROLS */}
              <motion.div 
                className="absolute bottom-4 left-0 right-0 z-10"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 flex-wrap justify-center px-4 max-w-full overflow-x-auto pb-2 sm:pb-0">
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

                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="icon"
                          className={cn(
                            "size-10 transition-colors",
                            showCodeEditor && "bg-primary/10"
                          )}
                          onClick={() => setShowCodeEditor(!showCodeEditor)}
                        >
                          <Code2Icon className="size-4" />
                        </Button>
                      </motion.div>

                      <EndCallButton />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </ResizablePanel>

            {showCodeEditor && (
              <>
                <ResizableHandle withHandle className="hidden sm:block" />
                <ResizablePanel defaultSize={65} minSize={25} className="hidden sm:block">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <CodeEditor />
                  </motion.div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </motion.div>

        {/* PARTICIPANTS PANEL */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute top-0 right-0 h-full w-full sm:w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l shadow-lg z-50"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Participants ({participants.length})</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden"
                    onClick={() => setShowParticipants(false)}
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <XIcon className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </div>
                <div className="p-4 border-b">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search participants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-2">
                    {filteredParticipants.map((participant) => (
                      <div
                        key={participant.userId}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={participant.image} />
                            <AvatarFallback>
                              {participant.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {participant.name || "Unknown"}
                              {participant.isLocalParticipant && " (You)"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {participant.isLocalParticipant ? "Host" : "Participant"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {participant.isSpeaking && (
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                          )}
                          <MicIcon className={cn("h-4 w-4", participant.isSpeaking ? "text-primary" : "text-muted-foreground")} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOBILE CODE EDITOR */}
        <AnimatePresence>
          {showCodeEditor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background sm:hidden z-50 flex flex-col"
            >
              <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="p-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Code Editor</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCodeEditor(false)}
                    className="hover:bg-muted/50"
                  >
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <XIcon className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeEditor />
              </div>
              <div className="sticky bottom-0 p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowCodeEditor(false)}
                >
                  Close Editor
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MeetingRoom;