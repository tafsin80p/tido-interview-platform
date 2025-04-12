import useMeetingActions from "@/hooks/useMeetingActions";
import { Doc } from "../../convex/_generated/dataModel";
import { getMeetingStatus } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CalendarIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Interview = Doc<"interviews">;

function MeetingCard({ interview }: { interview: Interview }) {
  const { joinMeeting } = useMeetingActions();

  const status = getMeetingStatus(interview);
  const formattedDate = format(new Date(interview.startTime), "EEEE, MMMM d · h:mm a");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden"
    >
      <Card className="relative group">
        <motion.div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          )}
        />
        
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-2 text-sm text-muted-foreground"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CalendarIcon className="h-4 w-4" />
              {formattedDate}
            </motion.div>

            <Badge
              variant={
                status === "live" ? "default" : status === "upcoming" ? "secondary" : "outline"
              }
              className={cn(
                "transition-all duration-300",
                status === "live" && "animate-pulse"
              )}
            >
              {status === "live" ? "Live Now" : status === "upcoming" ? "Upcoming" : "Completed"}
            </Badge>
          </div>

          <CardTitle className="group-hover:text-primary transition-colors duration-300">
            {interview.title}
          </CardTitle>

          {interview.description && (
            <CardDescription className="line-clamp-2 group-hover:text-foreground/80 transition-colors duration-300">
              {interview.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {status === "live" && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full bg-primary hover:bg-primary/90 transition-colors duration-300"
                onClick={() => joinMeeting(interview.streamCallId)}
              >
                Join Meeting
              </Button>
            </motion.div>
          )}

          {status === "upcoming" && (
            <Button 
              variant="outline" 
              className="w-full opacity-75 cursor-not-allowed"
              disabled
            >
              Waiting to Start
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
export default MeetingCard;