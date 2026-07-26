import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  MessageSquare,
  X,
  Send,
  BrainCircuit,
  Activity,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Compass,
  ArrowRight,
} from 'lucide-react-native';
import { apiClient } from '../../services/api/apiClient';

interface Message {
  role: 'user' | 'bot';
  content: string;
  isCheckin?: boolean;
}

export function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Guided Stress Check-in Flow State
  const [checkinStep, setCheckinStep] = useState<number | null>(null);
  const [checkinAnswers, setCheckinAnswers] = useState({
    stressLevel: 0,
    timeAvailable: 30,
    stressCause: '',
  });

  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-open chatbot on initial visit to Explore tab
  useEffect(() => {
    async function checkAutoOpen() {
      if (pathname.includes('/explore') || pathname === '/' || pathname === '/(app)/(customer)/explore') {
        const skipped = await SecureStore.getItemAsync('nivara_mobile_chat_skipped');
        if (!skipped && !hasInteracted) {
          setIsOpen(true);
        }
      }
    }
    checkAutoOpen();
  }, [pathname]);

  // Seed default welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'bot',
          content: 'Hello! I am your NIVARA Wellness Assistant. How can I help you find calm today?',
        },
      ]);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages, isLoading, isOpen, checkinStep]);

  const handleSendMessage = async (textToSend: string, customHistory?: Message[]) => {
    if (!textToSend.trim()) return;

    const currentMsgs = customHistory || messages;
    const newMsgs = [...currentMsgs, { role: 'user', content: textToSend } as Message];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const historyPayload = newMsgs.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiClient.post('/chat', {
        message: textToSend,
        conversationId,
        history: historyPayload,
      });

      const data = res.data;

      if (data && data.success) {
        const updatedConvId = data.conversationId;
        if (updatedConvId) setConversationId(updatedConvId);

        const finalMsgs = [...newMsgs, { role: 'bot', content: data.reply } as Message];
        setMessages(finalMsgs);
      } else {
        setErrorMessage(data?.message || 'Failed to fetch response. Please try again shortly.');
      }
    } catch (e: any) {
      console.error('[ChatWidget Mobile Error]:', e);
      setErrorMessage(
        e.response?.data?.message || 'The assistant is temporarily offline. Please try again shortly.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Guided Stress Check-in Trigger
  const startStressCheckin = () => {
    setCheckinStep(1);
    setMessages((prev) => [
      ...prev,
      { role: 'bot', content: 'Starting self-reported wellness stress check-in...', isCheckin: true },
    ]);
  };

  const handleCheckinAnswer = (step: number, answer: any) => {
    if (step === 1) {
      setCheckinAnswers((prev) => ({ ...prev, stressLevel: answer }));
      setCheckinStep(2);
    } else if (step === 2) {
      setCheckinAnswers((prev) => ({ ...prev, timeAvailable: answer }));
      setCheckinStep(3);
    } else if (step === 3) {
      const finalAnswers = { ...checkinAnswers, stressCause: answer };
      setCheckinAnswers(finalAnswers);
      setCheckinStep(null);

      let recommendedTier = 'Relaxation Base';
      if (finalAnswers.stressLevel >= 4 && finalAnswers.timeAvailable >= 60) {
        recommendedTier = 'Premium Luxury';
      } else if (finalAnswers.stressLevel >= 3 && finalAnswers.timeAvailable >= 45) {
        recommendedTier = 'Standard Comfort';
      }

      const prompt = `I completed my wellness check-in: My self-reported stress level is ${finalAnswers.stressLevel}/5, I have ${finalAnswers.timeAvailable} minutes, and I am most bothered by ${finalAnswers.stressCause} today. Tell me about my recommendation for the ${recommendedTier} tier and find me a nearby van to book it.`;

      handleSendMessage(prompt);
    }
  };

  // Parse markdown links or paths to interactive navigation buttons
  const renderMessageContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const startIndex = match.index;
      if (startIndex > lastIndex) {
        parts.push({ type: 'text', value: content.substring(lastIndex, startIndex) });
      }

      parts.push({ type: 'link', text: match[1], url: match[2] });
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', value: content.substring(lastIndex) });
    }

    if (parts.length === 0) {
      return <Text style={styles.botMessageText}>{content}</Text>;
    }

    return (
      <View style={{ flexDirection: 'column' }}>
        {parts.map((p, idx) => {
          if (p.type === 'text') {
            return <Text key={idx} style={styles.botMessageText}>{p.value}</Text>;
          }
          return (
            <TouchableOpacity
              key={idx}
              style={styles.actionChipButton}
              activeOpacity={0.8}
              onPress={() => {
                setIsOpen(false);
                const targetUrl = p.url || '';
                if (targetUrl.includes('/vans/')) {
                  const parts = targetUrl.split('/vans/');
                  const vanId = parts[1]?.split('?')[0];
                  if (vanId) router.push(`/(app)/(customer)/vans/${vanId}` as any);
                } else if (targetUrl.includes('/search')) {
                  router.push('/(app)/(customer)/search' as any);
                } else {
                  router.push('/(app)/(customer)/explore' as any);
                }
              }}
            >
              <Text style={styles.actionChipButtonText}>{p.text}</Text>
              <ArrowRight size={12} color="#16A34A" />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <TouchableOpacity
          style={styles.floatingButton}
          activeOpacity={0.85}
          onPress={() => {
            setHasInteracted(true);
            setIsOpen(true);
          }}
        >
          <BrainCircuit size={24} color="#FFFFFF" />
          <View style={styles.onlinePing} />
        </TouchableOpacity>
      )}

      {/* Chatbot Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.botIconWrapper}>
                  <BrainCircuit size={20} color="#16A34A" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>NIVARA Calm Assistant</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>AI Wellness Online</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setHasInteracted(true);
                  SecureStore.setItemAsync('nivara_mobile_chat_skipped', 'true');
                  setIsOpen(false);
                }}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Disclaimer banner */}
            <View style={styles.disclaimerBox}>
              <HelpCircle size={14} color="#16A34A" style={{ marginTop: 1 }} />
              <Text style={styles.disclaimerText}>
                Ask about pricing tiers, KYC needs, soundproofing, or search slots. This assistant uses self-reported info and does not replace medical diagnostics.
              </Text>
            </View>

            {/* Message History Container */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Initial Welcome Popup Card if single message */}
              {messages.length === 1 && !checkinStep && (
                <View style={styles.welcomeCard}>
                  <View style={styles.welcomeIconWrapper}>
                    <Sparkles size={24} color="#16A34A" />
                  </View>
                  <Text style={styles.welcomeTitle}>Welcome to NIVARA Sanctuary</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Would you like to book your at-home relaxation session using our guided Calm Assistant?
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryActionButton}
                    activeOpacity={0.85}
                    onPress={() => {
                      setHasInteracted(true);
                      startStressCheckin();
                    }}
                  >
                    <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryActionButtonText}>Book Session via Chatbot</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryActionButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      setHasInteracted(true);
                      SecureStore.setItemAsync('nivara_mobile_chat_skipped', 'true');
                      setIsOpen(false);
                    }}
                  >
                    <Text style={styles.secondaryActionButtonText}>Skip & Explore App</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Chat messages */}
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubbleContainer,
                    msg.role === 'user' ? styles.userContainer : styles.botContainer,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      msg.role === 'user' ? styles.userBubble : styles.botBubble,
                    ]}
                  >
                    {msg.role === 'user' ? (
                      <Text style={styles.userMessageText}>{msg.content}</Text>
                    ) : (
                      renderMessageContent(msg.content)
                    )}
                  </View>
                </View>
              ))}

              {/* Guided Stress Check-in Interactive Step Cards */}
              {checkinStep !== null && (
                <View style={styles.checkinCard}>
                  <View style={styles.checkinHeader}>
                    <Activity size={16} color="#16A34A" />
                    <Text style={styles.checkinHeaderText}>
                      Stress Check-in • Step {checkinStep} of 3
                    </Text>
                  </View>

                  {checkinStep === 1 && (
                    <View>
                      <Text style={styles.checkinQuestion}>
                        How would you rate your stress level right now?
                      </Text>
                      <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((val) => (
                          <TouchableOpacity
                            key={val}
                            style={styles.ratingButton}
                            onPress={() => handleCheckinAnswer(1, val)}
                          >
                            <Text style={styles.ratingButtonText}>{val}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <View style={styles.ratingLabels}>
                        <Text style={styles.ratingLabelText}>Calm (1)</Text>
                        <Text style={styles.ratingLabelText}>Severe (5)</Text>
                      </View>
                    </View>
                  )}

                  {checkinStep === 2 && (
                    <View>
                      <Text style={styles.checkinQuestion}>
                        How much time do you have available today?
                      </Text>
                      <View style={styles.durationRow}>
                        {[30, 45, 60].map((mins) => (
                          <TouchableOpacity
                            key={mins}
                            style={styles.durationButton}
                            onPress={() => handleCheckinAnswer(2, mins)}
                          >
                            <Text style={styles.durationButtonText}>{mins} Min</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {checkinStep === 3 && (
                    <View>
                      <Text style={styles.checkinQuestion}>
                        What is bothering you the most today?
                      </Text>
                      <View style={styles.causesGrid}>
                        {['Work stress', 'Commute fatigue', 'Personal matters', 'General overload'].map((cause) => (
                          <TouchableOpacity
                            key={cause}
                            style={styles.causeButton}
                            onPress={() => handleCheckinAnswer(3, cause)}
                          >
                            <Text style={styles.causeButtonText}>{cause}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => setCheckinStep(null)}
                    style={styles.cancelCheckinBtn}
                  >
                    <Text style={styles.cancelCheckinText}>Cancel Check-in</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Quick Action Suggestion Chips */}
              {messages.length > 0 && !checkinStep && (
                <View style={styles.quickChipsContainer}>
                  <Text style={styles.quickChipsTitle}>Quick Prompts</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                    <TouchableOpacity
                      style={styles.chipItem}
                      onPress={startStressCheckin}
                    >
                      <Sparkles size={12} color="#16A34A" style={{ marginRight: 4 }} />
                      <Text style={styles.chipText}>⚡ Guided Stress Check-in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.chipItem}
                      onPress={() => handleSendMessage('Search nearby available wellness vans')}
                    >
                      <Compass size={12} color="#0F2D52" style={{ marginRight: 4 }} />
                      <Text style={styles.chipText}>🚐 Search Nearby Vans</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.chipItem}
                      onPress={() => handleSendMessage('What are the session pricing tiers?')}
                    >
                      <Text style={styles.chipText}>💰 Pricing Tiers</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#16A34A" />
                  <Text style={styles.loadingText}>Finding calm response...</Text>
                </View>
              )}

              {/* Error banner */}
              {errorMessage && (
                <View style={styles.errorBox}>
                  <ShieldAlert size={16} color="#EF4444" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={input}
                onChangeText={setInput}
                placeholder={checkinStep !== null ? 'Complete check-in above...' : 'Ask assistant...'}
                placeholderTextColor="#9CA3AF"
                editable={!isLoading && checkinStep === null}
                onSubmitEditing={() => handleSendMessage(input)}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!input.trim() || isLoading || checkinStep !== null) && styles.sendButtonDisabled,
                ]}
                disabled={!input.trim() || isLoading || checkinStep !== null}
                onPress={() => handleSendMessage(input)}
              >
                <Send size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    zIndex: 999,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F2D52',
    borderWidth: 2,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  onlinePing: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 45, 82, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: Dimensions.get('window').height * 0.82,
    flexDirection: 'column',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0F2D52',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  statusText: {
    color: '#7FD6B5',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
  },
  disclaimerText: {
    color: '#6B7280',
    fontSize: 11,
    marginLeft: 8,
    flex: 1,
    lineHeight: 15,
  },
  messagesScroll: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  messagesContent: {
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E1D8',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    color: '#0F2D52',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: '#4B5563',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  primaryActionButton: {
    backgroundColor: '#0F2D52',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 10,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  secondaryActionButton: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
  },
  secondaryActionButtonText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubbleContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  botContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#0F2D52',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderBottomLeftRadius: 2,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  botMessageText: {
    color: '#1F2937',
    fontSize: 13,
    lineHeight: 18,
  },
  actionChipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  actionChipButtonText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
  },
  checkinCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  checkinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1D8',
    paddingBottom: 8,
    marginBottom: 12,
  },
  checkinHeaderText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginLeft: 6,
  },
  checkinQuestion: {
    color: '#0F2D52',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonText: {
    color: '#0F2D52',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabelText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  durationButtonText: {
    color: '#0F2D52',
    fontSize: 13,
    fontWeight: 'bold',
  },
  causesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  causeButton: {
    width: '48%',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    margin: '1%',
  },
  causeButtonText: {
    color: '#0F2D52',
    fontSize: 11,
    fontWeight: '600',
  },
  cancelCheckinBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  cancelCheckinText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  quickChipsContainer: {
    marginTop: 12,
  },
  quickChipsTitle: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: {
    color: '#0F2D52',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 10,
    marginVertical: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E1D8',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5E1D8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F2D52',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F2D52',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
