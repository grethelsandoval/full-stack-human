import React, { Suspense } from "react";

const DAppRoot = React.lazy(() => import("./DAppRoot"));

export default function LazyDApp() {
  return (
    <Suspense
      fallback={
        <div className="fa-app fa-boot" role="status">
          <img src="/brand/fsh-simbolo-color-dark.svg" alt="" width={96} />
          <span className="fa-sr">Cargando Full Stack Human…</span>
        </div>
      }
    >
      <DAppRoot />
    </Suspense>
  );
}
