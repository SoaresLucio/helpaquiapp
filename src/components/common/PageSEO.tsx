import { Helmet } from "react-helmet-async";

const BASE_URL = "https://helpaquiapp.lovable.app";

export interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  noIndex?: boolean;
  children?: React.ReactNode;
}

export default function PageSEO({
  title,
  description,
  path,
  ogImage,
  ogType = "website",
  noIndex = false,
  children,
}: PageSEOProps) {
  const fullTitle = title.includes("HelpAqui")
    ? title
    : `${title} — HelpAqui`;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content={ogType} />
        {ogImage && <meta property="og:image" content={ogImage} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        {noIndex && <meta name="robots" content="noindex, nofollow" />}
      </Helmet>
      {children}
    </>
  );
}
