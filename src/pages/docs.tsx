import dynamic from "next/dynamic";
import type { GetServerSideProps } from "next";
import openapiSpec from "../lib/openapiSpec";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function DocsPage({ spec }: { spec: any }) {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>API Docs</h1>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 6 }}>
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { spec: openapiSpec } };
};