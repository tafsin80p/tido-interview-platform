import {
  CallControls,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import { 
  LayoutIcon, 
  LoaderIcon, 
  UsersIcon, 
  CopyIcon, 
  CheckIcon, 
  SearchIcon, 
  MicIcon, 
  Code2Icon, 
  XIcon, 
  VideoIcon, 
  MonitorIcon,
  SettingsIcon,
  MessageCircleIcon,
  SendIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Add custom styles for Stream Video SDK
const streamVideoStyles = `
  .str-video__participant-view--speaking {
    outline: 2px solid var(--primary) !important;
    outline-offset: 4px !important;
    border-radius: 12px !important;
    overflow: visible !important;
    position: relative !important;
  }
  
  .str-video__participant-view--speaking::after {
    content: '' !important;
    position: absolute !important;
    top: 8px !important;
    right: 8px !important;
    width: 8px !important;
    height: 8px !important;
    border-radius: 50% !important;
    background: #22c55e !important;
    box-shadow: 0 0 0 2px var(--background) !important;
    animation: pulse 1.5s ease-in-out infinite !important;
  }
  
  .str-video__participant-view {
    border-radius: 12px !important;
    overflow: hidden !important;
    background: rgba(0, 0, 0, 0.2) !important;
  }

  .str-video__participant-view video {
    border-radius: 12px !important;
    object-fit: cover !important;
  }
  
  .str-video__participant-view__avatar {
    border-radius: 50% !important;
    border: 2px solid var(--background) !important;
  }
  
  .str-video__participant-view__name {
    background-color: rgba(0, 0, 0, 0.6) !important;
    border-radius: 6px !important;
    padding: 4px 8px !important;
    margin: 8px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
  }

  .str-video__grid {
    gap: 16px !important;
    padding: 16px !important;
  }

  .str-video__participant-view__loading {
    background: rgba(0, 0, 0, 0.2) !important;
    border-radius: 12px !important;
  }

  .str-video__participant-view__mute-overlay {
    background: rgba(0, 0, 0, 0.4) !important;
    border-radius: 12px !important;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.05);
      opacity: 1;
    }
    100% {
      transform: scale(0.95);
      opacity: 0.8;
    }
  }
`;

function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<"participants" | "chat">("participants");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { useCallCallingState, useParticipants, useLocalParticipant } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter participants based on search query
  const filteredParticipants = participants.filter((participant) =>
    participant.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const currentUser = participants.find(p => p.isLocalParticipant);
    const userName = currentUser?.name || "You";
    
    const message = {
      id: Date.now().toString(),
      sender: userName,
      content: newMessage.trim(),
      timestamp: new Date(),
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
    
    // In a real implementation, you would send this message to other participants
    // through your video call SDK's data channel or a separate chat service
  };

  // Handle key press for sending message with Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyId = () => {
    if (call) {
      navigator.clipboard.writeText(call.id);
      setIsCopied(true);
      toast.success("Meeting ID copied!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Add the custom styles to the document
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.textContent = streamVideoStyles;
    document.head.appendChild(styleElement);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Check if local participant is speaking
  useEffect(() => {
    if (!localParticipant) return;

    // Clear any existing interval
    if (speakingCheckInterval.current) {
      clearInterval(speakingCheckInterval.current);
    }

    // Set up an interval to check speaking status
    speakingCheckInterval.current = setInterval(() => {
      if (localParticipant.isSpeaking) {
        setIsSpeaking(true);
      } else {
        setIsSpeaking(false);
      }
    }, 500); // Check every 500ms

    // Clean up interval on unmount
    return () => {
      if (speakingCheckInterval.current) {
        clearInterval(speakingCheckInterval.current);
      }
    };
  }, [localParticipant]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-slate-900/20 dark:to-slate-900/50">
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary to-purple-600 opacity-75 blur"></div>
          <div className="relative flex flex-col items-center gap-6 rounded-lg bg-background p-8 shadow-xl">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">Joining Meeting</h2>
              <p className="mt-2 text-muted-foreground">Setting up your video connection...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* TOP BAR */}
      <div className="border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-md border border-border/40 bg-background p-1.5 shadow-sm"
            >
              <LayoutIcon className="h-5 w-5 text-primary/80" />
            </motion.div>
            
            <div className="flex flex-col">
              <motion.h1 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-sm font-medium text-foreground md:text-base"
              >
                Interview Session
              </motion.h1>
              
              {call && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex items-center gap-1.5"
                >
                  <span className="text-xs text-muted-foreground">{call.id}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyId}
                    className="h-5 w-5 rounded-sm p-0"
                  >
                    {isCopied ? (
                      <CheckIcon className="h-3 w-3 text-green-500" />
                    ) : (
                      <CopyIcon className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                </motion.div>
              )}
              </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex h-7 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1"
            >
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs font-medium text-primary">
                {participants.length} {participants.length === 1 ? "person" : "people"}
              </span>
            </motion.div>

            <div className="hidden sm:flex sm:items-center sm:gap-1.5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 gap-1.5 text-xs",
                    showParticipants && activeTab === "participants" && "bg-primary/10 text-primary border-primary/20"
                  )}
                  onClick={() => {
                    setShowParticipants(true);
                    setActiveTab("participants");
                  }}
                >
                  <UsersIcon className="h-3.5 w-3.5" />
                  <span>Participants</span>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 gap-1.5 text-xs",
                    showParticipants && activeTab === "chat" && "bg-primary/10 text-primary border-primary/20"
                  )}
                  onClick={() => {
                    setShowParticipants(true);
                    setActiveTab("chat");
                  }}
                >
                  <MessageCircleIcon className="h-3.5 w-3.5" />
                  <span>Chat</span>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 gap-1.5 text-xs",
                    showCodeEditor && "bg-primary/10 text-primary border-primary/20"
                  )}
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                >
                  <Code2Icon className="h-3.5 w-3.5" />
                  <span>Code Editor</span>
                </Button>
              </motion.div>
            </div>

            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => {
                      setShowParticipants(true);
                      setActiveTab("participants");
                    }}
                    className="gap-2"
                  >
                    <UsersIcon className="h-4 w-4" />
                    <span>Participants</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setShowParticipants(true);
                      setActiveTab("chat");
                    }}
                    className="gap-2"
                  >
                    <MessageCircleIcon className="h-4 w-4" />
                    <span>Chat</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowCodeEditor(!showCodeEditor)}
                    className="gap-2"
                  >
                    <Code2Icon className="h-4 w-4" />
                    <span>Code Editor</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <EndCallButton />
            </motion.div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative flex-1">
        <div className="h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* VIDEO PANEL */}
            <ResizablePanel 
              defaultSize={showCodeEditor ? 55 : 100} 
              minSize={40}
              className="relative overflow-hidden"
            >
              {/* VIDEO LAYOUTS */}
              <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                  {layout === "grid" ? (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <PaginatedGridLayout />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="speaker"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <SpeakerLayout />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* FLOATING CONTROLS */}
              <div className="absolute bottom-4 left-0 right-0 z-10">
                <div className="mx-auto flex max-w-fit flex-col gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/80 p-2 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="relative [&>div]:flex [&>div]:items-center [&>div]:gap-1.5">
                <CallControls onLeave={() => router.push("/")} />
                        {isSpeaking && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-sm"
                          >
                            <div className="h-1.5 w-1.5 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-white"></div>
                          </motion.div>
                        )}
                      </div>

                      <div className="mx-0.5 hidden sm:block h-5 w-px bg-border/50"></div>
                      
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-9 sm:size-10 rounded-lg border-border/40"
                          >
                            <LayoutIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => setLayout("grid")}
                            className={cn(
                              "gap-2",
                              layout === "grid" && "bg-primary/10 text-primary"
                            )}
                          >
                            <MonitorIcon className="h-4 w-4" />
                            <span>Grid View</span>
                      </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setLayout("speaker")}
                            className={cn(
                              "gap-2",
                              layout === "speaker" && "bg-primary/10 text-primary"
                            )}
                          >
                            <VideoIcon className="h-4 w-4" />
                            <span>Speaker View</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="icon"
                        className={cn(
                          "size-9 sm:size-10 rounded-lg border-border/40",
                          showParticipants && activeTab === "participants" && "bg-primary/10 border-primary/20"
                        )}
                        onClick={() => {
                          setShowParticipants((prev) => {
                            if (prev && activeTab === "participants") return false;
                            setActiveTab("participants");
                            return true;
                          });
                        }}
                  >
                    <UsersIcon className="size-4" />
                  </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          "size-9 sm:size-10 rounded-lg border-border/40",
                          showParticipants && activeTab === "chat" && "bg-primary/10 border-primary/20"
                        )}
                        onClick={() => {
                          setShowParticipants((prev) => {
                            if (prev && activeTab === "chat") return false;
                            setActiveTab("chat");
                            return true;
                          });
                        }}
                      >
                        <MessageCircleIcon className="size-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          "size-9 sm:size-10 rounded-lg border-border/40",
                          showCodeEditor && "bg-primary/10 border-primary/20"
                        )}
                        onClick={() => setShowCodeEditor(!showCodeEditor)}
                      >
                        <Code2Icon className="size-4" />
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </ResizablePanel>

            {/* CODE EDITOR PANEL */}
            {showCodeEditor && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={45} minSize={35} className="hidden sm:block">
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Code2Icon className="h-4 w-4 text-primary" />
                        <h2 className="font-medium">Code Editor</h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowCodeEditor(false)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <CodeEditor />
            </div>
          </div>
        </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>

        {/* SIDE PANEL */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-full border-l bg-background/95 backdrop-blur-md dark:bg-background/90 sm:w-80 md:w-96"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-4 py-2.5">
                  <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "participants" | "chat")} className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <TabsList className="w-full">
                        <TabsTrigger value="participants" className="flex-1">
                          <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4" />
                            <span>Participants ({participants.length})</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="flex-1">
                          <div className="flex items-center gap-2">
                            <MessageCircleIcon className="h-4 w-4" />
                            <span>Chat</span>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-8 w-8"
                        onClick={() => setShowParticipants(false)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>

                    <TabsContent value="participants" className="flex-1 overflow-hidden p-0">
                      <div className="flex h-full flex-col">
                        <div className="border-b p-3">
                          <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Search participants..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <ScrollArea className="flex-1 p-3">
                          <div className="space-y-1.5">
                            {filteredParticipants.map((participant, index) => (
                              <motion.div
                                key={participant.userId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                  "flex items-center justify-between rounded-lg p-2 transition-colors",
                                  participant.isLocalParticipant 
                                    ? "bg-primary/5 hover:bg-primary/10" 
                                    : "hover:bg-muted/60"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar className="h-9 w-9 border">
                                      <AvatarImage src={participant.image} />
                                      <AvatarFallback className={participant.isLocalParticipant ? "bg-primary/20" : undefined}>
                                        {participant.name?.charAt(0) || "U"}
                                      </AvatarFallback>
                                    </Avatar>
                                    {participant.isSpeaking && (
                                      <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500">
                                        <div className="h-full w-full animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-green-500/60" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="flex items-center gap-1.5 text-sm font-medium">
                                      {participant.name || "Unknown"}
                                      {participant.isLocalParticipant && (
                                        <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary">You</span>
                                      )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {participant.isLocalParticipant ? "Host" : "Participant"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MicIcon className={cn("h-4 w-4", participant.isSpeaking ? "text-primary" : "text-muted-foreground")} />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="chat" className="flex-1 overflow-hidden p-0">
                      <div className="flex h-full flex-col">
                        <div className="flex-1 overflow-y-auto p-3">
                          {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center">
                              <MessageCircleIcon className="h-12 w-12 text-muted-foreground/30" />
                              <p className="mt-4 text-center text-sm text-muted-foreground">
                                No messages yet. Start the conversation!
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {messages.map((message) => (
                                <div 
                                  key={message.id} 
                                  className={cn(
                                    "flex flex-col max-w-[80%]",
                                    message.sender === "You" ? "ml-auto items-end" : "items-start"
                                  )}
                                >
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {message.sender}
                                    </span>
                                    <span className="text-xs text-muted-foreground/60">
                                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <div 
                                    className={cn(
                                      "rounded-lg px-3 py-2 text-sm",
                                      message.sender === "You" 
                                        ? "bg-primary text-primary-foreground" 
                                        : "bg-muted"
                                    )}
                                  >
                                    {message.content}
                                  </div>
                                </div>
                              ))}
                              <div ref={messagesEndRef} />
                            </div>
                          )}
                        </div>
                        <div className="border-t p-3">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Type a message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="flex-1"
                            />
                            <Button 
                              size="icon" 
                              onClick={handleSendMessage}
                              disabled={newMessage.trim() === ""}
                            >
                              <SendIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOBILE CODE EDITOR */}
        <AnimatePresence>
          {showCodeEditor && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-50 flex flex-col border-t bg-background sm:hidden"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Code2Icon className="h-4 w-4 text-primary" />
                  <h2 className="font-medium">Code Editor</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowCodeEditor(false)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
          <CodeEditor />
              </div>
              <div className="border-t p-3">
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