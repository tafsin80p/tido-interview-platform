import { QuickActionType } from "@/constants";
import { Card } from "./card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";


// some weird tw bug, but this is how it works
// from-orange-500/10 via-orange-500/5 to-transparent
// from-blue-500/10 via-blue-500/5 to-transparent
// from-purple-500/10 via-purple-500/5 to-transparent
// from-primary/10 via-primary/5 to-transparent

function ActionCard({ action, onClick }: { action: QuickActionType; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "hover:border-primary/50 hover:shadow-lg cursor-pointer",
          "bg-gradient-to-br from-background to-background/80",
          "border border-border/50"
        )}
        onClick={onClick}
      >
        {/* ACTION GRADIENT */}
        <motion.div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            action.gradient,
            "opacity-100 group-hover:opacity-50 transition-opacity duration-300"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* ACTION CONTENT WRAPPER */}
        <div className="relative p-6 size-full">
          <div className="space-y-4">
            {/* ACTION ICON */}
            <motion.div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                `bg-${action.color}/10`,
                "group-hover:scale-110 transition-transform duration-300",
                "group-hover:bg-primary/10 group-hover:text-primary",
                "shadow-lg shadow-primary/5"
              )}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
            >
              <action.icon className={cn(
                `h-7 w-7 text-${action.color}`,
                "group-hover:text-primary transition-colors duration-300"
              )} />
            </motion.div>

            {/* ACTION DETAILS */}
            <div className="space-y-2">
              <motion.h3 
                className={cn(
                  "font-semibold text-xl",
                  "group-hover:text-primary transition-colors duration-300",
                  "bg-gradient-to-r from-foreground to-foreground/80 group-hover:from-primary group-hover:to-primary/80 bg-clip-text text-transparent"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {action.title}
              </motion.h3>
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {action.description}
              </motion.p>
            </div>

            {/* ACTION FOOTER */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-transparent"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default ActionCard;