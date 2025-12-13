import { findAutomation } from "@/actions/automations/queries";
import {
  createChatHistory,
  getChatHistory,
  getKeywordAutomation,
  getKeywordPost,
  matchKeyword,
  trackResponses,
  getCarouselAutomation,
} from "@/actions/webhook/queries";
import { sendDM, sendPrivateMessage, replyToComment, sendCarouselMessage } from "@/lib/fetch";
import { openai } from "@/lib/openai";
import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { trackAnalytics } from "@/actions/analytics";
import { OpenAI } from "openai";
import { executeFlow, hasFlowNodes } from "@/lib/flow-executor";

export async function GET(req: NextRequest) {
  const hub = req.nextUrl.searchParams.get("hub.challenge");
  return new NextResponse(hub);
}

export async function POST(req: NextRequest) {
  const webhook_payload = await req.json();
  let matcher;
  console.log("api hit");
  try {
    if (webhook_payload.entry[0].messaging) {
      matcher = await matchKeyword(
        webhook_payload.entry[0].messaging[0].message.text,
        "DM"
      );
    }

    if (webhook_payload.entry[0].changes) {
      matcher = await matchKeyword(
        webhook_payload.entry[0].changes[0].value.text,
        "COMMENT"
      );
    }

    if (matcher && matcher.automationId) {
      console.log("Matched", webhook_payload.entry[0]);

      // Check if automation uses flow-based execution
      const useFlowExecution = await hasFlowNodes(matcher.automationId);
      
      if (useFlowExecution) {
        console.log("Using flow-based execution for automation:", matcher.automationId);
        
        // Get automation for user context
        const automation = await getKeywordAutomation(matcher.automationId, true);
        if (!automation || !automation.active) {
          return NextResponse.json({ message: "Automation inactive" }, { status: 200 });
        }

        const isMessage = !!webhook_payload.entry[0].messaging;
        const isComment = !!webhook_payload.entry[0].changes?.find(
          (c: any) => c.field === "comments"
        );

        // Check post attachment for comments
        if (isComment) {
          const mediaId = webhook_payload.entry[0].changes[0].value.media?.id;
          if (mediaId) {
            const postMatch = await getKeywordPost(mediaId, automation.id);
            if (!postMatch) {
              return NextResponse.json({ message: "Post not attached to automation" }, { status: 200 });
            }
          }
        }

        const context = {
          automationId: matcher.automationId,
          userId: automation.userId!,
          token: automation.User?.integrations[0].token!,
          pageId: webhook_payload.entry[0].id,
          senderId: isMessage
            ? webhook_payload.entry[0].messaging[0].sender.id
            : webhook_payload.entry[0].changes[0].value.from.id,
          messageText: isMessage
            ? webhook_payload.entry[0].messaging[0].message.text
            : webhook_payload.entry[0].changes[0].value.text,
          commentId: isComment ? webhook_payload.entry[0].changes[0].value.id : undefined,
          mediaId: isComment ? webhook_payload.entry[0].changes[0].value.media?.id : undefined,
          triggerType: (isMessage ? "DM" : "COMMENT") as "DM" | "COMMENT",
          userSubscription: automation.User?.subscription?.plan,
          userOpenAiKey: automation.User?.openAiKey || undefined,
        };

        const flowResult = await executeFlow(matcher.automationId, context);
        console.log("Flow execution result:", flowResult);

        return NextResponse.json(
          { message: flowResult.message },
          { status: flowResult.success ? 200 : 200 }
        );
      }

      // Legacy execution (for automations without flow nodes)
      if (webhook_payload.entry[0].messaging) {
        const automation = await getKeywordAutomation(
          matcher.automationId,
          true
        );
        console.log("Message", automation);

        if (automation && automation.trigger && automation.active) {
          if (
            automation.listener &&
            automation.listener.listener === "MESSAGE" &&
            (!automation.listener.carouselTemplate || automation.listener.carouselTemplate.elements.length === 0)
          ) {
            console.log("MESSAGE", automation);

            const direct_message = await sendDM(
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              automation.listener?.prompt,
              automation.User?.integrations[0].token!
            );

            if (direct_message.status === 200) {
              const tracked = await trackResponses(automation.id, "DM");
              if (tracked) {
                await trackAnalytics(automation.userId!, "dm").catch(
                  console.error
                );
                return NextResponse.json(
                  {
                    message: "Message sent",
                  },
                  { status: 200 }
                );
              }
            }
          }

          if (
            automation.listener &&
            automation.listener.listener === "CAROUSEL"
          ) {
            console.log("CAROUSEL", automation);
            
            let carouselSent = false;
            if (automation.listener.carouselTemplate && automation.listener.carouselTemplate.elements.length > 0) {
              // Map carousel template elements to the format expected by sendCarouselMessage
              const carouselElements = automation.listener.carouselTemplate.elements.map(element => ({
                title: element.title,
                subtitle: element.subtitle || undefined,
                imageUrl: element.imageUrl || undefined,
                defaultAction: element.defaultAction || undefined,
                buttons: element.buttons.map(button => ({
                  type: button.type.toLowerCase() as "web_url" | "postback",
                  title: button.title,
                  url: button.url || undefined,
                  payload: button.payload || undefined
                }))
              }));
              
              try {
                const carousel_message = await sendCarouselMessage(
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].messaging[0].sender.id,
                  carouselElements,
                  automation.User?.integrations[0].token!
                );
                
                if (carousel_message) {
                  carouselSent = true;
                  const tracked = await trackResponses(automation.id, "CAROUSEL");
                  if (tracked) {
                    await trackAnalytics(automation.userId!, "dm").catch(
                      console.error
                    );
                    return NextResponse.json(
                      {
                        message: "Carousel message sent",
                      },
                      { status: 200 }
                    );
                  }
                }
              } catch (error) {
                console.error("Error sending carousel message:", error);
              }
            }

            // Fallback to regular message if carousel fails or is not available
            if (!carouselSent && automation.listener.prompt) {
              const direct_message = await sendDM(
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                automation.listener.prompt,
                automation.User?.integrations[0].token!
              );

              if (direct_message.status === 200) {
                const tracked = await trackResponses(automation.id, "DM");
                if (tracked) {
                  await trackAnalytics(automation.userId!, "dm").catch(
                    console.error
                  );
                  return NextResponse.json(
                    {
                      message: "Fallback message sent",
                    },
                    { status: 200 }
                  );
                }
              }
            }
          }
          
          if (
            automation.listener &&
            automation.listener.listener === "SMARTAI" &&
            automation.User?.subscription?.plan === "PRO"
          ) {
            console.log("Smart AI", automation);

            const openaiClient = automation.User?.openAiKey
              ? new OpenAI({
                  apiKey: automation.User.openAiKey,
                })
              : openai;
            
            const smart_ai_message = await openaiClient.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "assistant",
                  content: `${automation.listener?.prompt}: Keep responses under 2 sentences`,
                },
              ],
            });
            console.log("answers?", smart_ai_message);

            if (smart_ai_message.choices[0].message.content) {
              const reciever = createChatHistory(
                automation.id,
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                webhook_payload.entry[0].messaging[0].message.text
              );

              const sender = createChatHistory(
                automation.id,
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                smart_ai_message.choices[0].message.content
              );

              await client.$transaction([reciever, sender]);

              const direct_message = await sendDM(
                webhook_payload.entry[0].id,
                webhook_payload.entry[0].messaging[0].sender.id,
                smart_ai_message.choices[0].message.content,
                automation.User?.integrations[0].token!
              );

              if (direct_message.status === 200) {
                const tracked = await trackResponses(automation.id, "DM");
                if (tracked) {
                  await trackAnalytics(automation.userId!, "dm").catch(
                    console.error
                  );
                  return NextResponse.json(
                    {
                      message: "Message sent",
                    },
                    { status: 200 }
                  );
                }
              }
            }
          }
        }
      }

      if (
        webhook_payload.entry[0].changes &&
        webhook_payload.entry[0].changes[0].field === "comments"
      ) {
        const automation = await getKeywordAutomation(
          matcher.automationId,
          false
        );

        console.log("geting the automations");

        const automations_post = await getKeywordPost(
          webhook_payload.entry[0].changes[0].value.media.id,
          automation?.id!
        );

        console.log("found keyword ", automations_post);

        if (
          automation &&
          automations_post &&
          automation.trigger &&
          automation.active
        ) {
          console.log("first if");
          if (automation.listener) {
            console.log("first if");
            if (automation.listener.listener === "MESSAGE") {
              console.log(
                "Processing message automation for comment",
                webhook_payload.entry[0].changes[0].value
              );

              // Handle both comment reply and DM in parallel
              const actions = [];

              if (automation.listener.commentReply) {
                console.log("Replying to comment with template");
                actions.push(
                  replyToComment(
                    webhook_payload.entry[0].changes[0].value.id,
                    automation.listener.commentReply,
                    automation.User?.integrations[0].token!
                  )
                );
              }

              console.log("Sending direct message");
              actions.push(
                sendDM(
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].changes[0].value.from.id,
                  automation.listener?.prompt,
                  automation.User?.integrations[0].token!
                )
              );

              const results = await Promise.all(actions);
              const direct_message = results[actions.length - 1];

              if (direct_message.status === 200) {
                const tracked = await trackResponses(automation.id, "COMMENT");

                if (tracked) {
                  await trackAnalytics(automation.userId!, "comment").catch(
                    console.error
                  );
                  return NextResponse.json(
                    {
                      message: "Messages sent successfully",
                    },
                    { status: 200 }
                  );
                }
              }
            } else if (automation.listener.listener === "CAROUSEL") {
              console.log("CAROUSEL for comment", automation);
              
              let carouselSent = false;
              if (automation.listener.carouselTemplate && automation.listener.carouselTemplate.elements.length > 0) {
                const carouselElements = automation.listener.carouselTemplate.elements.map(element => ({
                  title: element.title,
                  subtitle: element.subtitle || undefined,
                  imageUrl: element.imageUrl || undefined,
                  defaultAction: element.defaultAction || undefined,
                  buttons: element.buttons.map(button => ({
                    type: button.type.toLowerCase() as "web_url" | "postback",
                    title: button.title,
                    url: button.url || undefined,
                    payload: button.payload || undefined
                  }))
                }));
                
                try {
                  const carousel_message = await sendCarouselMessage(
                    webhook_payload.entry[0].id,
                    webhook_payload.entry[0].changes[0].value.from.id,
                    carouselElements,
                    automation.User?.integrations[0].token!
                  );
                  
                  if (carousel_message) {
                    carouselSent = true;
                    const tracked = await trackResponses(automation.id, "CAROUSEL");
                    if (tracked) {
                      await trackAnalytics(automation.userId!, "comment").catch(
                        console.error
                      );
                      return NextResponse.json(
                        {
                          message: "Carousel message sent for comment",
                        },
                        { status: 200 }
                      );
                    }
                  }
                } catch (error) {
                  console.error("Error sending carousel message for comment:", error);
                }
              }

              // Fallback to regular message if carousel fails or is not available
              if (!carouselSent && automation.listener.prompt) {
                const direct_message = await sendDM(
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].changes[0].value.from.id,
                  automation.listener.prompt,
                  automation.User?.integrations[0].token!
                );

                if (direct_message.status === 200) {
                  const tracked = await trackResponses(automation.id, "COMMENT");
                  if (tracked) {
                    await trackAnalytics(automation.userId!, "comment").catch(
                      console.error
                    );
                    return NextResponse.json(
                      {
                        message: "Fallback message sent for comment",
                      },
                      { status: 200 }
                    );
                  }
                }
              }
            }
            
            if (
              automation.listener.listener === "SMARTAI" &&
              automation.User?.subscription?.plan === "PRO"
            ) {
              const smart_ai_message = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "assistant",
                    content: `${automation.listener?.prompt}: keep responses under 2 sentences`,
                  },
                ],
              });
              console.log("answers?", smart_ai_message);

              if (smart_ai_message.choices[0].message.content) {
                const reciever = createChatHistory(
                  automation.id,
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].changes[0].value.from.id,
                  webhook_payload.entry[0].changes[0].value.text
                );

                const sender = createChatHistory(
                  automation.id,
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].changes[0].value.from.id,
                  smart_ai_message.choices[0].message.content
                );

                await client.$transaction([reciever, sender]);

                const direct_message = await sendPrivateMessage(
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].changes[0].value.id,
                  automation.listener?.prompt,
                  automation.User?.integrations[0].token!
                );

                if (direct_message.status === 200) {
                  const tracked = await trackResponses(
                    automation.id,
                    "COMMENT"
                  );

                  if (tracked) {
                    await trackAnalytics(automation.userId!, "comment").catch(
                      console.error
                    );
                    return NextResponse.json(
                      {
                        message: "Message sent",
                      },
                      { status: 200 }
                    );
                  }
                }
              }
            }
          }
        }
      }
    }

    if (!matcher) {
      const customer_history = await getChatHistory(
        webhook_payload.entry[0].messaging[0].recipient.id,
        webhook_payload.entry[0].messaging[0].sender.id
      );

      if (
        customer_history.history.length > 0 &&
        customer_history.automationId
      ) {
        const automation = await findAutomation(customer_history.automationId);

        if (
          automation?.User?.subscription?.plan === "PRO" &&
          automation.listener?.listener === "SMARTAI" &&
          automation.active
        ) {
          const openaiClient = automation.User?.openAiKey
            ? new OpenAI({
                apiKey: automation.User.openAiKey,
              })
            : openai;
          
          const smart_ai_message = await openaiClient.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "assistant",
                content: `${automation.listener?.prompt}: keep responses under 2 sentences`,
              },
              ...customer_history.history,
              {
                role: "user",
                content: webhook_payload.entry[0].messaging[0].message.text,
              },
            ],
          });

          if (smart_ai_message.choices[0].message.content) {
            const reciever = createChatHistory(
              automation.id,
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              webhook_payload.entry[0].messaging[0].message.text
            );

            const sender = createChatHistory(
              automation.id,
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              smart_ai_message.choices[0].message.content
            );
            await client.$transaction([reciever, sender]);
            const direct_message = await sendDM(
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              smart_ai_message.choices[0].message.content,
              automation.User?.integrations[0].token!
            );

            if (direct_message.status === 200) {
              await trackAnalytics(automation.userId!, "dm").catch(
                console.error
              );
              return NextResponse.json(
                {
                  message: "Message sent",
                },
                { status: 200 }
              );
            }
          }
        }
      }

      return NextResponse.json(
        {
          message: "No automation set / check if you have automation activated",
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        message: "No automation set / check if you have automation activated",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        message: "Server error",
      },
      { status: 200 }
    );
  }
}