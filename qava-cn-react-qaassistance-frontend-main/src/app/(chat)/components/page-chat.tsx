"use client";

import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";

import HeaderChat from "@/components/layout/headerChat";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/chat/chat-bubble";
import { ChatMessageList } from "@/components/chat/chat-message-list";  
import { ButtonClipboard } from "@/components/chat/button-clipboard";
import ChatMarkdawnBlock from "@/components/chat/chat-markdawnBlock";
import ChatShowContext from "./steps/chat-show-context";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { SendHorizonal } from "lucide-react";
import { Message, MESSAGE_VARIANTS, ROLE, TEST_TYPE, testType } from "@/types/types";
import { DELIMITER_CSV, MESSAGE_STEP_CONTEXT } from "@/data/config";
import generateDownloadCsv from "@/helpers/generateDownloadCsv";
import { IconIA } from "@/components/chat/icon-ia"; 
import VersionChangesModal from "@/components/version/VersionChangesModal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PageChatProps {
  initialMessages?: Message[];
  idConversation?: string;
  stepApi?: number;
  testTypeApi?: testType;
}

export default function PageChat({ initialMessages = [], idConversation , stepApi, testTypeApi }: PageChatProps) {
  const router = useRouter();
  const [typeTest, setTypeTest] = useState<testType>(testTypeApi || TEST_TYPE.CONTEXT);
  const [step, setStep] = useState(1);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    onResponse: async (response: Response) => {
      const { messages: newMessages, id }: { messages: Message[] , id: string} = await response.json();
      // Combina los mensajes existentes con los nuevos
      setMessages((prevMessages) => [...prevMessages.flat(), ...newMessages]);

      //redirigir una solo vez cuando se crea una conversación
      if(messages.length === 1) {
        router.replace(`/${id}`); 
        router.refresh();
      }
      
      if (newMessages[0].validate) {
        setStep(3);
        setTypeTest(TEST_TYPE.USER_STORY);
        router.refresh(); 
      }

    },  
    onError: (error: Error) => {
      console.error('error name',error.name);
      if (error.name === "SyntaxError") {
        // Esto indica que el servidor no respondió
        toast.error(`No se puede conectar al servidor. Por favor, intenta más tarde.`);
      }
    },
  });

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const getMessageVariant = (role : string) => role === ROLE.ASSISTANT ? MESSAGE_VARIANTS.RECEIVED : MESSAGE_VARIANTS.SENT;

  const setChatMessages = useCallback(
    (newMessages: Message[]) => {
      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
    },
    [setMessages]
  );

  // Iniciar un nuevo chat y guardar el chat actual en el historial
  const handleNewChat = () => {
    setStep(1)
    setMessages([]);
    router.push("/");
  };

  const handleSendMessage = (e: React.SyntheticEvent) => {
    e.preventDefault();

    handleSubmit(e, {
      body: {
        testType: initialMessages.at(-1)?.validate ? TEST_TYPE.USER_STORY : typeTest,
        idConversation: idConversation,
        step: step + 1,
      },
    });

    // Limpiar input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (isLoading || !input) return;
      handleSendMessage(e);
    }
  };

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
    //setear el step del chat
    if(stepApi) {
      setStep(stepApi);
    }
  }, [ initialMessages, setMessages, stepApi, idConversation ]);

  //? Hacer scroll al final del contenedor de mensajes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  //? Cuando se llega al paso 2, envía automáticamente un mensaje del asistente
  useEffect(() => {
    if(initialMessages.length > 0) return
    else if (step === 2) {
      const assistantMessage: Message = {
        id: `message-${Date.now()}`,
        role: ROLE.ASSISTANT,
        content: MESSAGE_STEP_CONTEXT
      };
      setChatMessages([assistantMessage]);
    }
  }, [step, setChatMessages, idConversation]);

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl p-5 justify-between gap-4">
      <HeaderChat onNewChat={handleNewChat} />
      <div className="h-[calc(100vh-215px)] flex flex-col rounded-xl lg:col-span-2 gap-4 justify-between flex-1 ">
        <ChatMessageList
          ref={messagesContainerRef}
          className={cn(
            "bg-chatBox rounded-2xl h-full max-h-full flex-1",
            {
              "justify-center items-center max-h-full": step === 1,
            }
          )}
        >
          {initialMessages.length > 0 || step === 1 && <ChatShowContext onNextStep={() => setStep(2)} />}

          {step >= 2 && (
            <AnimatePresence>
              {messages.map((message, index) => {
                const variant = getMessageVariant(message.role!);
                // Aquí asumimos que el CSV siempre estará entre delimitadores como "**CSV**"
                const [beforeCSV, csvContent, afterCSV] = message.content.split(DELIMITER_CSV);
    
                return (
                  <motion.div
                  key={item.id}  // Usar id único
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 1 }}
                >
                  {item.name}
                </motion.div>                
                    }}
                    style={{ originX: 0.5, originY: 0.5 }}
                    className="flex flex-col gap-2 p-4"
                  >
                    <ChatBubble key={index} variant={variant}>
                      <ChatBubbleMessage
                        variant={variant}
                        className="flex gap-2"
                      >
                        {message.role === ROLE.ASSISTANT && <IconIA />}
                        <span>
                          <ChatMarkdawnBlock beforeCSV={beforeCSV} csvContent={csvContent} afterCSV={afterCSV} />
                          {message.role === ROLE.ASSISTANT && (
                            <div className="flex items-center justify-end mt-1.5 gap-1">
                              {!isLoading && (
                                <>
                                  <ButtonClipboard text={message.content} />
                                </>
                              )}
                              {!isLoading && message.role === ROLE.ASSISTANT && csvContent && (
                                  <Button onClick={ () => generateDownloadCsv(csvContent) }>
                                    Descargar CSV
                                  </Button>
                                )}
                            </div>
                          )}
                        </span>
                      </ChatBubbleMessage>
                    </ChatBubble>
                  </motion.div>
                );
              })}

              {/* Loading */}
              {isLoading && (
                <ChatBubble variant={MESSAGE_VARIANTS.RECEIVED}>
                  <ChatBubbleAvatar src="" fallback={<IconIA/>}/>
                  <ChatBubbleMessage isLoading /> 
                </ChatBubble>
              )}
            </AnimatePresence>
          )}
        </ChatMessageList>

        {step >= 2 && (
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 "
          >
            <ChatInput
              ref={inputRef}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
              rows={1}
              placeholder="Escribe tu prompt..."
              className="rounded-lg px-4 shadow-none focus-visible:ring-0 border bg-background focus-within:ring-1 focus-within:ring-ring"
            />
            <Button
              size="icon"
              className="rounded-full"
              disabled={!input || isLoading}
              type="submit"
            >
              <SendHorizonal className="size-4" />
            </Button>
          </form>
        )}
      </div>
      <VersionChangesModal />
    </div>
  );
}