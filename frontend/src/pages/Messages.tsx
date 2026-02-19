import { MessageCircle } from "lucide-react";

const Messages = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] px-4 pb-20">
      <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-bold text-card-foreground mb-2">No Messages Yet</h2>
      <p className="text-muted-foreground text-center">
        Start a conversation with professionals or clients to see your messages here.
      </p>
    </div>
  );
};

export default Messages;

