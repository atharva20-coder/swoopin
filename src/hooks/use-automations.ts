import { z } from "zod";
import { useMutationData } from "./use-mutation-data";
import { useEffect, useRef, useState } from "react";
import { TRIGGER } from "@/redux/slices/automation";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import useZodForm from "./use-zod-form";

// REST API helpers
async function createAutomations(id?: string) {
  const res = await fetch("/api/v1/automations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

async function deleteAutomations(id: string) {
  const res = await fetch(`/api/v1/automations/${id}`, { method: "DELETE" });
  return res.json();
}

async function deleteKeyword(id: string) {
  const res = await fetch(`/api/v1/automations/keywords/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

async function saveKeyword(automationId: string, keyword: string) {
  const res = await fetch(`/api/v1/automations/${automationId}/keywords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword }),
  });
  return res.json();
}

async function saveListener(
  automationId: string,
  listener: string,
  prompt: string,
  reply: string,
  carouselTemplateId?: string,
) {
  const res = await fetch(`/api/v1/automations/${automationId}/listener`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listener, prompt, reply, carouselTemplateId }),
  });
  return res.json();
}

async function savePosts(
  automationId: string,
  posts: Array<{
    postid: string;
    caption?: string;
    media: string;
    mediaType: string;
  }>,
) {
  const res = await fetch(`/api/v1/automations/${automationId}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ posts }),
  });
  return res.json();
}

async function detachPost(automationId: string, postid: string) {
  const res = await fetch(
    `/api/v1/automations/${automationId}/posts/${encodeURIComponent(postid)}`,
    { method: "DELETE" },
  );
  return res.json();
}

async function saveTrigger(automationId: string, types: string[]) {
  const res = await fetch(`/api/v1/automations/${automationId}/triggers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ types }),
  });
  return res.json();
}

async function updateAutomationName(
  automationId: string,
  data: { name: string },
) {
  const res = await fetch(`/api/v1/automations/${automationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export const useCreateAutomation = (id?: string) => {
  const { isPending, mutate } = useMutationData(
    ["create-automation"],
    () => createAutomations(id),
    "user-automations",
  );

  return { isPending, mutate };
};
export const useDeleteAutomation = (id: string) => {
  const { isPending, mutate } = useMutationData(
    ["delete-automation"],
    () => deleteAutomations(id),
    "user-automations",
  );

  return { isPending, mutate };
};
export const useEditAutomation = (automationId: string) => {
  const [edit, setEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const enableEdit = () => setEdit(true);
  const disableEdit = () => setEdit(false);

  const { isPending, mutate } = useMutationData(
    ["update-automation"],
    (data: { name: string }) =>
      updateAutomationName(automationId, { name: data.name }),
    "automation-info",
    disableEdit,
  );

  useEffect(() => {
    function handleClickOutside(this: Document, event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node | null)
      ) {
        if (inputRef.current.value !== "") {
          mutate({ name: inputRef.current.value });
        } else {
          disableEdit();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mutate]);

  return {
    edit,
    enableEdit,
    disableEdit,
    inputRef,
    isPending,
    mutate,
  };
};

export const useAutomationPosts = (id: string) => {
  const [posts, setPosts] = useState<
    {
      postid: string;
      caption?: string;
      media: string;
      mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    }[]
  >([]);

  const onSelectPost = (post: {
    postid: string;
    caption?: string;
    media: string;
    mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  }) => {
    setPosts((prevItems) => {
      if (prevItems.find((p) => p.postid === post.postid)) {
        return prevItems.filter((item) => item.postid !== post.postid);
      } else {
        return [...prevItems, post];
      }
    });
  };

  const { mutate, isPending } = useMutationData(
    ["attach-posts"],
    () => savePosts(id, posts),
    "automation-info",
    () => setPosts([]),
  );
  return { posts, onSelectPost, mutate, isPending };
};

export const useDetachPost = (automationId: string) => {
  const { mutate, isPending } = useMutationData(
    ["detach-post"],
    (data: { postid: string }) => detachPost(automationId, data.postid),
    "automation-info",
  );
  return { detach: mutate, isDetaching: isPending };
};

export const useTriggers = (id: string) => {
  const types = useAppSelector(
    (state) => state.AutomationReducer.trigger?.types,
  );

  const dispatch: AppDispatch = useDispatch();

  const onSetTrigger = (type: "COMMENT" | "DM") =>
    dispatch(TRIGGER({ trigger: { type } }));

  const { isPending, mutate } = useMutationData(
    ["add-trigger"],
    (data: { types: string[] }) => saveTrigger(id, data.types),
    "automation-info",
  );

  const onSaveTrigger = () => mutate({ types });
  return { types, onSetTrigger, onSaveTrigger, isPending };
};
export const useKeywords = (id: string) => {
  const [keyword, setKeyword] = useState("");
  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setKeyword(e.target.value);

  const { mutate } = useMutationData(
    ["add-keyword"],
    (data: { keyword: string }) => saveKeyword(id, data.keyword),
    "automation-info",
    () => setKeyword(""),
  );

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      mutate({ keyword });
      setKeyword("");
    }
  };

  const { mutate: deleteMutation } = useMutationData(
    ["delete-keyword"],
    (data: { id: string }) => deleteKeyword(data.id),
    "automation-info",
  );

  return { keyword, onValueChange, onKeyPress, deleteMutation };
};

export const useListener = (id: string) => {
  const [listener, setListener] = useState<
    "MESSAGE" | "SMARTAI" | "CAROUSEL" | null
  >(null);

  const promptSchema = z.object({
    prompt: z.string().min(1),
    reply: z.string(),
    carouselTemplateId: z.string().optional(),
  });

  const { isPending, mutate } = useMutationData(
    ["create-lister"],
    (data: { prompt: string; reply: string; carouselTemplateId?: string }) =>
      saveListener(
        id,
        listener || "MESSAGE",
        data.prompt,
        data.reply,
        data.carouselTemplateId,
      ),
    "automation-info",
  );

  const { errors, onFormSubmit, register, reset, watch } = useZodForm(
    promptSchema,
    mutate,
  );

  const onSetListener = (type: "SMARTAI" | "MESSAGE" | "CAROUSEL") =>
    setListener(type);
  return { onSetListener, register, onFormSubmit, listener, isPending };
};
