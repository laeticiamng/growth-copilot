import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "@/hooks/useDemoMode";

/**
 * /demo route — Activates demo mode and redirects to dashboard
 */
export default function Demo() {
  const { activateDemo } = useDemoMode();
  const navigate = useNavigate();

  useEffect(() => {
    activateDemo();
    navigate("/dashboard", { replace: true });
  }, [activateDemo, navigate]);

  return null;
}
