import { NextRequest } from "next/server";
import { requireAuth } from "@/app/api/v1/_lib/middleware";
import { rateLimitByUser } from "@/app/api/v1/_lib/rate-limit";
import { success, error, validationError } from "@/app/api/v1/_lib/response";
import { flowService } from "@/services/flow.service";
import {
  SaveFlowDataRequestSchema,
  SaveFlowBatchRequestSchema,
  DeleteNodeRequestSchema,
  GetExecutionPathRequestSchema,
} from "@/schemas/flow.schema";

/**
 * GET /api/v1/automations/[id]/flow
 * Get flow data for an automation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
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
        validation.data.triggerType
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "heavy");
    if (rateLimitResponse) return rateLimitResponse;

    const { id: automationId } = await params;
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

      const result = await flowService.saveFlowBatch(
        user.id,
        automationId,
        validation.data
      );

      if ("error" in result) {
        return error("EXTERNAL_API_ERROR", result.error, 400);
      }

      return success(result);
    }

    // Simple save (nodes and edges only)
    const validation = SaveFlowDataRequestSchema.safeParse(body);
    if (!validation.success) {
      return validationError("Invalid request body", {
        details: validation.error.errors,
      });
    }

    const result = await flowService.saveFlowData(
      user.id,
      automationId,
      validation.data.nodes,
      validation.data.edges
    );

    if ("error" in result) {
      return error("EXTERNAL_API_ERROR", result.error, 400);
    }

    return success(result);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();

    const rateLimitResponse = await rateLimitByUser(user.id, "standard");
    if (rateLimitResponse) return rateLimitResponse;

    const { id: automationId } = await params;
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
      validation.data.nodeId
    );

    if ("error" in result) {
      return error("EXTERNAL_API_ERROR", result.error, 400);
    }

    return success(result);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return error("UNAUTHORIZED", "Authentication required", 401);
    }
    console.error("Flow DELETE error:", err);
    return error("INTERNAL_ERROR", "Failed to delete node", 500);
  }
}
