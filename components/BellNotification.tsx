"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBranch } from "@/contexts/branch-context";
import { updateNotification } from "@/lib/api";
import { AppDispatch, RootState } from "@/store";
import { fetchNotification } from "@/store/NotificationSlice";
import { Bell, Mail, MailOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface NotificationType {
  title: string;
  description: string;
  status: string;
}

const BellNotification = () => {
  const { currentBranchId } = useBranch();
  const [noti, setNoti] = useState<NotificationType>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { items: notification } = useSelector(
    (state: RootState) => state.notificationReducer
  );

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchNotification(currentBranchId));
  }, [currentBranchId]);

  const handleUpdateStatus = async (id: string) => {
    const res = await updateNotification(id);
    if (res?.status === 201) {
      dispatch(fetchNotification(currentBranchId));
    }
  };

  const stats = {
    unread: notification?.filter((n) => n.status === "unread").length,
    read: notification?.filter((n) => n.status === "read").length,
  };

  return (
    <div className="">
      <Popover>
        <PopoverTrigger className="relative">
          <Bell size={24} className="" />
          {stats.unread && stats?.unread > 0 && (
            <Badge
              className={`absolute top-[-8px] left-[-5px] w-5 h-5 text-[10px] rounded-full flex justify-center items-center bg-red-500 hover:bg-red-500`}
            >
              {stats.unread > 99 && "99+"}
              {stats.unread <= 99 && stats.unread}
            </Badge>
          )}
        </PopoverTrigger>
        <PopoverContent className="p-2 flex flex-col gap-2 min-w-[320px] max-h-[300px] overflow-y-auto">
          {notification && notification?.length > 0 ? (
            notification.map((noti, index) => (
              <Card key={index} className="p-0 border-gray-100">
                <CardContent className="p-2 flex justify-between items-center gap-1">
                  <div className="">
                    <h4 className="text-sm font-semibold">{noti.title}</h4>
                    <p className="text-foreground text-xs">
                      {noti.description.slice(0, 28)}...
                    </p>
                  </div>

                  {noti.status === "read" ? (
                    <Button variant="ghost">
                      <Tooltip>
                        <TooltipTrigger>
                          <MailOpen size={16} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs text-muted-foreground">
                            Already Read
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setDialogOpen(true);
                        setNoti(noti);
                        handleUpdateStatus(noti._id!);
                      }}
                    >
                      <Tooltip>
                        <TooltipTrigger>
                          <Mail size={16} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs text-muted-foreground">
                            Read Notification
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center space-y-5">
              <p className="text-sm text-muted-foreground">
                No Notification found
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="gap-1">
          <h2 className="text-lg font-semibold leading-5">{noti?.title}</h2>
          <p className="text-sm">{noti?.description}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BellNotification;
