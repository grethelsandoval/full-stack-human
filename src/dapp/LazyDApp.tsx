import React, { Suspense } from "react";

const DAppRoot = React.lazy(() => import("./DAppRoot"));

export default function LazyDApp() {
  return (
    <Suspense fallback={<div className="da-boot">Cargando FSH Hub…</div>}>
      <DAppRoot />
    </Suspense>
  );
}
