"use client";

import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { CodeIcon } from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import DasboardBtn from "./DashboardBtn";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Navbar = () => {
  return (
    <motion.nav 
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border/50",
        "bg-background/80 backdrop-blur-sm",
        "transition-colors duration-300"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex h-16 items-center px-4 container mx-auto">
        {/* LEFT SIDE - LOGO */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 font-blue text-2xl mr-6 font-mono group"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <CodeIcon className="size-8 text-blue-500" />
              <motion.div
                className="absolute inset-0 bg-blue-500/10 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </motion.div>
            <motion.span 
              className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              TidoMeeting
            </motion.span>
          </Link>
        </motion.div>

        {/* RIGHT SIDE - ACTIONS */}
        <SignedIn>
          <motion.div 
            className="flex items-center space-x-4 ml-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <DasboardBtn />
            <ModeToggle />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserButton />
            </motion.div>
          </motion.div>
        </SignedIn>
      </div>
    </motion.nav>
  );
};

export default Navbar;