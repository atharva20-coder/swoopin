import { NextRequest, NextResponse } from "next/server";
import {
  success,
  unauthorized,
  internalError,
  validationError,
} from "@/app/api/v1/_lib";
import { getAuthUser } from "@/app/api/v1/_lib/middleware";
import { rateLimitByUser } from "@/app/api/v1/_lib/rate-limit";
import { client } from "@/lib/prisma";
import { z } from "zod";
import {
  initializeNodeRegistry,
  runWorkflow,
  type FlowNodeRuntime,
  type FlowEdgeRuntime,
  type ExecutionContext,
} from "@/lib/flow-runner";

// =============================================================================
// SCHEMA
// =============================================================================

const TestRunRequestSchema = z.object({
  nodes: z.array(
    z.object({
      nodeId: z.string().min(1),
      type: z.string().min(1),
      subType: z.string().min(1),
      label: z.string().min(1),
      config: z.record(z.unknown()).default({}),
    }),
  ),
  edges: z.array(
    z.object({
      edgeId: z.string().min(1),
      sourceNodeId: z.string().min(1),
      targetNodeId: z.string().min(1),
      sourceHandle: z
        .string()
        .nullish()
        .transform((v) => v ?? null),
      targetHandle: z
        .string()
        .nullish()
        .transform((v) => v ?? null),
    }),
  ),
  triggerType: z.enum(["DM", "COMMENT", "STORY_REPLY", "MENTION"]),
  mockInput: z
    .object({
      messageText: z.string().optional(),
      commentId: z.string().optional(),
      senderId: z.string().optional(),
    })
    .optional(),
});

// =============================================================================
// HANDLER
// =============================================================================

/**
 * POST /api/v1/automations/[id]/test-run
 * Execute flow with ephemeral data (not saved to DB).
 * Used for testing flows before saving.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    // 1. Authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return unauthorized();
    }

    // 2. Await params (Next.js 15)
    const { id: automationId } = await params;

    // 3. Get user from DB
    const user = await client.user.findUnique({
      where: { email: authUser.email },
      include: {
        integrations: {
          where: { name: "INSTAGRAM" },
        },
        subscription: true,
      },
    });

    if (!user) {
      return unauthorized("User not found");
    }

    // 4. Rate limiting (heavy operation)
    const rateLimitResponse = await rateLimitByUser(user.id, "heavy");
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // 5. Validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "Invalid JSON in request body",
          },
        },
        { status: 400 },
      );
    }

    const validation = TestRunRequestSchema.safeParse(body);
    if (!validation.success) {
      return validationError("Invalid request body", {
        details: validation.error.errors,
      });
    }

    const { nodes, edges, triggerType, mockInput } = validation.data;

    // 6. Get Instagram integration for token
    const integration = user.integrations[0];
    if (!integration?.token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_INTEGRATION",
            message: "Instagram not connected",
          },
        },
        { status: 400 },
      );
    }

    // 7. Initialize node registry
    initializeNodeRegistry();

    // 8. Build execution context
    const context: ExecutionContext = {
      automationId,
      userId: user.id,
      token: integration.token,
      pageId: integration.instagramId || "",
      senderId: mockInput?.senderId || "test-sender-id",
      messageText: mockInput?.messageText || "Test message",
      commentId: mockInput?.commentId,
      triggerType,
      userSubscription: user.subscription?.plan,
    };

    // 9. Convert to runtime types
    const runtimeNodes: FlowNodeRuntime[] = nodes.map((n) => ({
      nodeId: n.nodeId,
      type: n.type,
      subType: n.subType,
      label: n.label,
      config: n.config as Record<string, unknown>,
    }));

    const runtimeEdges: FlowEdgeRuntime[] = edges.map((e) => ({
      edgeId: e.edgeId,
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    }));

    // 10. Execute flow
    console.log(`[TestRun] Starting test run for automation ${automationId}`);
    const result = await runWorkflow(runtimeNodes, runtimeEdges, context);

    // 11. Return result with logs
    return success({
      dryRun: false, // Not a dry run, but using mock data
      success: result.success,
      message: result.message,
      executionTimeMs: result.executionTimeMs,
      nodeLogs: result.nodeLogs,
      error: result.error,
    });
  } catch (error: unknown) {
    console.error("POST /api/v1/automations/[id]/test-run error:", error);
    return internalError();
  }
}
