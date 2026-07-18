"use client";
import { initials } from "../lib/authors";

export default function AuthorAvatar({ author, className = "" }) {
  return (
    <div className={`avatar avatar-${author.id} ${className}`}>
      <img
        src={author.avatar}
        alt={author.name}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      <span className="avatar-fallback">{initials(author.name)}</span>
    </div>
  );
}
