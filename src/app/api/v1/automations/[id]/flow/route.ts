import { NextRequest } from "next/server";
import { requireAuth } from "@/app/api/v1/_lib/middleware";
import { rateLimitByUserWithPlan } from "@/app/api/v1/_lib/rate-limit";
import { success, error, validationError } from "@/app/api/v1/_lib/response";
import { flowService } from "@/services/flow.service";
import { automationService } from "@/services/automation.service";
import { client } from "@/lib/prisma";
import { canPerformAction } from "@/lib/access-control";
import {
  SaveFlowDataRequestSchema,
  SaveFlowBatchRequestSchema,
  DeleteNodeRequestSchema,
  GetExecutionPathRequestSchema,
} from "@/schemas/flow.schema";
import {
  validateFlow,
  type FlowNodeRuntime,
  type FlowEdgeRuntime,
  type PlanType,
} from "@/lib/flow-runner";
import type { SUBSCRIPTION_PLAN } from "@prisma/client";

/**
 * Helper: fetch user subscription plan from DB
 */
async function getUserPlan(userId: string): Promise<SUBSCRIPTION_PLAN> {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { subscription: { select: { plan: true } } },
  });
  return (user?.subscription?.plan ?? "FREE") as SUBSCRIPTION_PLAN;
}

/**
 * GET /api/v1/automations/[id]/flow
 * Get flow data for an automation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();

    // Tier-aware rate limiting
    const plan = await getUserPlan(user.id);
    const rateLimitResponse = await rateLimitByUserWithPlan(
      user.id,
      plan,
      "standard",
    );
    if (rateLimitResponse) return rateLimitResponse;

    const { id: automationId } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Get execution path
    if (action === "execution-path") {
      const validation = GetExecutionPathRequestSchema.safeParse({
        triggerType: searchParams.get("triggerType"),
      });

      if (!validation.success) {
        return validationError("Invalid request parameters", {
          details: validation.error.errors,
        });
      }

      const result = await flowService.getFlowExecutionPath(
        automationId,
        validation.data.triggerType,
      );

      if ("error" in result) {
        return error("NOT_FOUND", result.error, 404);
      }

      return success(result);
    }

    // Default: Get flow data
    const result = await flowService.getFlowData(user.id, automationId);

    if ("error" in result) {
      return error("NOT_FOUND", result.error, 404);
    }

    return success(result);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Flow GET error:", err);
    return error("INTERNAL_ERROR", "Failed to get flow data", 500);
  }
}

/**
 * POST /api/v1/automations/[id]/flow
 * Save flow data (simple or batch)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();

    // Tier-aware rate limiting
    const plan = await getUserPlan(user.id);
    const rateLimitResponse = await rateLimitByUserWithPlan(
      user.id,
      plan,
      "heavy",
    );
    if (rateLimitResponse) return rateLimitResponse;

    const { id: automationId } = await params;

    // Edit limit guard
    const editCheck = await canPerformAction(
      user.id,
      "edit_automation",
      automationId,
    );
    if (!editCheck.allowed) {
      return error(
        "FORBIDDEN",
        editCheck.reason ?? "Edit limit reached. Upgrade your plan.",
        403,
      );
    }

    const body = await request.json();
    const action = body.action;

    // Batch save (nodes, edges, triggers, keywords, listener)
    if (action === "batch") {
      const validation = SaveFlowBatchRequestSchema.safeParse(body);
      if (!validation.success) {
        return validationError("Invalid request body", {
          details: validation.error.errors,
        });
      }

      // Convert nodes to runtime format for validation
      const runtimeNodes: FlowNodeRuntime[] = (validation.data.nodes || []).map(
        (n) => ({
          nodeId: n.nodeId,
          type: n.type,
          subType: n.subType,
          label: n.label,
          config: (n.config as Record<string, unknown>) || {},
        }),
      );

      const runtimeEdges: FlowEdgeRuntime[] = (validation.data.edges || []).map(
        (e) => ({
          edgeId: e.edgeId,
          sourceNodeId: e.sourceNodeId,
          targetNodeId: e.targetNodeId,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        }),
      );

      // Validate flow structure
      const flowValidation = validateFlow(
        runtimeNodes,
        runtimeEdges,
        plan as PlanType,
      );

      const result = await flowService.saveFlowBatch(
        user.id,
        automationId,
        validation.data,
      );

      if ("error" in result) {
        return error("EXTERNAL_API_ERROR", result.error, 400);
      }

      // Track edit
      await automationService.incrementEditCount(automationId, user.id);

      // Return result with validation warnings/errors
      return success({
        ...result,
        validation: {
          valid: flowValidation.valid,
          errors: flowValidation.errors,
          warnings: flowValidation.warnings,
        },
      });
    }

    // Simple save (nodes and edges only)
    const validation = SaveFlowDataRequestSchema.safeParse(body);
    if (!validation.success) {
      return validationError("Invalid request body", {
        details: validation.error.errors,
      });
    }

    // Convert to runtime format for validation
    const runtimeNodes: FlowNodeRuntime[] = validation.data.nodes.map((n) => ({
      nodeId: n.nodeId,
      type: n.type,
      subType: n.subType,
      label: n.label,
      config: (n.config as Record<string, unknown>) || {},
    }));

    const runtimeEdges: FlowEdgeRuntime[] = validation.data.edges.map((e) => ({
      edgeId: e.edgeId,
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    }));

    // Validate flow structure (Zero-Patchwork: validate at gateway)
    const flowValidation = validateFlow(
      runtimeNodes,
      runtimeEdges,
      plan as PlanType,
    );

    // Save the flow (allow save with warnings - flexible approach)
    const result = await flowService.saveFlowData(
      user.id,
      automationId,
      validation.data.nodes,
      validation.data.edges,
    );

    if ("error" in result) {
      return error("EXTERNAL_API_ERROR", result.error, 400);
    }

    // Track edit
    await automationService.incrementEditCount(automationId, user.id);

    // Return result with validation warnings/errors
    return success({
      ...result,
      validation: {
        valid: flowValidation.valid,
        errors: flowValidation.errors,
        warnings: flowValidation.warnings,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Flow POST error:", err);
    return error("INTERNAL_ERROR", "Failed to save flow data", 500);
  }
}

/**
 * DELETE /api/v1/automations/[id]/flow
 * Delete a flow node
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();

    // Tier-aware rate limiting
    const plan = await getUserPlan(user.id);
    const rateLimitResponse = await rateLimitByUserWithPlan(
      user.id,
      plan,
      "standard",
    );
    if (rateLimitResponse) return rateLimitResponse;

    const { id: automationId } = await params;

    // Edit limit guard (deleting a node is an edit)
    const editCheck = await canPerformAction(
      user.id,
      "edit_automation",
      automationId,
    );
    if (!editCheck.allowed) {
      return error(
        "FORBIDDEN",
        editCheck.reason ?? "Edit limit reached. Upgrade your plan.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);

    const validation = DeleteNodeRequestSchema.safeParse({
      nodeId: searchParams.get("nodeId"),
    });

    if (!validation.success) {
      return validationError("Invalid request parameters", {
        details: validation.error.errors,
      });
    }

    const result = await flowService.deleteFlowNode(
      user.id,
      automationId,
      validation.data.nodeId,
    );

    if ("error" in result) {
      return error("EXTERNAL_API_ERROR", result.error, 400);
    }

    // Track edit
    await automationService.incrementEditCount(automationId, user.id);

    return success(result);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Flow DELETE error:", err);
    return error("INTERNAL_ERROR", "Failed to delete node", 500);
  }
}
