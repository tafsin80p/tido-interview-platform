"use client";

import ActionCard from "@/components/ui/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/ui/MeetingModal";
import LoaderUI from "@/components/LoaderUi";
import { Loader2Icon, Calendar, Clock, Users } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();

  const { isInterviewer, isCandidate, isLoading } = useUserRole();
  const interviews = useQuery(api.interviews.getMyInterviews);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">();

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;
      default:
        router.push(`/${title.toLowerCase()}`);
    }
  };

  if (isLoading) return <LoaderUI />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* WELCOME SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-3xl" />
          <div className="relative p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome back!
                </motion.h1>
                <motion.p 
                  className="text-muted-foreground text-lg max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {isInterviewer
                    ? "Manage your interviews and review candidates effectively"
                    : "Access your upcoming interviews and preparations"}
                </motion.p>
              </div>
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Active Users</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Today's Meetings</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard
                key={action.title}
                action={action}
                onClick={() => handleQuickAction(action.title)}
              />
            ))}
          </div>
        </motion.div>

        {/* UPCOMING INTERVIEWS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Upcoming Interviews</h2>
              <p className="text-sm text-muted-foreground">
                {isInterviewer ? "Your scheduled interviews" : "Your upcoming interview sessions"}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Upcoming</span>
            </div>
          </div>

          {interviews === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.map((interview, index) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <MeetingCard interview={interview} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Interviews Scheduled</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isInterviewer 
                  ? "You don't have any interviews scheduled at the moment. Start a new interview or wait for upcoming schedules."
                  : "You don't have any interviews scheduled at the moment. Check back later for updates or contact your interviewer."}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* MEETING MODAL */}
        <MeetingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
          isJoinMeeting={modalType === "join"}
        />
      </div>
    </div>
  );
}