import React from "react";

export function Button2(props: {
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      className={props.className}
      onClick={() => props.onClick?.()}
      style={{ background: `linear-gradient(90deg, #f4fc 0%, #f4fe 100%)` }}
    >
      {props.children}
    </button>
  );
}
