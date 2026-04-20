/** @jsxImportSource preact */
import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx";
import DashboardContent from "../islands/DashboardContent.tsx";

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard - KSP ERP</title>
      </Head>
      
      <Layout>
        <DashboardContent />
      </Layout>
    </>
  );
}