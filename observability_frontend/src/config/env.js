 // PUBLIC_INTERFACE
 export function getEnv() {
   /**
    * Returns environment variables required by the app.
    * - REACT_APP_WS_URL: Base WebSocket URL (e.g., wss://example.com/ws). If missing, a warning is logged.
    * - REACT_APP_USE_MOCKS: "true" or "false" to enable mock/no-op behavior for services like WebSocket.
    *
    * Note: Values are read from process.env as provided by the React build environment.
    */
   const WS_URL = process.env.REACT_APP_WS_URL || "";
   const USE_MOCKS = String(process.env.REACT_APP_USE_MOCKS || "").toLowerCase() === "true";

   if (!WS_URL && !USE_MOCKS) {
     // eslint-disable-next-line no-console
     console.warn(
       "[env] REACT_APP_WS_URL is not set; WebSocket client will not be able to connect unless mocks are enabled."
     );
   }

   return {
     WS_URL,
     USE_MOCKS,
   };
 }

 // PUBLIC_INTERFACE
 export const ENV = getEnv();
 /** This is a public object for convenient named imports. */
