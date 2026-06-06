"use client";

import { useState, useCallback } from "react";
import { useGutCheckStore } from "@/store/gutcheck.store";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import { offlineQuickCheck, withAllergyAvoids } from "@/lib/offline/fallback-tree";
import { toast } from "@/store/ui.store";
import type { GroceryAuditResult, GroceryItem } from "@/types";

async function messageForBadResponse(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  if (res.status === 429) {
    return body?.error ?? "You are auditing very fast — please wait a moment and try again.";
  }
  return body?.error ?? fallback;
}

type GroceryState =
  | { status: "idle" }
  | { status: "scanning"; discovered: number }
  | { status: "complete"; result: GroceryAuditResult }
  | { status: "error"; message: string };

export function useGroceryScan() {
  const [state, setState] = useState<GroceryState>({ status: "idle" });
  const healthProfile = useGutCheckStore((s) => s.healthProfile);
  const addGroceryResult = useGutCheckStore((s) => s.addGroceryResult);
  const dietaryPreferences = useGutCheckStore((s) => s.dietaryPreferences);
  const allergies = useGutCheckStore((s) => s.allergies);
  const { isOnline } = useOfflineDetection();

  const audit = useCallback(
    async (groceryList: string) => {
      if (!healthProfile) {
        setState({
          status: "error",
          message: "Please upload your blood report first.",
        });
        return;
      }

      setState({ status: "scanning", discovered: 0 });

      if (!isOnline) {
        const tree = withAllergyAvoids(healthProfile.offlineFallbackTree, allergies);
        const lines = groceryList
          .split("\n")
          .filter((l) => l.trim().length > 0);

        const reduced = lines.reduce(
          (acc, line) => {
            const check = offlineQuickCheck(line, tree);

            if (check.classification === "PRIORITIZE") acc.greatCount++;
            else if (check.classification === "MODERATE") acc.moderateCount++;
            else if (check.classification === "AVOID") acc.reconsiderCount++;

            acc.items.push({
              name: line.trim(),
              classification: check.classification,
              reason: check.primaryReason,
              hiddenIngredients: [],
              swap: null,
            });

            return acc;
          },
          {
            items: [] as GroceryItem[],
            greatCount: 0,
            moderateCount: 0,
            reconsiderCount: 0,
          },
        );

        const result: GroceryAuditResult = {
          items: reduced.items,
          summary:
            "You are offline — results based on your cached profile keyword matching.",
          overallGuidance: "",
          greatCount: reduced.greatCount,
          moderateCount: reduced.moderateCount,
          reconsiderCount: reduced.reconsiderCount,
          timestamp: new Date().toISOString(),
        };

        addGroceryResult(result);
        setState({ status: "complete", result });
        return;
      }

      try {
        const res = await fetch("/api/agents/scan-grocery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groceryList,
            profileJson: JSON.stringify({
              ...healthProfile.consolidatedRules,
              ...(dietaryPreferences.length ? { dietaryPreferences } : {}),
              ...(allergies.length ? { allergies } : {}),
            }),
          }),
        });

        if (!res.body) throw new Error("No response body");
        if (!res.ok) throw new Error(await messageForBadResponse(res, "Audit failed. Please try again."));
        const result = await consumeSSEStream<GroceryAuditResult>(res, (count) =>
          setState((cur) => (cur.status === "scanning" ? { status: "scanning", discovered: count } : cur)),
        );

        if (!result) throw new Error("No result returned");

        addGroceryResult(result);
        setState({ status: "complete", result });
      } catch (err) {
        const message = (err as Error).message ?? "Audit failed.";
        setState({ status: "error", message });
        toast.error(message);
      }
    },
    [healthProfile, isOnline, addGroceryResult, dietaryPreferences, allergies],
  );

  return { state, audit, reset: () => setState({ status: "idle" }) };
}

async function consumeSSEStream<T>(
  res: Response,
  onCount?: (discovered: number) => void,
): Promise<T | null> {
  if (!res.body) return null;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result: T | null = null;
  let buffer = "";
  let streamed = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
          if (typeof payload.chunk === "string" && onCount) {
            streamed += payload.chunk;
            const matches = streamed.match(/"name"\s*:/g);
            if (matches) onCount(matches.length);
          }
          if (payload.done && payload.result) result = payload.result as T;
          if (payload.error) throw new Error(payload.error as string);
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return result;
}
