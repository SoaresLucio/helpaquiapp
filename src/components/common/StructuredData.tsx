import { Helmet } from "react-helmet-async";

interface StructuredDataProps {
  schema: Record<string, any> | Record<string, any>[];
}

export default function StructuredData({ schema }: StructuredDataProps) {
  const schemas = Array.isArray(schema) ? schema : [schema];
  return (
    <Helmet>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify({ "@context": "https://schema.org", ...s })}
        </script>
      ))}
    </Helmet>
  );
}
