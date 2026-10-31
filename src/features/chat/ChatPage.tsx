import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  fetchConversationHistory,
  fetchConversations,
  sendChatMessage,
} from "@/api/chat";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useCompanion } from "@/hooks/useCompanion";
import { describeApiError } from "@/lib/errors";
import { parseUtcDate, relativeTime } from "@/lib/date";
import { classNames } from "@/lib/utils";
import { isDemoActive } from "@/demo/demoSession";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/speech";
import type {
  ChatMessage,
  ChatResponse,
  ConversationSummary,
} from "@/types";
import { CompanionAvatar } from "@/components/avatar/CompanionAvatar";
import { CompanionMini } from "@/components/avatar/CompanionMini";
import { companionStateLabel, type CompanionState } from "@/components/avatar/states";
import { Alert, Button, Skeleton, Spinner } from "@/components/ui";
import {
  ChatIcon,
  MicIcon,
  PlusIcon,
  SendIcon,
  SpeakerIcon,
  SparkIcon,
} from "@/components/ui/icons";
import { VoiceMode, type VoiceSendOutcome } from "./VoiceMode";

const MAX_MESSAGE_LENGTH = 4096;

const STARTERS = [
  "I’ve been feeling overwhelmed lately.",
  "Can you help me slow down my thoughts?",
  "I want to talk about how today went.",
];

interface PendingMessage {
  text: string;
  status: "sending" | "failed";
}

interface SendOutcome {
  response: ChatResponse | null;
  error: string;
}

function conversationTitle(
  title: string | null,
  fallback = "Conversation",
): string {
  const clean = title?.trim();
  return clean ? clean : fallback;
}

function messageTime(value: string): string {
  return parseUtcDate(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const reducedMotion = useReducedMotion();
  const demo = isDemoActive();
  const { character } = useCompanion();
  const companionName = character.name;
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState("");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [input, setInput] = useState("");
  const [pending, setPending] = useState<PendingMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [responding, setResponding] = useState(false);

  const [composerFocused, setComposerFocused] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [dictationError, setDictationError] = useState("");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [mobileDrawerLayout, setMobileDrawerLayout] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 960px)").matches,
  );
  const [voiceOpen, setVoiceOpen] = useState(
    () => searchParams.get("voice") === "1",
  );

  const closeVoice = useCallback(() => {
    setVoiceOpen(false);
    if (searchParams.get("voice")) {
      const next = new URLSearchParams(searchParams);
      next.delete("voice");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const historyToggleRef = useRef<HTMLButtonElement>(null);
  const historyCloseRef = useRef<HTMLButtonElement>(null);
  const activeIdRef = useRef<string | null>(null);
  const sendingRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const responseTimerRef = useRef<number | null>(null);
  const lastParamRef = useRef<string | null>(searchParams.get("c"));
  const mountedRef = useRef(true);

  const speechSupported = useMemo(() => Boolean(getSpeechRecognition()), []);
  const ttsSupported = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    [],
  );

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    setConversationsError("");
    try {
      const list = await fetchConversations();
      if (mountedRef.current) setConversations(list);
    } catch (error) {
      if (mountedRef.current) {
        setConversationsError(
          describeApiError(
            error,
            "Could not load your conversations.",
          ).message,
        );
      }
    } finally {
      if (mountedRef.current) setConversationsLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (conversationId: string) => {
    activeIdRef.current = conversationId;
    lastParamRef.current = conversationId;
    setActiveId(conversationId);
    setMobileHistoryOpen(false);
    setHistoryLoading(true);
    setHistoryError("");
    setPending(null);
    setSendError("");
    setMessages([]);

    try {
      const history = await fetchConversationHistory(conversationId);
      if (!mountedRef.current || activeIdRef.current !== conversationId) return;
      setMessages(history.messages);
    } catch (error) {
      if (!mountedRef.current || activeIdRef.current !== conversationId) return;
      const info = describeApiError(error, "Could not load this conversation.");
      setHistoryError(
        info.status === 404
          ? "This conversation is no longer available."
          : info.message,
      );
    } finally {
      if (mountedRef.current && activeIdRef.current === conversationId) {
        setHistoryLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadConversations();

    const initial = searchParams.get("c");
    if (initial) void loadHistory(initial);

    return () => {
      mountedRef.current = false;
      if (responseTimerRef.current) {
        window.clearTimeout(responseTimerRef.current);
      }
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
    // Initial load only; later query changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadConversations, loadHistory]);

  useEffect(() => {
    const param = searchParams.get("c");
    if (param === lastParamRef.current) return;
    lastParamRef.current = param;

    if (sendingRef.current) return;

    if (!param) {
      activeIdRef.current = null;
      setActiveId(null);
      setMessages([]);
      setPending(null);
      setHistoryError("");
      setHistoryLoading(false);
      return;
    }

    if (param !== activeIdRef.current) void loadHistory(param);
  }, [searchParams, loadHistory]);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    // Keep the welcome state anchored at the top; only follow new messages.
    if (messages.length === 0 && pending === null && !historyLoading) return;
    log.scrollTo({
      top: log.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [messages, pending, historyLoading, reducedMotion]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`;
  }, [input]);

  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 960px)");
    const onChange = () => setMobileDrawerLayout(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobileHistoryOpen || !mobileDrawerLayout) return;

    const toggle = historyToggleRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileHistoryOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    historyCloseRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      toggle?.focus();
    };
  }, [mobileHistoryOpen, mobileDrawerLayout]);

  const refreshConversations = useCallback(async () => {
    try {
      const list = await fetchConversations();
      if (mountedRef.current) setConversations(list);
    } catch {
      // The conversation list is secondary; the message itself succeeded.
    }
  }, []);

  const resetToNewConversation = () => {
    if (sending) return;
    activeIdRef.current = null;
    lastParamRef.current = null;
    setActiveId(null);
    setMessages([]);
    setPending(null);
    setSendError("");
    setHistoryError("");
    setMobileHistoryOpen(false);
    setSearchParams({}, { replace: true });
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const selectConversation = (conversationId: string) => {
    if (sending || conversationId === activeId) {
      setMobileHistoryOpen(false);
      return;
    }
    lastParamRef.current = conversationId;
    setSearchParams({ c: conversationId }, { replace: true });
    void loadHistory(conversationId);
  };

  const send = async (rawText?: string): Promise<SendOutcome> => {
    const text = (rawText ?? input).trim();
    if (!text || sendingRef.current) return { response: null, error: "" };

    if (text.length > MAX_MESSAGE_LENGTH) {
      const message = `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`;
      setSendError(message);
      return { response: null, error: message };
    }

    const conversationAtSend = activeIdRef.current;
    sendingRef.current = true;
    setSending(true);
    setSendError("");
    setDictationError("");
    setResponding(false);
    setPending({ text, status: "sending" });
    if (rawText === undefined) setInput("");

    try {
      const response = await sendChatMessage(text, conversationAtSend);
      if (!mountedRef.current) {
        return { response: null, error: "" };
      }

      if (activeIdRef.current !== conversationAtSend) {
        // The reader moved to another conversation while the companion was
        // replying. The message is stored server-side; it will appear in its
        // history.
        void refreshConversations();
        return { response, error: "" };
      }

      setMessages((current) => {
        const seen = new Set(current.map((message) => message.id));
        const next = [...current];
        for (const message of [response.user_message, response.ai_response]) {
          if (!seen.has(message.id)) next.push(message);
        }
        return next;
      });
      setPending(null);

      if (!conversationAtSend) {
        activeIdRef.current = response.conversation_id;
        lastParamRef.current = response.conversation_id;
        setActiveId(response.conversation_id);
        setSearchParams({ c: response.conversation_id }, { replace: true });
      }

      setResponding(true);
      if (responseTimerRef.current) window.clearTimeout(responseTimerRef.current);
      responseTimerRef.current = window.setTimeout(() => {
        if (mountedRef.current) setResponding(false);
      }, 2600);

      void refreshConversations();
      return { response, error: "" };
    } catch (error) {
      if (!mountedRef.current) return { response: null, error: "" };

      const info = describeApiError(
        error,
        `${companionName} couldn’t reply just now. Your message was not sent.`,
      );
      const message =
        info.status === 404
          ? "This conversation is no longer available. Start a new conversation to keep talking."
          : info.message;
      setPending({ text, status: "failed" });
      setSendError(message);
      return { response: null, error: message };
    } finally {
      if (mountedRef.current) {
        sendingRef.current = false;
        setSending(false);
      }
    }
  };

  const sendVoice = async (text: string): Promise<VoiceSendOutcome> => {
    const outcome = await send(text);
    if (outcome.response) {
      return { ok: true, reply: outcome.response.ai_response.content };
    }
    return {
      ok: false,
      message: outcome.error || `${companionName} couldn’t reply just now.`,
    };
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send();
  };

  const handleComposerKeyDown = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };

  const toggleDictation = () => {
    setDictationError("");

    if (dictating) {
      recognitionRef.current?.stop();
      return;
    }

    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setDictationError("Dictation isn’t available in this browser.");
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = navigator.language || "en-US";
      recognition.onresult = (event) => {
        const results = event.results;
        const last = results[results.length - 1];
        const transcript = last?.[0]?.transcript?.trim();
        if (transcript) {
          setInput((current) =>
            current.trim() ? `${current.trim()} ${transcript}` : transcript,
          );
        }
      };
      recognition.onerror = (event) => {
        setDictating(false);
        recognitionRef.current = null;
        const reason = event.error;
        setDictationError(
          reason === "not-allowed" || reason === "service-not-allowed"
            ? "Microphone access was blocked. Allow it in your browser settings and try again."
            : reason === "no-speech"
              ? "No speech was heard. Try again when you’re ready."
              : "Dictation stopped unexpectedly. You can still type your message.",
        );
      };
      recognition.onend = () => {
        setDictating(false);
        recognitionRef.current = null;
        textareaRef.current?.focus();
      };
      recognitionRef.current = recognition;
      setDictating(true);
      recognition.start();
    } catch {
      setDictating(false);
      recognitionRef.current = null;
      setDictationError("Dictation couldn’t start in this browser.");
    }
  };

  const toggleReadAloud = (message: ChatMessage) => {
    if (!ttsSupported) return;
    if (speakingId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 0.98;
    utterance.pitch = 1.02;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(message.id);
    window.speechSynthesis.speak(utterance);
  };

  const companionState: CompanionState = sendError
    ? "error"
    : sending
      ? "thinking"
      : responding
        ? "responding"
        : dictating || composerFocused || input.trim().length > 0
          ? "listening"
          : messages.length === 0
            ? "encouraging"
            : "idle";

  const hasMessages = messages.length > 0 || pending !== null;
  const conversationName = useMemo(() => {
    if (!activeId) return "New conversation";
    const match = conversations.find((item) => item.id === activeId);
    return conversationTitle(match?.title ?? null);
  }, [activeId, conversations]);

  const historyDrawer = (
    <aside
      className={classNames(
        "chat-history",
        mobileHistoryOpen && "chat-history--open",
      )}
      aria-label="Conversation history"
    >
      <div className="chat-history__head">
        <div>
          <p className="eyebrow">Your archive</p>
          <h2>Conversations</h2>
        </div>
        <button
          type="button"
          ref={historyCloseRef}
          className="icon-button chat-history__close"
          onClick={() => setMobileHistoryOpen(false)}
          aria-label="Close conversation history"
        >
          <PlusIcon size={18} className="chat-history__close-icon" />
        </button>
      </div>

      <button
        type="button"
        className="chat-history__new"
        onClick={() => {
          resetToNewConversation();
          setMobileHistoryOpen(false);
        }}
        disabled={sending}
      >
        <SparkIcon size={16} />
        <span>Start a new conversation</span>
      </button>

      <div className="chat-history__list">
        {conversationsLoading ? (
          <div className="skeleton-stack">
            <Skeleton width="80%" height={14} />
            <Skeleton width="65%" height={14} />
            <Skeleton width="74%" height={14} />
          </div>
        ) : conversationsError ? (
          <div className="chat-history__error">
            <p>{conversationsError}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void loadConversations()}
            >
              Retry
            </Button>
          </div>
        ) : conversations.length === 0 ? (
          <p className="chat-history__empty">
            Your conversations will appear here once you’ve talked with{" "}
            {companionName}.
          </p>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              className={classNames(
                "chat-history__item",
                conversation.id === activeId && "chat-history__item--active",
              )}
              onClick={() => selectConversation(conversation.id)}
              disabled={sending}
              aria-current={conversation.id === activeId ? "true" : undefined}
              title={
                sending
                  ? `Wait for ${companionName}’s reply before switching conversations`
                  : undefined
              }
            >
              <span className="chat-history__item-title">
                {conversationTitle(conversation.title)}
              </span>
              <span className="chat-history__item-meta">
                {relativeTime(conversation.started_at)}
              </span>
            </button>
          ))
        )}
      </div>

      <p className="chat-history__note">
        {demo
          ? "Sample conversations · session only"
          : activeId
            ? "Your messages are stored"
            : "A new chat starts fresh"}
      </p>
    </aside>
  );

  const historyScrim = mobileHistoryOpen ? (
    <button
      type="button"
      className="chat-history__scrim"
      aria-label="Close conversation history"
      onClick={() => setMobileHistoryOpen(false)}
    />
  ) : null;

  return (
    <div className="chat-page">
      <header className="chat-header">
        <button
          type="button"
          ref={historyToggleRef}
          className="icon-button chat-header__history-toggle"
          onClick={() => setMobileHistoryOpen(true)}
          aria-label="Open conversation history"
        >
          <ChatIcon size={19} />
        </button>

        <div className="chat-header__companion">
          <CompanionAvatar state={companionState} size="sm" />
        </div>

        <div className="chat-header__text">
          <div className="chat-header__title-row">
            <h1>{conversationName}</h1>
            <span className="chat-header__state" aria-hidden="true">
              {companionStateLabel(companionState, companionName)}
            </span>
          </div>
          <p>
            {demo
              ? "Demo conversation · scripted sample replies, nothing is sent to Mindora"
              : "Private to your account · supportive guidance only"}
          </p>
        </div>

        <div className="chat-header__actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={resetToNewConversation}
            disabled={sending}
            leftIcon={<PlusIcon size={16} />}
          >
            New
          </Button>
        </div>
      </header>

      <div className="chat-workspace">
        {mobileDrawerLayout ? null : historyDrawer}
        {mobileDrawerLayout ? null : historyScrim}

        <section
          className="chat-main"
          aria-label={`Conversation with ${companionName}`}
        >
          <div className="chat-log" ref={logRef} role="log" aria-live="polite">
            {historyLoading ? (
              <div className="chat-loading" role="status">
                <Spinner size={20} />
                <span>Gathering this conversation…</span>
              </div>
            ) : historyError ? (
              <div className="chat-loading">
                <Alert tone="danger">{historyError}</Alert>
                {activeId ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void loadHistory(activeId)}
                  >
                    Try again
                  </Button>
                ) : null}
              </div>
            ) : !hasMessages ? (
              <div className="chat-welcome">
                <CompanionAvatar state="encouraging" size="lg" />
                <p className="eyebrow">
                  <SparkIcon size={15} /> {companionName}
                </p>
                <h2>What’s on your mind today?</h2>
                <p>
                  You can talk about your day, a feeling you can’t quite name,
                  or something you’d like to think through. {companionName}{" "}
                  responds with supportive guidance — not a diagnosis.
                </p>
                <div className="chat-starters" aria-label="Conversation starters">
                  {STARTERS.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      className="chat-starter"
                      onClick={() => {
                        setInput(starter);
                        textareaRef.current?.focus();
                      }}
                    >
                      {starter}
                    </button>
                  ))}
                </div>
                {speechSupported ? (
                  <button
                    type="button"
                    className="chat-welcome__voice"
                    onClick={() => setVoiceOpen(true)}
                  >
                    <MicIcon size={15} />
                    <span>Speak instead</span>
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="chat-messages">
                {messages.map((message) => {
                  const isUser = message.sender === "user";
                  return (
                    <article
                      key={message.id}
                      className={classNames(
                        "chat-message",
                        isUser ? "chat-message--user" : "chat-message--ai",
                      )}
                    >
                      {!isUser ? (
                        <span className="chat-message__avatar">
                          <CompanionMini
                            character={character}
                            speaking={speakingId === message.id}
                          />
                        </span>
                      ) : null}
                      <div className="chat-message__body">
                        <div className="chat-bubble">
                          <p>{message.content}</p>
                        </div>
                        <div className="chat-message__meta">
                          <span>{isUser ? "You" : companionName}</span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={message.created_at}>
                            {messageTime(message.created_at)}
                          </time>
                          {demo && !isUser ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="chat-message__demo">
                                Sample reply
                              </span>
                            </>
                          ) : null}
                          {!isUser && ttsSupported ? (
                            <button
                              type="button"
                              className="chat-read"
                              onClick={() => toggleReadAloud(message)}
                              aria-label={
                                speakingId === message.id
                                  ? "Stop reading this reply aloud"
                                  : "Read this reply aloud"
                              }
                              aria-pressed={speakingId === message.id}
                            >
                              <SpeakerIcon size={14} />
                              <span>
                                {speakingId === message.id ? "Stop" : "Read"}
                              </span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}

                {pending ? (
                  <article className="chat-message chat-message--user">
                    <div className="chat-message__body">
                      <div
                        className={classNames(
                          "chat-bubble",
                          pending.status === "failed" && "chat-bubble--failed",
                        )}
                      >
                        <p>{pending.text}</p>
                      </div>
                      <div className="chat-message__meta">
                        {pending.status === "failed" ? (
                          <>
                            <span className="chat-message__unsent">
                              Not sent
                            </span>
                            <button
                              type="button"
                              className="chat-retry"
                              onClick={() => void send(pending.text)}
                            >
                              Retry
                            </button>
                            <button
                              type="button"
                              className="chat-retry chat-retry--muted"
                              onClick={() => {
                                setPending(null);
                                setSendError("");
                              }}
                            >
                              Discard
                            </button>
                          </>
                        ) : (
                          <>
                            <span>You</span>
                            <span aria-hidden="true">·</span>
                            <span>Sending…</span>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                ) : null}

                {sending ? (
                  <div className="chat-thinking" role="status">
                    <span className="chat-thinking__avatar">
                      <CompanionMini
                        character={character}
                        state="thinking"
                      />
                    </span>
                    <span className="chat-thinking__dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span>{companionName} is thinking</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="chat-composer-wrap">
            {sendError ? (
              <div className="chat-composer__error" role="alert">
                <span>{sendError}</span>
                {pending?.status === "failed" ? (
                  <div className="chat-composer__error-actions">
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => void send(pending.text)}
                    >
                      Retry
                    </button>
                    {sendError.toLowerCase().includes("no longer available") ? (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          const text = pending.text;
                          resetToNewConversation();
                          setInput(text);
                        }}
                      >
                        Start fresh
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {dictationError ? (
              <p className="chat-composer__dictation-note" role="alert">
                {dictationError}
              </p>
            ) : null}

            <form className="chat-composer" onSubmit={handleSubmit}>
              <div className="chat-composer__box">
                <label className="sr-only" htmlFor="chat-message">
                  Message {companionName}
                </label>
                <textarea
                  id="chat-message"
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  maxLength={MAX_MESSAGE_LENGTH}
                  placeholder="Share what’s on your mind…"
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  onFocus={() => setComposerFocused(true)}
                  onBlur={() => setComposerFocused(false)}
                  disabled={historyLoading}
                />

                <div className="chat-composer__tools">
                  {speechSupported ? (
                    <button
                      type="button"
                      className={classNames(
                        "chat-dictate",
                        dictating && "chat-dictate--active",
                      )}
                      onClick={toggleDictation}
                      aria-pressed={dictating}
                      aria-label={
                        dictating
                          ? "Stop dictating"
                          : "Dictate a message using your browser"
                      }
                    >
                      {dictating ? <Spinner size={15} /> : <MicIcon size={17} />}
                      <span>{dictating ? "Listening…" : "Dictate"}</span>
                    </button>
                  ) : null}

                  {input.length > MAX_MESSAGE_LENGTH - 400 ? (
                    <span className="chat-composer__count">
                      {input.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                  ) : null}

                  <Button
                    type="submit"
                    size="sm"
                    loading={sending}
                    disabled={!input.trim() || historyLoading}
                    leftIcon={<SendIcon size={16} />}
                  >
                    Send
                  </Button>
                </div>
              </div>

              <footer className="chat-composer__footer">
                <span>Enter to send · Shift + Enter for a new line</span>
                <span>
                  {speechSupported
                    ? "Dictation uses your browser’s speech recognition, not a Mindora voice service."
                    : "Supportive guidance, not emergency care."}
                </span>
              </footer>
            </form>

            {!voiceOpen && hasMessages ? (
              <button
                type="button"
                className="voice-fab"
                onClick={() => setVoiceOpen(true)}
                aria-label={`Open voice chat with ${companionName}`}
              >
                <span className="voice-fab__ring" aria-hidden="true" />
                <CompanionAvatar state={companionState} size="sm" />
                <span className="voice-fab__label">Voice</span>
              </button>
            ) : null}
          </div>
        </section>
      </div>

      <VoiceMode
        open={voiceOpen}
        demo={demo}
        onSend={sendVoice}
        onClose={(returnToText) => {
          closeVoice();
          if (returnToText) {
            window.setTimeout(() => textareaRef.current?.focus(), 0);
          }
        }}
      />

      {mobileDrawerLayout
        ? createPortal(
            <>
              {historyDrawer}
              {historyScrim}
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
