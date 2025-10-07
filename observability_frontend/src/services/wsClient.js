 /**
  * WebSocket Client Service
  *
  * Features:
  * - Exponential backoff reconnect with jitter and cap
  * - Heartbeat/ping support (client-initiated ping frames via keepalive messages)
  * - Channel-based subscribe/unsubscribe API with per-channel handler sets
  * - Simple event-emitter-like interface for "open", "close", "error", "message"
  * - Reads base URL from REACT_APP_WS_URL via src/config/env.js
  * - Honors REACT_APP_USE_MOCKS: when true, connect() is a no-op and emits mock-open
  *
  * Public API:
  * - connect()
  * - disconnect()
  * - subscribe(channel, handler)
  * - unsubscribe(channel, handler)
  * - on(event, handler)
  * - off(event, handler)
  *
  * Channel message format expectation:
  * - Incoming messages should be JSON: { channel: string, event?: string, data?: any }
  * - Dispatching is based on the "channel" field; handlers receive (payload, rawEvent)
  *
  * Implementation notes:
  * - No external dependencies; suitable for React or vanilla usage.
  */

 import { ENV } from "../config/env";

 // Internal constants
 const DEFAULT_RECONNECT_BASE_DELAY_MS = 500; // initial backoff base
 const DEFAULT_RECONNECT_MAX_DELAY_MS = 15000; // cap on backoff
 const DEFAULT_HEARTBEAT_INTERVAL_MS = 25000; // ping every 25s if connection is open
 const DEFAULT_HEARTBEAT_PAYLOAD = { type: "ping", ts: 0 }; // ts populated at send time

 // Simple EventEmitter-like utility without dependencies
 class TinyEmitter {
   constructor() {
     this.handlers = new Map(); // event -> Set<fn>
   }
   // PUBLIC_INTERFACE
   on(event, handler) {
     /** Register a handler for the given event name. */
     if (!this.handlers.has(event)) this.handlers.set(event, new Set());
     this.handlers.get(event).add(handler);
     return () => this.off(event, handler);
   }
   // PUBLIC_INTERFACE
   off(event, handler) {
     /** Remove a specific handler for the given event name. */
     const set = this.handlers.get(event);
     if (set) {
       set.delete(handler);
       if (set.size === 0) this.handlers.delete(event);
     }
   }
   emit(event, ...args) {
     const set = this.handlers.get(event);
     if (set && set.size) {
       for (const fn of Array.from(set)) {
         try {
           fn(...args);
         } catch (err) {
           // eslint-disable-next-line no-console
           console.error("[wsClient] Error in event handler:", err);
         }
       }
     }
   }
 }

 // WebSocket Client
 class WSClient {
   constructor() {
     this.ws = null;
     this.connected = false;
     this.manualClose = false;

     this.emitter = new TinyEmitter();

     // channel -> Set<handler>
     this.subscriptions = new Map();

     // reconnect control
     this.reconnectAttempts = 0;
     this.reconnectTimer = null;

     // heartbeat control
     this.heartbeatTimer = null;

     // config
     this.baseUrl = ENV.WS_URL || "";
     this.useMocks = ENV.USE_MOCKS;
     this.reconnectBaseDelay = DEFAULT_RECONNECT_BASE_DELAY_MS;
     this.reconnectMaxDelay = DEFAULT_RECONNECT_MAX_DELAY_MS;
     this.heartbeatInterval = DEFAULT_HEARTBEAT_INTERVAL_MS;
   }

   // PUBLIC_INTERFACE
   connect() {
     /**
      * Establish a WebSocket connection unless mocks are enabled.
      * When mocks are enabled, acts as a no-op and emits an "open" event to simulate connectivity.
      */
     this.manualClose = false;

     if (this.useMocks) {
       // eslint-disable-next-line no-console
       console.info("[wsClient] Mocks enabled: skipping real WebSocket connection.");
       // Simulate async open
       setTimeout(() => {
         this.connected = true;
         this.emitter.emit("open");
       }, 0);
       return;
     }

     if (!this.baseUrl) {
       // eslint-disable-next-line no-console
       console.warn("[wsClient] REACT_APP_WS_URL not configured; cannot connect.");
       return;
     }

     // If already connected or connecting, ignore
     if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
       return;
     }

     try {
       this.ws = new WebSocket(this.baseUrl);
     } catch (err) {
       // eslint-disable-next-line no-console
       console.error("[wsClient] Failed to create WebSocket:", err);
       this.scheduleReconnect();
       return;
     }

     this.ws.addEventListener("open", this.handleOpen);
     this.ws.addEventListener("message", this.handleMessage);
     this.ws.addEventListener("close", this.handleClose);
     this.ws.addEventListener("error", this.handleError);
   }

   // PUBLIC_INTERFACE
   disconnect() {
     /**
      * Close the WebSocket connection and stop reconnection attempts and heartbeats.
      */
     this.manualClose = true;
     this.clearReconnectTimer();
     this.clearHeartbeat();

     if (this.useMocks) {
       if (this.connected) {
         this.connected = false;
         this.emitter.emit("close", { code: 1000, reason: "mock disconnect" });
       }
       return;
     }

     if (this.ws) {
       try {
         this.ws.close(1000, "client disconnect");
       } catch (err) {
         // ignore
       }
     }
     this.ws = null;
     this.connected = false;
   }

   // PUBLIC_INTERFACE
   subscribe(channel, handler) {
     /**
      * Subscribe a handler to a channel; handler will receive (payload, rawEvent).
      */
     if (!channel || typeof handler !== "function") return () => {};
     if (!this.subscriptions.has(channel)) {
       this.subscriptions.set(channel, new Set());
     }
     const set = this.subscriptions.get(channel);
     set.add(handler);

     // Return unsubscribe function
     return () => this.unsubscribe(channel, handler);
   }

   // PUBLIC_INTERFACE
   unsubscribe(channel, handler) {
     /**
      * Unsubscribe a handler from a channel.
      */
     const set = this.subscriptions.get(channel);
     if (!set) return;
     set.delete(handler);
     if (set.size === 0) {
       this.subscriptions.delete(channel);
     }
   }

   // PUBLIC_INTERFACE
   on(event, handler) {
     /**
      * Attach a global event handler: events are "open", "close", "error", "message".
      */
     return this.emitter.on(event, handler);
   }

   // PUBLIC_INTERFACE
   off(event, handler) {
     /**
      * Remove global event handler.
      */
     return this.emitter.off(event, handler);
   }

   // Event handlers must be bound to preserve "this"
   handleOpen = () => {
     this.connected = true;
     this.reconnectAttempts = 0;
     this.emitter.emit("open");
     this.startHeartbeat();

     // Optionally, send any initial subscription handshake if backend expects it.
     // This client assumes server will broadcast filtered channels or we handle client-side filtering only.
   };

   handleMessage = (event) => {
     this.emitter.emit("message", event);

     let payload;
     try {
       payload = JSON.parse(event.data);
     } catch (e) {
       // Not JSON; skip channel dispatch but still allow global message handlers to see it
       return;
     }

     // Channel-based dispatch
     const channel = payload && payload.channel;
     if (channel && this.subscriptions.has(channel)) {
       const handlers = this.subscriptions.get(channel);
       for (const fn of Array.from(handlers)) {
         try {
           fn(payload, event);
         } catch (err) {
           // eslint-disable-next-line no-console
           console.error("[wsClient] Error in channel handler:", err);
         }
       }
     }
   };

   handleClose = (event) => {
     this.connected = false;
     this.clearHeartbeat();
     this.emitter.emit("close", event);

     // Clean up listeners on the socket instance
     this.detachSocketListeners();

     if (!this.manualClose) {
       this.scheduleReconnect();
     }
   };

   handleError = (event) => {
     this.emitter.emit("error", event);
     // Errors often precede close; let close handler schedule reconnect.
   };

   detachSocketListeners() {
     if (!this.ws) return;
     this.ws.removeEventListener("open", this.handleOpen);
     this.ws.removeEventListener("message", this.handleMessage);
     this.ws.removeEventListener("close", this.handleClose);
     this.ws.removeEventListener("error", this.handleError);
     // Do not null ws here; close handler or disconnect will manage ws lifecycle
   }

   // Reconnect logic with capped exponential backoff and jitter
   scheduleReconnect() {
     if (this.useMocks) return; // no reconnects in mock mode
     if (this.manualClose) return; // don't reconnect if manually closed

     this.clearReconnectTimer();

     this.reconnectAttempts += 1;
     const expBackoff = Math.min(
       this.reconnectMaxDelay,
       this.reconnectBaseDelay * Math.pow(2, this.reconnectAttempts - 1)
     );
     const jitter = Math.random() * this.reconnectBaseDelay; // add up to baseDelay jitter
     const delay = Math.floor(expBackoff + jitter);

     // eslint-disable-next-line no-console
     console.info(`[wsClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

     this.reconnectTimer = setTimeout(() => {
       this.connect();
     }, delay);
   }

   clearReconnectTimer() {
     if (this.reconnectTimer) {
       clearTimeout(this.reconnectTimer);
       this.reconnectTimer = null;
     }
   }

   // Heartbeat: send a lightweight ping payload on an interval if socket is open
   startHeartbeat() {
     this.clearHeartbeat();
     if (this.useMocks) return;
     this.heartbeatTimer = setInterval(() => {
       if (this.ws && this.ws.readyState === WebSocket.OPEN) {
         const payload = { ...DEFAULT_HEARTBEAT_PAYLOAD, ts: Date.now() };
         try {
           this.ws.send(JSON.stringify(payload));
         } catch (err) {
           // eslint-disable-next-line no-console
           console.warn("[wsClient] Failed to send heartbeat:", err);
         }
       }
     }, this.heartbeatInterval);
   }

   clearHeartbeat() {
     if (this.heartbeatTimer) {
       clearInterval(this.heartbeatTimer);
       this.heartbeatTimer = null;
     }
   }
 }

 // Create a singleton instance for app-wide use
 const client = new WSClient();

 // PUBLIC_INTERFACE
 export function connect() {
   /** Connect the singleton WebSocket client. */
   client.connect();
   return client;
 }

 // PUBLIC_INTERFACE
 export function disconnect() {
   /** Disconnect the singleton WebSocket client. */
   client.disconnect();
 }

 // PUBLIC_INTERFACE
 export function subscribe(channel, handler) {
   /**
    * Subscribe to messages for a specific channel.
    * Returns an unsubscribe function.
    */
   return client.subscribe(channel, handler);
 }

 // PUBLIC_INTERFACE
 export function unsubscribe(channel, handler) {
   /** Unsubscribe a previously registered handler for a channel. */
   return client.unsubscribe(channel, handler);
 }

 // PUBLIC_INTERFACE
 export function on(event, handler) {
   /** Attach a global event handler for "open", "close", "error", or "message". */
   return client.on(event, handler);
 }

 // PUBLIC_INTERFACE
 export function off(event, handler) {
   /** Remove a global event handler. */
   return client.off(event, handler);
 }

 // PUBLIC_INTERFACE
 export function getClient() {
   /** Get the underlying client instance for advanced usage or status inspection. */
   return client;
 }

 // Provide a default export object aggregator for convenience imports.
 const wsClient = {
   connect,
   disconnect,
   subscribe,
   unsubscribe,
   on,
   off,
   getClient,
 };

 export default wsClient;
