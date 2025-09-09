import { useEffect } from "react";
import { useRouter } from "next/router";

export default function HomeContent() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      fontSize: "18px",
      color: "#6b7280"
    }}>
      Redirecting to Dashboard...
    </div>
  );
}
