import {
  FaXTwitter,
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

const SOCIAL_CONFIG: {
  key: string;
  label: string;
  Icon: IconType;
  color: string;
}[] = [
  { key: "twitter", label: "X / Twitter", Icon: FaXTwitter, color: "hover:border-zinc-400/60 hover:text-white" },
  { key: "youtube", label: "YouTube", Icon: FaYoutube, color: "hover:border-red-500/50 hover:text-red-400" },
  { key: "instagram", label: "Instagram", Icon: FaInstagram, color: "hover:border-pink-500/50 hover:text-pink-400" },
  { key: "facebook", label: "Facebook", Icon: FaFacebook, color: "hover:border-blue-500/50 hover:text-blue-400" },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedin, color: "hover:border-sky-500/50 hover:text-sky-400" },
];

type SocialProps = {
  socialTwitter: string | null;
  socialYoutube: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialLinkedin: string | null;
};

function getItems(social: SocialProps) {
  const hrefs: Record<string, string | null> = {
    twitter: social.socialTwitter,
    youtube: social.socialYoutube,
    instagram: social.socialInstagram,
    facebook: social.socialFacebook,
    linkedin: social.socialLinkedin,
  };
  return SOCIAL_CONFIG.filter((c) => hrefs[c.key]?.trim()).map((c) => ({
    ...c,
    href: hrefs[c.key]!,
  }));
}

export function ArticleSocialFooter(
  props: SocialProps & { className?: string },
) {
  const links = getItems(props);
  if (links.length === 0) return null;

  return (
    <footer
      className={`mt-12 border-t border-white/10 pt-8 ${props.className ?? ""}`}
    >
      <p className="mb-4 text-sm font-medium tracking-wide text-zinc-400 uppercase">
        Connect
      </p>
      <ul className="flex flex-wrap gap-3">
        {links.map((l) => (
          <li key={l.key}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition-all duration-150 ${l.color} hover:bg-white/8`}
            >
              <l.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
