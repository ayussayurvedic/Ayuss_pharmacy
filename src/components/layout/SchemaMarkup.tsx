import React from 'react';

interface SchemaMarkupProps {
  schema: Record<string, unknown>;
}

export default function SchemaMarkup({ schema }: SchemaMarkupProps) {
  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
}
