/** Ambient shims so the IDE can typecheck Edge Functions without Deno LSP. */

declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
  ): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  // Minimal surface used by our functions — full client types live in Deno/esm.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function createClient(url: string, key: string, options?: Record<string, unknown>): any;
}
