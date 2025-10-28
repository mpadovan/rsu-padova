import type { ButtonHTMLAttributes } from "react";

export type VoteDirection = "up" | "down";

type Props = {
  direction: VoteDirection;
  onVote: () => void;
  disabled?: boolean;
  loading?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

const labels: Record<VoteDirection, string> = {
  up: "Upvote",
  down: "Downvote"
};

const symbols: Record<VoteDirection, string> = {
  up: "⬆",
  down: "⬇"
};

export function VoteButton({ direction, onVote, disabled, loading, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={labels[direction]}
      onClick={onVote}
      disabled={disabled || loading}
      className={`flex items-center gap-2 rounded-md border border-slate-500 px-3 py-1 text-sm font-medium transition hover:border-brand-secondary hover:text-brand-secondary disabled:cursor-not-allowed disabled:opacity-50`}
      {...rest}
    >
      <span aria-hidden>{symbols[direction]}</span>
      {labels[direction]}
    </button>
  );
}
