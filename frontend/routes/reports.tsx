/** @jsxImportSource preact */
import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx";
import ReportsContent from "../islands/ReportsContent.tsx";

export default function ReportsPage() {
  return (
    <>
      <Head>
        <title>KSP ERP - Laporan</title>
      </Head>
      
      <Layout>
        <ReportsContent />
      </Layout>
    </>
  );
}