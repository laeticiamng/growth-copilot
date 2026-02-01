import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

interface ActionButtonProps extends ButtonProps {
  tooltip?: string;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

/**
 * ActionButton - Button with optional tooltip and loading state
 * Use for actions that benefit from additional context
 */
export function ActionButton({
  tooltip,
  loading = false,
  loadingText,
  icon,
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  const buttonContent = (
    <Button disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );

  if (!tooltip) {
    return buttonContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {buttonContent}
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface IconActionButtonProps extends Omit<ButtonProps, 'children'> {
  tooltip: string;
  icon: React.ReactNode;
  loading?: boolean;
}

/**
 * IconActionButton - Icon-only button with required tooltip for accessibility
 */
export function IconActionButton({
  tooltip,
  icon,
  loading = false,
  disabled,
  ...props
}: IconActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled || loading}
          aria-label={tooltip}
          {...props}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface ConfirmActionButtonProps extends ActionButtonProps {
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
}

/**
 * ConfirmActionButton - Button that requires confirmation before action
 * Use for destructive or irreversible actions
 */
export function ConfirmActionButton({
  onConfirm,
  confirmText = "Confirmer ?",
  tooltip,
  loading,
  children,
  ...props
}: ConfirmActionButtonProps) {
  const [confirming, setConfirming] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    if (!confirming) {
      setConfirming(true);
      timeoutRef.current = setTimeout(() => setConfirming(false), 3000);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setConfirming(false);
    await onConfirm();
  };

  const buttonContent = (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={confirming ? "destructive" : props.variant}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : null}
      {confirming ? confirmText : children}
    </Button>
  );

  if (!tooltip) {
    return buttonContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {buttonContent}
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
