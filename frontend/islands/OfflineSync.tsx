// Ganti fungsi queueMutation
export async function queueMutation(endpoint: string, method: string, body: any) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const idempotency_key = `${method}:${endpoint}:${Date.now()}:${Math.random()}`;
  
  await tx.objectStore(STORE).add({ 
    id: crypto.randomUUID(), 
    endpoint, 
    method, 
    body, 
    ts: Date.now(), 
    status: "pending", 
    retry: 0,
    idempotency_key 
  });
  tx.commit();
}

// Ganti fungsi syncPending
export async function syncPending() {
  if (!navigator.onLine) return;
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const req = store.getAll();
  
  req.onsuccess = async () => {
    const pending = req.result.filter((r: any) => r.status === "pending");
    if (pending.length === 0) return;
    
    try {
      const res = await fetch("http://localhost:3000/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending),
      });
      
      if (res.ok) {
        const { results } = await res.json();
        for (const result of results) {
          const record = pending.find((r: any) => r.id === result.id);
          if (record) {
            if (result.status === "success" || result.status === "skipped") {
              store.delete(record.id);
            } else {
              record.retry = (record.retry || 0) + 1;
              if (record.retry >= 3) record.status = "failed";
              store.put(record);
            }
          }
        }
      }
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };
  
  tx.commit();
}