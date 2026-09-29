import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import VisitorSignupDialog, { type VisitorFormReason, type VisitorFormValues } from "@/components/VisitorSignupDialog";
import { readVisitorContact, storeVisitorContact } from "@/lib/visitorContact";
import { visitorService, type VisitorProfile } from "@/services/visitorService";
import { toast } from "@/components/ui/use-toast";
import { savedToast } from "@/lib/savedToast";

interface VisitorGateContextType {
  /**
   * Returns the current member or visitor. If there is none, opens the visitor form and
   * resolves with the new visitor once signed in, or null if the form is closed.
   */
  requestVisitor: (reason?: VisitorFormReason) => Promise<User | null>;
  /** Creates (or restores) the visitor from values collected by another form, e.g. the first info request. */
  startVisitor: (values: VisitorFormValues) => Promise<User>;
  visitorProfile: VisitorProfile | null;
  refreshVisitorProfile: () => Promise<void>;
}

const VisitorGateContext = createContext<VisitorGateContextType | undefined>(undefined);

export const useVisitorGate = () => {
  const context = useContext(VisitorGateContext);
  if (!context) throw new Error("useVisitorGate must be used within a VisitorGateProvider");
  return context;
};

export const VisitorGateProvider = ({ children }: { children: ReactNode }) => {
  const { user, visitorUser, loading: authLoading, startVisitorSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<VisitorFormReason>("save");
  const [initialValues, setInitialValues] = useState<VisitorFormValues>(readVisitorContact);
  const [visitorProfile, setVisitorProfile] = useState<VisitorProfile | null>(null);
  const resolverRef = useRef<((user: User | null) => void) | null>(null);

  const refreshVisitorProfile = useCallback(async () => {
    if (!visitorUser) {
      setVisitorProfile(null);
      return;
    }
    try {
      setVisitorProfile(await visitorService.getMine(visitorUser.id));
    } catch (error) {
      console.error("Error loading visitor profile:", error);
    }
  }, [visitorUser]);

  useEffect(() => {
    void refreshVisitorProfile();
  }, [refreshVisitorProfile]);

  const settle = (result: User | null) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
  };

  useEffect(() => {
    if (!user && !visitorUser) return;
    if (open) setOpen(false);
    settle(user ?? visitorUser);
  }, [user, visitorUser, open]);

  const requestVisitor = useCallback(
    (nextReason: VisitorFormReason = "save") => {
      const current = user ?? visitorUser;
      if (current) return Promise.resolve(current);
      if (authLoading) return Promise.resolve(null);
      settle(null);
      setReason(nextReason);
      setInitialValues(readVisitorContact());
      setOpen(true);
      return new Promise<User | null>((resolve) => {
        resolverRef.current = resolve;
      });
    },
    [user, visitorUser, authLoading],
  );

  const startVisitor = async (values: VisitorFormValues) => {
    try {
      const { user: newVisitor, restored } = await startVisitorSession(values);
      storeVisitorContact(values);
      if (restored) {
        savedToast(`Bon retour, ${values.name.trim()} !`, "Vos favoris ont été restaurés.");
      }
      return newVisitor;
    } catch (error) {
      console.error("Visitor sign-in failed:", error);
      const message = error instanceof Error ? error.message : "";
      if (/anonymous sign-ins are disabled/i.test(message)) {
        toast({ variant: "destructive", title: "Indisponible", description: "L'enregistrement invité n'est pas encore activé." });
      }
      throw error;
    }
  };

  const handleSubmit = async (values: VisitorFormValues) => {
    const newVisitor = await startVisitor(values);
    setOpen(false);
    settle(newVisitor);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) settle(null);
  };

  return (
    <VisitorGateContext.Provider value={{ requestVisitor, startVisitor, visitorProfile, refreshVisitorProfile }}>
      {children}
      <VisitorSignupDialog
        open={open && !authLoading && !user && !visitorUser}
        reason={reason}
        initialValues={initialValues}
        onOpenChange={handleOpenChange}
        onSubmit={handleSubmit}
      />
    </VisitorGateContext.Provider>
  );
};
